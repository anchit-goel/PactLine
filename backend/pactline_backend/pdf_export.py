"""Contract PDF compilation using Typst inside the isolated Docker sandbox."""

import json
import os
import tempfile
from pathlib import Path
from typing import Any, Dict, Optional

from backend.pactline_backend.sandbox import (
    create_sandbox,
    copy_in,
    exec as sbx_exec,
    copy_out,
    destroy,
    is_docker_available,
)

RUNS_DIR = Path("runs")


def escape_typst(text: str) -> str:
    """Escape Typst special characters."""
    if not text:
        return ""
    # In Typst, #, $, @, and [ ] can have syntactic meanings
    res = text.replace("\\", "\\\\")
    res = res.replace("#", "\\#")
    res = res.replace("$", "\\$")
    res = res.replace("@", "\\@")
    return res


def build_typst_content(run_id: str, brief: str, draft: Optional[Dict[str, Any]], ledger: Optional[Dict[str, Any]]) -> str:
    """Generate clean Typst document source."""
    brief_escaped = escape_typst(brief)
    
    lines = [
        '#set page(paper: "a4", margin: 2.2cm)',
        '#set text(font: "Liberation Sans", size: 10pt)',
        '= Pactline Creator Collaboration Agreement',
        '#v(0.3em)',
        f'*Run ID:* `{run_id}` \\',
        f'*Subject Brief:* {brief_escaped} \\',
        '#v(1em)',
        '== 1. Sourced Collaboration Clauses',
        '#v(0.5em)',
    ]

    clauses = draft.get("clauses", []) if draft else []
    if not clauses:
        lines.append('_No draft clauses recorded._')
    else:
        for idx, c in enumerate(clauses):
            c_text = escape_typst(c.get("text", ""))
            src_ids = c.get("source_ids", [])
            fn_text = escape_typst(", ".join(src_ids)) if src_ids else "Direct Brief Requirement"
            lines.append(f'+ {c_text} #footnote[{fn_text}]')

    lines.extend([
        '#v(1.5em)',
        '== 2. Milestone Disbursement Schedule',
        '#v(0.5em)',
    ])

    entries = ledger.get("entries", []) if ledger else []
    if not entries:
        lines.append('_No settlement ledger recorded._')
    else:
        lines.append('#table(')
        lines.append('  columns: (2.2fr, 1.4fr, 1.2fr, 1.2fr, 1.2fr),')
        lines.append('  [Party], [Milestone], [Gross], [TDS (10%)], [Net],')
        for entry in entries:
            party = escape_typst(entry.get("party", ""))
            milestone = escape_typst(entry.get("milestone", ""))
            gross = f'\\${entry.get("gross", 0.0):.2f}'
            tds = f'-\\${entry.get("tds", 0.0):.2f}'
            net = f'\\${entry.get("net", 0.0):.2f}'
            lines.append(f'  [{party}], [{milestone}], [{gross}], [{tds}], [{net}],')
        
        totals = ledger.get("totals", {}) if ledger else {}
        if totals:
            t_gross = f'\\${totals.get("gross", 0.0):.2f}'
            t_tds = f'-\\${totals.get("tds", 0.0):.2f}'
            t_net = f'\\${totals.get("net", 0.0):.2f}'
            lines.append(f'  [*TOTALS*], [], [*{t_gross}*], [*{t_tds}*], [*{t_net}*],')
        lines.append(')')

    lines.extend([
        '#v(2em)',
        '#align(center)[',
        '  _Decision support, not legal advice._ \\',
        '  #text(size: 8pt, fill: luma(100))[Statutory withholding parameters and tax calculations must be verified by a qualified human officer before live execution.]',
        ']',
    ])

    return "\n".join(lines)


def generate_contract_pdf(run_id: str) -> bytes:
    """Compile contract PDF using Typst inside an isolated Docker sandbox."""
    run_file = RUNS_DIR / f"{run_id}.jsonl"
    if not run_file.exists():
        raise FileNotFoundError(f"Run file '{run_file}' not found.")

    brief = "Creator Collaboration Agreement"
    latest_draft = None
    latest_ledger = None

    with open(run_file, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                ev = json.loads(line.strip())
                if ev.get("type") == "run_start":
                    brief = ev.get("brief", brief)
                elif ev.get("type") == "draft_update":
                    latest_draft = ev
                elif ev.get("type") == "ledger":
                    latest_ledger = ev

    typst_src = build_typst_content(run_id, brief, latest_draft, latest_ledger)

    if not is_docker_available():
        raise RuntimeError("Docker daemon is required to compile contract.pdf in the sandbox.")

    # Sandbox execution
    sbx_name = create_sandbox(f"pdf_{run_id[:8]}")
    try:
        with tempfile.NamedTemporaryFile("w+", suffix=".typ", delete=False) as tf_typ:
            tf_typ.write(typst_src)
            typ_path = tf_typ.name
        os.chmod(typ_path, 0o644)

        with tempfile.NamedTemporaryFile("wb+", suffix=".pdf", delete=False) as tf_pdf:
            pdf_path = tf_pdf.name

        try:
            copy_in(sbx_name, typ_path, "/workspace/contract.typ")
            res = sbx_exec(sbx_name, "typst compile /workspace/contract.typ /workspace/contract.pdf")
            if res.returncode != 0:
                raise RuntimeError(f"Typst compilation failed: {res.stderr}")

            copy_out(sbx_name, "/workspace/contract.pdf", pdf_path)

            with open(pdf_path, "rb") as f_pdf:
                pdf_bytes = f_pdf.read()

            if not pdf_bytes.startswith(b"%PDF"):
                raise ValueError("Generated file is not a valid PDF.")

            return pdf_bytes
        finally:
            if os.path.exists(typ_path):
                os.remove(typ_path)
            if os.path.exists(pdf_path):
                os.remove(pdf_path)
    finally:
        destroy(sbx_name)
