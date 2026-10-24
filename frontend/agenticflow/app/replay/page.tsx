"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { RunWorkspace, ConnectionBadge } from "@/components/run/RunWorkspace";
import { Badge, Button, Card, IconPause, IconPlay, IconReset, IconStep, ProgressBar, SegmentedControl } from "@/components/ui";
import { useDealSocket } from "@/hooks/useDealSocket";
import { AppShell } from "@/components/shell/AppShell";
import { api } from "@/lib/api";
import type { PactlineEvent } from "@/lib/events";
import { Play, Sparkles } from "lucide-react";

const SCENARIOS = [
  { id: "normal", name: "Normal path", text: "Retrieval re-query, self-corrected draft, two approval gates, sandbox maths." },
  { id: "ambiguous", name: "Ambiguous exclusivity", text: "Draft 1 is flagged for ambiguous exclusivity and corrected on revision 2." },
  { id: "failure", name: "Gate rejection", text: "A reviewer rejects the contract at the first gate." },
  { id: "demo", name: "Demo recording", text: "The default recorded demo run (GET /replay/demo)." },
];

export default function ReplayPage() {
  const router = useRouter();
  const state = useDealSocket(); // no run id: events are fed in by the player
  const { injectEvent, resetEvents } = state;

  const [scenario, setScenario] = useState("normal");
  const [recorded, setRecorded] = useState<PactlineEvent[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const waitingApproval = useRef(false);

  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("scenario");
    if (s && SCENARIOS.some((x) => x.id === s)) setScenario(s);
  }, []);

  useEffect(() => {
    let alive = true;
    setPlaying(false);
    resetEvents();
    setIndex(0);
    waitingApproval.current = false;
    setLoadError(null);
    api
      .replay(scenario)
      .then((e) => alive && setRecorded(e))
      .catch((e) => {
        if (alive) {
          setRecorded([]);
          setLoadError(e instanceof Error ? e.message : "Could not load replay");
        }
      });
    return () => {
      alive = false;
    };
  }, [scenario, resetEvents]);

  const step = useCallback(() => {
    if (index >= recorded.length) return false;
    const ev = recorded[index];
    injectEvent(ev);
    setIndex(index + 1);
    if (ev.type === "approval_required") {
      waitingApproval.current = true;
      setPlaying(false);
    }
    return true;
  }, [index, recorded, injectEvent]);

  useEffect(() => {
    if (!playing) return;
    if (index >= recorded.length) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(step, Math.max(80, 450 / speed));
    return () => clearTimeout(t);
  }, [playing, index, recorded.length, speed, step]);

  // Approvals in replay are local: record the decision, then continue playback
  const onApproval = (approved: boolean, note?: string) => {
    const pending = state.pendingApproval;
    if (!pending) return;
    injectEvent({
      type: "approval_response",
      run_id: "replay",
      seq: 0,
      ts: new Date().toISOString(),
      gate: pending.gate,
      approved,
      note,
    });
    waitingApproval.current = false;
    setPlaying(true);
  };

  const brief = recorded.find((e) => e.type === "run_start");
  const finished = index >= recorded.length && recorded.length > 0;

  async function startLive() {
    if (!brief || brief.type !== "run_start") return;
    setStarting(true);
    try {
      const { run_id } = await api.createDeal(brief.brief);
      router.push(`/deal/${run_id}`);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not start a live run");
      setStarting(false);
    }
  }

  return (
    <AppShell>
      <div className="bento fade-up">
        <div className="flex flex-wrap items-end justify-between gap-4 px-1 mb-2">
          <div>
            <h1 className="t-greeting m-0 text-[32px] font-bold text-[#171717] tracking-tight">Replay player</h1>
            <p className="t-label mt-1.5 mb-0 text-[14px] text-[#737373]">
              Step through a recorded multi-agent run. Visual replay mode for testing without calling live models.
            </p>
          </div>
          <ConnectionBadge state={state} replay />
        </div>

        {/* Scenario Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SCENARIOS.map((s) => {
            const active = s.id === scenario;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setScenario(s.id)}
                aria-pressed={active}
                className={`p-4 rounded-[20px] bg-white border text-left cursor-pointer transition-all shadow-sm ${
                  active 
                    ? "border-[#F07845] ring-2 ring-[#F07845]/20 shadow-md" 
                    : "border-[#E7E5E4] hover:border-[#D5D3CE]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge tone={active ? "warn" : "neutral"}>
                    {active ? "Active Scenario" : "Recorded replay"}
                  </Badge>
                  {active && <span className="w-2 h-2 rounded-full bg-[#F07845]" />}
                </div>
                <div className="text-[14px] font-bold text-[#171717] mt-1">{s.name}</div>
                <p className="text-[12px] text-[#737373] mt-1 mb-0 leading-relaxed">{s.text}</p>
              </button>
            );
          })}
        </div>

        {loadError && (
          <div role="alert" className="row-surface px-4 py-3 text-[13px] rounded-xl bg-[#FCECEC] text-[#D85C5C] border border-[#F8D7D7]">
            {loadError}
          </div>
        )}

        {/* Player Controls Card */}
        <Card className="rounded-[22px] border border-[#E7E5E4] shadow-sm p-5 bg-white">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => (finished ? (resetEvents(), setIndex(0), setPlaying(true)) : setPlaying((p) => !p))}
              disabled={recorded.length === 0 || (waitingApproval.current && !!state.pendingApproval)}
              className="inline-flex items-center justify-center gap-2 px-5 h-10 rounded-full bg-[#171717] hover:bg-[#262626] text-white text-[14px] font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {playing ? <IconPause size={16} /> : <IconPlay size={16} />} 
              {playing ? "Pause" : finished ? "Replay" : "Play"}
            </button>

            <button
              type="button"
              onClick={() => step()}
              disabled={playing || finished || !!state.pendingApproval}
              className="inline-flex items-center justify-center gap-2 px-4 h-9 rounded-full bg-white border border-[#E7E5E4] text-[#171717] hover:bg-[#F8F7F5] text-[13px] font-medium transition-all shadow-sm cursor-pointer disabled:opacity-40"
            >
              <IconStep size={14} /> Step
            </button>

            <button
              type="button"
              onClick={() => (setPlaying(false), resetEvents(), setIndex(0), (waitingApproval.current = false))}
              disabled={index === 0}
              className="inline-flex items-center justify-center gap-2 px-4 h-9 rounded-full bg-white border border-[#E7E5E4] text-[#171717] hover:bg-[#F8F7F5] text-[13px] font-medium transition-all shadow-sm cursor-pointer disabled:opacity-40"
            >
              <IconReset size={14} /> Reset
            </button>

            <SegmentedControl<1 | 2 | 4>
              label="Speed"
              value={speed}
              onChange={setSpeed}
              options={[
                { value: 1, label: "1×" },
                { value: 2, label: "2×" },
                { value: 4, label: "4×" },
              ]}
            />

            <div className="flex-1 min-w-[200px] px-2">
              <ProgressBar value={index} max={recorded.length || 1} barColor="#F07845" label="Replay progress" />
              <div className="text-[11px] text-[#737373] mt-1 font-medium">
                {index} / {recorded.length} events {state.pendingApproval ? " · Gate approval required" : ""}
              </div>
            </div>

            {brief && (
              <button
                type="button"
                onClick={startLive}
                disabled={starting}
                className="inline-flex items-center justify-center gap-2 px-4 h-9 rounded-full bg-[#FFF0E8] border border-[rgba(240,120,69,0.3)] text-[#F07845] hover:bg-[#FFE6D9] text-[13px] font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {starting ? "Launching…" : "Launch Live Deal"}
              </button>
            )}
          </div>
        </Card>

        {/* Workspace Component */}
        <RunWorkspace state={state} runId={null} replay simulated onApproval={onApproval} />
      </div>
    </AppShell>
  );
}
