"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Drawer,
  EmptyState,
  IconAlert,
  IconCheck,
  IconDownload,
  IconShield,
  Modal,
  ProgressBar,
  Skeleton,
  Tabs,
  type Tone,
} from "@/components/ui";
import type { useDealSocket } from "@/hooks/useDealSocket";
import { api, saveBlob } from "@/lib/api";
import { AGENTS, agentTimings } from "@/lib/derive";
import type { ComplianceIssue } from "@/lib/events";
import { formatDuration, formatMoney, formatNumber } from "@/lib/format";

type DealState = ReturnType<typeof useDealSocket>;

const DISCLAIMER = "Decision support, not legal advice.";

const SEVERITY_TONE: Record<ComplianceIssue["severity"], Tone> = {
  low: "neutral",
  medium: "warn",
  high: "danger",
  critical: "danger",
};

export function ConnectionBadge({ state, replay }: { state: DealState; replay?: boolean }) {
  if (replay) return <Badge tone="neutral" dot>RECORDED REPLAY</Badge>;
  switch (state.connection) {
    case "live":
      return <Badge tone="success" dot>Live</Badge>;
    case "connecting":
      return <Badge tone="neutral">Connecting…</Badge>;
    case "reconnecting":
      return <Badge tone="warn" dot>Reconnecting…</Badge>;
    case "offline":
      return <Badge tone="danger" dot>Backend offline</Badge>;
    default:
      return <Badge tone="neutral" dot>{state.interrupted ? "Stored log (interrupted)" : "Stored log"}</Badge>;
  }
}

export function RunWorkspace({
  state,
  runId,
  replay = false,
  simulated,
  onApproval,
}: {
  state: DealState;
  runId: string | null;
  replay?: boolean;
  simulated: boolean;
  onApproval: (approved: boolean, note?: string) => void;
}) {
  const [centre, setCentre] = useState<"contract" | "ledger" | "sandbox">("contract");
  const [right, setRight] = useState<"retrieval" | "compliance" | "trace">("retrieval");
  const [citation, setCitation] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  const { draft, compliance, ledger, retrievals, tools, events, pendingApproval, usageTotals, evalMetrics } = state;
  const timings = useMemo(() => agentTimings(events), [events]);
  const done = timings.filter((t) => t.status === "done").length;
  const simTag = simulated ? <Badge tone="warn">simulated</Badge> : null;

  useEffect(() => {
    if (ledger) setCentre("ledger");
  }, [ledger]);

  // Re-enable the approval buttons whenever a new gate opens
  useEffect(() => {
    setSubmitted(false);
    setNote("");
  }, [pendingApproval?.gate, pendingApproval?.summary]);

  async function doExport(kind: "ledger.csv" | "contract.pdf") {
    if (!runId) return;
    setExporting(kind);
    setExportError(null);
    try {
      saveBlob(await api.exportBlob(runId, kind), `${kind.startsWith("ledger") ? "ledger" : "contract"}_${runId}.${kind.split(".")[1]}`);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(null);
    }
  }

  function respond(approved: boolean) {
    setSubmitted(true);
    onApproval(approved, note || (approved ? "Approved via web interface" : "Rejected via web interface"));
  }

  // Everything we know about a cited source id, from this run's own data
  const citationInfo = useMemo(() => {
    if (!citation) return null;
    const hits = retrievals.flatMap((r) => r.hits.filter((h) => h.id === citation).map((h) => ({ ...h, source: r.source, query: r.query })));
    const clause = draft?.clauses.find((c) => c.id === citation) ?? null;
    const issues = (compliance?.issues ?? []).filter((i) => i.rule_source_id === citation || i.clause_id === citation);
    return { hits, clause, issues };
  }, [citation, retrievals, draft, compliance]);

  const usedUnverified = tools.some((t) => t.output?.parameters_used?.verified === false);

  return (
    <div className="bento">
      {state.error && (
        <div role="alert" className="row-surface flex items-start gap-3 px-4 py-3" style={{ background: "var(--danger-bg)", color: "#B91C1C" }}>
          <IconAlert size={18} />
          <div className="text-[14px]">
            <strong className="font-medium">Run error.</strong> {state.error}
          </div>
        </div>
      )}
      {!replay && state.connection === "recorded" && state.interrupted && !state.runComplete && (
        <div role="status" className="row-surface px-4 py-3 text-[13px]" style={{ background: "var(--warn-bg)", color: "#B45309" }}>
          This run has no live stream attached. You are looking at its stored event log, which ends before completion.
        </div>
      )}
      {state.connection === "reconnecting" && !replay && (
        <div role="status" className="row-surface px-4 py-3 text-[13px]" style={{ background: "var(--warn-bg)", color: "#B45309" }}>
          Connection lost. Retrying and following the stored event log every few seconds.
        </div>
      )}
      {state.runComplete && (
        <div role="status" className="row-surface flex items-center gap-2 px-4 py-3 text-[14px]" style={{ background: "var(--success-bg)", color: "#15803D" }}>
          <IconCheck size={16} /> Run complete.
        </div>
      )}

      <div className="bento stack-sm" style={{ gridTemplateColumns: "minmax(0,3fr) minmax(0,5fr) minmax(0,4fr)", alignItems: "start" }}>
        {/* ── Left: agent timeline ── */}
        <Card title="Agent timeline" action={<span className="t-micro" style={{ color: "var(--muted)" }}>{events.length} events</span>}>
          <ProgressBar value={done} max={AGENTS.length} label={`${done} of ${AGENTS.length} agents done`} />
          <div className="t-micro mt-2 mb-4" style={{ color: "var(--muted)" }}>
            {done} of {AGENTS.length} agents done
          </div>
          <ol className="list-none m-0 p-0 flex flex-col gap-3">
            {AGENTS.map((a, i) => {
              const t = timings[i];
              return (
                <li
                  key={a.id}
                  className="row-surface p-4"
                  style={{ opacity: t.status === "pending" ? 0.6 : 1, borderColor: t.status === "active" ? "var(--ink)" : undefined }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14px] font-medium">
                      {i + 1}. {a.name}
                    </span>
                    {t.status === "done" ? (
                      <Badge tone="success">Done · {formatDuration(t.durationMs)}</Badge>
                    ) : t.status === "active" ? (
                      <Badge tone="warn" dot>Running</Badge>
                    ) : (
                      <Badge>Waiting</Badge>
                    )}
                  </div>
                  <div className="t-micro mt-1" style={{ color: "var(--muted)" }}>{a.role}</div>
                  {t.summary && <p className="text-[13px] mt-2 mb-0" style={{ color: "var(--ink-2)" }}>{t.summary}</p>}
                </li>
              );
            })}
          </ol>
        </Card>

        {/* ── Centre: contract | ledger | sandbox ── */}
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <Tabs
              label="Deliverable"
              value={centre}
              onChange={setCentre}
              tabs={[
                { id: "contract", label: "Contract", badge: draft ? <span className="t-micro opacity-70">rev {draft.revision}</span> : undefined },
                { id: "ledger", label: "Ledger", disabled: !ledger },
                { id: "sandbox", label: "Sandbox", badge: tools.length ? <span className="t-micro opacity-70">{tools.length}</span> : undefined },
              ]}
            />
            {runId && !replay && (
              <div className="flex gap-2">
                {draft && (
                  <Button variant="ghost" onClick={() => doExport("contract.pdf")} disabled={exporting !== null}>
                    <IconDownload size={14} /> {exporting === "contract.pdf" ? "Preparing…" : "PDF"}
                  </Button>
                )}
                {ledger && (
                  <Button variant="ghost" onClick={() => doExport("ledger.csv")} disabled={exporting !== null}>
                    <IconDownload size={14} /> {exporting === "ledger.csv" ? "Preparing…" : "CSV"}
                  </Button>
                )}
              </div>
            )}
          </div>
          {exportError && (
            <p role="alert" className="text-[13px] mt-0 mb-3" style={{ color: "var(--danger)" }}>
              Export failed: {exportError}
            </p>
          )}

          {centre === "contract" && (
            <div className="flex flex-col gap-3">
              {compliance && (
                <div
                  className="row-surface flex items-start gap-3 px-4 py-3"
                  style={{ background: compliance.passed ? "var(--success-bg)" : "var(--danger-bg)" }}
                >
                  {compliance.passed ? <IconCheck size={18} /> : <IconAlert size={18} />}
                  <div className="text-[13px]">
                    <div className="font-medium">Compliance (rev {compliance.revision}): {compliance.passed ? "passed" : `${compliance.issues.length} issue(s) found`}</div>
                    {!compliance.passed && <div style={{ color: "var(--ink-2)" }}>See the Compliance tab for details.</div>}
                  </div>
                </div>
              )}
              {!draft ? (
                state.runComplete || state.connection === "recorded" ? (
                  <EmptyState title="No contract draft in this run" />
                ) : (
                  <div className="flex flex-col gap-3">
                    <Skeleton height={80} />
                    <Skeleton height={80} />
                  </div>
                )
              ) : (
                draft.clauses.map((c, i) => (
                  <article key={c.id} className="row-surface p-4">
                    <div className="t-micro t-mono mb-1" style={{ color: "var(--muted)" }}>
                      Clause {i + 1} · {c.id}
                    </div>
                    <p className="text-[14px] m-0" style={{ color: "var(--ink)" }}>{c.text}</p>
                    {c.source_ids && c.source_ids.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {c.source_ids.map((s) => (
                          <button
                            key={s}
                            onClick={() => setCitation(s)}
                            className="inline-flex items-center gap-1 px-2.5 h-7 text-[12px] t-mono cursor-pointer hover:bg-black/10"
                            style={{ borderRadius: 12, background: "var(--chip-bg)", color: "var(--ink-2)" }}
                          >
                            <IconShield size={12} /> {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </article>
                ))
              )}
              <p className="t-micro m-0" style={{ color: "var(--muted)" }}>{DISCLAIMER}</p>
            </div>
          )}

          {centre === "ledger" && (
            <div>
              {!ledger ? (
                <EmptyState title="Awaiting milestone calculation" body="The settlement agent computes the ledger in the sandbox after the contract is approved." />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px]" style={{ borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ color: "var(--muted)" }}>
                          {["Milestone", "Gross", "TDS", "Net", "Due"].map((h) => (
                            <th key={h} className="font-medium py-2 pr-3" style={{ borderBottom: "1px solid var(--line)" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="tabular-nums">
                        {ledger.entries.map((e, i) => (
                          <tr key={i}>
                            <td className="py-3 pr-3" style={{ borderBottom: "1px solid var(--line)" }}>
                              {e.milestone}
                              <div className="t-micro" style={{ color: "var(--muted)" }}>{e.party}</div>
                            </td>
                            <td className="py-3 pr-3" style={{ borderBottom: "1px solid var(--line)" }}>{formatMoney(e.gross)}</td>
                            <td className="py-3 pr-3" style={{ borderBottom: "1px solid var(--line)", color: "var(--danger)" }}>−{formatMoney(e.tds)}</td>
                            <td className="py-3 pr-3 font-medium" style={{ borderBottom: "1px solid var(--line)" }}>{formatMoney(e.net)}</td>
                            <td className="py-3" style={{ borderBottom: "1px solid var(--line)" }}>{e.due_date}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="tabular-nums font-medium">
                        <tr>
                          <td className="py-3 pr-3">Totals</td>
                          <td className="py-3 pr-3">{formatMoney(ledger.totals.gross)}</td>
                          <td className="py-3 pr-3" style={{ color: "var(--danger)" }}>−{formatMoney(ledger.totals.tds)}</td>
                          <td className="py-3 pr-3">{formatMoney(ledger.totals.net)}</td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <p className="t-micro mt-3 mb-0" style={{ color: "var(--warn)" }}>
                    Demo TDS rate: unverified. Confirm withholding with the primary authority before paying out. {DISCLAIMER}
                  </p>
                </>
              )}
            </div>
          )}

          {centre === "sandbox" && (
            <div className="flex flex-col gap-3">
              <div className="row-surface p-4 text-[12px] t-mono" style={{ color: "var(--ink-2)" }}>
                image sandbox-python:latest · --network none · 512m RAM · 1 CPU · no-new-privileges
              </div>
              {tools.length === 0 ? (
                <EmptyState title="No sandbox calls yet" body="Tool calls from the settlement agent appear here." />
              ) : (
                tools.map((t) => (
                  <div key={t.tool_id} className="row-surface p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] font-medium t-mono">{t.name}</span>
                      <Badge tone={t.ok === undefined ? "warn" : t.ok ? "success" : "danger"}>{t.ok === undefined ? "running" : t.ok ? "ok" : "failed"}</Badge>
                    </div>
                    <div className="t-micro mb-1" style={{ color: "var(--muted)" }}>call</div>
                    <pre className="t-mono text-[11px] m-0 mb-2 p-3 overflow-x-auto" style={{ background: "var(--chip-bg)", borderRadius: 12 }}>{JSON.stringify(t.args, null, 2)}</pre>
                    {t.output !== undefined && (
                      <>
                        <div className="t-micro mb-1" style={{ color: "var(--muted)" }}>result</div>
                        <pre className="t-mono text-[11px] m-0 p-3 overflow-x-auto" style={{ background: "var(--chip-bg)", borderRadius: 12 }}>{JSON.stringify(t.output, null, 2)}</pre>
                      </>
                    )}
                  </div>
                ))
              )}
              {usedUnverified && (
                <p className="t-micro m-0" style={{ color: "var(--warn)" }}>Tool output marks its tax parameters as unverified.</p>
              )}
            </div>
          )}
        </Card>

        {/* ── Right: retrieval | compliance | trace ── */}
        <Card>
          <div className="mb-4">
            <Tabs
              label="Inspector"
              value={right}
              onChange={setRight}
              tabs={[
                { id: "retrieval", label: "Retrieval", badge: retrievals.length ? <span className="t-micro opacity-70">{retrievals.length}</span> : undefined },
                { id: "compliance", label: "Compliance" },
                { id: "trace", label: "Trace" },
              ]}
            />
          </div>

          {right === "retrieval" && (
            <div className="flex flex-col gap-3">
              {retrievals.length === 0 ? (
                <EmptyState title="No retrieval queries yet" />
              ) : (
                retrievals.map((r, i) => (
                  <div key={i} className="row-surface p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="t-micro t-mono uppercase" style={{ color: "var(--muted)" }}>{r.source}</span>
                      <Badge tone={r.action === "accept" ? "success" : "warn"}>
                        {r.action === "accept" ? "Accepted" : r.action === "requery" ? "Re-query" : "Switch source"}
                      </Badge>
                    </div>
                    <div className="text-[14px] mb-3">“{r.query}”</div>
                    <div className="flex justify-between t-micro mb-1" style={{ color: "var(--muted)" }}>
                      <span>Relevance grade</span>
                      <span className="tabular-nums">{(r.grade * 100).toFixed(0)}%</span>
                    </div>
                    <ProgressBar value={r.grade * 100} label="Relevance grade" />
                    {r.rewritten_query && (
                      <div className="mt-3 p-3 text-[13px]" style={{ background: "var(--warn-bg)", borderRadius: 12, color: "#B45309" }}>
                        <span className="font-medium">Rewritten query: </span>“{r.rewritten_query}”
                      </div>
                    )}
                    {r.hits.length > 0 && (
                      <ul className="list-none m-0 mt-3 p-0 flex flex-col gap-1">
                        {r.hits.map((h) => (
                          <li key={h.id} className="flex justify-between gap-3 text-[12px]">
                            <button onClick={() => setCitation(h.id)} className="t-mono text-left cursor-pointer hover:underline truncate">{h.id}</button>
                            <span className="tabular-nums" style={{ color: "var(--muted)" }}>{h.score.toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {right === "compliance" && (
            <div className="flex flex-col gap-3">
              {!compliance ? (
                <EmptyState title="No compliance result yet" />
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Badge tone={compliance.passed ? "success" : "danger"}>{compliance.passed ? "Passed" : "Issues found"}</Badge>
                    <span className="t-micro" style={{ color: "var(--muted)" }}>revision {compliance.revision}</span>
                  </div>
                  {compliance.issues.length === 0 ? (
                    <p className="text-[13px] m-0" style={{ color: "var(--ink-2)" }}>No issues reported.</p>
                  ) : (
                    compliance.issues.map((iss, i) => (
                      <div key={i} className="row-surface p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="t-micro t-mono">{iss.clause_id}</span>
                          <Badge tone={SEVERITY_TONE[iss.severity]}>{iss.severity}</Badge>
                        </div>
                        <p className="text-[13px] m-0">{iss.fix_hint}</p>
                        <button onClick={() => setCitation(iss.rule_source_id)} className="t-micro t-mono mt-2 cursor-pointer hover:underline" style={{ color: "var(--muted)" }}>
                          rule: {iss.rule_source_id}
                        </button>
                      </div>
                    ))
                  )}
                </>
              )}
              <p className="t-micro m-0" style={{ color: "var(--muted)" }}>{DISCLAIMER}</p>
            </div>
          )}

          {right === "trace" && (
            <div className="flex flex-col gap-4">
              <div className="row-surface p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[13px] font-medium">Usage</span>
                  {simTag}
                </div>
                <div className="grid grid-cols-3 gap-2 tabular-nums">
                  <div><div className="text-[20px]">{formatNumber(usageTotals.tokensIn)}</div><div className="t-micro" style={{ color: "var(--muted)" }}>tokens in</div></div>
                  <div><div className="text-[20px]">{formatNumber(usageTotals.tokensOut)}</div><div className="t-micro" style={{ color: "var(--muted)" }}>tokens out</div></div>
                  <div><div className="text-[20px]">{formatMoney(usageTotals.costUsd, 4)}</div><div className="t-micro" style={{ color: "var(--muted)" }}>est. cost</div></div>
                </div>
              </div>
              <div className="row-surface p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[13px] font-medium">Evaluation</span>
                  {simTag}
                </div>
                {evalMetrics ? (
                  <div className="grid grid-cols-3 gap-2 tabular-nums">
                    <div><div className="text-[20px]">{(evalMetrics.retrieval_precision * 100).toFixed(0)}%</div><div className="t-micro" style={{ color: "var(--muted)" }}>retrieval precision</div></div>
                    <div><div className="text-[20px]">{(evalMetrics.groundedness * 100).toFixed(0)}%</div><div className="t-micro" style={{ color: "var(--muted)" }}>groundedness</div></div>
                    <div><div className="text-[20px]">{(evalMetrics.payout_accuracy * 100).toFixed(0)}%</div><div className="t-micro" style={{ color: "var(--muted)" }}>payout accuracy</div></div>
                  </div>
                ) : (
                  <p className="t-label m-0">No evaluation result yet.</p>
                )}
              </div>
              <div>
                <div className="text-[13px] font-medium mb-2">Event stream</div>
                {events.length === 0 ? (
                  <EmptyState title="No events yet" />
                ) : (
                  <ul className="list-none m-0 p-0 flex flex-col gap-1.5 max-h-[420px] overflow-y-auto pr-1">
                    {events.map((ev, i) => (
                      <li key={i}>
                        <details className="row-surface px-3 py-2">
                          <summary className="cursor-pointer text-[12px] t-mono">
                            #{ev.seq} {ev.type}
                            {ev.agent ? ` · ${ev.agent}` : ""}
                          </summary>
                          <pre className="t-mono text-[11px] mt-2 mb-0 overflow-x-auto">{JSON.stringify(ev, null, 2)}</pre>
                        </details>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Approval modal (both gates) */}
      <Modal open={!!pendingApproval} onClose={() => {}} dismissible={false} title={pendingApproval ? `Approval needed: ${pendingApproval.gate} gate` : "Approval"}>
        {pendingApproval && (
          <div className="flex flex-col gap-4">
            <p className="text-[14px] m-0" style={{ color: "var(--ink-2)" }}>{pendingApproval.summary}</p>
            {pendingApproval.gate === "payout" && (
              <div className="row-surface p-3 text-[13px]" style={{ background: "var(--warn-bg)", color: "#B45309" }}>
                The TDS rate in this demo is <strong>unverified</strong>. A human must confirm tax and withholding rates before any payout.
              </div>
            )}
            <div className="t-micro" style={{ color: "var(--muted)" }}>{DISCLAIMER}</div>
            <label htmlFor="approval-note" className="sr-only">Review note</label>
            <input
              id="approval-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={submitted}
              placeholder="Optional review note"
              className="h-11 px-4 text-[14px] outline-none"
              style={{ borderRadius: 999, border: "1px solid var(--line)" }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => respond(false)} disabled={submitted}>Reject</Button>
              <Button onClick={() => respond(true)} disabled={submitted}>{submitted ? "Recorded…" : "Approve"}</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Citation drawer — fed only by this run's own data */}
      <Drawer open={!!citation} onClose={() => setCitation(null)} title={citation ?? ""}>
        {citationInfo && (
          <div className="flex flex-col gap-4 text-[13px]">
            {citationInfo.clause && (
              <section>
                <div className="t-label mb-1">Clause text in this draft</div>
                <p className="m-0 p-3" style={{ background: "var(--chip-bg)", borderRadius: 12 }}>{citationInfo.clause.text}</p>
              </section>
            )}
            {citationInfo.hits.map((h, i) => (
              <section key={i}>
                <div className="t-label mb-1">Retrieved from {h.source} (score {h.score.toFixed(2)})</div>
                <p className="m-0 p-3" style={{ background: "var(--chip-bg)", borderRadius: 12 }}>{h.snippet}</p>
                <div className="t-micro mt-1" style={{ color: "var(--muted)" }}>query: “{h.query}”</div>
              </section>
            ))}
            {citationInfo.issues.map((iss, i) => (
              <section key={i}>
                <div className="t-label mb-1">Compliance note ({iss.severity})</div>
                <p className="m-0 p-3" style={{ background: "var(--warn-bg)", borderRadius: 12 }}>{iss.fix_hint}</p>
              </section>
            ))}
            {!citationInfo.clause && citationInfo.hits.length === 0 && citationInfo.issues.length === 0 && (
              <p className="m-0" style={{ color: "var(--muted)" }}>This run's data contains no excerpt for this source id.</p>
            )}
            <p className="t-micro m-0" style={{ color: "var(--muted)" }}>{DISCLAIMER}</p>
          </div>
        )}
      </Drawer>
    </div>
  );
}
