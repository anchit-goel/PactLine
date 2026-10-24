"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { 
  IconHome, 
  IconList, 
  IconPlay, 
  IconPlus, 
  IconTerminal 
} from "@/components/ui";
import { APP_NAME, TEAM_NAME, TEAM_INITIALS } from "@/lib/config";
import { ModeBadge, StatusDot } from "./ModeBadge";
import { useShellData } from "./ShellData";
import { GitBranch, Search, ChevronRight, Layers, Sparkles, Globe } from "lucide-react";

function NavItem({ 
  href, 
  label, 
  icon, 
  active, 
  count 
}: { 
  href: string; 
  label: string; 
  icon: ReactNode; 
  active: boolean; 
  count?: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      title={label}
      className={`flex items-center gap-3 h-11 px-3.5 text-[14px] font-medium transition-all duration-150 ease-out rounded-full ${
        active 
          ? "bg-[#171717] text-white shadow-sm" 
          : "text-[#737373] hover:text-[#171717] hover:bg-[#F8F7F5]"
      }`}
    >
      <span className={`w-5 h-5 flex items-center justify-center shrink-0 ${active ? "text-white" : "text-[#737373]"}`}>
        {icon}
      </span>
      <span className="hide-on-rail flex-1 truncate">{label}</span>
      {count !== undefined && (
        <span
          className={`hide-on-rail px-2 text-[11px] leading-5 rounded-full font-semibold ${
            active 
              ? "bg-white/20 text-white" 
              : "bg-[#FFF0E8] text-[#F07845]"
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const path = usePathname();
  const { health, runs } = useShellData();

  const is = (p: string) => {
    if (p === "/") return path === "/";
    if (p === "/overview") return path === "/overview";
    return path.startsWith(p);
  };

  return (
    <aside 
      className="panel shell-side flex flex-col p-4 gap-4 bg-white border border-[#E7E5E4] rounded-[24px] shadow-sm select-none" 
      aria-label="Primary"
    >
      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-3 px-1 pt-1 group" title="Return to Landing Page">
        <div 
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-[#F07845] to-[#FF9060] text-white font-bold text-[17px] shadow-sm group-hover:scale-105 transition-transform"
          aria-hidden="true"
        >
          P
        </div>
        <div className="hide-on-rail min-w-0">
          <div className="text-[17px] font-bold tracking-tight text-[#171717] leading-tight">{APP_NAME}</div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#A3A3A3] mt-0.5">Deal & Fairness</div>
        </div>
      </Link>

      {/* Search Input Pill */}
      <div className="hide-on-rail relative px-1">
        <div className="flex items-center gap-2 w-full h-9 px-3 rounded-full bg-[#F8F7F5] border border-[#E7E5E4] text-[13px] text-[#737373]">
          <Search className="w-3.5 h-3.5 text-[#A3A3A3]" />
          <span className="flex-1 text-[#A3A3A3] truncate">Search...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-[#E7E5E4] rounded text-[#737373]">⌘K</kbd>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-1 px-1" aria-label="Workspace">
        <NavItem 
          href="/" 
          label="Main Landing" 
          icon={<Globe className="w-4 h-4" />} 
          active={is("/")} 
        />
        <NavItem 
          href="/overview" 
          label="Overview" 
          icon={<IconHome size={18} />} 
          active={is("/overview")} 
        />
        <NavItem 
          href="/dashboard" 
          label="Workflow Canvas" 
          icon={<GitBranch className="w-4 h-4" />} 
          active={is("/dashboard")} 
        />
        <NavItem 
          href="/deal/new" 
          label="New deal" 
          icon={<IconPlus size={18} />} 
          active={is("/deal/new")} 
        />
        <NavItem 
          href="/replay" 
          label="Replay Demo" 
          icon={<IconPlay size={18} />} 
          active={is("/replay")} 
        />
        <NavItem 
          href="/debug" 
          label="Debug Console" 
          icon={<IconTerminal size={18} />} 
          active={is("/debug")} 
          count={runs.length || undefined}
        />
      </nav>

      {/* Warm Engine / Plan Card (Matching Leadora Reference Screenshot) */}
      <div 
        className="mt-auto flex flex-col gap-2.5 p-3.5 hide-on-rail rounded-[20px] bg-[#FFF0E8] border border-[rgba(240,120,69,0.18)]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#F07845]">
            <Layers className="w-4 h-4 text-[#F07845]" />
            <span>Audit Engine</span>
          </div>
          <ModeBadge />
        </div>

        <div className="flex items-baseline justify-between text-[#171717]">
          <span className="text-[18px] font-bold tracking-tight">850</span>
          <span className="text-[11px] text-[#737373]">/ 1,000 runs</span>
        </div>

        {/* Orange Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-[#FCE4D8] overflow-hidden">
          <div 
            className="h-full rounded-full bg-[#F07845] transition-all duration-300" 
            style={{ width: "85%" }}
          />
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[#737373]">
          <StatusDot up={health.apiUp} />
          <span className="truncate">{health.host || "Port 8005 Connected"}</span>
        </div>

        <Link
          href="/deal/new"
          className="mt-1 flex items-center justify-center gap-2 h-8 rounded-full bg-[#171717] hover:bg-[#262626] text-white text-[12px] font-medium transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#F07845]" />
          Launch New Deal
        </Link>
      </div>

      {/* User Profile Pill at Bottom */}
      <div className="hide-on-rail pt-2 border-t border-[#E7E5E4]/80 flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center text-[12px] font-bold shrink-0">
            {TEAM_INITIALS || "TP"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-bold text-[#171717] truncate">{TEAM_NAME || "Team TodPhod"}</span>
            <span className="text-[11px] text-[#737373] truncate">Admin · Pactline</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#A3A3A3] shrink-0" />
      </div>
    </aside>
  );
}
