"""FastAPI application for Pactline creator contracts & milestone payouts."""

import json
import os
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langgraph.types import Command

from backend.pactline_backend.graph import build_deal_graph
from backend.pactline_backend.events import make_event
from backend.pactline_backend.routes_extra import router as extra_router
from backend.pactline_backend.audit_ws import handle_audit_ws

app = FastAPI(title="Pactline API")

# Enable CORS for frontend (matching dataset_backend config)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(extra_router)

RUNS_DIR = Path("runs")
RUNS_DIR.mkdir(parents=True, exist_ok=True)

FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"

# In-memory store for registered deals
RUNS_REGISTRY: Dict[str, Dict[str, Any]] = {}


class DealRequest(BaseModel):
    brief: str
    budget: Optional[float] = None  # None -> parse from brief text
    creators: int = 1


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/deal")
def create_deal(req: DealRequest):
    run_id = f"pact_{uuid.uuid4().hex[:10]}"
    RUNS_REGISTRY[run_id] = {
        "brief": req.brief,
        "budget": req.budget,
        "creators": req.creators,
    }
    return {"run_id": run_id}


@app.get("/replay/demo")
def replay_demo():
    fixture_paths = [
        FIXTURES_DIR / "demo_run.jsonl",
        Path("fixtures/demo_run.jsonl"),
    ]
    for p in fixture_paths:
        if p.exists():
            events = []
            with open(p, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        events.append(json.loads(line.strip()))
            return events
    return []


@app.websocket("/ws/deal/{run_id}")
async def websocket_deal_endpoint(websocket: WebSocket, run_id: str):
    await websocket.accept()

    deal_info = RUNS_REGISTRY.get(run_id, {})
    brief = deal_info.get("brief", "Creator Collaboration Contract")
    raw_budget = deal_info.get("budget")
    budget = float(raw_budget) if raw_budget else None
    creators = int(deal_info.get("creators", 1))
    log_file_path = RUNS_DIR / f"{run_id}.jsonl"

    def append_log(event: Dict[str, Any]):
        with open(log_file_path, "a", encoding="utf-8") as lf:
            lf.write(json.dumps(event) + "\n")

    # 1. Emit run_start
    run_start_event = make_event("run_start", run_id=run_id, seq=1, brief=brief)
    append_log(run_start_event)
    await websocket.send_json(run_start_event)

    graph = build_deal_graph()
    config = {"configurable": {"thread_id": run_id}, "recursion_limit": 60}

    init_state = {
        "brief": brief,
        "run_id": run_id,
        "sender": "user",
        "messages": [],
        "creators": [],
        "payment_model": {"total_budget": budget, "currency": "USD", "creator_count": creators},
        "draft": {},
        "compliance": {},
        "revision_count": 0,
        "settlement": {},
        "approvals": {},
        "trace": [run_start_event],
    }

    last_emitted_seq = 1

    async def emit_new_events():
        nonlocal last_emitted_seq
        current_state = graph.get_state(config)
        trace = current_state.values.get("trace", [])
        for ev in trace:
            if ev.get("seq", 0) > last_emitted_seq:
                last_emitted_seq = ev["seq"]
                append_log(ev)
                await websocket.send_json(ev)

    try:
        # Run until first interrupt (contract_gate) or completion
        graph.invoke(init_state, config)
        await emit_new_events()

        # Handle gate loops
        while True:
            current_state = graph.get_state(config)
            if not current_state.next:
                # Graph completed
                break

            # If interrupted at a gate, emit approval_required to client if not already sent
            for task in current_state.tasks:
                for int_item in getattr(task, "interrupts", []):
                    val = getattr(int_item, "value", {})
                    if isinstance(val, dict) and "gate" in val:
                        gate_name = val["gate"]
                        summary = val.get("summary", "")
                        last_emitted_seq += 1
                        approval_ev = make_event(
                            "approval_required",
                            run_id=run_id,
                            seq=last_emitted_seq,
                            gate=gate_name,
                            summary=summary,
                        )
                        append_log(approval_ev)
                        await websocket.send_json(approval_ev)

            # Wait for client approval response
            client_msg = await websocket.receive_json()
            gate = client_msg.get("gate", "contract")
            approved = bool(client_msg.get("approved", False))
            note = client_msg.get("note", "")

            # Resume graph with Command
            command = Command(resume={"gate": gate, "approved": approved, "note": note})
            graph.invoke(command, config)
            await emit_new_events()

    except WebSocketDisconnect:
        pass
    except Exception as exc:
        err_event = make_event(
            "error",
            run_id=run_id,
            seq=last_emitted_seq + 1,
            message=f"Pipeline error: {str(exc)}",
            recoverable=False,
        )
        append_log(err_event)
        try:
            await websocket.send_json(err_event)
        except Exception:
            pass


@app.websocket("/ws/audit")
async def audit_websocket(websocket: WebSocket):
    await handle_audit_ws(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.pactline_backend.api:app", host="0.0.0.0", port=8005, reload=False)
