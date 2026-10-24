"use client";

import { Badge } from "@/components/ui";
import { useShellData } from "./ShellData";

/** Always-visible run-mode badge: stub (simulated) / live / offline. */
export function ModeBadge() {
  const { health } = useShellData();
  if (health.apiUp === null) return <Badge tone="neutral">Checking…</Badge>;
  if (!health.apiUp) return <Badge tone="danger" dot>API offline</Badge>;
  if (health.mode === "stub") return <Badge tone="warn" dot>Stub mode · simulated</Badge>;
  if (health.mode === "live") return <Badge tone="success" dot>Live mode</Badge>;
  return <Badge tone="neutral" dot>Mode unknown</Badge>;
}

export function StatusDot({ up }: { up: boolean | null }) {
  const color = up === null ? "var(--series-2)" : up ? "var(--success)" : "var(--danger)";
  return (
    <span
      role="img"
      aria-label={up === null ? "API status unknown" : up ? "API connected" : "API unreachable"}
      className={`inline-block w-2 h-2 rounded-full ${up ? "pulse-dot" : ""}`}
      style={{ background: color }}
    />
  );
}
