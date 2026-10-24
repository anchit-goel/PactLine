/**
 * TypeScript Discriminated Union Event Contract for Pactline.
 */

export interface RetrievalHit {
  id: string;
  score: number;
  snippet: string;
}

export interface Clause {
  id: string;
  text: string;
  source_ids?: string[];
}

export interface ComplianceIssue {
  clause_id: string;
  rule_source_id: string;
  severity: "low" | "medium" | "high" | "critical";
  fix_hint: string;
}

export interface LedgerEntry {
  party: string;
  milestone: string;
  gross: number;
  tds: number;
  net: number;
  due_date: string;
}

export interface LedgerTotals {
  gross: number;
  tds: number;
  net: number;
}

export interface EvalMetrics {
  retrieval_precision: number;
  groundedness: number;
  payout_accuracy: number;
}

export interface BaseEventEnvelope {
  run_id: string;
  seq: number;
  ts: string;
  agent?: string;
}

export interface RunStartEvent extends BaseEventEnvelope {
  type: "run_start";
  brief: string;
}

export interface AgentStartEvent extends BaseEventEnvelope {
  type: "agent_start";
  agent: string;
}

export interface AgentEndEvent extends BaseEventEnvelope {
  type: "agent_end";
  agent: string;
  summary: string;
}

export interface RetrievalEvent extends BaseEventEnvelope {
  type: "retrieval";
  agent: string;
  query: string;
  source: "clauses" | "regulatory" | "creators" | "deliverables";
  hits: RetrievalHit[];
  grade: number;
  action: "accept" | "requery" | "switch_source";
  rewritten_query?: string;
}

export interface ToolCallEvent extends BaseEventEnvelope {
  type: "tool_call";
  agent: string;
  tool_id: string;
  name: string;
  args: Record<string, any>;
}

export interface ToolResultEvent extends BaseEventEnvelope {
  type: "tool_result";
  agent: string;
  tool_id: string;
  name: string;
  output: any;
  ok: boolean;
}

export interface LLMUsageEvent extends BaseEventEnvelope {
  type: "llm_usage";
  agent: string;
  model: string;
  tokens_in: number;
  tokens_out: number;
  latency_ms: number;
  cost_usd: number;
}

export interface DraftUpdateEvent extends BaseEventEnvelope {
  type: "draft_update";
  revision: number;
  clauses: Clause[];
}

export interface ComplianceResultEvent extends BaseEventEnvelope {
  type: "compliance_result";
  revision: number;
  passed: boolean;
  issues: ComplianceIssue[];
}

export interface ApprovalRequiredEvent extends BaseEventEnvelope {
  type: "approval_required";
  gate: "contract" | "payout";
  summary: string;
}

export interface ApprovalResponseEvent extends BaseEventEnvelope {
  type: "approval_response";
  gate: "contract" | "payout";
  approved: boolean;
  note?: string;
}

export interface LedgerEvent extends BaseEventEnvelope {
  type: "ledger";
  entries: LedgerEntry[];
  totals: LedgerTotals;
}

export interface EvalResultEvent extends BaseEventEnvelope {
  type: "eval_result";
  metrics: EvalMetrics;
}

export interface RunCompleteEvent extends BaseEventEnvelope {
  type: "run_complete";
}

export interface ErrorEvent extends BaseEventEnvelope {
  type: "error";
  message: string;
  recoverable: boolean;
}

export type PactlineEvent =
  | RunStartEvent
  | AgentStartEvent
  | AgentEndEvent
  | RetrievalEvent
  | ToolCallEvent
  | ToolResultEvent
  | LLMUsageEvent
  | DraftUpdateEvent
  | ComplianceResultEvent
  | ApprovalRequiredEvent
  | ApprovalResponseEvent
  | LedgerEvent
  | EvalResultEvent
  | RunCompleteEvent
  | ErrorEvent;
