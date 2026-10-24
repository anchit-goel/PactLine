"use client";

import { useCallback, useEffect, useState } from "react";
import { api, apiHost, type ModeInfo } from "@/lib/api";
import { HEALTH_POLL_MS } from "@/lib/config";

export interface HealthState {
  apiUp: boolean | null; // null = not yet known
  mode: ModeInfo["mode"] | null;
  host: string;
  refresh: () => void;
}

/** Polls /health (and /mode for stub vs live) every HEALTH_POLL_MS. */
export function useHealth(): HealthState {
  const [apiUp, setApiUp] = useState<boolean | null>(null);
  const [mode, setMode] = useState<ModeInfo["mode"] | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    const check = async () => {
      try {
        await api.health();
        if (alive) setApiUp(true);
        try {
          const m = await api.mode();
          if (alive) setMode(m.mode);
        } catch {
          /* /mode unavailable on older backends: leave mode unknown */
        }
      } catch {
        if (alive) setApiUp(false);
      }
    };
    check();
    const id = setInterval(check, HEALTH_POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);
  return { apiUp, mode, host: apiHost(), refresh };
}
