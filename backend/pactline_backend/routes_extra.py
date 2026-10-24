"""Extra API routes for Pactline: run listing, event retrieval, ledger export, and replays."""

import csv
import io
import json
import os
from pathlib import Path
from typing import Any, Dict, List

import shutil
from fastapi import APIRouter, HTTPException, Response, File, UploadFile, Form
from fastapi.responses import JSONResponse, FileResponse
from backend.pactline_backend.audit_generator import generate_audit_outputs

router = APIRouter(tags=["extras"])

RUNS_DIR = Path("runs")
FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"
REPLAYS_DIR = FIXTURES_DIR / "replays"


@router.get("/mode")
def get_mode() -> Dict[str, Any]:
    """Report whether the backend runs in stub (simulated) or live mode."""
    stub = os.environ.get("PACTLINE_STUB", "1") == "1"
    return {"mode": "stub" if stub else "live", "stub": stub}


@router.get("/runs")
def list_runs() -> List[Dict[str, Any]]:
    """List all recorded deal runs in the runs directory."""
    RUNS_DIR.mkdir(parents=True, exist_ok=True)
    results = []

    jsonl_files = sorted(RUNS_DIR.glob("*.jsonl"), key=os.path.getmtime, reverse=True)
    for p in jsonl_files:
        run_id = p.stem
        brief = "Creator Contract Run"
        status = "in_progress"
        event_count = 0
        created_at = None

        try:
            with open(p, "r", encoding="utf-8") as f:
                lines = [line.strip() for line in f if line.strip()]

            event_count = len(lines)
            if event_count > 0:
                first_ev = json.loads(lines[0])
                brief = first_ev.get("brief", brief)
                created_at = first_ev.get("ts")

                last_ev = json.loads(lines[-1])
                last_type = last_ev.get("type")
                if last_type == "run_complete":
                    status = "completed"
                elif last_type == "error":
                    status = "failed"
                elif last_type == "approval_required":
                    status = "awaiting_approval"
        except Exception:
            status = "unknown"

        results.append({
            "id": run_id,
            "brief": brief,
            "status": status,
            "event_count": event_count,
            "created_at": created_at,
        })

    return results


@router.get("/runs/{run_id}/events")
def get_run_events(run_id: str) -> List[Dict[str, Any]]:
    """Return all recorded sequential events for a specific run."""
    run_file = RUNS_DIR / f"{run_id}.jsonl"
    if not run_file.exists():
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")

    events = []
    with open(run_file, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                events.append(json.loads(line.strip()))
    return events


@router.get("/runs/{run_id}/export/ledger.csv")
def export_ledger_csv(run_id: str):
    """Export the finalized settlement payout ledger as a downloadable CSV."""
    run_file = RUNS_DIR / f"{run_id}.jsonl"
    if not run_file.exists():
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")

    ledger_event = None
    with open(run_file, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                ev = json.loads(line.strip())
                if ev.get("type") == "ledger":
                    ledger_event = ev

    if not ledger_event:
        raise HTTPException(
            status_code=400,
            detail=f"No finalized ledger found for run '{run_id}'."
        )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["party", "milestone", "gross", "tds", "net", "due_date"])

    entries = ledger_event.get("entries", [])
    for entry in entries:
        writer.writerow([
            entry.get("party", ""),
            entry.get("milestone", ""),
            entry.get("gross", 0.0),
            entry.get("tds", 0.0),
            entry.get("net", 0.0),
            entry.get("due_date", ""),
        ])

    totals = ledger_event.get("totals", {})
    if totals:
        writer.writerow([
            "TOTAL",
            "",
            totals.get("gross", 0.0),
            totals.get("tds", 0.0),
            totals.get("net", 0.0),
            "",
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="ledger_{run_id}.csv"'}
    )


@router.get("/runs/{run_id}/export/contract.pdf")
def export_contract_pdf(run_id: str):
    """Export the agreed contract and settlement schedule as a Typst-compiled PDF."""
    try:
        from backend.pactline_backend.pdf_export import generate_contract_pdf
        pdf_bytes = generate_contract_pdf(run_id)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="contract_{run_id}.pdf"'}
        )
    except FileNotFoundError as fnf:
        raise HTTPException(status_code=404, detail=str(fnf))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to generate contract PDF in sandbox: {str(exc)}")



@router.get("/replay/{name}")
def get_replay_scenario(name: str) -> List[Dict[str, Any]]:
    """Return pre-recorded scenario events for offline/demo replay."""
    candidate_paths = [
        REPLAYS_DIR / f"{name}.jsonl",
        FIXTURES_DIR / f"{name}.jsonl",
        FIXTURES_DIR / f"{name}_run.jsonl",
    ]

    for p in candidate_paths:
        if p.exists():
            events = []
            with open(p, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        events.append(json.loads(line.strip()))
            return events

    available = [p.stem for p in REPLAYS_DIR.glob("*.jsonl")] if REPLAYS_DIR.exists() else []
    raise HTTPException(
        status_code=404,
        detail=f"Replay scenario '{name}' not found. Available scenarios: {available}"
    )


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    description: str = Form(""),
    target_column: str = Form(""),
):
    """Handle CSV dataset uploads from the frontend UploadNode."""
    if not file.filename or not file.filename.lower().endswith(".csv"):
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": "Only .csv files are accepted"}
        )

    os.makedirs("dataset", exist_ok=True)
    file_path = os.path.abspath("dataset/data.csv")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    metadata = {"description": description.strip(), "target_column": target_column.strip()}
    metadata_path = os.path.abspath("dataset/metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    # Immediately populate outputs/ for visual canvas charts & code tabs
    generate_audit_outputs(file_path)

    file_size = os.path.getsize(file_path)
    return {
        "status": "success",
        "filename": file.filename,
        "saved_as": "data.csv",
        "size_bytes": file_size,
        "target_column": target_column.strip(),
    }


@router.get("/dataset/status")
async def dataset_status():
    """Check if an uploaded dataset exists."""
    file_path = os.path.abspath("dataset/data.csv")
    if os.path.exists(file_path) and os.path.getsize(file_path) > 10:
        size = os.path.getsize(file_path)
        return {"exists": True, "filename": "data.csv", "size_bytes": size}
    return {"exists": False}


@router.get("/outputs/{filename}")
async def get_output_file(filename: str):
    """Serve generated JSON charts, markdown reviews, code cells, or PDF reports."""
    outputs_dir = Path("outputs").resolve()
    target_path = (outputs_dir / filename).resolve()
    if not str(target_path).startswith(str(outputs_dir)):
        raise HTTPException(status_code=403, detail="Access denied")

    if not target_path.exists():
        # Auto-generate if missing
        generate_audit_outputs()

    if target_path.exists():
        if filename.endswith(".json"):
            return Response(content=target_path.read_text(encoding="utf-8"), media_type="application/json")
        elif filename.endswith(".md") or filename.endswith(".txt"):
            return Response(content=target_path.read_text(encoding="utf-8"), media_type="text/markdown")
        elif filename.endswith(".pdf"):
            return Response(content=target_path.read_bytes(), media_type="application/pdf")
        return FileResponse(str(target_path))

    raise HTTPException(status_code=404, detail=f"Output file {filename} not found")


