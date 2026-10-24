"""LangGraph workflow for Pactline creator contract generation and compliance auditing."""

import os
import re
from typing import Any, Dict, List, Literal, Optional
from langchain_core.messages import AIMessage, HumanMessage
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import interrupt, Command

from backend.pactline_backend.state import DealState
from backend.pactline_backend.events import make_event
from backend.pactline_backend.trace import generate_stub_usage
from backend.pactline_backend.retrieval import retrieve, grade
from backend.pactline_backend.settlement_calc import compute_settlement

MAX_REVISIONS = 3


def is_stub_mode() -> bool:
    return os.environ.get("PACTLINE_STUB", "1") == "1"


def get_seq(state: DealState) -> int:
    return len(state.get("trace", [])) + 1


def _get_run_id(state: DealState) -> str:
    """Get the actual run_id from state, falling back to brief for compat."""
    return state.get("run_id", "") or state.get("brief", "run_stub")


def _parse_budget_from_brief(state: DealState) -> float:
    """Extract total budget from payment_model or parse from brief text."""
    pm = state.get("payment_model", {})
    if pm and pm.get("total_budget"):
        return float(pm["total_budget"])
    # Fallback: try to extract from brief text.
    # Prefer an explicit "Budget: $X" statement, then the first $-amount.
    brief = state.get("brief", "") or ""
    patterns = [
        r'budget[^\n$\d]{0,30}\$?\s*([\d,]+(?:\.\d+)?)\s*(k\b)?',
        r'\$\s*([\d,]+(?:\.\d+)?)\s*(k\b)?',
        r'([\d,]+(?:\.\d+)?)\s*(k\b)?\s*usd',
    ]
    for pat in patterns:
        match = re.search(pat, brief, re.IGNORECASE)
        if match:
            try:
                val = float(match.group(1).replace(",", ""))
                if match.group(2):
                    val *= 1000
                if val > 0:
                    return val
            except ValueError:
                continue
    return 10000.0


def _get_creator_name(state: DealState) -> str:
    """Extract a creator name from brief text, or use a sensible default."""
    brief = state.get("brief", "")
    # Try to find named creator patterns
    match = re.search(r'(?:creator|influencer|partner)[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)', brief)
    if match:
        return match.group(1)
    return "Creator Partner"


# ── Node 1: brief_analyst ───────────────────────────────────────────────────

def brief_analyst(state: DealState) -> Dict[str, Any]:
    if not is_stub_mode():
        raise NotImplementedError("brief_analyst")

    run_id = _get_run_id(state)
    brief_text = state.get("brief", "")
    budget = _parse_budget_from_brief(state)
    trace: List[Dict[str, Any]] = []

    # 1. agent_start
    trace.append(make_event("agent_start", run_id=run_id, seq=get_seq(state) + len(trace), agent="brief_analyst"))

    # 2. retrieval with low grade -> requery
    hits_broad = retrieve("creators", "broad creator requirements", k=3)
    grade_1 = grade("broad", hits_broad)  # 0.42
    trace.append(make_event(
        "retrieval",
        run_id=run_id,
        seq=get_seq(state) + len(trace),
        agent="brief_analyst",
        query="broad creator requirements",
        source="creators",
        hits=hits_broad,
        grade=grade_1,
        action="requery",
        rewritten_query="creator rate cards and past tech deliverables",
    ))

    # 3. retrieval accepted
    hits_refined = retrieve("creators", "creator rate cards and past tech deliverables", k=3)
    grade_2 = grade("creator rate cards and past tech deliverables", hits_refined)  # 0.92
    trace.append(make_event(
        "retrieval",
        run_id=run_id,
        seq=get_seq(state) + len(trace),
        agent="brief_analyst",
        query="creator rate cards and past tech deliverables",
        source="creators",
        hits=hits_refined,
        grade=grade_2,
        action="accept",
    ))

    # 4. agent_end — include parsed budget in summary for transparency
    trace.append(make_event(
        "agent_end",
        run_id=run_id,
        seq=get_seq(state) + len(trace),
        agent="brief_analyst",
        summary=f"Brief parsed: ${budget:,.0f} campaign budget identified with 3 milestone gates.",
    ))

    # 5. llm_usage
    trace.append(generate_stub_usage(run_id, get_seq(state) + len(trace), "brief_analyst", tokens_in=520, tokens_out=190))

    return {
        "sender": "brief_analyst",
        "creators": hits_refined,
        "payment_model": {
            "total_budget": budget,
            "currency": "USD",
            "creator_count": state.get("payment_model", {}).get("creator_count", 1),
        },
        "trace": trace,
        "messages": [AIMessage(content=f"Brief analyzed: ${budget:,.0f} budget, creator profile retrieved.")],
    }


# ── Node 2: deal_architect ──────────────────────────────────────────────────

def deal_architect(state: DealState) -> Dict[str, Any]:
    if not is_stub_mode():
        raise NotImplementedError("deal_architect")

    run_id = _get_run_id(state)
    budget = _parse_budget_from_brief(state)
    trace: List[Dict[str, Any]] = []
    current_rev = state.get("revision_count", 0) + 1

    trace.append(make_event("agent_start", run_id=run_id, seq=get_seq(state) + len(trace), agent="deal_architect"))

    if current_rev == 1:
        # Revision 1: intentionally omits disclosure clause
        clauses = [
            {
                "id": "cls_ip_transfer_001",
                "text": f"Creator hereby assigns all worldwide right, title, and interest in and to Deliverables upon final milestone settlement (total: ${budget:,.0f}).",
                "source_ids": ["cls_ip_transfer_001"],
            },
            {
                "id": "cls_exclusivity_003",
                "text": "Creator shall not endorse direct audio tech competitors for 30 days post-launch.",
                "source_ids": ["cls_exclusivity_003"],
            },
        ]
    else:
        # Revision 2+: includes disclosure clause
        clauses = [
            {
                "id": "cls_ip_transfer_001",
                "text": f"Creator hereby assigns all worldwide right, title, and interest in and to Deliverables upon final milestone settlement (total: ${budget:,.0f}).",
                "source_ids": ["cls_ip_transfer_001"],
            },
            {
                "id": "cls_disclosure_002",
                "text": "Creator must prominently display promotional disclosure (#Ad, #Sponsored) at beginning of all published content in accordance with FTC guidelines.",
                "source_ids": ["cls_disclosure_002", "reg_ftc_endorsement_001"],
            },
            {
                "id": "cls_exclusivity_003",
                "text": "Creator shall not endorse direct audio tech competitors for 30 days post-launch.",
                "source_ids": ["cls_exclusivity_003"],
            },
        ]

    trace.append(make_event(
        "draft_update",
        run_id=run_id,
        seq=get_seq(state) + len(trace),
        agent="deal_architect",
        revision=current_rev,
        clauses=clauses,
    ))

    trace.append(make_event(
        "agent_end",
        run_id=run_id,
        seq=get_seq(state) + len(trace),
        agent="deal_architect",
        summary=f"Draft contract updated to revision {current_rev} with {len(clauses)} clauses.",
    ))

    trace.append(generate_stub_usage(run_id, get_seq(state) + len(trace), "deal_architect", tokens_in=850, tokens_out=340))

    return {
        "sender": "deal_architect",
        "draft": {"revision": current_rev, "clauses": clauses},
        "revision_count": current_rev,
        "trace": trace,
        "messages": [AIMessage(content=f"Draft revision {current_rev} generated.")],
    }


# ── Node 3: compliance_auditor ──────────────────────────────────────────────

def compliance_auditor(state: DealState) -> Dict[str, Any]:
    if not is_stub_mode():
        raise NotImplementedError("compliance_auditor")

    run_id = _get_run_id(state)
    trace: List[Dict[str, Any]] = []
    current_rev = state.get("revision_count", 1)

    trace.append(make_event("agent_start", run_id=run_id, seq=get_seq(state) + len(trace), agent="compliance_auditor"))

    if current_rev == 1:
        passed = False
        issues = [
            {
                "clause_id": "cls_disclosure_002",
                "rule_source_id": "reg_ftc_endorsement_001",
                "severity": "high",
                "fix_hint": "Mandatory disclosure clause missing per FTC Endorsement Guides 16 CFR Part 255.",
            }
        ]
    else:
        passed = True
        issues = []

    trace.append(make_event(
        "compliance_result",
        run_id=run_id,
        seq=get_seq(state) + len(trace),
        agent="compliance_auditor",
        revision=current_rev,
        passed=passed,
        issues=issues,
    ))

    summary = "Compliance check passed." if passed else f"Compliance check failed with {len(issues)} issue(s)."
    trace.append(make_event(
        "agent_end",
        run_id=run_id,
        seq=get_seq(state) + len(trace),
        agent="compliance_auditor",
        summary=summary,
    ))

    trace.append(generate_stub_usage(run_id, get_seq(state) + len(trace), "compliance_auditor", tokens_in=610, tokens_out=180))

    return {
        "sender": "compliance_auditor",
        "compliance": {"revision": current_rev, "passed": passed, "issues": issues},
        "trace": trace,
        "messages": [AIMessage(content=summary)],
    }


def route_compliance(state: DealState) -> Literal["deal_architect", "contract_gate"]:
    compliance = state.get("compliance", {})
    if compliance.get("passed", False):
        return "contract_gate"
    revision_count = state.get("revision_count", 0)
    if revision_count < MAX_REVISIONS:
        return "deal_architect"
    # Max revisions reached: escalate to human gate with flagged issues
    return "contract_gate"


# ── Node 4: contract_gate ───────────────────────────────────────────────────

def contract_gate(state: DealState) -> Dict[str, Any]:
    if not is_stub_mode():
        raise NotImplementedError("contract_gate")

    run_id = _get_run_id(state)
    trace: List[Dict[str, Any]] = []

    compliance = state.get("compliance", {})
    if compliance.get("passed"):
        summary = "Contract draft revision approved by automated compliance check. Sign-off required."
    else:
        issues = compliance.get("issues", [])
        summary = f"Contract draft reached revision limit with {len(issues)} unverified compliance issue(s). Manual review required."

    # Emit approval_required event
    trace.append(make_event(
        "approval_required",
        run_id=run_id,
        seq=get_seq(state) + len(trace),
        gate="contract",
        summary=summary,
    ))

    # Interrupt and wait for approval response
    decision = interrupt({"gate": "contract", "summary": summary})

    approvals = dict(state.get("approvals", {}))
    approvals["contract"] = decision

    if not decision or not decision.get("approved"):
        trace.append(make_event(
            "error",
            run_id=run_id,
            seq=get_seq(state) + len(trace),
            message="Contract sign-off was rejected by the reviewer.",
            recoverable=True,
        ))
        return {"approvals": approvals, "trace": trace, "sender": "contract_gate"}

    return {"approvals": approvals, "trace": trace, "sender": "contract_gate"}


def route_contract_gate(state: DealState) -> Literal["settlement_agent", "__end__"]:
    approvals = state.get("approvals", {})
    contract_decision = approvals.get("contract", {})
    if contract_decision and contract_decision.get("approved"):
        return "settlement_agent"
    return "__end__"


# ── Node 5: settlement_agent ────────────────────────────────────────────────

def settlement_agent(state: DealState) -> Dict[str, Any]:
    if not is_stub_mode():
        raise NotImplementedError("settlement_agent")

    run_id = _get_run_id(state)
    budget = _parse_budget_from_brief(state)
    creator_name = _get_creator_name(state)
    trace: List[Dict[str, Any]] = []

    trace.append(make_event("agent_start", run_id=run_id, seq=get_seq(state) + len(trace), agent="settlement_agent"))

    # Tool call — use dynamic budget and creator name
    tool_args = {"party": creator_name, "total_gross": budget}
    trace.append(make_event(
        "tool_call",
        run_id=run_id,
        seq=get_seq(state) + len(trace),
        agent="settlement_agent",
        tool_id="call_calc_milestones_01",
        name="calculate_milestone_settlement",
        args=tool_args,
    ))

    # Deterministic settlement calculation with actual budget
    calc_res = compute_settlement(party=creator_name, total_gross=budget)

    trace.append(make_event(
        "tool_result",
        run_id=run_id,
        seq=get_seq(state) + len(trace),
        agent="settlement_agent",
        tool_id="call_calc_milestones_01",
        name="calculate_milestone_settlement",
        output=calc_res,
        ok=True,
    ))

    trace.append(make_event(
        "agent_end",
        run_id=run_id,
        seq=get_seq(state) + len(trace),
        agent="settlement_agent",
        summary=f"Milestone payout schedule calculated: ${budget:,.0f} gross across {len(calc_res['entries'])} milestones.",
    ))

    trace.append(generate_stub_usage(run_id, get_seq(state) + len(trace), "settlement_agent", tokens_in=410, tokens_out=150))

    return {
        "sender": "settlement_agent",
        "settlement": calc_res,
        "trace": trace,
        "messages": [AIMessage(content=f"Milestone payout for ${budget:,.0f} calculated.")],
    }


# ── Node 6: payout_gate ─────────────────────────────────────────────────────

def payout_gate(state: DealState) -> Dict[str, Any]:
    if not is_stub_mode():
        raise NotImplementedError("payout_gate")

    run_id = _get_run_id(state)
    budget = _parse_budget_from_brief(state)
    trace: List[Dict[str, Any]] = []

    summary = f"Milestone payout of ${budget:,.0f} with statutory tax deductions calculated. Finance approval required."
    trace.append(make_event(
        "approval_required",
        run_id=run_id,
        seq=get_seq(state) + len(trace),
        gate="payout",
        summary=summary,
    ))

    decision = interrupt({"gate": "payout", "summary": summary})

    approvals = dict(state.get("approvals", {}))
    approvals["payout"] = decision

    if not decision or not decision.get("approved"):
        trace.append(make_event(
            "error",
            run_id=run_id,
            seq=get_seq(state) + len(trace),
            message="Payout schedule approval was rejected by finance.",
            recoverable=True,
        ))
        return {"approvals": approvals, "trace": trace, "sender": "payout_gate"}

    return {"approvals": approvals, "trace": trace, "sender": "payout_gate"}


def route_payout_gate(state: DealState) -> Literal["finalize", "__end__"]:
    approvals = state.get("approvals", {})
    payout_decision = approvals.get("payout", {})
    if payout_decision and payout_decision.get("approved"):
        return "finalize"
    return "__end__"


# ── Node 7: finalize ────────────────────────────────────────────────────────

def finalize(state: DealState) -> Dict[str, Any]:
    if not is_stub_mode():
        raise NotImplementedError("finalize")

    run_id = _get_run_id(state)
    trace: List[Dict[str, Any]] = []

    settlement = state.get("settlement", {})
    entries = settlement.get("entries", [])
    budget = _parse_budget_from_brief(state)
    tds_amount = round(budget * 0.10, 2)
    net_amount = round(budget - tds_amount, 2)
    totals = settlement.get("totals", {"gross": budget, "tds": tds_amount, "net": net_amount})

    # Ledger event
    trace.append(make_event(
        "ledger",
        run_id=run_id,
        seq=get_seq(state) + len(trace),
        entries=entries,
        totals=totals,
    ))

    # Eval result
    trace.append(make_event(
        "eval_result",
        run_id=run_id,
        seq=get_seq(state) + len(trace),
        metrics={
            "retrieval_precision": 0.92,
            "groundedness": 0.95,
            "payout_accuracy": 1.0,
        },
    ))

    # Run complete
    trace.append(make_event(
        "run_complete",
        run_id=run_id,
        seq=get_seq(state) + len(trace),
    ))

    return {
        "sender": "finalize",
        "trace": trace,
        "messages": [AIMessage(content="Run completed successfully.")],
    }


def build_deal_graph():
    workflow = StateGraph(DealState)

    workflow.add_node("brief_analyst", brief_analyst)
    workflow.add_node("deal_architect", deal_architect)
    workflow.add_node("compliance_auditor", compliance_auditor)
    workflow.add_node("contract_gate", contract_gate)
    workflow.add_node("settlement_agent", settlement_agent)
    workflow.add_node("payout_gate", payout_gate)
    workflow.add_node("finalize", finalize)

    workflow.add_edge(START, "brief_analyst")
    workflow.add_edge("brief_analyst", "deal_architect")
    workflow.add_edge("deal_architect", "compliance_auditor")

    workflow.add_conditional_edges(
        "compliance_auditor",
        route_compliance,
        {"deal_architect": "deal_architect", "contract_gate": "contract_gate"},
    )

    workflow.add_conditional_edges(
        "contract_gate",
        route_contract_gate,
        {"settlement_agent": "settlement_agent", "__end__": END},
    )

    workflow.add_edge("settlement_agent", "payout_gate")

    workflow.add_conditional_edges(
        "payout_gate",
        route_payout_gate,
        {"finalize": "finalize", "__end__": END},
    )

    workflow.add_edge("finalize", END)

    memory = MemorySaver()
    compiled = workflow.compile(checkpointer=memory)
    return compiled
