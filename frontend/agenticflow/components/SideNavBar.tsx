"use client";

import {
  GitBranch,
  FileText,
  HelpCircle,
  Zap,
  Compass,
  Library,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";

import { useViewMode } from "./ViewModeContext";
import Link from "next/link";

export default function SideNavBar() {
  const { isSidebarCollapsed, setShowTour, currentView, setCurrentView } = useViewMode();

  return (
    <nav
      className={`fixed left-0 top-16 bottom-0 flex flex-col py-5 z-[90] bg-white border-r border-[#E7E5E4] text-sm font-medium transition-all duration-300 ease-in-out shadow-xs ${
        isSidebarCollapsed ? "w-0 -translate-x-full opacity-0 overflow-hidden" : "w-[260px] translate-x-0 opacity-100"
      }`}
    >
      {/* Workspace Header */}
      <div className="px-5 mb-5 whitespace-nowrap">
        <h2 className="text-[11px] uppercase tracking-wider text-[#A3A3A3] font-bold mb-1.5">
          Playground Workspace
        </h2>
        <div className="text-[16px] font-bold text-[#171717] flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#F07845] to-[#FF9060] flex items-center justify-center text-white shadow-xs">
            <Layers className="w-3.5 h-3.5 text-white" />
          </div>
          Audit Studio
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 flex flex-col gap-1.5 px-3 whitespace-nowrap">
        <button
          onClick={() => setCurrentView("dataset")}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer text-[13px] ${
            currentView === "dataset"
              ? "bg-[#171717] text-white font-semibold shadow-sm"
              : "text-[#737373] hover:text-[#171717] hover:bg-[#F8F7F5]"
          }`}
        >
          <GitBranch className={`w-4 h-4 ${currentView === "dataset" ? "text-white" : "text-[#737373]"}`} />
          <span className="tracking-tight">Workflow Canvas</span>
        </button>

        <button
          onClick={() => setCurrentView("library")}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer text-[13px] ${
            currentView === "library"
              ? "bg-[#171717] text-white font-semibold shadow-sm"
              : "text-[#737373] hover:text-[#171717] hover:bg-[#F8F7F5]"
          }`}
        >
          <Library className={`w-4 h-4 ${currentView === "library" ? "text-[#F07845]" : "text-[#737373]"}`} />
          <span className="tracking-tight">Algorithm Library</span>
        </button>

        <Link
          href="/overview"
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-[#737373] hover:text-[#171717] hover:bg-[#F8F7F5] transition-all text-[13px]"
        >
          <Zap className="w-4 h-4 text-[#F07845]" />
          <span className="tracking-tight">Overview Dashboard</span>
        </Link>

        <Link
          href="/deal/new"
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-[#737373] hover:text-[#171717] hover:bg-[#F8F7F5] transition-all text-[13px]"
        >
          <FileText className="w-4 h-4 text-[#24966B]" />
          <span className="tracking-tight">New Deal Studio</span>
        </Link>

        <Link
          href="/replay"
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-[#737373] hover:text-[#171717] hover:bg-[#F8F7F5] transition-all text-[13px]"
        >
          <Compass className="w-4 h-4 text-[#C8BDEB]" />
          <span className="tracking-tight">Replay Player</span>
        </Link>
      </div>

      {/* Bottom Section */}
      <div className="px-4 mt-auto whitespace-nowrap flex flex-col gap-3">
        <button
          onClick={() => setShowTour(true)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-[#FFF0E8] border border-[rgba(240,120,69,0.2)] text-[#F07845] hover:bg-[#FFE8DC] text-[12px] font-semibold transition-all cursor-pointer shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#F07845]" />
          <span>Interactive Tour</span>
        </button>

        <div className="pt-3 border-t border-[#E7E5E4] flex items-center justify-between text-[11px] text-[#A3A3A3]">
          <span>Docker Sandbox</span>
          <span className="inline-flex items-center gap-1 font-semibold text-[#24966B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#24966B] animate-pulse" />
            Port 8005
          </span>
        </div>
      </div>
    </nav>
  );
}
