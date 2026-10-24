/**
 * Typed Pactline API client. The only place that talks HTTP to the backend.
 * Base URLs come exclusively from lib/config.ts.
 */
import { API_BASE_URL, WS_BASE_URL, REQUEST_TIMEOUT_MS } from "./config";
import type { PactlineEvent } from "./events";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type RunStatus = "in_progress" | "awaiting_approval" | "completed" | "failed" | "unknown";

export interface RunListItem {
  id: string;
  brief: string;
  status: RunStatus;
  event_count: number;
  created_at: string | null;
}

export interface Health {
  status: string;
}

export interface ModeInfo {
  mode: "stub" | "live";
  stub: boolean;
}

async function request(path: string, init: RequestInit = {}, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { ...init, signal: ctrl.signal });
    if (!res.ok) {
      let detail = "";
      try {
        const body = await res.clone().json();
        detail = typeof body?.detail === "string" ? body.detail : JSON.stringify(body?.detail ?? body);
      } catch {
        detail = await res.text().catch(() => "");
      }
      throw new ApiError(detail || `Request failed (HTTP ${res.status})`, res.status);
    }
    return res;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("The request timed out. Is the backend running?", 0);
    }
    throw new ApiError("Cannot reach the backend. Is it running?", 0);
  } finally {
    clearTimeout(timer);
  }
}

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  return (await request(path, init)).json() as Promise<T>;
}

export const api = {
  health: () => json<Health>("/health"),
  mode: () => json<ModeInfo>("/mode"),
  createDeal: (brief: string, budget?: number | null, creators?: number | null) =>
    json<{ run_id: string }>("/deal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brief,
        ...(budget !== undefined && budget !== null ? { budget } : {}),
        ...(creators !== undefined && creators !== null ? { creators } : {}),
      }),
    }),
  listRuns: () => json<RunListItem[]>("/runs"),
  runEvents: (runId: string) => json<PactlineEvent[]>(`/runs/${encodeURIComponent(runId)}/events`),
  replay: (name: string) => json<PactlineEvent[]>(`/replay/${encodeURIComponent(name)}`),
  /** Download an export as a Blob (so errors can be shown inline instead of navigating away). */
  exportBlob: async (runId: string, kind: "ledger.csv" | "contract.pdf"): Promise<Blob> =>
    (await request(`/runs/${encodeURIComponent(runId)}/export/${kind}`, {}, 60000)).blob(),
};

export function dealSocketUrl(runId: string): string {
  return `${WS_BASE_URL}/ws/deal/${encodeURIComponent(runId)}`;
}

export function apiHost(): string {
  try {
    return new URL(API_BASE_URL).host;
  } catch {
    return API_BASE_URL;
  }
}

/** Trigger a browser download from a Blob. */
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
