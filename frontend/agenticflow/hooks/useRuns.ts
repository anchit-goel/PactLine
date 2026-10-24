"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError, type RunListItem } from "@/lib/api";
import { RUNS_POLL_MS } from "@/lib/config";

export function isActive(status: string) {
  return status === "in_progress" || status === "awaiting_approval";
}

/** Lists runs; polls every RUNS_POLL_MS only while at least one run is active. */
export function useRuns() {
  const [runs, setRuns] = useState<RunListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const runsRef = useRef<RunListItem[]>([]);

  const load = useCallback(async () => {
    try {
      const data = await api.listRuns();
      runsRef.current = data;
      setRuns(data);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load runs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, tick]);

  useEffect(() => {
    const id = setInterval(() => {
      if (runsRef.current.some((r) => isActive(r.status))) load();
    }, RUNS_POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);
  return { runs, loading, error, refresh };
}
