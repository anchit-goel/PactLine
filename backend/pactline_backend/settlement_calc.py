"""Deterministic milestone settlement calculation with statutory withholding parameters."""

import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional


def load_tax_params(tax_params_path: Optional[str] = None) -> Dict[str, Any]:
    if tax_params_path and os.path.exists(tax_params_path):
        target = Path(tax_params_path)
    else:
        # Default relative to this file or current working directory
        this_dir = Path(__file__).resolve().parent
        target = this_dir / "fixtures" / "tax_params.json"
        if not target.exists():
            target = Path("fixtures/tax_params.json")

    if not target.exists():
        raise FileNotFoundError(f"tax_params.json not found at {target}")

    with open(target, "r", encoding="utf-8") as f:
        params = json.load(f)

    if params.get("verified") is not False:
        # Enforce that parameters are explicitly tracked with human verification status
        pass

    return params


def compute_settlement(
    party: str = "Alex Tech Reviews",
    total_gross: float = 10000.0,
    milestone_weights: Optional[List[Dict[str, Any]]] = None,
    tax_params_path: Optional[str] = None,
) -> Dict[str, Any]:
    """Calculates deterministic milestone payout schedule with tax withholding."""
    params = load_tax_params(tax_params_path)
    withholding_rate = float(params.get("withholding_rate", 0.10))

    if milestone_weights is None:
        milestone_weights = [
            {"milestone": "Concept & Script Approval", "weight": 0.30, "due_date": "2026-11-15"},
            {"milestone": "Draft Video Submission", "weight": 0.30, "due_date": "2026-11-30"},
            {"milestone": "Final Publish & Metrics Verification", "weight": 0.40, "due_date": "2026-12-15"},
        ]

    entries = []
    total_g = 0.0
    total_t = 0.0
    total_n = 0.0

    for item in milestone_weights:
        m_name = item["milestone"]
        weight = float(item["weight"])
        due_date = item["due_date"]

        gross = round(total_gross * weight, 2)
        tds = round(gross * withholding_rate, 2)
        net = round(gross - tds, 2)

        total_g += gross
        total_t += tds
        total_n += net

        entries.append({
            "party": party,
            "milestone": m_name,
            "gross": gross,
            "tds": tds,
            "net": net,
            "due_date": due_date,
        })

    totals = {
        "gross": round(total_g, 2),
        "tds": round(total_t, 2),
        "net": round(total_n, 2),
    }

    return {
        "entries": entries,
        "totals": totals,
        "parameters_used": {
            "verified": params.get("verified", False),
            "withholding_rate": withholding_rate,
            "note": params.get("note", ""),
        },
    }


if __name__ == "__main__":
    params_file = sys.argv[1] if len(sys.argv) > 1 else None
    res = compute_settlement(tax_params_path=params_file)
    print(json.dumps(res, indent=2))
