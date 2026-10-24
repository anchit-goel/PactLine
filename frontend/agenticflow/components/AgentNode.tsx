"use client";

import { memo, useState, useEffect, useRef } from "react";
import { Handle, Position, type NodeProps, type Node, useUpdateNodeInternals } from "@xyflow/react";
import { Database, Brain, Code, MoreHorizontal, ChevronDown, ChevronUp, Clock, Wrench, Play, Loader2 } from "lucide-react";
import { useViewMode } from "./ViewModeContext";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AgentNodeData {
  title: string;
  iconType: "database" | "brain" | "code";
  description?: string;
  inputLabel: string;
  outputLabel: string;
  inputVariant?: "active" | "default";
  outputVariant?: "active" | "default";
  statusBadge?: { label: string; color: string };
  confidenceScore?: number;
  isSelected?: boolean;
  hasRunButton?: boolean;
  toolCalls?: { id: string; name: string; inputs: any; output: string }[];
  isAgentRunning?: boolean;
  onRunStart?: (nodeId: string) => void;
  onRunComplete?: (nodeId: string) => void;
  [key: string]: unknown;
}

export type AgentNodeType = Node<AgentNodeData, "agent">;

/* ------------------------------------------------------------------ */
/*  Icon map                                                           */
/* ------------------------------------------------------------------ */

const iconMap = {
  database: {
    bg: "bg-[#FFF0E8]",
    icon: <Database className="w-4 h-4 text-[#F07845]" />,
  },
  brain: {
    bg: "bg-[#FFF0E8]",
    icon: <Brain className="w-4 h-4 text-[#F07845]" />,
  },
  code: {
    bg: "bg-[#FFF5DF]",
    icon: <Code className="w-4 h-4 text-[#D99A32]" />,
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function AgentNode({ id, data, selected }: NodeProps<AgentNodeType>) {
  const { bg, icon } = iconMap[data.iconType];
  const isHighlighted = selected || data.isSelected;
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});
  const [showAllTools, setShowAllTools] = useState(false);
  const [localIsRunning, setLocalIsRunning] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const updateNodeInternals = useUpdateNodeInternals();
  const { viewMode } = useViewMode();

  const isAgentRunning = data.isAgentRunning !== undefined ? data.isAgentRunning : localIsRunning;
  const prevIsRunningRef = useRef(isAgentRunning);

  useEffect(() => {
    // Only show notification if we went from running to not running
    if (prevIsRunningRef.current === true && isAgentRunning === false) {
      setShowNotification(true);
    }
    prevIsRunningRef.current = isAgentRunning;
  }, [isAgentRunning]);

  useEffect(() => {
    if (isHighlighted && showNotification) {
      setShowNotification(false);
    }
  }, [isHighlighted, showNotification]);

  const toggleTool = (e: React.MouseEvent, toolId: string) => {
    e.stopPropagation();
    setExpandedTools((prev) => ({ ...prev, [toolId]: !prev[toolId] }));
    // Tell React Flow the node dimensions changed so it redraws edges correctly
    setTimeout(() => updateNodeInternals(id), 0);
  };

  const handleRun = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent node selection when clicking run
    if (data.isTourMode) return;
    if (isAgentRunning) return;

    if (typeof data.onRunStart === "function") {
      data.onRunStart(id);
    } else {
      // Fallback to simulated behavior for agents not yet connected
      setLocalIsRunning(true);
      setTimeout(() => {
        setLocalIsRunning(false);
        if (typeof data.onRunComplete === "function") {
          data.onRunComplete(id);
        }
      }, 5000);
    }
  };

  return (
    <div
      className={`relative w-[300px] rounded-[22px] bg-white border transition-all duration-200 select-none ${
        isHighlighted
          ? "border-[#F07845] ring-2 ring-[#F07845]/25 shadow-md"
          : "border-[#E7E5E4] shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
      }`}
    >
      {/* Completion Notification */}
      {showNotification && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce z-50">
          <div className="bg-[#171717] text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
            Click to view results
          </div>
          <div className="w-2.5 h-2.5 bg-[#171717] rotate-45 -mt-1.5 rounded-sm"></div>
        </div>
      )}
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between p-3 border-b border-[#E7E5E4] bg-white rounded-t-[22px]">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
            {icon}
          </div>
          <h3 className="text-[13px] font-bold text-[#171717]">
            {data.title}
          </h3>
        </div>
        {data.hasRunButton ? (
          <button 
            onClick={handleRun}
            disabled={isAgentRunning}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider transition-all duration-150 cursor-pointer shadow-xs ${
              isAgentRunning 
                ? "bg-[#FFF0E8] text-[#F07845]" 
                : "bg-[#171717] hover:bg-[#262626] text-white"
            }`}
          >
            {isAgentRunning ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Running
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current text-[#F07845]" />
                Run
              </>
            )}
          </button>
        ) : data.statusBadge ? (
          <div className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: data.statusBadge.color }}
            />
            <span className="text-xs font-semibold" style={{ color: data.statusBadge.color }}>
              {data.statusBadge.label}
            </span>
          </div>
        ) : (
          <button className="text-[#737373] hover:text-[#171717] transition-colors cursor-pointer">
            <MoreHorizontal className="w-[18px] h-[18px]" />
          </button>
        )}
      </div>

      {/* ---- Body ---- */}
      <div className="p-4 flex flex-col gap-4">
        {data.description && (
          <p className="text-xs leading-relaxed text-[#737373]">
            {data.description}
          </p>
        )}

        {data.confidenceScore !== undefined && (
          <div className="bg-[#F8F7F5] rounded-xl p-3 border border-[#E7E5E4]">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] text-[#737373] uppercase tracking-wider font-semibold">
                Confidence Score
              </span>
              <span className="text-[13px] font-bold tracking-[0.05em] text-[#F07845]">
                {data.confidenceScore}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-[#E7E5E4] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F07845] transition-[width] duration-300 ease-out"
                style={{ width: `${data.confidenceScore}%` }}
              />
            </div>
          </div>
        )}

        {/* Individual Tool Accordions - Only visible in Developer Mode */}
        {(viewMode === "developer" || viewMode === "test") && data.toolCalls && data.toolCalls.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] text-[#737373] uppercase tracking-wider font-bold">
                {showAllTools ? "All Tool Calls" : "Recent Activity"}
              </span>
              {data.toolCalls.length > 1 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllTools(!showAllTools);
                    setTimeout(() => updateNodeInternals(id), 0);
                  }}
                  className="text-[10px] text-[#F07845] hover:underline font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {showAllTools ? "Show Less" : `View All (${data.toolCalls.length})`}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showAllTools ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1">
              {(showAllTools ? data.toolCalls : data.toolCalls.slice(-1)).map((tool, index) => {
                const isExpanded = expandedTools[tool.id] || false;
                return (
                  <div key={`${tool.id}-${index}`} className="shrink-0 bg-[#F8F7F5] border border-[#E7E5E4] rounded-xl overflow-hidden cursor-default">
                    {(() => {
                      let displayTitle = tool.name;
                      try {
                        const parsedInputs = typeof tool.inputs === 'string' ? JSON.parse(tool.inputs) : tool.inputs;
                        if (parsedInputs && (parsedInputs.reason || parsedInputs['arguments.reason'])) {
                          displayTitle = parsedInputs.reason || parsedInputs['arguments.reason'];
                        }
                      } catch (e) {
                        // ignore parse errors
                      }
                      return (
                        <button
                          onClick={(e) => toggleTool(e, tool.id)}
                          className="w-full flex items-center gap-2 p-2.5 text-xs text-[#171717] hover:bg-black/5 transition-colors cursor-pointer"
                        >
                          <div className="w-5 h-5 rounded-full bg-white border border-[#E7E5E4] flex items-center justify-center shrink-0">
                            <Wrench className="w-3 h-3 text-[#737373]" />
                          </div>
                          <span className="flex-1 text-left font-mono truncate text-[11px] font-semibold" title={displayTitle}>{displayTitle}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[#737373]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#737373]" />}
                        </button>
                      );
                    })()}
                    
                    {isExpanded && (
                      <div className="p-2.5 border-t border-[#E7E5E4] bg-white flex flex-col gap-2">
                        <div className="bg-[#F8F7F5] border border-[#E7E5E4] rounded-lg p-2.5 w-full font-mono text-[10px] overflow-x-auto hide-scrollbar flex flex-col gap-2">
                          {/* Parameters */}
                          {tool.inputs && (
                            <div>
                              <div className="inline-block bg-white text-[#737373] border border-[#E7E5E4] px-1.5 py-0.5 rounded text-[9px] font-semibold mb-1.5">
                                Parameters
                              </div>
                              <pre className="text-[#15803D] whitespace-pre-wrap break-all">
                                {typeof tool.inputs === 'string' ? tool.inputs : JSON.stringify(tool.inputs, null, 2)}
                              </pre>
                            </div>
                          )}
                          {/* Result */}
                          <div>
                            <div className="inline-block bg-white text-[#737373] border border-[#E7E5E4] px-1.5 py-0.5 rounded text-[9px] font-semibold mb-1.5">
                                Result
                            </div>
                            <pre className="text-[#171717] whitespace-pre-wrap break-all">
                              {tool.output}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Port Labels */}
        <div className="flex justify-between items-center w-full mt-2">
          <span className="text-xs text-on-surface-variant">
            {data.inputLabel}
          </span>
          <span
            className={`text-xs ${
              data.outputVariant === "active" ? "text-primary" : "text-on-surface-variant"
            }`}
          >
            {data.outputLabel}
          </span>
        </div>
      </div>

      {/* ---- Handles (connection ports) ---- */}
      <Handle
        type="target"
        position={Position.Left}
        className={`!w-3 !h-3 !rounded-full !border-2 !border-white !-left-1.5 shadow-sm ${
          data.inputVariant === "active" ? "!bg-[#F07845]" : "!bg-[#D5D3CE]"
        }`}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={`!w-3 !h-3 !rounded-full !border-2 !border-white !-right-1.5 shadow-sm ${
          data.outputVariant === "active" ? "!bg-[#F07845]" : "!bg-[#D5D3CE]"
        }`}
      />
    </div>
  );
}

export default memo(AgentNode);
