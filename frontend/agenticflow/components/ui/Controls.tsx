"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

/* ── Pill / Badge ───────────────────────────────────────────── */
export type Tone = "success" | "danger" | "warn" | "neutral";

const TONES: Record<Tone, { bg: string; fg: string }> = {
  success: { bg: "#E6F5ED", fg: "#24966B" },
  danger: { bg: "#FCECEC", fg: "#D85C5C" },
  warn: { bg: "#FFF5DF", fg: "#D99A32" },
  neutral: { bg: "#F8F7F5", fg: "#737373" },
};

export function Pill({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium rounded-full bg-[#F8F7F5] text-[#737373] border border-[#E7E5E4] ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

export function Badge({ tone = "neutral", children, dot }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  const t = TONES[tone];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[12px] font-semibold rounded-full whitespace-nowrap"
      style={{ background: t.bg, color: t.fg }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />}
      {children}
    </span>
  );
}

/* ── Button ─────────────────────────────────────────────────── */
type Variant = "primary" | "ghost" | "icon" | "accent";

function btnStyle(variant: Variant): { className: string; style: CSSProperties } {
  switch (variant) {
    case "primary":
      return {
        className: "inline-flex items-center justify-center gap-2 px-5 h-10 text-[14px] font-semibold cursor-pointer rounded-full bg-[#171717] text-white hover:bg-[#262626] transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        style: {},
      };
    case "accent":
      return {
        className: "inline-flex items-center justify-center gap-2 px-5 h-10 text-[14px] font-semibold cursor-pointer rounded-full bg-[#F07845] text-white hover:bg-[#E06733] transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        style: {},
      };
    case "ghost":
      return {
        className: "inline-flex items-center justify-center gap-2 px-4 h-9 text-[13px] font-medium cursor-pointer rounded-full bg-white text-[#171717] border border-[#E7E5E4] hover:bg-[#F8F7F5] transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        style: {},
      };
    default:
      return {
        className: "inline-flex items-center justify-center w-10 h-10 cursor-pointer rounded-full bg-white text-[#737373] hover:text-[#171717] border border-[#E7E5E4] hover:bg-[#F8F7F5] transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        style: {},
      };
  }
}

export function Button({
  variant = "primary",
  className = "",
  style,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const b = btnStyle(variant);
  return <button type="button" {...rest} className={`${b.className} ${className}`} style={{ ...b.style, ...style }} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  children,
  className = "",
}: {
  href: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
}) {
  const b = btnStyle(variant);
  return (
    <Link href={href} className={`${b.className} ${className}`} style={b.style}>
      {children}
    </Link>
  );
}

/* ── SegmentedControl ───────────────────────────────────────── */
export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div 
      role="tablist" 
      aria-label={label} 
      className="inline-flex p-1 gap-1 rounded-full bg-[#ECEAE5] border border-[#E7E5E4]"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`px-3.5 h-7 text-[12px] font-semibold cursor-pointer rounded-full transition-all duration-150 ${
              active 
                ? "bg-white text-[#171717] shadow-sm" 
                : "text-[#737373] hover:text-[#171717]"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Tabs ───────────────────────────────────────────────────── */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: { id: T; label: string; badge?: ReactNode; disabled?: boolean }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap gap-1.5 p-1 rounded-full bg-[#ECEAE5] border border-[#E7E5E4]">
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            disabled={t.disabled}
            onClick={() => onChange(t.id)}
            className={`inline-flex items-center gap-2 px-4 h-8 text-[13px] font-semibold cursor-pointer rounded-full transition-all duration-150 ${
              active 
                ? "bg-white text-[#171717] shadow-sm" 
                : "text-[#737373] hover:text-[#171717] disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
          >
            {t.label}
            {t.badge}
          </button>
        );
      })}
    </div>
  );
}
