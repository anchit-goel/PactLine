/** Tiny smooth line with a faint fill. Accepts a plain array; empty → dashed baseline. */
export function Sparkline({ values, height = 36, ariaLabel }: { values: number[]; height?: number; ariaLabel: string }) {
  const W = 120;
  if (values.length === 0) {
    return (
      <svg role="img" aria-label={`${ariaLabel}: no data`} width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none">
        <line x1="0" x2={W} y1={height - 2} y2={height - 2} stroke="var(--line)" strokeDasharray="3 3" />
      </svg>
    );
  }
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const pts = values.map((v, i) => [values.length === 1 ? W / 2 : (i / (values.length - 1)) * W, height - 4 - ((v - min) / span) * (height - 8)]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${height} L${pts[0][0]},${height} Z`;
  return (
    <svg role="img" aria-label={ariaLabel} width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none">
      <path d={area} fill="var(--series-3)" opacity="0.35" />
      <path d={line} fill="none" stroke="var(--series-1)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
