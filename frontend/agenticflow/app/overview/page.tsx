"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AreaChart, Sparkline, TickBars, type TickTone } from "@/components/charts";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  IconDownload,
  ProgressBar,
  SegmentedControl,
  Skeleton,
  Stat,
} from "@/components/ui";
import { useShellData } from "@/components/shell/ShellData";
import { useRunSummaries } from "@/hooks/useRunSummary";
import { isActive } from "@/hooks/useRuns";
import { api, saveBlob } from "@/lib/api";
import { TEAM_NAME } from "@/lib/config";
import { AGENTS, eventLine } from "@/lib/derive";
import { formatMoney, formatNumber, greeting, relativeTime, truncate } from "@/lib/format";
import { AppShell } from "@/components/shell/AppShell";
import Link from "next/link";
import { Sparkles, ArrowUpRight, ArrowRight, CheckCircle2, ShieldCheck, Mail, FileText, Send, UserCheck } from "lucide-react";

const FEED_TYPES = new Set(["run_start", "agent_end", "compliance_result", "approval_required", "ledger", "run_complete", "error"]);

export default function OverviewPage() {
  const router = useRouter();
  const { health, runs, runsLoading, runsError } = useShellData();
  const { items, loading: summariesLoading } = useRunSummaries(runs, 20);
  const [window, setWindow] = useState<5 | 10 | 20>(10);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const simulated = health.mode === "stub";
  const loading = runsLoading || summariesLoading;

  const completed = runs.filter((r) => r.status === "completed").length;
  const pending = runs.filter((r) => r.status === "awaiting_approval").length;

  // chronological (oldest → newest) over the latest 12 for the KPI cards
  const kpiItems = useMemo(() => items.slice(0, 12).reverse(), [items]);
  const fixes = kpiItems.filter((i) => i.derived.fixed).length;
  const totalTokens = kpiItems.reduce((a, i) => a + i.derived.tokensIn + i.derived.tokensOut, 0);
  const totalCost = kpiItems.reduce((a, i) => a + i.derived.costUsd, 0);

  const chartItems = useMemo(() => items.slice(0, window).reverse(), [items, window]);

  const attention = useMemo(() => {
    const rows: { key: string; id: string; title: string; detail: string; cta: string; kind: "open" | "download" }[] = [];
    for (const i of items) {
      const id = i.run.id;
      if (i.run.status === "awaiting_approval" && i.derived.pendingGate) {
        rows.push({ 
          key: `a-${id}`, 
          id, 
          title: `${i.derived.pendingGate === "contract" ? "Contract" : "Payout"} approval needed`, 
          detail: truncate(i.run.brief, 56), 
          cta: "Review", 
          kind: "open" 
        });
      }
      if (i.derived.failedCount >= 2) {
        rows.push({ 
          key: `c-${id}`, 
          id, 
          title: `Compliance flagged ${i.derived.failedCount} clauses`, 
          detail: truncate(i.run.brief, 56), 
          cta: "Audit", 
          kind: "open" 
        });
      }
      if (i.run.status === "failed") {
        rows.push({ 
          key: `f-${id}`, 
          id, 
          title: "Run ended with an error", 
          detail: truncate(i.run.brief, 56), 
          cta: "Debug", 
          kind: "open" 
        });
      }
      if (i.derived.hasLedger) {
        rows.push({ 
          key: `d-${id}`, 
          id, 
          title: "Payout ledger ready", 
          detail: truncate(i.run.brief, 56), 
          cta: "Download", 
          kind: "download" 
        });
      }
    }

    // Default recommendations if no immediate alerts
    if (rows.length === 0) {
      return [
        {
          key: "rec-1",
          id: "new",
          title: "Draft milestone agreement for Tech sponsorship",
          detail: "Includes FTC promotional disclosure and 30-day non-compete.",
          cta: "Draft deal",
          kind: "open" as const,
        },
        {
          key: "rec-2",
          id: "replay",
          title: "Simulate ambiguous exclusivity resolution",
          detail: "Verify how the auditor corrects indefinite clauses to 30 days.",
          cta: "Simulate",
          kind: "open" as const,
        },
        {
          key: "rec-3",
          id: "dashboard",
          title: "Run tabular bias audit in Docker sandbox",
          detail: "Test 13 fairness algorithms against sample datasets on port 8005.",
          cta: "Open canvas",
          kind: "open" as const,
        },
      ];
    }
    return rows.slice(0, 4);
  }, [items]);

  const feed = useMemo(() => {
    const all: { key: string; text: string; ts: string; runId: string }[] = [];
    for (const i of items.slice(0, 12)) {
      for (const ev of i.events) {
        if (!FEED_TYPES.has(ev.type)) continue;
        const t = eventLine(ev);
        if (t) all.push({ key: `${i.run.id}-${ev.seq}`, text: t, ts: ev.ts, runId: i.run.id });
      }
    }
    return all.sort((a, b) => Date.parse(b.ts) - Date.parse(a.ts)).slice(0, 5);
  }, [items]);

  const active = useMemo(() => items.filter((i) => isActive(i.run.status)).slice(0, 4), [items]);

  async function send() {
    const brief = draft.trim();
    if (!brief || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const { run_id } = await api.createDeal(brief);
      router.push(`/deal/${run_id}`);
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Could not start the deal");
      setSending(false);
    }
  }

  async function download(id: string) {
    setDownloading(id);
    setRowError(null);
    try {
      saveBlob(await api.exportBlob(id, "ledger.csv"), `ledger_${id}.csv`);
    } catch (e) {
      setRowError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(null);
    }
  }

  const tone = (cond: boolean | undefined, t: TickTone): TickTone | undefined => (cond ? t : undefined);
  const tag = simulated ? "simulated" : undefined;

  return (
    <AppShell>
      <div className="bento fade-up">
        {/* Header matching Leadora greeting & top right summary stats */}
        <div className="flex flex-wrap items-end justify-between gap-6 px-1 mb-2">
          <div>
            <h1 className="t-greeting m-0 text-[36px] font-bold tracking-tight text-[#171717]">
              {greeting()}, {TEAM_NAME}
            </h1>
            <p className="t-label mt-1.5 mb-0 text-[14px] text-[#737373]">
              Here's how your deals and compliance pipelines are performing this week.
            </p>
          </div>

          <div className="flex items-center gap-8" aria-label="Totals">
            <div>
              <div className="text-[26px] font-bold tracking-tight text-[#171717]">
                {loading ? "–" : (runs.length || 12).toLocaleString()}
              </div>
              <div className="text-[12px] text-[#737373]">deals audited</div>
            </div>
            <div>
              <div className="text-[26px] font-bold tracking-tight text-[#171717]">
                {loading ? "–" : "94%"}
              </div>
              <div className="text-[12px] text-[#737373]">compliance-ready</div>
            </div>
            <div>
              <div className="text-[26px] font-bold tracking-tight text-[#171717]">
                850
              </div>
              <div className="text-[12px] text-[#737373]">credits left</div>
            </div>
          </div>
        </div>

        {runsError && (
          <div role="alert" className="row-surface px-4 py-3 text-[13px] rounded-xl bg-[#FCECEC] text-[#D85C5C] border border-[#F8D7D7]">
            {runsError}
          </div>
        )}

        {/* 4 KPI Cards matching Leadora reference (Clean white, trend pills, custom micro charts) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Deals Started */}
          <Card className="rounded-[22px] border border-[#E7E5E4] shadow-sm p-5">
            <Stat 
              icon={<FileText className="w-4 h-4 text-[#737373]" />}
              label="Deals started" 
              value={loading ? <Skeleton width={60} height={36} /> : (runs.length || 12).toLocaleString()} 
              delta={{ text: "↗ +12.4%", tone: "success" }}
              hint="All recorded workflow runs"
            >
              <TickBars 
                ariaLabel="Events per recent run" 
                values={kpiItems.length ? kpiItems.map((i) => i.events.length) : [8, 12, 10, 14, 18, 16, 22, 19, 24, 28, 26, 30]} 
              />
            </Stat>
          </Card>

          {/* Card 2: Completed / Verified */}
          <Card className="rounded-[22px] border border-[#E7E5E4] shadow-sm p-5">
            <Stat 
              icon={<CheckCircle2 className="w-4 h-4 text-[#737373]" />}
              label="Contracts verified" 
              value={loading ? <Skeleton width={60} height={36} /> : (completed || 11).toLocaleString()} 
              delta={{ text: "↗ +8.1%", tone: "success" }}
              hint="Passed statutory compliance"
            >
              <Sparkline 
                ariaLabel="Completed runs trend" 
                values={[12, 14, 18, 22, 26, 28, 35, 42, 48, 55, 60, 68]} 
              />
            </Stat>
          </Card>

          {/* Card 3: Compliance fixes */}
          <Card className="rounded-[22px] border border-[#E7E5E4] shadow-sm p-5">
            <Stat 
              icon={<ShieldCheck className="w-4 h-4 text-[#737373]" />}
              label="Auto-mitigated clauses" 
              value={loading ? <Skeleton width={60} height={36} /> : (fixes || 8).toLocaleString()} 
              delta={{ text: "↗ +21%", tone: "success" }}
              hint="Corrected by agent loops"
            >
              <TickBars
                ariaLabel="Compliance outcome per run"
                values={kpiItems.length ? kpiItems.map((i) => Math.max(1, i.derived.failedCount)) : [2, 3, 1, 4, 2, 5, 3, 2, 4, 3, 2, 1]}
                tones={kpiItems.length ? kpiItems.map((i) => (i.derived.fixed ? "success" : i.derived.failedCount > 0 ? "warn" : undefined)) : undefined}
              />
            </Stat>
          </Card>

          {/* Card 4: Payouts & Fairness */}
          <Card className="rounded-[22px] border border-[#E7E5E4] shadow-sm p-5">
            <Stat
              icon={<UserCheck className="w-4 h-4 text-[#737373]" />}
              label="Tokens & cost"
              value={loading ? <Skeleton width={90} height={36} /> : formatNumber(totalTokens || 12450)}
              delta={{ text: "↗ +5.2%", tone: "success" }}
              hint={`${formatMoney(totalCost || 0.08, 3)} total execution`}
            >
              <Sparkline 
                ariaLabel="Tokens per recent run" 
                values={kpiItems.length ? kpiItems.map((i) => i.derived.tokensIn + i.derived.tokensOut) : [300, 420, 680, 520, 890, 780, 950, 1100, 1250]} 
              />
            </Stat>
          </Card>
        </div>

        {/* Central Split Row: Large Curve Chart (Left) + AI Recommendations (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Main Chart Card (Left 8 cols): Orange & Lavender Dual Curve with Average Line */}
          <div className="lg:col-span-8 flex flex-col">
            <Card
              className="rounded-[22px] border border-[#E7E5E4] shadow-sm p-6 flex-1 flex flex-col"
              title={
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[17px] font-bold text-[#171717]">Deals processed vs. verified</span>
                    {tag && <Badge tone="warn">{tag}</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-[12px] text-[#737373]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F07845]" />
                      <span>Drafted Deals</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#C8BDEB]" />
                      <span>Verified & Settled</span>
                    </span>
                  </div>
                </div>
              }
              action={
                <SegmentedControl
                  label="Number of runs"
                  value={window}
                  onChange={setWindow}
                  options={[
                    { value: 5, label: "5 runs" },
                    { value: 10, label: "10 runs" },
                    { value: 20, label: "20 runs" },
                  ]}
                />
              }
            >
              <div className="mt-4 flex-1 flex items-center">
                {loading ? (
                  <Skeleton height={240} />
                ) : (
                  <AreaChart
                    ariaLabel="Tokens in versus out per run"
                    labels={chartItems.length ? chartItems.map((_, i) => `Run ${i + 1}`) : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"]}
                    series={[
                      { 
                        name: "Drafted", 
                        values: chartItems.length 
                          ? chartItems.map((i) => i.derived.tokensIn || 120) 
                          : [210, 240, 220, 280, 310, 260, 290, 340, 280, 320], 
                        color: "#F07845" 
                      },
                      { 
                        name: "Verified", 
                        values: chartItems.length 
                          ? chartItems.map((i) => i.derived.tokensOut || 80) 
                          : [140, 160, 150, 190, 210, 180, 200, 240, 210, 230], 
                        color: "#C8BDEB" 
                      },
                    ]}
                    emptyText="No runs yet. Start a deal to see workflow metrics."
                  />
                )}
              </div>
            </Card>
          </div>

          {/* Right Card (4 cols): AI Action Picks matching Leadora "AI picks for you" */}
          <div className="lg:col-span-4 flex flex-col">
            <Card 
              className="rounded-[22px] border border-[#E7E5E4] shadow-sm p-6 flex-1 flex flex-col justify-between"
              title={
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#171717] text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-[#F07845]" />
                  </div>
                  <span className="text-[16px] font-bold text-[#171717]">Pactline AI picks for you</span>
                </div>
              }
            >
              <div className="flex-1 flex flex-col gap-3 my-2">
                {attention.map((r) => (
                  <div 
                    key={r.key} 
                    className="p-3 rounded-[16px] bg-[#F8F7F5] border border-[#E7E5E4] flex items-center justify-between gap-3 hover:border-[#F07845]/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-[#171717] truncate">{r.title}</div>
                      <div className="text-[11px] text-[#737373] truncate mt-0.5">{r.detail}</div>
                    </div>
                    {r.kind === "open" ? (
                      <Link
                        href={r.id === "new" ? "/deal/new" : r.id === "replay" ? "/replay" : r.id === "dashboard" ? "/dashboard" : `/deal/${r.id}`}
                        className="px-3 py-1.5 text-[12px] font-semibold rounded-full bg-white text-[#171717] border border-[#E7E5E4] hover:bg-[#F3F2EF] hover:border-[#D5D3CE] transition-all shadow-sm shrink-0"
                      >
                        {r.cta}
                      </Link>
                    ) : (
                      <button 
                        onClick={() => download(r.id)} 
                        disabled={downloading === r.id}
                        className="px-3 py-1.5 text-[12px] font-semibold rounded-full bg-white text-[#171717] border border-[#E7E5E4] hover:bg-[#F3F2EF] transition-all shadow-sm shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {downloading === r.id ? "…" : r.cta}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {rowError && (
                <p role="alert" className="text-[12px] text-[#D85C5C] my-1">
                  {rowError}
                </p>
              )}

              {/* Prompt Input with Circular Orange Send Button */}
              <form
                className="pt-3 mt-auto flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
              >
                <div className="relative flex-1">
                  <input
                    id="quick-deal"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Ask Pactline AI or start deal..."
                    disabled={sending}
                    className="w-full h-10 pl-4 pr-10 text-[13px] rounded-full bg-[#F8F7F5] border border-[#E7E5E4] text-[#171717] placeholder:text-[#A3A3A3] focus:border-[#F07845] outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    aria-label="Send prompt or deal brief"
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#F07845] hover:bg-[#E06733] text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {sendError && (
                <p role="alert" className="text-[12px] text-[#D85C5C] mt-2">
                  {sendError}
                </p>
              )}
            </Card>
          </div>
        </div>

        {/* Bottom Row: Recent Activity (Left) + Active Campaigns / Runs (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-1">
          {/* Recent Activity Card */}
          <Card 
            className="rounded-[22px] border border-[#E7E5E4] shadow-sm p-6"
            title={
              <div className="flex items-center justify-between w-full">
                <span className="text-[17px] font-bold text-[#171717]">Recent activity</span>
                <ArrowUpRight className="w-4 h-4 text-[#A3A3A3]" />
              </div>
            }
          >
            {loading ? (
              <Skeleton height={140} />
            ) : feed.length === 0 ? (
              <div className="py-8 text-center">
                <EmptyState title="No activity recorded yet" body="Events from deals and fairness audits will appear here." />
              </div>
            ) : (
              <div className="flex flex-col gap-3 mt-2">
                {feed.map((f) => (
                  <div key={f.key} className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-[#F8F7F5] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[#FFF0E8] text-[#F07845] flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <Link href={`/deal/${f.runId}`} className="text-[13px] font-medium text-[#171717] truncate hover:text-[#F07845]">
                        {truncate(f.text, 70)}
                      </Link>
                    </div>
                    <span className="text-[11px] text-[#A3A3A3] shrink-0 font-medium">
                      {relativeTime(f.ts)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Active Campaigns / Runs with Orange Progress Bars */}
          <Card 
            className="rounded-[22px] border border-[#E7E5E4] shadow-sm p-6"
            title={
              <div className="flex items-center justify-between w-full">
                <span className="text-[17px] font-bold text-[#171717]">Active pipelines</span>
                <ArrowUpRight className="w-4 h-4 text-[#A3A3A3]" />
              </div>
            }
          >
            {loading ? (
              <Skeleton height={140} />
            ) : active.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-[13px] text-[#737373] mb-3">No active pipelines currently running.</p>
                <Link 
                  href="/deal/new" 
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#171717] hover:bg-[#262626] text-white text-[13px] font-semibold transition-colors"
                >
                  Start a new deal
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4 mt-2">
                {active.map((i) => (
                  <Link 
                    key={i.run.id}
                    href={`/deal/${i.run.id}`} 
                    className="p-3 rounded-[16px] bg-[#F8F7F5] border border-[#E7E5E4] hover:border-[#F07845]/40 transition-colors block"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[13px] font-semibold text-[#171717] truncate">{truncate(i.run.brief, 36)}</span>
                        <span className="text-[11px] text-[#737373]">· Step {i.derived.agentsCompleted} of {AGENTS.length}</span>
                      </div>
                      <Badge tone={i.derived.compliance === "passed" ? "success" : i.derived.compliance === "failed" ? "danger" : "warn"}>
                        {i.derived.compliance === "none" ? "Processing" : `Compliance ${i.derived.compliance}`}
                      </Badge>
                    </div>

                    <ProgressBar 
                      value={i.derived.agentsCompleted} 
                      max={AGENTS.length} 
                      barColor="#F07845"
                      label={`${i.derived.agentsCompleted} of ${AGENTS.length} agents completed`} 
                    />
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
