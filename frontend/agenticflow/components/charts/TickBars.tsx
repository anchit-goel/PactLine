export type TickTone = "success" | "danger" | "warn";

const COLORS: Record<TickTone, string> = {
  success: "var(--success)",
  danger: "var(--danger)",
  warn: "var(--warn)",
};

/** Thin vertical ticks. `tones[i]` highlights a tick with a semantic colour. */
export function TickBars({
  values,
  tones,
  height = 40,
  ariaLabel,
}: {
  values: number[];
  tones?: (TickTone | undefined)[];
  height?: number;
  ariaLabel: string;
}) {
  const W = 120;
  if (values.length === 0) {
    return (
      <svg role="img" aria-label={`${ariaLabel}: no data`} width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none">
        <line x1="0" x2={W} y1={height - 1} y2={height - 1} stroke="var(--line)" strokeWidth="1" strokeDasharray="3 3" />
      </svg>
    );
  }
  const max = Math.max(...values, 1);
  const step = W / values.length;
  return (
    <svg role="img" aria-label={ariaLabel} width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none">
      {values.map((v, i) => {
        const h = Math.max(3, (v / max) * (height - 2));
        const tone = tones?.[i];
        return (
          <rect
            key={i}
            x={i * step + step * 0.3}
            y={height - h}
            width={Math.max(1.5, step * 0.4)}
            height={h}
            rx={1}
            fill={tone ? COLORS[tone] : "var(--series-3)"}
          />
        );
      })}
    </svg>
  );
}
