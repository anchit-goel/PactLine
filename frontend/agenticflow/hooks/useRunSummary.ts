"use client";

import { useEffect, useMemo, useState } from "react";
import { api, type RunListItem } from "@/lib/api";
import { deriveRun, type RunDerived } from "@/lib/derive";
import type { PactlineEvent } from "@/lib/events";

const cache = new Map<string, PactlineEvent[]>(); // key: `${id}:${event_count}`

/** Fetches /runs/{id}/events once and derives KPIs from them. */
export function useRunSummary(runId: string | undefined) {
  const [events, setEvents] = useState<PactlineEvent[]>([]);
  const [loading, setLoading] = useState(!!runId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) return;
    let alive = true;
    setLoading(true);
    api
      .runEvents(runId)
      .then((e) => alive && (setEvents(e), setError(null)))
      .catch((e) => alive && setError(e?.message ?? "Failed to load events"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [runId]);

  const summary: RunDerived = useMemo(() => deriveRun(events), [events]);
  return { events, summary, loading, error };
}

export interface RunWithEvents {
  run: RunListItem;
  events: PactlineEvent[];
  derived: RunDerived;
}

/** Fetches events for the latest `limit` runs (cached per event_count). */
export function useRunSummaries(runs: RunListItem[], limit = 12) {
  const [items, setItems] = useState<RunWithEvents[]>([]);
  const [loading, setLoading] = useState(true);
  const latest = useMemo(() => runs.slice(0, limit), [runs, limit]);
  const key = latest.map((r) => `${r.id}:${r.event_count}`).join("|");

  useEffect(() => {
    let alive = true;
    if (latest.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(
      latest.map(async (run) => {
        const k = `${run.id}:${run.event_count}`;
        let events = cache.get(k);
        if (!events) {
          try {
            events = await api.runEvents(run.id);
            cache.set(k, events);
          } catch {
            events = [];
          }
        }
        return { run, events, derived: deriveRun(events) };
      })
    ).then((r) => {
      if (alive) {
        setItems(r);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { items, loading };
}
