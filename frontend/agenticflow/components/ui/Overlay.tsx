"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { IconX } from "./icons";

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
}

export function Modal({
  open,
  onClose,
  title,
  children,
  dismissible = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  dismissible?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEscape(open && dismissible, onClose);
  useEffect(() => {
    if (open) ref.current?.focus();
  }, [open]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(11,11,12,0.35)" }}
      onMouseDown={(e) => dismissible && e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="card fade-up w-full max-w-lg outline-none"
        style={{ background: "var(--surface-solid)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="t-title m-0">{title}</h2>
          {dismissible && (
            <button aria-label="Close" onClick={onClose} className="cursor-pointer p-1 rounded-full hover:bg-black/5">
              <IconX size={18} />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40" onMouseDown={(e) => e.target === e.currentTarget && onClose()} style={{ background: "rgba(11,11,12,0.2)" }}>
      <aside
        role="dialog"
        aria-label={title}
        className="fade-up absolute top-3 right-3 bottom-3 w-full max-w-md overflow-y-auto"
        style={{ background: "var(--surface-solid)", borderRadius: "var(--r-panel)", boxShadow: "var(--shadow)", border: "1px solid var(--line)", padding: 24, maxWidth: "min(28rem, calc(100vw - 24px))" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="t-title m-0 t-mono break-all">{title}</h2>
          <button aria-label="Close" onClick={onClose} className="cursor-pointer p-1 rounded-full hover:bg-black/5">
            <IconX size={18} />
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}
