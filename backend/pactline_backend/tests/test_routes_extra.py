"""Unit tests for Pactline extra routes: /runs, /runs/{id}/events, /export/ledger.csv, /replay/{name}."""

import io
import json
from pathlib import Path
from fastapi.testclient import TestClient

from backend.pactline_backend.api import app

client = TestClient(app)


def test_list_runs():
    res = client.get("/runs")
    assert res.status_code == 200
    runs = res.json()
    assert isinstance(runs, list)
    if len(runs) > 0:
        r = runs[0]
        assert "id" in r
        assert "brief" in r
        assert "status" in r
        assert "event_count" in r


def test_get_run_events_and_not_found():
    # 404 case
    res_404 = client.get("/runs/nonexistent_run_99999/events")
    assert res_404.status_code == 404

    # 200 case using existing run or demo run
    runs_dir = Path("runs")
    jsonl_files = list(runs_dir.glob("*.jsonl"))
    if jsonl_files:
        run_id = jsonl_files[0].stem
        res = client.get(f"/runs/{run_id}/events")
        assert res.status_code == 200
        events = res.json()
        assert isinstance(events, list)
        assert len(events) > 0
        assert events[0].get("type") == "run_start"


def test_export_ledger_csv():
    runs_dir = Path("runs")
    jsonl_files = list(runs_dir.glob("*.jsonl"))
    target_id = None
    for p in jsonl_files:
        with open(p, "r", encoding="utf-8") as f:
            content = f.read()
            if '"type": "ledger"' in content or '"type":"ledger"' in content:
                target_id = p.stem
                break

    if target_id:
        res = client.get(f"/runs/{target_id}/export/ledger.csv")
        assert res.status_code == 200
        assert "text/csv" in res.headers.get("content-type", "")
        body = res.text
        assert "party,milestone,gross,tds,net,due_date" in body
        assert "TOTAL" in body


def test_export_contract_pdf():
    from backend.pactline_backend.sandbox import is_docker_available
    import pytest
    if not is_docker_available():
        pytest.skip("Docker is not available")

    runs_dir = Path("runs")
    jsonl_files = list(runs_dir.glob("*.jsonl"))
    target_id = None
    for p in jsonl_files:
        with open(p, "r", encoding="utf-8") as f:
            content = f.read()
            if '"type": "draft_update"' in content or '"type":"draft_update"' in content:
                target_id = p.stem
                break

    if target_id:
        res = client.get(f"/runs/{target_id}/export/contract.pdf")
        assert res.status_code == 200
        assert "application/pdf" in res.headers.get("content-type", "")
        assert res.content.startswith(b"%PDF")



def test_replay_scenarios():
    for name in ["normal", "ambiguous", "failure"]:
        res = client.get(f"/replay/{name}")
        assert res.status_code == 200
        events = res.json()
        assert isinstance(events, list)
        assert len(events) > 0
        assert events[0].get("type") == "run_start"

    # Nonexistent replay
    res_404 = client.get("/replay/nonexistent_scenario_xyz")
    assert res_404.status_code == 404


def test_dataset_status_and_upload():
    # 1. Check status
    res = client.get("/dataset/status")
    assert res.status_code == 200
    assert "exists" in res.json()

    # 2. Upload test CSV
    csv_content = b"col1,col2,target\n1,2,0\n3,4,1\n"
    res_upload = client.post(
        "/upload",
        files={"file": ("test_upload.csv", io.BytesIO(csv_content), "text/csv")},
        data={"description": "Test upload", "target_column": "target"}
    )
    assert res_upload.status_code == 200
    data = res_upload.json()
    assert data["status"] == "success"
    assert data["filename"] == "test_upload.csv"



def test_mode_route(monkeypatch):
    monkeypatch.setenv("PACTLINE_STUB", "1")
    assert client.get("/mode").json() == {"mode": "stub", "stub": True}
    monkeypatch.setenv("PACTLINE_STUB", "0")
    assert client.get("/mode").json() == {"mode": "live", "stub": False}
