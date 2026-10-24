"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useHealth, type HealthState } from "@/hooks/useHealth";
import { useRuns } from "@/hooks/useRuns";
import type { RunListItem } from "@/lib/api";

export interface ShellData {
  health: HealthState;
  runs: RunListItem[];
  runsLoading: boolean;
  runsError: string | null;
  refreshRuns: () => void;
}

const defaultShellData: ShellData = {
  health: { apiUp: true, mode: "stub", host: "localhost:8005", refresh: () => {} },
  runs: [],
  runsLoading: false,
  runsError: null,
  refreshRuns: () => {},
};

const Ctx = createContext<ShellData | null>(null);

/** Single source of health + runs for the whole app (one poller, many readers). */
export function ShellDataProvider({ children }: { children: ReactNode }) {
  const health = useHealth();
  const { runs, loading, error, refresh } = useRuns();
  return (
    <Ctx.Provider value={{ health, runs, runsLoading: loading, runsError: error, refreshRuns: refresh }}>{children}</Ctx.Provider>
  );
}

export function useShellData(): ShellData {
  const v = useContext(Ctx);
  return v || defaultShellData;
}
