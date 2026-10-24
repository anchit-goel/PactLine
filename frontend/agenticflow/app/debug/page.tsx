"use client";

import { useState } from "react";
import { useDealSocket } from "../../hooks/useDealSocket";
import { api } from "../../lib/api";
import { AppShell } from "@/components/shell/AppShell";
import { Badge, Card } from "@/components/ui";
import { Terminal, Play, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

export default function DebugPage() {
  const [runId, setRunId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [briefInput, setBriefInput] = useState<string>(
    "Creator sponsorship with 3-milestone deliverables schedule and FTC disclosure compliance."
  );

  const {
    events,
    timeline,
    draft,
    compliance,
    pendingApproval,
    ledger,
    usageTotals,
    evalMetrics,
    connected,
    runComplete,
    error,
    sendApproval,
  } = useDealSocket(runId);

  const handleStartRun = async () => {
    setLoading(true);
    try {
      const data = await api.createDeal(briefInput);
      if (data.run_id) {
        setRunId(data.run_id);
      }
    } catch (err) {
      console.error("Failed to start deal:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="bento fade-up" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>
        {/* Header */}
        <div className="px-1 mb-2">
          <div className="flex items-center gap-2 text-[#F07845] text-xs font-bold uppercase tracking-wider mb-1">
            <Terminal className="w-4 h-4" />
            <span>Developer Diagnostics</span>
          </div>
          <h1 className="t-greeting m-0 text-[30px] font-bold text-[#171717] tracking-tight">Debug Console</h1>
          <p className="t-label mt-1 text-[13px] text-[#737373]">
            Raw WebSocket streaming inspector, manual gate approval controls, and telemetry inspector.
          </p>
        </div>

        {/* Start / Connect Bar */}
        <Card className="rounded-[22px] border border-[#E7E5E4] shadow-sm p-5 bg-white">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={briefInput}
              onChange={(e) => setBriefInput(e.target.value)}
              placeholder="Brief prompt..."
              className="flex-1 min-w-[300px] h-10 px-4 text-[13px] rounded-full bg-[#F8F7F5] border border-[#E7E5E4] text-[#171717] focus:border-[#F07845] outline-none"
            />
            <button
              onClick={handleStartRun}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 h-10 rounded-full bg-[#171717] hover:bg-[#262626] text-white text-[13px] font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? "Starting..." : "Start Run"}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-[#E7E5E4] text-[12px] text-[#737373]">
            <div>
              <strong className="text-[#171717]">Run ID:</strong> {runId || "(none)"}
            </div>
            <div>
              <strong className="text-[#171717]">Socket:</strong>{" "}
              <Badge tone={connected ? "success" : "neutral"} dot>
                {connected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            <div>
              <strong className="text-[#171717]">Completed:</strong>{" "}
              <Badge tone={runComplete ? "success" : "neutral"}>
                {runComplete ? "Yes" : "No"}
              </Badge>
            </div>
          </div>
        </Card>

        {error && (
          <div role="alert" className="p-4 rounded-[16px] bg-[#FCECEC] text-[#D85C5C] border border-[#F8D7D7] text-[13px]">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Pending Approval Gate in Debug View */}
        {pendingApproval && (
          <div className="p-5 rounded-[20px] bg-[#FFF5DF] border-2 border-[#D99A32] shadow-sm">
            <div className="flex items-center gap-2 text-[#B45309] font-bold text-[14px]">
              <span>Approval Required: [{pendingApproval.gate.toUpperCase()} GATE]</span>
            </div>
            <p className="text-[13px] text-[#171717] my-2">{pendingApproval.summary}</p>
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => sendApproval(true, "Approved in debug view")}
                className="px-5 py-2 rounded-full bg-[#24966B] hover:bg-[#1f825c] text-white text-[13px] font-semibold transition-all shadow-sm cursor-pointer"
              >
                Approve
              </button>
              <button
                onClick={() => sendApproval(false, "Rejected in debug view")}
                className="px-5 py-2 rounded-full bg-[#D85C5C] hover:bg-[#c44f4f] text-white text-[13px] font-semibold transition-all shadow-sm cursor-pointer"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        {/* Dual Grid: Timeline / Deliverable on Left, Raw JSON Events on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <div className="flex flex-col gap-5">
            {/* Timeline */}
            <Card title={<span className="text-[15px] font-bold text-[#171717]">Agent Timeline</span>} className="rounded-[22px] border border-[#E7E5E4] shadow-sm p-5 bg-white">
              <ul className="list-none m-0 p-0 divide-y divide-[#E7E5E4] text-[12px]">
                {timeline.map((item, idx) => (
                  <li key={idx} className="py-2.5">
                    <strong className="text-[#171717]">{item.agent}</strong>: {item.summary || "In progress"}{" "}
                    <span className="text-[#A3A3A3]">({item.timestamp})</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Latest Draft */}
            {draft && (
              <Card title={<span className="text-[15px] font-bold text-[#171717]">Latest Draft (Rev {draft.revision})</span>} className="rounded-[22px] border border-[#E7E5E4] shadow-sm p-5 bg-white">
                <ul className="list-none m-0 p-0 divide-y divide-[#E7E5E4] text-[12px]">
                  {draft.clauses.map((c) => (
                    <li key={c.id} className="py-2.5">
                      <strong className="text-[#F07845]">[{c.id}]</strong> {c.text}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Compliance Status */}
            {compliance && (
              <Card title={<span className="text-[15px] font-bold text-[#171717]">Compliance Status (Rev {compliance.revision})</span>} className="rounded-[22px] border border-[#E7E5E4] shadow-sm p-5 bg-white">
                <div className="text-[13px] font-medium text-[#171717] mb-2">
                  Passed:{" "}
                  <Badge tone={compliance.passed ? "success" : "danger"}>
                    {compliance.passed ? "YES" : "NO"}
                  </Badge>
                </div>
                {compliance.issues.length > 0 && (
                  <ul className="list-none m-0 p-0 divide-y divide-[#E7E5E4] text-[12px]">
                    {compliance.issues.map((iss, i) => (
                      <li key={i} className="py-2 text-[#D85C5C]">
                        [{iss.severity.toUpperCase()}] {iss.fix_hint}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}

            {/* Ledger */}
            {ledger && (
              <Card title={<span className="text-[15px] font-bold text-[#171717]">Payout Ledger Schedule</span>} className="rounded-[22px] border border-[#E7E5E4] shadow-sm p-5 bg-white">
                <table className="w-full text-[12px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#E7E5E4] text-left text-[#737373]">
                      <th className="py-1.5">Milestone</th>
                      <th className="py-1.5">Gross</th>
                      <th className="py-1.5">TDS (10%)</th>
                      <th className="py-1.5">Net</th>
                      <th className="py-1.5">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.entries.map((entry, idx) => (
                      <tr key={idx} className="border-b border-[#E7E5E4]/60 text-[#171717]">
                        <td className="py-1.5 font-medium">{entry.milestone}</td>
                        <td className="py-1.5">${entry.gross}</td>
                        <td className="py-1.5 text-[#D85C5C]">${entry.tds}</td>
                        <td className="py-1.5 font-semibold text-[#24966B]">${entry.net}</td>
                        <td className="py-1.5 text-[#737373]">{entry.due_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-3 pt-2 border-t border-[#E7E5E4] text-[12px] text-[#171717]">
                  <strong>Totals:</strong> Gross: ${ledger.totals.gross} | TDS: ${ledger.totals.tds} | Net: ${ledger.totals.net}
                </div>
              </Card>
            )}

            {/* Telemetry */}
            <Card title={<span className="text-[15px] font-bold text-[#171717]">Telemetry & Metrics</span>} className="rounded-[22px] border border-[#E7E5E4] shadow-sm p-5 bg-white text-[12px]">
              <p className="m-0 text-[#171717]">
                <strong>Tokens In:</strong> {usageTotals.tokensIn} | <strong>Tokens Out:</strong> {usageTotals.tokensOut} | <strong>Cost:</strong> ${usageTotals.costUsd}
              </p>
              {evalMetrics && (
                <p className="mt-2 mb-0 text-[#737373]">
                  Precision: {evalMetrics.retrieval_precision} | Groundedness: {evalMetrics.groundedness} | Payout Accuracy: {evalMetrics.payout_accuracy}
                </p>
              )}
            </Card>
          </div>

          {/* Right: Raw JSON Event Stream */}
          <div>
            <Card 
              title={<span className="text-[15px] font-bold text-[#171717]">Raw Event Stream ({events.length} events)</span>} 
              className="rounded-[22px] border border-[#E7E5E4] shadow-sm p-5 bg-white"
            >
              <div className="h-[650px] overflow-y-auto rounded-[16px] bg-[#F8F7F5] border border-[#E7E5E4] p-3 text-[11px] font-mono">
                {events.map((ev, i) => (
                  <div key={i} className="mb-2 pb-2 border-b border-[#E7E5E4]/60">
                    <span className="text-[#24966B] font-bold">
                      #{ev.seq} [{ev.type}]
                    </span>{" "}
                    <span className="text-[#737373]">({ev.agent || "system"})</span>:
                    <pre className="mt-1 p-2 rounded-lg bg-white border border-[#E7E5E4] text-[#171717] overflow-x-auto">
                      {JSON.stringify(ev, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
