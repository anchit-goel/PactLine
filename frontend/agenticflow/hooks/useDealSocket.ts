"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  PactlineEvent,
  Clause,
  RetrievalEvent,
  ComplianceResultEvent,
  LedgerEvent,
  EvalMetrics,
} from "../lib/events";
import { api, ApiError, dealSocketUrl } from "../lib/api";
import { mergeBySeq } from "../lib/derive";

export interface TimelineEntry {
  agent: string;
  summary?: string;
  timestamp: string;
}

/**
 * connecting    – looking up the run / opening the socket
 * live          – WebSocket open, events streaming
 * reconnecting  – socket dropped or backend unreachable; polling /runs/{id}/events
 * recorded      – showing a finished (or interrupted) run from its stored event log
 * offline       – backend never reachable for this run
 */
export type ConnectionState = "connecting" | "live" | "reconnecting" | "recorded" | "offline";

export interface DealSocketState {
  events: PactlineEvent[];
  timeline: TimelineEntry[];
  retrievals: RetrievalEvent[];
  draft: { revision: number; clauses: Clause[] } | null;
  compliance: ComplianceResultEvent | null;
  pendingApproval: { gate: "contract" | "payout"; summary: string } | null;
  ledger: LedgerEvent | null;
  usageTotals: { tokensIn: number; tokensOut: number; costUsd: number };
  evalMetrics: EvalMetrics | null;
  tools: { tool_id: string; name: string; args: any; output?: any; ok?: boolean }[];
  connected: boolean;
  runComplete: boolean;
  error: string | null;
  connection: ConnectionState;
  interrupted: boolean; // recorded run that never reached run_complete / error
}

const initialState: DealSocketState = {
  events: [],
  timeline: [],
  retrievals: [],
  draft: null,
  compliance: null,
  pendingApproval: null,
  ledger: null,
  usageTotals: { tokensIn: 0, tokensOut: 0, costUsd: 0 },
  evalMetrics: null,
  tools: [],
  connected: false,
  runComplete: false,
  error: null,
  connection: "connecting",
  interrupted: false,
};

type Action =
  | { type: "SOCKET_CONNECTED" }
  | { type: "SOCKET_DISCONNECTED" }
  | { type: "CONNECTION"; connection: ConnectionState }
  | { type: "EVENT_RECEIVED"; event: PactlineEvent }
  | { type: "MERGE_EVENTS"; events: PactlineEvent[]; recorded: boolean }
  | { type: "RESET" };

function applyEvent(state: DealSocketState, ev: PactlineEvent): DealSocketState {
  // Ignore duplicates (same seq already applied). The locally-synthesised approval_response is exempt.
  if (ev.type !== "approval_response" && state.events.some((e) => e.type !== "approval_response" && e.seq === ev.seq)) {
    return state;
  }
  const nextEvents = [...state.events, ev];
  let nextTimeline = state.timeline;
  let nextRetrievals = state.retrievals;
  let nextDraft = state.draft;
  let nextCompliance = state.compliance;
  let nextPendingApproval = state.pendingApproval;
  let nextLedger = state.ledger;
  let nextUsage = { ...state.usageTotals };
  let nextEval = state.evalMetrics;
  const nextTools = [...state.tools];
  let nextRunComplete = state.runComplete;
  let nextError = state.error;

  switch (ev.type) {
    case "agent_start":
      nextTimeline = [...nextTimeline, { agent: ev.agent, timestamp: ev.ts }];
      nextPendingApproval = null;
      break;
    case "agent_end":
      nextTimeline = nextTimeline.map((item) => (item.agent === ev.agent ? { ...item, summary: ev.summary } : item));
      break;
    case "retrieval":
      nextRetrievals = [...nextRetrievals, ev];
      break;
    case "draft_update":
      nextDraft = { revision: ev.revision, clauses: ev.clauses };
      break;
    case "compliance_result":
      nextCompliance = ev;
      break;
    case "approval_required":
      nextPendingApproval = { gate: ev.gate, summary: ev.summary };
      break;
    case "approval_response":
      nextPendingApproval = null;
      break;
    case "ledger":
      nextLedger = ev;
      break;
    case "tool_call":
      nextTools.push({ tool_id: ev.tool_id, name: ev.name, args: ev.args });
      break;
    case "tool_result": {
      const idx = nextTools.findIndex((t) => t.tool_id === ev.tool_id);
      if (idx >= 0) {
        nextTools[idx] = { ...nextTools[idx], output: ev.output, ok: ev.ok };
      } else {
        nextTools.push({ tool_id: ev.tool_id, name: ev.name, args: {}, output: ev.output, ok: ev.ok });
      }
      break;
    }
    case "llm_usage":
      nextUsage = {
        tokensIn: nextUsage.tokensIn + ev.tokens_in,
        tokensOut: nextUsage.tokensOut + ev.tokens_out,
        costUsd: Number((nextUsage.costUsd + ev.cost_usd).toFixed(6)),
      };
      break;
    case "eval_result":
      nextEval = ev.metrics;
      break;
    case "run_complete":
      nextRunComplete = true;
      nextPendingApproval = null;
      break;
    case "error":
      nextError = ev.message;
      nextPendingApproval = null;
      break;
  }

  return {
    ...state,
    events: nextEvents,
    timeline: nextTimeline,
    retrievals: nextRetrievals,
    draft: nextDraft,
    compliance: nextCompliance,
    pendingApproval: nextPendingApproval,
    ledger: nextLedger,
    usageTotals: nextUsage,
    evalMetrics: nextEval,
    tools: nextTools,
    runComplete: nextRunComplete,
    error: nextError,
  };
}

function dealReducer(state: DealSocketState, action: Action): DealSocketState {
  switch (action.type) {
    case "SOCKET_CONNECTED":
      return { ...state, connected: true, connection: "live" };
    case "SOCKET_DISCONNECTED":
      return { ...state, connected: false };
    case "CONNECTION":
      return { ...state, connection: action.connection };
    case "RESET":
      return { ...initialState };
    case "EVENT_RECEIVED":
      return applyEvent(state, action.event);
    case "MERGE_EVENTS": {
      // Rebuild from the merged, seq-ordered list so out-of-order history is applied correctly.
      const merged = mergeBySeq(state.events.filter((e) => e.type !== "approval_response"), action.events);
      let next: DealSocketState = { ...initialState, connected: state.connected, connection: state.connection };
      for (const ev of merged) next = applyEvent(next, ev);
      if (action.recorded) {
        // A stored log cannot be answered: never show a stale approval prompt.
        next = { ...next, pendingApproval: null, interrupted: !next.runComplete && !next.error };
      }
      return next;
    }
    default:
      return state;
  }
}

const RETRY_MS = 3000;

export function useDealSocket(runId?: string) {
  const [state, dispatch] = useReducer(dealReducer, initialState);
  const wsRef = useRef<WebSocket | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!runId) return;
    let alive = true;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;

    dispatch({ type: "RESET" });

    const isFinished = () => stateRef.current.runComplete || !!stateRef.current.error;

    const openSocket = () => {
      if (!alive) return;
      const ws = new WebSocket(dealSocketUrl(runId));
      wsRef.current = ws;

      ws.onopen = () => alive && dispatch({ type: "SOCKET_CONNECTED" });
      ws.onmessage = (m) => {
        try {
          dispatch({ type: "EVENT_RECEIVED", event: JSON.parse(m.data) as PactlineEvent });
        } catch (err) {
          console.error("Failed to parse event JSON:", err);
        }
      };
      ws.onclose = () => {
        if (!alive) return;
        dispatch({ type: "SOCKET_DISCONNECTED" });
        if (isFinished()) {
          dispatch({ type: "CONNECTION", connection: "recorded" });
        } else {
          dispatch({ type: "CONNECTION", connection: "reconnecting" });
          // The backend starts a fresh run on every socket connect, so we do not re-open the socket.
          // Instead we follow the stored event log until the backend answers.
          pollLog(true);
        }
      };
    };

    /** Follow /runs/{id}/events (used after a drop). */
    const pollLog = (afterDrop: boolean) => {
      if (!alive) return;
      api
        .runEvents(runId)
        .then((events) => {
          if (!alive) return;
          dispatch({ type: "MERGE_EVENTS", events, recorded: true });
          dispatch({ type: "CONNECTION", connection: "recorded" });
        })
        .catch((e) => {
          if (!alive) return;
          if (e instanceof ApiError && e.status === 404 && !afterDrop) {
            openSocket(); // brand-new run: no log yet, start streaming
            return;
          }
          dispatch({ type: "CONNECTION", connection: afterDrop ? "reconnecting" : "offline" });
          pollTimer = setTimeout(() => pollLog(afterDrop), RETRY_MS);
        });
    };

    pollLog(false);

    return () => {
      alive = false;
      if (pollTimer) clearTimeout(pollTimer);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [runId]);

  const sendApproval = useCallback(
    (approved: boolean, note?: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.warn("WebSocket is not open to send approval");
        return;
      }
      const gate = state.pendingApproval?.gate || "contract";
      wsRef.current.send(JSON.stringify({ type: "approval_response", gate, approved, note: note || "" }));
      dispatch({
        type: "EVENT_RECEIVED",
        event: {
          type: "approval_response",
          run_id: runId || "",
          seq: 0,
          ts: new Date().toISOString(),
          gate,
          approved,
          note,
        },
      });
    },
    [state.pendingApproval, runId]
  );

  const injectEvent = useCallback((event: PactlineEvent) => {
    dispatch({ type: "EVENT_RECEIVED", event });
  }, []);

  const resetEvents = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    ...state,
    sendApproval,
    injectEvent,
    resetEvents,
  };
}
