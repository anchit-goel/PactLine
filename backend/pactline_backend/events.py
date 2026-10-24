"""Event definitions and factory for Pactline streaming event contract."""

from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional, Union
from pydantic import BaseModel, Field


class RetrievalHit(BaseModel):
    id: str
    score: float
    snippet: str


class Clause(BaseModel):
    id: str
    text: str
    source_ids: List[str] = Field(default_factory=list)


class ComplianceIssue(BaseModel):
    clause_id: str
    rule_source_id: str
    severity: Literal["low", "medium", "high", "critical"]
    fix_hint: str


class LedgerEntry(BaseModel):
    party: str
    milestone: str
    gross: float
    tds: float
    net: float
    due_date: str


class LedgerTotals(BaseModel):
    gross: float
    tds: float
    net: float


class EvalMetrics(BaseModel):
    retrieval_precision: float
    groundedness: float
    payout_accuracy: float


# Event Base Envelope
class EventEnvelope(BaseModel):
    type: str
    run_id: str
    seq: int
    ts: str
    agent: Optional[str] = None


class RunStartEvent(EventEnvelope):
    type: Literal["run_start"] = "run_start"
    brief: str


class AgentStartEvent(EventEnvelope):
    type: Literal["agent_start"] = "agent_start"
    agent: str


class AgentEndEvent(EventEnvelope):
    type: Literal["agent_end"] = "agent_end"
    agent: str
    summary: str


class RetrievalEvent(EventEnvelope):
    type: Literal["retrieval"] = "retrieval"
    agent: str
    query: str
    source: Literal["clauses", "regulatory", "creators", "deliverables"]
    hits: List[RetrievalHit]
    grade: float
    action: Literal["accept", "requery", "switch_source"]
    rewritten_query: Optional[str] = None


class ToolCallEvent(EventEnvelope):
    type: Literal["tool_call"] = "tool_call"
    agent: str
    tool_id: str
    name: str
    args: Dict[str, Any]


class ToolResultEvent(EventEnvelope):
    type: Literal["tool_result"] = "tool_result"
    agent: str
    tool_id: str
    name: str
    output: Any
    ok: bool


class LLMUsageEvent(EventEnvelope):
    type: Literal["llm_usage"] = "llm_usage"
    agent: str
    model: str
    tokens_in: int
    tokens_out: int
    latency_ms: float
    cost_usd: float


class DraftUpdateEvent(EventEnvelope):
    type: Literal["draft_update"] = "draft_update"
    revision: int
    clauses: List[Clause]


class ComplianceResultEvent(EventEnvelope):
    type: Literal["compliance_result"] = "compliance_result"
    revision: int
    passed: bool
    issues: List[ComplianceIssue]


class ApprovalRequiredEvent(EventEnvelope):
    type: Literal["approval_required"] = "approval_required"
    gate: Literal["contract", "payout"]
    summary: str


class ApprovalResponseEvent(EventEnvelope):
    type: Literal["approval_response"] = "approval_response"
    gate: Literal["contract", "payout"]
    approved: bool
    note: Optional[str] = None


class LedgerEvent(EventEnvelope):
    type: Literal["ledger"] = "ledger"
    entries: List[LedgerEntry]
    totals: LedgerTotals


class EvalResultEvent(EventEnvelope):
    type: Literal["eval_result"] = "eval_result"
    metrics: EvalMetrics


class RunCompleteEvent(EventEnvelope):
    type: Literal["run_complete"] = "run_complete"


class ErrorEvent(EventEnvelope):
    type: Literal["error"] = "error"
    message: str
    recoverable: bool


PactlineEvent = Union[
    RunStartEvent,
    AgentStartEvent,
    AgentEndEvent,
    RetrievalEvent,
    ToolCallEvent,
    ToolResultEvent,
    LLMUsageEvent,
    DraftUpdateEvent,
    ComplianceResultEvent,
    ApprovalRequiredEvent,
    ApprovalResponseEvent,
    LedgerEvent,
    EvalResultEvent,
    RunCompleteEvent,
    ErrorEvent,
]

EVENT_CLASS_MAP = {
    "run_start": RunStartEvent,
    "agent_start": AgentStartEvent,
    "agent_end": AgentEndEvent,
    "retrieval": RetrievalEvent,
    "tool_call": ToolCallEvent,
    "tool_result": ToolResultEvent,
    "llm_usage": LLMUsageEvent,
    "draft_update": DraftUpdateEvent,
    "compliance_result": ComplianceResultEvent,
    "approval_required": ApprovalRequiredEvent,
    "approval_response": ApprovalResponseEvent,
    "ledger": LedgerEvent,
    "eval_result": EvalResultEvent,
    "run_complete": RunCompleteEvent,
    "error": ErrorEvent,
}


def make_event(
    event_type: str,
    run_id: str,
    seq: int,
    agent: Optional[str] = None,
    ts: Optional[str] = None,
    **kwargs: Any,
) -> Dict[str, Any]:
    if ts is None:
        ts = datetime.now(timezone.utc).isoformat()

    cls = EVENT_CLASS_MAP.get(event_type)
    if cls is None:
        raise ValueError(f"Unknown event type: {event_type}")

    payload = {
        "type": event_type,
        "run_id": run_id,
        "seq": seq,
        "ts": ts,
        "agent": agent,
        **kwargs,
    }
    model = cls(**payload)
    return model.model_dump()
