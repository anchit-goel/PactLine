"""WebSocket client smoke test for Pactline backend."""

import asyncio
import json
import sys
import urllib.request
import websockets


async def run_smoke_test(base_http: str = "http://localhost:8005", base_ws: str = "ws://localhost:8005"):
    print(f"[SMOKE] Requesting new deal run from {base_http}/deal...")

    # 1. POST /deal
    req_data = json.dumps({"brief": "Automated smoke test creator agreement"}).encode("utf-8")
    req = urllib.request.Request(
        f"{base_http}/deal",
        data=req_data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=5) as resp:
        body = json.loads(resp.read().decode("utf-8"))
        run_id = body.get("run_id")

    print(f"[SMOKE] Deal created with run_id: {run_id}")
    ws_uri = f"{base_ws}/ws/deal/{run_id}"
    print(f"[SMOKE] Connecting to WebSocket: {ws_uri}")

    events_received = []

    async with websockets.connect(ws_uri) as ws:
        while True:
            raw_msg = await ws.recv()
            ev = json.loads(raw_msg)
            events_received.append(ev)
            seq = ev.get("seq")
            ev_type = ev.get("type")
            agent = ev.get("agent")
            print(f"  [#{seq}] {ev_type} (agent={agent})")

            if ev_type == "approval_required":
                gate = ev.get("gate", "contract")
                print(f"[SMOKE] Auto-approving {gate} gate...")
                approval_msg = {
                    "type": "approval_response",
                    "gate": gate,
                    "approved": True,
                    "note": f"Auto-approved {gate} by smoke script",
                }
                await ws.send(json.dumps(approval_msg))

            elif ev_type == "run_complete":
                print("[SMOKE] Run completed successfully!")
                break

            elif ev_type == "error":
                print(f"[SMOKE] Received error: {ev.get('message')}")
                if not ev.get("recoverable", False):
                    sys.exit(1)

    print(f"[SMOKE] Smoke test passed. Received {len(events_received)} events in sequence.")


if __name__ == "__main__":
    asyncio.run(run_smoke_test())
