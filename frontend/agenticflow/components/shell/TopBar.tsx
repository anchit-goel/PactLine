"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TEAM_INITIALS } from "@/lib/config";
import { ModeBadge, StatusDot } from "./ModeBadge";
import { useShellData } from "./ShellData";
import { ChevronLeft, RefreshCw, Sparkles, Clock, ExternalLink } from "lucide-react";

function crumbs(path: string): { parent: string; current: string } {
  if (path === "/" || path === "/overview") return { parent: "Dashboard", current: "Overview" };
  if (path === "/dashboard") return { parent: "Workspace", current: "Workflow Canvas" };
  if (path === "/deal/new") return { parent: "Deal Studio", current: "New Deal" };
  if (path.startsWith("/deal/")) return { parent: "Deal Studio", current: decodeURIComponent(path.split("/")[2] ?? "Run") };
  if (path === "/replay") return { parent: "Simulations", current: "Replay Demo" };
  if (path === "/debug") return { parent: "Developer", current: "Debug Console" };
  return { parent: "Pactline", current: "" };
}

export function TopBar() {
  const router = useRouter();
  const path = usePathname();
  const { health, refreshRuns } = useShellData();
  const [dev, setDev] = useState(process.env.NODE_ENV === "development");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("dev") === "1") setDev(true);
  }, [path]);

  const c = crumbs(path);

  return (
    <header className="flex items-center justify-between gap-3 mb-6 px-1">
      {/* Breadcrumbs with subtle back button */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#E7E5E4] text-[#737373] hover:text-[#171717] hover:bg-[#F8F7F5] transition-colors shadow-sm cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <nav aria-label="Breadcrumb" className="text-[14px] min-w-0 truncate">
          <span className="text-[#737373]">{c.parent}</span>
          <span className="text-[#A3A3A3] mx-1.5">/</span>
          <span className="font-semibold text-[#171717]">{c.current}</span>
        </nav>
      </div>

      {/* Right actions matching Leadora reference */}
      <div className="flex items-center gap-2.5">
        {dev && (
          <Link 
            href="/debug" 
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1 text-[12px] font-mono rounded-full bg-white border border-[#E7E5E4] text-[#737373] hover:text-[#171717]"
          >
            debug
          </Link>
        )}

        <Link
          href="/"
          title="Return to Main Landing Page"
          className="hidden md:inline-flex items-center gap-1.5 px-3 h-9 rounded-full bg-white border border-[#E7E5E4] text-[12px] font-medium text-[#737373] hover:text-[#171717] hover:bg-[#F8F7F5] transition-colors shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Landing Page</span>
        </Link>

        <div className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-full bg-white border border-[#E7E5E4] text-[13px] text-[#171717] shadow-sm">
          <StatusDot up={health.apiUp} />
          <span className="text-[12px] font-medium text-[#737373]">
            {health.apiUp ? "Engine Ready" : "Backend Offline"}
          </span>
          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[#FFF0E8] text-[#F07845] font-semibold">
            8005
          </span>
        </div>

        <button
          type="button"
          aria-label="Refresh data"
          title="Refresh runs"
          onClick={() => {
            health.refresh();
            refreshRuns();
          }}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#E7E5E4] text-[#737373] hover:text-[#171717] hover:bg-[#F8F7F5] transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <Link
          href="/dashboard"
          title="Workflow Playground"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#E7E5E4] text-[#737373] hover:text-[#F07845] hover:bg-[#F8F7F5] transition-colors shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
        </Link>

        {/* User avatar circle */}
        <div 
          className="w-9 h-9 rounded-full bg-[#171717] text-white flex items-center justify-center text-[12px] font-bold shadow-sm"
          title="User profile"
        >
          {TEAM_INITIALS || "TP"}
        </div>
      </div>
    </header>
  );
}
