"""Unit tests for mock payout adapter and idempotency (BE4)."""

import os
from pathlib import Path
from backend.pactline_backend.payouts import schedule_payouts

SAMPLE_LEDGER = {
    "entries": [
        {"party": "Alex Tech", "milestone": "Script", "gross": 3000.0, "tds": 300.0, "net": 2700.0, "due_date": "2026-11-15"},
        {"party": "Alex Tech", "milestone": "Video", "gross": 7000.0, "tds": 700.0, "net": 6300.0, "due_date": "2026-12-01"},
    ],
    "totals": {"gross": 10000.0, "tds": 1000.0, "net": 9000.0},
}


def test_schedule_payouts_and_totals():
    run_id = "test_payout_run_101"
    payout_file = Path("runs") / f"{run_id}_payouts.json"
    if payout_file.exists():
        os.remove(payout_file)

    try:
        res1 = schedule_payouts(run_id, SAMPLE_LEDGER)
        assert res1["run_id"] == run_id
        assert res1["totals"]["gross"] == 10000.0
        assert res1["totals"]["tds"] == 1000.0
        assert res1["totals"]["net"] == 9000.0
        assert len(res1["receipts"]) == 2
        assert len(res1["invoices"]) == 1

        # Check invoice totals
        inv = res1["invoices"][0]
        assert inv["party"] == "Alex Tech"
        assert inv["gross"] == 10000.0
        assert inv["net_payable"] == 9000.0

        # Idempotency check: call second time
        res2 = schedule_payouts(run_id, SAMPLE_LEDGER)
        assert res2["receipts"] == res1["receipts"]
        assert res2["invoices"] == res1["invoices"]
        assert res2["totals"] == res1["totals"]

    finally:
        if payout_file.exists():
            os.remove(payout_file)
