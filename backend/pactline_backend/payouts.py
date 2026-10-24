"""Mock payout adapter and invoice generation for Pactline (BE4).

Generates idempotent simulated payout receipts and invoices without contacting real financial networks.
"""

import hashlib
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

RUNS_DIR = Path("runs")


def generate_reference_id(run_id: str, party: str, milestone: str, gross: float) -> str:
    """Deterministic fake reference ID generator for idempotency."""
    key = f"{run_id}:{party}:{milestone}:{gross:.2f}"
    h = hashlib.sha256(key.encode("utf-8")).hexdigest()[:12]
    return f"pay_tx_{h}"


def schedule_payouts(run_id: str, ledger: Dict[str, Any]) -> Dict[str, Any]:
    """Schedule mock disbursements for a ledger.
    
    Idempotent: If payouts.json already exists for this run, returns the existing receipts.
    """
    RUNS_DIR.mkdir(parents=True, exist_ok=True)
    payout_file = RUNS_DIR / f"{run_id}_payouts.json"

    # Idempotency check: if already executed, return existing receipts
    if payout_file.exists():
        with open(payout_file, "r", encoding="utf-8") as f:
            return json.load(f)

    entries: List[Dict[str, Any]] = ledger.get("entries", [])
    totals: Dict[str, Any] = ledger.get("totals", {})

    receipts = []
    invoices_by_party: Dict[str, Dict[str, Any]] = {}

    now_iso = datetime.now(timezone.utc).isoformat()

    for entry in entries:
        party = entry.get("party", "Unknown Creator")
        milestone = entry.get("milestone", "Deliverable")
        gross = float(entry.get("gross", 0.0))
        tds = float(entry.get("tds", 0.0))
        net = float(entry.get("net", 0.0))
        due_date = entry.get("due_date", "")

        tx_ref = generate_reference_id(run_id, party, milestone, gross)

        receipt = {
            "reference_id": tx_ref,
            "party": party,
            "milestone": milestone,
            "gross": gross,
            "tds_deducted": tds,
            "net_paid": net,
            "due_date": due_date,
            "status": "simulated_success",
            "timestamp": now_iso,
        }
        receipts.append(receipt)

        # Build party invoice
        if party not in invoices_by_party:
            invoices_by_party[party] = {
                "invoice_number": f"INV-{run_id[-6:].upper()}-{len(invoices_by_party)+1:02d}",
                "date": now_iso[:10],
                "party": party,
                "gross": 0.0,
                "tds_withheld": 0.0,
                "net_payable": 0.0,
                "line_items": [],
            }

        inv = invoices_by_party[party]
        inv["gross"] = round(inv["gross"] + gross, 2)
        inv["tds_withheld"] = round(inv["tds_withheld"] + tds, 2)
        inv["net_payable"] = round(inv["net_payable"] + net, 2)
        inv["line_items"].append({
            "milestone": milestone,
            "gross": gross,
            "tds": tds,
            "net": net,
            "reference_id": tx_ref,
        })

    result = {
        "run_id": run_id,
        "created_at": now_iso,
        "receipts": receipts,
        "invoices": list(invoices_by_party.values()),
        "totals": {
            "gross": round(float(totals.get("gross", sum(r["gross"] for r in receipts))), 2),
            "tds": round(float(totals.get("tds", sum(r["tds_deducted"] for r in receipts))), 2),
            "net": round(float(totals.get("net", sum(r["net_paid"] for r in receipts))), 2),
        },
        "mode": "test_mode",
        "notice": "Simulated payouts. Never use real financial credentials in audit environment.",
    }

    # Write out payouts.json
    with open(payout_file, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    return result
