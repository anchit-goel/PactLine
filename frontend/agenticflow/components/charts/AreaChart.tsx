"use client";

import { useId, useState } from "react";

export interface AreaSeries {
  name: string;
  values: number[];
  color: string;
}

const W = 600;

function smoothPath(pts: [number, number][]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M${pts[0][0]},${pts[0][1]}`;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/**
 * Smooth multi-series area chart. Dashed average line (first series) with a black pill label,
 * hover point + white tooltip card, index axis. Empty data → empty state text.
 */
export function AreaChart({
  labels,
  series,
  height = 220,
  ariaLabel,
  emptyText = "No data yet",
  unit = "",
}: {
  labels: string[];
  series: AreaSeries[];
  height?: number;
  ariaLabel: string;
  emptyText?: string;
  unit?: string;
}) {
  const gid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const n = labels.length;

  if (n === 0 || series.every((s) => s.values.length === 0)) {
    return (
      <div className="flex items-center justify-center t-label" style={{ height }} role="img" aria-label={`${ariaLabel}: no data`}>
        {emptyText}
      </div>
    );
  }

  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const top = 16;
  const bottom = height - 8;
  const x = (i: number) => (n === 1 ? W / 2 : (i / (n - 1)) * W);
  const y = (v: number) => bottom - (v / max) * (bottom - top);
  const primary = series[0];
  const avg = primary.values.length ? primary.values.reduce((a, b) => a + b, 0) / primary.values.length : 0;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const rel = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    setHover(n === 1 ? 0 : Math.round(rel * (n - 1)));
  };

  const hx = hover === null ? 0 : (x(hover) / W) * 100;

  return (
    <div className="w-full">
      <div className="relative" style={{ height }} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        <svg role="img" aria-label={ariaLabel} width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none">
          <defs>
            {series.map((s, i) => (
              <linearGradient key={i} id={`${gid}-${i}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={i === 0 ? 0.22 : 0.14} />
                <stop offset="100%" stopColor={s.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1="0" x2={W} y1={top + (bottom - top) * f} y2={top + (bottom - top) * f} stroke="var(--line)" />
          ))}
          {[...series].reverse().map((s, ri) => {
            const i = series.length - 1 - ri;
            const pts = s.values.map((v, k) => [x(k), y(v)] as [number, number]);
            const line = smoothPath(pts);
            return (
              <g key={s.name}>
                {pts.length > 1 && <path d={`${line} L${pts[pts.length - 1][0]},${bottom} L${pts[0][0]},${bottom} Z`} fill={`url(#${gid}-${i})`} />}
                <path d={line} fill="none" stroke={s.color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                {pts.length === 1 && <circle cx={pts[0][0]} cy={pts[0][1]} r="3" fill={s.color} />}
              </g>
            );
          })}
          <line x1="0" x2={W} y1={y(avg)} y2={y(avg)} stroke="var(--ink)" strokeDasharray="4 4" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.5" />
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={top} y2={bottom} stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
        </svg>

        <span
          className="absolute right-0 px-2.5 py-0.5 text-[11px] font-medium"
          style={{ top: Math.max(0, y(avg) - 11), borderRadius: 999, background: "var(--ink)", color: "#fff" }}
        >
          avg {Math.round(avg).toLocaleString()}
          {unit}
        </span>

        {hover !== null && (
          <>
            {series.map((s) =>
              s.values[hover] === undefined ? null : (
                <span
                  key={s.name}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    left: `${hx}%`,
                    top: y(s.values[hover]),
                    transform: "translate(-50%,-50%)",
                    background: "#fff",
                    border: `2px solid ${s.color}`,
                  }}
                />
              )
            )}
            <div
              className="absolute pointer-events-none px-3 py-2 text-[12px]"
              style={{
                left: `${Math.min(80, Math.max(0, hx))}%`,
                top: 0,
                transform: "translateX(-10%)",
                background: "#fff",
                borderRadius: 12,
                boxShadow: "var(--shadow)",
                border: "1px solid var(--line)",
                whiteSpace: "nowrap",
              }}
            >
              <div className="font-medium">{labels[hover]}</div>
              {series.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5" style={{ color: "var(--ink-2)" }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  {s.name}: {(s.values[hover] ?? 0).toLocaleString()}
                  {unit}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="flex justify-between t-micro mt-2" style={{ color: "var(--muted)" }}>
        {labels.length <= 12
          ? labels.map((l, i) => <span key={i}>{l}</span>)
          : [labels[0], labels[Math.floor(labels.length / 2)], labels[labels.length - 1]].map((l, i) => <span key={i}>{l}</span>)}
      </div>
      <div className="flex gap-4 mt-2 t-micro" style={{ color: "var(--ink-2)" }}>
        {series.map((s) => (
          <span key={s.name} className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
