"use client";

import { use } from "react";
import { RunWorkspace, ConnectionBadge } from "@/components/run/RunWorkspace";
import { useShellData } from "@/components/shell/ShellData";
import { useDealSocket } from "@/hooks/useDealSocket";
import { AppShell } from "@/components/shell/AppShell";

export default function DealRunPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = use(params);
  const state = useDealSocket(runId);
  const { health } = useShellData();
  const brief = state.events.find((e) => e.type === "run_start");

  return (
    <AppShell>
      <div className="fade-up">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 px-1">
          <div className="min-w-0">
            <h1 className="m-0 text-[28px] font-bold tracking-tight text-[#171717] truncate">
              {brief && brief.type === "run_start" ? brief.brief : "Deal workspace"}
            </h1>
            <div className="text-[12px] font-mono text-[#737373] mt-1">Run ID: {runId}</div>
          </div>
          <ConnectionBadge state={state} />
        </div>
        <RunWorkspace state={state} runId={runId} simulated={health.mode === "stub"} onApproval={state.sendApproval} />
      </div>
    </AppShell>
  );
}
