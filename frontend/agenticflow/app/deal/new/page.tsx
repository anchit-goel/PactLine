"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, Button, Card, EmptyState, IconArrowRight, Skeleton } from "@/components/ui";
import { useShellData } from "@/components/shell/ShellData";
import { AppShell } from "@/components/shell/AppShell";
import { api } from "@/lib/api";
import { formatDate, truncate } from "@/lib/format";
import { Sparkles, ArrowRight, Play, FileText } from "lucide-react";

const PRESETS = [
  {
    title: "Tech review sponsorship",
    brief:
      "Creator collaboration for tech audio hardware review: 3-milestone deliverables (Concept approval, Draft video, Publish verification) with mandatory FTC promotional disclosure (#Ad, #Sponsored) and 30-day non-compete.",
  },
  {
    title: "Gaming campaign, ambiguous exclusivity",
    brief:
      "Sponsorship agreement for gameplay stream with ambiguous indefinite exclusivity clause. Automated compliance auditor will flag and correct to 30 days.",
  },
  {
    title: "Lifestyle multi-milestone",
    brief:
      "Brand ambassador campaign with equal milestone distribution, statutory 10% TDS withholding calculation in sandbox, and contract gate sign-off.",
  },
];

const SCENARIOS = [
  { id: "normal", name: "Normal path", text: "Retrieval re-query, self-corrected draft, two approval gates, sandbox maths." },
  { id: "ambiguous", name: "Ambiguous exclusivity", text: "Draft 1 is flagged for ambiguous exclusivity and corrected on revision 2." },
  { id: "failure", name: "Gate rejection", text: "A reviewer rejects the contract at the first gate." },
];

export default function NewDealPage() {
  const router = useRouter();
  const { runs, runsLoading } = useShellData();
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    if (!brief.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const { run_id } = await api.createDeal(brief.trim());
      router.push(`/deal/${run_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the run");
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="bento fade-up">
        <div className="px-1 mb-2">
          <h1 className="t-greeting m-0 text-[32px] font-bold text-[#171717] tracking-tight">New deal collaboration</h1>
          <p className="t-label mt-1.5 mb-0 text-[14px] text-[#737373]">
            Describe the collaboration. Pactline agents will draft clauses, check statutory compliance, and compute milestone payouts.
          </p>
        </div>

        {/* Form Card */}
        <Card className="rounded-[22px] border border-[#E7E5E4] shadow-sm p-6 bg-white">
          <label htmlFor="brief" className="block text-[13px] font-semibold text-[#171717] mb-2">
            Deal Brief & Requirements
          </label>
          <textarea
            id="brief"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={5}
            placeholder="e.g. Sponsored review of a pair of wireless headphones with three milestones, statutory 10% TDS withholding, and FTC promotional disclosure..."
            className="w-full p-4 text-[14px] rounded-[16px] bg-[#F8F7F5] border border-[#E7E5E4] focus:border-[#F07845] text-[#171717] placeholder:text-[#A3A3A3] outline-none transition-colors resize-y"
          />

          {/* Quick Presets */}
          <div className="mt-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A3A3A3] block mb-2">
              Example Brief Presets:
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Example briefs">
              {PRESETS.map((p) => (
                <button
                  key={p.title}
                  type="button"
                  onClick={() => setBrief(p.brief)}
                  className="px-3.5 py-1.5 text-[12px] font-medium rounded-full bg-[#F8F7F5] border border-[#E7E5E4] text-[#737373] hover:text-[#171717] hover:bg-white hover:border-[#D5D3CE] transition-all cursor-pointer shadow-xs"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p role="alert" className="text-[13px] mt-4 mb-0 px-4 py-3 rounded-xl bg-[#FCECEC] text-[#D85C5C] border border-[#F8D7D7]">
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-[#E7E5E4]">
            <span className="text-[12px] text-[#A3A3A3]">
              The backend currently accepts brief text only. Decision support, not legal advice.
            </span>
            <button
              type="button"
              onClick={start}
              disabled={loading || !brief.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 h-11 rounded-full bg-[#F07845] hover:bg-[#E06733] text-white text-[14px] font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span>Starting agent pipeline…</span>
              ) : (
                <>
                  <span>Start deal run</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </Card>

        {/* Scenarios Row */}
        <div>
          <span className="text-[13px] font-semibold text-[#171717] block mb-3 px-1">
            Pre-recorded Simulation Scenarios
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SCENARIOS.map((s) => (
              <Link 
                key={s.id} 
                href={`/replay?scenario=${s.id}`} 
                className="p-5 rounded-[20px] bg-white border border-[#E7E5E4] shadow-sm hover:border-[#F07845]/40 hover:-translate-y-0.5 transition-all block"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge tone="neutral">Recorded replay</Badge>
                  <Play className="w-3.5 h-3.5 text-[#F07845]" />
                </div>
                <div className="text-[15px] font-bold text-[#171717] mt-2">{s.name}</div>
                <p className="text-[12px] text-[#737373] mt-1 mb-0 leading-relaxed">{s.text}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Runs Card */}
        <Card 
          title={<span className="text-[16px] font-bold text-[#171717]">Recent runs</span>}
          className="rounded-[22px] border border-[#E7E5E4] shadow-sm p-6 bg-white"
        >
          {runsLoading ? (
            <Skeleton height={80} />
          ) : runs.length === 0 ? (
            <EmptyState title="No runs yet" body="Start your first deal above to begin auditing." />
          ) : (
            <ul className="list-none m-0 p-0 divide-y divide-[#E7E5E4]">
              {runs.slice(0, 5).map((r) => (
                <li key={r.id}>
                  <Link href={`/deal/${r.id}`} className="flex items-center justify-between gap-4 py-3.5 hover:px-2 rounded-lg transition-all hover:bg-[#F8F7F5]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#FFF0E8] text-[#F07845] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="truncate text-[13px] font-medium text-[#171717]">{truncate(r.brief, 80)}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] text-[#A3A3A3] font-medium">{formatDate(r.created_at)}</span>
                      <Badge tone={r.status === "completed" ? "success" : r.status === "failed" ? "danger" : "warn"}>
                        {r.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
