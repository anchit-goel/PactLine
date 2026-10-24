# Pactline Event Contract Specification

All events emitted across the WebSocket stream conform to an envelope:
```json
{
  "type": "<event_type>",
  "run_id": "<string>",
  "seq": 1,
  "ts": "2026-10-23T18:00:00.000Z",
  "agent": "optional_agent_name",
  "...payload"
}
```

- `seq`: Monotonically increasing 1-indexed sequence number per `run_id`.
- `ts`: ISO 8601 UTC timestamp.
- `agent`: Optional agent identifier (`brief_analyst`, `deal_architect`, `compliance_auditor`, `settlement_agent`).

## Event Types

1. `run_start`
   - Payload: `brief: str`
2. `agent_start`
   - Payload: `agent: str`
3. `agent_end`
   - Payload: `agent: str, summary: str`
4. `retrieval`
   - Payload:
     - `agent: str`
     - `query: str`
     - `source: "clauses" | "regulatory" | "creators" | "deliverables"`
     - `hits: List[{ "id": str, "score": float, "snippet": str }]`
     - `grade: float` (0.0 to 1.0)
     - `action: "accept" | "requery" | "switch_source"`
     - `rewritten_query: Optional[str]`
5. `tool_call`
   - Payload: `agent: str, tool_id: str, name: str, args: dict`
6. `tool_result`
   - Payload: `agent: str, tool_id: str, name: str, output: Any, ok: bool`
7. `llm_usage`
   - Payload: `agent: str, model: str, tokens_in: int, tokens_out: int, latency_ms: float, cost_usd: float`
8. `draft_update`
   - Payload: `revision: int, clauses: List[{ "id": str, "text": str, "source_ids": List[str] }]`
9. `compliance_result`
   - Payload: `revision: int, passed: bool, issues: List[{ "clause_id": str, "rule_source_id": str, "severity": str, "fix_hint": str }]`
10. `approval_required`
    - Payload: `gate: "contract" | "payout", summary: str`
11. `approval_response` (Client -> Server)
    - Payload: `gate: "contract" | "payout", approved: bool, note: Optional[str]`
12. `ledger`
    - Payload:
      - `entries: List[{ "party": str, "milestone": str, "gross": float, "tds": float, "net": float, "due_date": str }]`
      - `totals: { "gross": float, "tds": float, "net": float }`
13. `eval_result`
    - Payload: `metrics: { "retrieval_precision": float, "groundedness": float, "payout_accuracy": float }`
14. `run_complete`
    - Payload: `{}`
15. `error`
    - Payload: `message: str, recoverable: bool`
