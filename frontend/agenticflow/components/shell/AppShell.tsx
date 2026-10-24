"use client";

import type { ReactNode } from "react";
import { ShellDataProvider } from "./ShellData";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ShellDataProvider>
      <div 
        className="interior-theme min-h-screen bg-[#F3F2EF] text-[#171717] selection:bg-[#FFF0E8] selection:text-[#F07845]"
        style={{
          backgroundImage: "radial-gradient(ellipse 70% 320px at 50% 0%, rgba(240, 120, 69, 0.05) 0%, transparent 70%)",
        }}
      >
        <div className="shell">
          <Sidebar />
          <div className="min-w-0 py-1 pr-1">
            <TopBar />
            <main id="main">{children}</main>
          </div>
        </div>
      </div>
    </ShellDataProvider>
  );
}

