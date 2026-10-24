"""Tests for Pactline stub run workflow and sandbox settlement calculation."""

import json
import os
import pytest
from langgraph.types import Command

from backend.pactline_backend.graph import build_deal_graph
from backend.pactline_backend.events import make_event
from backend.pactline_backend.settlement_calc import compute_settlement
from backend.pactline_backend.sandbox import (
    is_docker_available,
    create_sandbox,
    copy_in,
    exec,
    destroy,
    cleanup_all,
)


def run_full_stub_pipeline(run_id: str = "test_stub_42"):
    graph = build_deal_graph()
    config = {"configurable": {"thread_id": run_id}, "recursion_limit": 60}

    run_start_event = make_event("run_start", run_id=run_id, seq=1, brief="Creator test deal")
    init_state = {
        "brief": run_id,
        "sender": "user",
        "messages": [],
        "creators": [],
        "payment_model": {},
        "draft": {},
        "compliance": {},
        "revision_count": 0,
        "settlement": {},
        "approvals": {},
        "trace": [run_start_event],
    }

    # Step 1: run to contract gate interrupt
    graph.invoke(init_state, config)

    # Step 2: approve contract gate
    graph.invoke(Command(resume={"gate": "contract", "approved": True, "note": "Contract ok"}), config)

    # Step 3: approve payout gate
    graph.invoke(Command(resume={"gate": "payout", "approved": True, "note": "Payout ok"}), config)

    final_state = graph.get_state(config)
    return final_state.values.get("trace", [])


def test_stub_run_contract_and_sequence():
    trace = run_full_stub_pipeline("run_assert_01")
    assert len(trace) > 10

    # 1. seq monotonic
    seqs = [e["seq"] for e in trace]
    assert seqs == sorted(seqs)
    assert len(seqs) == len(set(seqs))
    for i in range(len(seqs) - 1):
        assert seqs[i] + 1 == seqs[i + 1]

    # 2. At least one retrieval with action requery
    requeries = [e for e in trace if e.get("type") == "retrieval" and e.get("action") == "requery"]
    assert len(requeries) >= 1

    # 3. Compliance result with passed=false followed later by passed=true
    comp_events = [e for e in trace if e.get("type") == "compliance_result"]
    assert len(comp_events) >= 2
    first_passed = comp_events[0].get("passed")
    second_passed = comp_events[1].get("passed")
    assert first_passed is False
    assert second_passed is True

    # 4. Exactly two approval_required events
    approvals = [e for e in trace if e.get("type") == "approval_required"]
    assert len(approvals) == 2
    assert approvals[0]["gate"] == "contract"
    assert approvals[1]["gate"] == "payout"

    # 5. Ledger totals equal values worked out by hand, independent of settlement_calc.py
    # Hand calculation:
    # 10,000 total gross with 10% statutory withholding:
    # - M1 (30%): gross = 3000.0, tds = 300.0, net = 2700.0
    # - M2 (30%): gross = 3000.0, tds = 300.0, net = 2700.0
    # - M3 (40%): gross = 4000.0, tds = 400.0, net = 3600.0
    # Expected totals: gross = 10000.0, tds = 1000.0, net = 9000.0
    EXPECTED_HAND_GROSS = 10000.0
    EXPECTED_HAND_TDS = 1000.0
    EXPECTED_HAND_NET = 9000.0

    ledger_events = [e for e in trace if e.get("type") == "ledger"]
    assert len(ledger_events) == 1
    ledger = ledger_events[0]
    totals = ledger.get("totals", {})
    assert totals.get("gross") == EXPECTED_HAND_GROSS
    assert totals.get("tds") == EXPECTED_HAND_TDS
    assert totals.get("net") == EXPECTED_HAND_NET

    # 6. run_complete is the last event
    assert trace[-1]["type"] == "run_complete"


@pytest.mark.skipif(not is_docker_available(), reason="Docker daemon is not reachable")
def test_settlement_calc_in_sandbox():
    cleanup_all()
    run_id = "sbx_calc_99"
    name = create_sandbox(run_id)
    try:
        calc_path = os.path.abspath("backend/pactline_backend/settlement_calc.py")
        params_path = os.path.abspath("backend/pactline_backend/fixtures/tax_params.json")

        copy_in(name, calc_path, "/workspace/settlement_calc.py")
        copy_in(name, params_path, "/workspace/tax_params.json")

        # Run script inside the sandbox
        res = exec(name, "python3 /workspace/settlement_calc.py /workspace/tax_params.json")
        assert res.returncode == 0, f"exec failed: {res.stderr}"

        sandbox_result = json.loads(res.stdout.strip())
        local_result = compute_settlement(tax_params_path=params_path)

        # Assert output equals local result
        assert sandbox_result["totals"] == local_result["totals"]
        assert sandbox_result["entries"] == local_result["entries"]
        assert sandbox_result["parameters_used"]["withholding_rate"] == local_result["parameters_used"]["withholding_rate"]

    finally:
        destroy(name)
        cleanup_all()
