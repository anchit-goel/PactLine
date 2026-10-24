/** Pure helpers that derive display data from Pactline event arrays. No fabricated values. */
import type { PactlineEvent } from "./events";

export const AGENTS = [
  { id: "brief_analyst", name: "Brief Analyst", role: "Retrieval & creator matching" },
  { id: "deal_architect", name: "Deal Architect", role: "Milestones & clause drafting" },
  { id: "compliance_auditor", name: "Compliance Auditor", role: "Regulatory review" },
  { id: "settlement_agent", name: "Settlement Agent", role: "Sandboxed payout maths" },
] as const;

export interface RunDerived {
  agentsCompleted: number;
  revision: number;
  compliance: "none" | "failed" | "passed";
  failedCount: number;
  fixed: boolean; // a failed compliance_result followed by a passed one
  lastGrade: number | null;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  pendingGate: "contract" | "payout" | null;
  hasLedger: boolean;
  complete: boolean;
  errored: boolean;
  startedAt: string | null;
  lastTs: string | null;
  latestSummary: string | null;
}

export function deriveRun(events: PactlineEvent[]): RunDerived {
  const d: RunDerived = {
    agentsCompleted: 0,
    revision: 0,
    compliance: "none",
    failedCount: 0,
    fixed: false,
    lastGrade: null,
    tokensIn: 0,
    tokensOut: 0,
    costUsd: 0,
    pendingGate: null,
    hasLedger: false,
    complete: false,
    errored: false,
    startedAt: null,
    lastTs: null,
    latestSummary: null,
  };
  const ended = new Set<string>();
  let sawFail = false;
  for (const ev of events) {
    if (!d.startedAt) d.startedAt = ev.ts;
    d.lastTs = ev.ts;
    switch (ev.type) {
      case "agent_end":
        ended.add(ev.agent);
        d.latestSummary = ev.summary;
        break;
      case "retrieval":
        d.lastGrade = ev.grade;
        break;
      case "draft_update":
        d.revision = Math.max(d.revision, ev.revision);
        break;
      case "compliance_result":
        if (ev.passed) {
          d.compliance = "passed";
          if (sawFail) d.fixed = true;
        } else {
          d.compliance = "failed";
          d.failedCount += 1;
          sawFail = true;
        }
        break;
      case "llm_usage":
        d.tokensIn += ev.tokens_in;
        d.tokensOut += ev.tokens_out;
        d.costUsd += ev.cost_usd;
        break;
      case "ledger":
        d.hasLedger = true;
        break;
      case "run_complete":
        d.complete = true;
        break;
      case "error":
        d.errored = true;
        break;
    }
  }
  d.agentsCompleted = AGENTS.filter((a) => ended.has(a.id)).length;
  const last = events[events.length - 1];
  if (last && last.type === "approval_required") d.pendingGate = last.gate;
  return d;
}

export interface AgentTiming {
  id: string;
  status: "pending" | "active" | "done";
  durationMs: number | null;
  summary: string | null;
}

export function agentTimings(events: PactlineEvent[]): AgentTiming[] {
  return AGENTS.map((a) => {
    let start: number | null = null;
    let total = 0;
    let ended = false;
    let started = false;
    let summary: string | null = null;
    for (const ev of events) {
      if ("agent" in ev && ev.agent === a.id) {
        if (ev.type === "agent_start") {
          started = true;
          ended = false;
          start = Date.parse(ev.ts);
        } else if (ev.type === "agent_end") {
          ended = true;
          summary = ev.summary;
          if (start !== null) total += Math.max(0, Date.parse(ev.ts) - start);
          start = null;
        }
      }
    }
    return {
      id: a.id,
      status: ended ? "done" : started ? "active" : "pending",
      durationMs: ended ? total : null,
      summary,
    };
  });
}

export function mergeBySeq(a: PactlineEvent[], b: PactlineEvent[]): PactlineEvent[] {
  const map = new Map<number, PactlineEvent>();
  for (const ev of a) map.set(ev.seq, ev);
  for (const ev of b) if (!map.has(ev.seq)) map.set(ev.seq, ev);
  return Array.from(map.values()).sort((x, y) => x.seq - y.seq);
}

/** One-line human summary of an event for activity feeds. */
export function eventLine(ev: PactlineEvent): string | null {
  switch (ev.type) {
    case "run_start":
      return `Run started: ${ev.brief}`;
    case "agent_end":
      return ev.summary;
    case "retrieval":
      return `Retrieved from ${ev.source} (grade ${(ev.grade * 100).toFixed(0)}%, ${ev.action})`;
    case "draft_update":
      return `Draft revision ${ev.revision} (${ev.clauses.length} clauses)`;
    case "compliance_result":
      return ev.passed ? `Compliance passed (rev ${ev.revision})` : `Compliance failed (rev ${ev.revision}, ${ev.issues.length} issue${ev.issues.length === 1 ? "" : "s"})`;
    case "approval_required":
      return `Awaiting ${ev.gate} approval`;
    case "ledger":
      return `Ledger ready: net ${ev.totals.net.toFixed(2)}`;
    case "run_complete":
      return "Run complete";
    case "error":
      return `Error: ${ev.message}`;
    default:
      return null;
  }
}
