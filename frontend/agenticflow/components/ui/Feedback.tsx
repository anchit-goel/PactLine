import type { CSSProperties, ReactNode } from "react";
import { Badge } from "./Controls";

export function ProgressBar({ 
  value, 
  max = 100, 
  label,
  barColor = "#F07845"
}: { 
  value: number; 
  max?: number; 
  label?: string;
  barColor?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="w-full overflow-hidden rounded-full bg-[#ECEAE5]"
      style={{ height: 6 }}
    >
      <div 
        className="h-full rounded-full transition-[width] duration-300 ease-out"
        style={{ width: `${pct}%`, backgroundColor: barColor }} 
      />
    </div>
  );
}

export function Skeleton({ width = "100%", height = 16, style }: { width?: number | string; height?: number | string; style?: CSSProperties }) {
  return (
    <div 
      className="skeleton rounded-xl bg-[#E7E5E4]/60 animate-pulse" 
      style={{ width, height, ...style }} 
      aria-hidden="true" 
    />
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 py-10 px-4 rounded-[22px] bg-white border border-[#E7E5E4] shadow-sm">
      <div className="text-[16px] font-semibold text-[#171717]">{title}</div>
      {body && <p className="text-[13px] text-[#737373] m-0 max-w-sm">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Stat({
  label,
  value,
  delta,
  hint,
  icon,
  children,
}: {
  label: string;
  value: ReactNode;
  delta?: { text: string; tone?: "success" | "danger" | "warn" | "neutral" };
  hint?: string;
  icon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-[#737373]">{icon}</span>}
          <span className="text-[13px] font-medium text-[#737373]">{label}</span>
        </div>
        {delta && <Badge tone={delta.tone ?? "success"}>{delta.text}</Badge>}
      </div>
      <div className="text-[32px] font-bold tracking-tight text-[#171717] leading-none">{value}</div>
      {hint && <div className="text-[11px] text-[#A3A3A3]">{hint}</div>}
      {children && <div className="mt-1">{children}</div>}
    </div>
  );
}
