"use client";

import React from "react";
import { X, Book, Shield, Zap, Terminal, FileText, ChevronRight } from "lucide-react";

interface DocsModalProps {
  onClose: () => void;
}

export default function DocsModal({ onClose }: DocsModalProps) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="interior-theme w-full max-w-4xl max-h-[85vh] bg-white border border-[#E7E5E4] rounded-[22px] shadow-[0_24px_60px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7E5E4] flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FFF0E8] text-[#F07845] border border-[#F07845]/20">
              <Book className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#171717] leading-none">Pactline Documentation</h2>
              <p className="text-xs text-[#737373] mt-1 uppercase tracking-widest font-semibold">Fairness Auditing Framework</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#F8F7F5] text-[#737373] hover:text-[#171717] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#FAF9F6]" data-lenis-prevent="true">
          
          {/* Quick Start */}
          <section className="mb-10">
            <h3 className="text-xs font-bold text-[#F07845] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Quick Start Guide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#E7E5E4] hover:border-[#F07845]/40 transition-colors shadow-sm">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF0E8] text-[#F07845] flex items-center justify-center font-bold text-sm shrink-0">1</div>
                  <div>
                    <p className="text-[#171717] font-semibold mb-1">Upload Data</p>
                    <p className="text-xs text-[#737373] leading-relaxed">Drag your CSV onto the "Dataset Input" node. Ensure protected attributes like gender or age are present.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#E7E5E4] hover:border-[#F07845]/40 transition-colors shadow-sm">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF0E8] text-[#F07845] flex items-center justify-center font-bold text-sm shrink-0">2</div>
                  <div>
                    <p className="text-[#171717] font-semibold mb-1">Run Inspection</p>
                    <p className="text-xs text-[#737373] leading-relaxed">Click "RUN" on the Data Inspector. Pactline will spawn a secure Docker sandbox to profile the data.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#E7E5E4] hover:border-[#F07845]/40 transition-colors shadow-sm">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF0E8] text-[#F07845] flex items-center justify-center font-bold text-sm shrink-0">3</div>
                  <div>
                    <p className="text-[#171717] font-semibold mb-1">Audit Biases</p>
                    <p className="text-xs text-[#737373] leading-relaxed">Agent Auditor will select the best fairness algorithm. Watch for red paths indicating detected disparities.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#E7E5E4] hover:border-[#F07845]/40 transition-colors shadow-sm">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF0E8] text-[#F07845] flex items-center justify-center font-bold text-sm shrink-0">4</div>
                  <div>
                    <p className="text-[#171717] font-semibold mb-1">Export Report</p>
                    <p className="text-xs text-[#737373] leading-relaxed">The Mitigation Expert repairs data, and the Report Writer compiles a publication-ready PDF.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Core Concepts */}
          <section className="mb-10">
            <h3 className="text-xs font-bold text-[#F07845] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Core Concepts
            </h3>
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white border border-[#E7E5E4] shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[#171717] font-semibold">The 80% Rule (Disparate Impact)</p>
                  <span className="text-[10px] bg-[#FFF0E8] text-[#F07845] border border-[#F07845]/20 px-2 py-0.5 rounded-full font-bold">LEGAL STANDARD</span>
                </div>
                <p className="text-xs text-[#737373] leading-relaxed">
                  A selection rate for any group which is less than four-fifths (80%) of the rate for the group with the highest rate will generally be regarded as evidence of adverse impact.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-[#E7E5E4] shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[#171717] font-semibold">Dockerized Sandbox Isolation</p>
                  <span className="text-[10px] bg-[#E6F5ED] text-[#24966B] border border-[#24966B]/20 px-2 py-0.5 rounded-full font-bold">SECURITY</span>
                </div>
                <p className="text-xs text-[#737373] leading-relaxed">
                  All AI-generated code executes in an ephemeral Docker container. No local dependencies are required, and your host system remains isolated from agent execution.
                </p>
              </div>
            </div>
          </section>

          {/* Technical Reference */}
          <section>
            <h3 className="text-xs font-bold text-[#F07845] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4" /> Technical Reference
            </h3>
            <div className="rounded-2xl border border-[#E7E5E4] bg-white divide-y divide-[#E7E5E4] overflow-hidden shadow-sm">
              <div className="p-4 flex items-center justify-between hover:bg-[#F8F7F5] transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <FileText className="w-5 h-5 text-[#737373]" />
                  <p className="text-sm font-medium text-[#171717]">MCP Tool Definitions</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A3A3A3] group-hover:text-[#F07845]" />
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-[#F8F7F5] transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <FileText className="w-5 h-5 text-[#737373]" />
                  <p className="text-sm font-medium text-[#171717]">Algorithm Metadata Schemas</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A3A3A3] group-hover:text-[#F07845]" />
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-[#F8F7F5] transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <FileText className="w-5 h-5 text-[#737373]" />
                  <p className="text-sm font-medium text-[#171717]">WebSocket Event Protocol</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A3A3A3] group-hover:text-[#F07845]" />
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-[#F8F7F5] transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <FileText className="w-5 h-5 text-[#737373]" />
                  <p className="text-sm font-medium text-[#171717]">Fairness Metric Mathematical Proofs</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A3A3A3] group-hover:text-[#F07845]" />
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E7E5E4] bg-white flex justify-between items-center text-[11px] text-[#737373]">
          <p>© 2026 Pactline AI Framework v1.0</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#F07845]">Privacy Policy</a>
            <a href="#" className="hover:text-[#F07845]">Github</a>
          </div>
        </div>
      </div>
    </div>
  );
}
