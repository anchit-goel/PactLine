"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Bot, X, Send, Sparkles, CircleCheck, Circle, Copy, Check, MessageCircleQuestion } from "lucide-react";
import { API_BASE_URL, MODEL_API_BASE_URL } from "../lib/config";
import { useViewMode } from "./ViewModeContext";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

type AgentAvailability = Record<string, { name: string; available: boolean }>;

const AGENT_ORDER = [1, 2, 3, 4];

const DATA_FALLBACK_NAMES: Record<number, string> = {
  1: "Data Surveyor",
  2: "Fairness Adjudicator",
  3: "Mitigation Agent",
  4: "Report Compiler",
};

const MODEL_FALLBACK_NAMES: Record<number, string> = {
  1: "Model Inspector",
  2: "Behavioral Auditor",
  3: "Threshold Calibrator",
  4: "Report Compiler",
};

export default function AskSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [agents, setAgents] = useState<AgentAvailability>({});
  const [selectedAgents, setSelectedAgents] = useState<Set<number>>(new Set());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { viewMode, currentView } = useViewMode();
  const isTestMode = viewMode === 'test';
  const FALLBACK_NAMES = DATA_FALLBACK_NAMES;
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const baseUrl = API_BASE_URL;
        const res = await fetch(`${baseUrl}/qa/agents?test_mode=${isTestMode}&view_type=${currentView}`);
        if (res.ok && !cancelled) {
          const data: AgentAvailability = await res.json();
          setAgents(data);
        }
      } catch {
        // backend not reachable yet — ignore, will retry
      }
    };

    poll();
    const intervalId = setInterval(poll, 2000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [isOpen, isTestMode]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const toggleAgent = (num: number) => {
    setSelectedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const handleAsk = useCallback(async () => {
    const q = question.trim();
    if (!q || isStreaming) return;

    setMessages((prev) => [...prev, { role: "user", text: q }, { role: "assistant", text: "" }]);
    setQuestion("");
    setIsStreaming(true);

    try {
      const baseUrl = API_BASE_URL;
      const res = await fetch(`${baseUrl}/qa/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          agent_numbers: Array.from(selectedAgents),
          test_mode: isTestMode,
          view_type: currentView
        }),
      });

      if (!res.body) throw new Error("No response stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") continue;
          try {
            const parsed = JSON.parse(payload);
            const chunk = parsed.text ?? (parsed.error ? `Error: ${parsed.error}` : "");
            if (chunk) {
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = {
                  role: "assistant",
                  text: next[next.length - 1].text + chunk,
                };
                return next;
              });
            }
          } catch {
            // ignore malformed SSE chunk
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", text: "Couldn't reach the audit backend. Is it running?" };
        return next;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [question, isStreaming, selectedAgents]);

  const selectedCount = selectedAgents.size;

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`fixed right-6 bottom-8 z-40 flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 active:scale-90 shadow-lg ${
          isOpen
            ? "bg-white border border-[#E7E5E4] text-[#171717] hover:bg-[#F8F7F5]"
            : "bg-[#F07845] text-white hover:bg-[#E06835] hover:scale-105 shadow-[0_8px_24px_rgba(240,120,69,0.35)]"
        }`}
        title={isOpen ? "Close Ask the Audit" : "Ask the Audit"}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Sparkles className="h-6 w-6" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-screen w-[420px] max-w-[95vw] flex-col overflow-hidden bg-white border-l border-[#E7E5E4] shadow-[-12px_0_40px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-5 pt-5 pb-4 border-b border-[#E7E5E4] bg-white">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF0E8] border border-[#F07845]/20 text-[#F07845]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-[#171717] tracking-tight">Ask the Audit</h2>
                <p className="text-[11px] text-[#737373] mt-0.5">
                  Powered by Granite 4 · Local LLM
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-xl p-2 text-[#737373] hover:bg-[#F8F7F5] hover:text-[#171717] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Agent context selector */}
        <div className="px-5 py-3.5 border-b border-[#E7E5E4] bg-[#F8F7F5]">
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#737373]">
            Agent Context {selectedCount > 0 && <span className="text-[#F07845]">· {selectedCount} active</span>}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {AGENT_ORDER.map((num) => {
              const info = agents[String(num)];
              const available = !!info?.available;
              const checked = selectedAgents.has(num);
              return (
                <button
                  key={num}
                  type="button"
                  disabled={!available}
                  onClick={() => toggleAgent(num)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-medium transition-all duration-200 ${
                    !available
                      ? "cursor-not-allowed border-[#E7E5E4] text-[#A3A3A3] bg-transparent opacity-50"
                      : checked
                      ? "border-[#F07845]/50 bg-[#FFF0E8] text-[#F07845] font-semibold"
                      : "border-[#E7E5E4] text-[#525252] bg-white hover:border-[#D5D3CE] hover:text-[#171717]"
                  }`}
                >
                  {checked && available ? (
                    <CircleCheck className="h-3.5 w-3.5 shrink-0 text-[#F07845]" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 shrink-0 opacity-40 text-[#737373]" />
                  )}
                  <span className="truncate">{info?.name ?? FALLBACK_NAMES[num]}</span>
                  {!available && <span className="ml-auto text-[9px] opacity-60">off</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain scroll-smooth px-5 py-5 space-y-5 bg-[#FAF9F6]"
          style={{ scrollBehavior: 'auto' }}
          onWheel={(e) => {
            e.stopPropagation();
          }}
        >
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center px-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white border border-[#E7E5E4] text-[#737373] shadow-sm">
                <MessageCircleQuestion className="h-7 w-7" />
              </div>
              <div className="space-y-1.5">
                <p className="text-[13px] font-medium text-[#171717]">No messages yet</p>
                <p className="text-[11px] text-[#737373] leading-relaxed max-w-[260px]">
                  Select agents above, then ask about audit findings in plain English.
                </p>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              style={{
                animation: `chat-slide-in 0.3s ease-out both`,
                animationDelay: `${Math.min(i * 0.05, 0.2)}s`,
              }}
            >
              {/* Assistant avatar */}
              {m.role === "assistant" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FFF0E8] border border-[#F07845]/20 mt-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#F07845]" />
                </div>
              )}
              <div className="flex flex-col gap-1 max-w-[80%]">
                <div
                  className={`text-[13px] leading-[1.6] ${
                    m.role === "user"
                      ? "bg-[#F07845] text-white rounded-2xl rounded-br-md px-4 py-2.5 shadow-sm"
                      : "bg-white text-[#171717] rounded-2xl rounded-bl-md px-4 py-3 border border-[#E7E5E4] shadow-sm chat-markdown"
                  }`}
                >
                  {m.role === "assistant" ? (
                    m.text ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{m.text}</ReactMarkdown>
                    ) : (
                      <span className="inline-flex gap-1.5 py-1 px-1">
                        <span className="h-2 w-2 rounded-full bg-[#F07845]/60 animate-bounce [animation-delay:-0.3s]" />
                        <span className="h-2 w-2 rounded-full bg-[#F07845]/60 animate-bounce [animation-delay:-0.15s]" />
                        <span className="h-2 w-2 rounded-full bg-[#F07845]/60 animate-bounce" />
                      </span>
                    )
                  ) : (
                    m.text
                  )}
                </div>
                {/* Copy button for assistant messages */}
                {m.role === "assistant" && m.text && (
                  <div className="flex items-center gap-1 pl-1">
                    <button
                      onClick={() => handleCopy(m.text, i)}
                      className="flex items-center gap-1 text-[10px] text-[#737373] hover:text-[#171717] transition-colors py-0.5 px-1.5 rounded-md hover:bg-white border border-transparent hover:border-[#E7E5E4]"
                    >
                      {copiedIndex === i ? (
                        <><Check className="h-3 w-3 text-[#24966B]" /><span className="text-[#24966B]">Copied</span></>
                      ) : (
                        <><Copy className="h-3 w-3" /><span>Copy</span></>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Composer */}
        <div className="p-4 border-t border-[#E7E5E4] bg-white">
          <div className="flex items-center gap-2 rounded-2xl bg-[#F8F7F5] border border-[#E7E5E4] px-4 py-1.5 focus-within:border-[#F07845] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#F07845]/15 transition-all duration-200">
            <input
              ref={inputRef}
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
              placeholder="Ask about the audit..."
              className="flex-1 bg-transparent py-2 text-[13px] text-[#171717] placeholder:text-[#A3A3A3] outline-none"
            />
            <button
              onClick={handleAsk}
              disabled={isStreaming || !question.trim()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F07845] text-white transition-all duration-200 hover:bg-[#E06835] active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              title="Send"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
