"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { Loader2, AlertCircle } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type DockerStatus = "idle" | "spawning" | "running" | "stopped" | "error";

export interface DockerNodeData {
  status: DockerStatus;
  containerId?: string;
  [key: string]: unknown;
}

export type DockerNodeType = Node<DockerNodeData, "docker">;

/* ------------------------------------------------------------------ */
/*  Status config                                                      */
/* ------------------------------------------------------------------ */

const statusConfig: Record<DockerStatus, { label: string; color: string; bgRing: string; pulseColor: string }> = {
  idle: {
    label: "Waiting",
    color: "#737373",
    bgRing: "#F8F7F5",
    pulseColor: "rgba(115, 115, 115, 0.2)",
  },
  spawning: {
    label: "Spawning",
    color: "#F07845",
    bgRing: "#FFF0E8",
    pulseColor: "rgba(240, 120, 69, 0.3)",
  },
  running: {
    label: "Running",
    color: "#24966B",
    bgRing: "#E6F5ED",
    pulseColor: "rgba(36, 150, 107, 0.3)",
  },
  stopped: {
    label: "Stopped",
    color: "#737373",
    bgRing: "#F8F7F5",
    pulseColor: "rgba(115, 115, 115, 0.15)",
  },
  error: {
    label: "Error",
    color: "#D85C5C",
    bgRing: "#FCECEC",
    pulseColor: "rgba(216, 92, 92, 0.3)",
  },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function renderCenterIcon(status: DockerStatus, color: string, isDimmed: boolean) {
  if (status === "spawning") {
    return <Loader2 className="w-5 h-5 animate-spin" style={{ color }} />;
  }
  if (status === "error") {
    return <AlertCircle className="w-5 h-5" style={{ color }} />;
  }
  return (
    <img
      src="https://cdn.simpleicons.org/docker/2496ED"
      alt="Docker Logo"
      className="w-5 h-5 object-contain"
      style={{
        opacity: isDimmed ? 0.6 : 1,
        filter: isDimmed ? "grayscale(80%)" : "none",
        transform: "translateX(1px) scale(1.1)",
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function DockerNode({ data }: NodeProps<DockerNodeType>) {
  const status = data.status || "idle";
  const cfg = statusConfig[status];
  const isAnimating = status === "spawning";
  const isRunning = status === "running";
  const isDimmed = status === "idle" || status === "stopped";

  return (
    <div className="relative w-[190px] select-none">
      {/* Card */}
      <div
        className="rounded-[22px] bg-white border border-[#E7E5E4] shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-200"
        style={{
          borderColor: isAnimating || isRunning ? cfg.color : "#E7E5E4",
          boxShadow: isAnimating
            ? `0 0 20px ${cfg.pulseColor}`
            : isRunning
            ? `0 0 16px ${cfg.pulseColor}`
            : "0 4px 20px rgba(0,0,0,0.04)",
        }}
      >
        {/* Icon area */}
        <div className="flex flex-col items-center pt-5 pb-4 px-4">
          {/* Animated ring */}
          <div className="relative w-14 h-14 flex items-center justify-center">
            {/* Outer pulse ring (spawning only) */}
            {isAnimating && (
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{ backgroundColor: cfg.pulseColor, opacity: 0.3 }}
              />
            )}
            {/* Ring */}
            <div
              className={`absolute inset-0 rounded-full border-2 transition-all duration-200 ${
                isAnimating ? "animate-spin" : ""
              }`}
              style={{
                borderColor: isAnimating ? "transparent" : "#E7E5E4",
                borderTopColor: cfg.color,
                animationDuration: isAnimating ? "1.2s" : undefined,
              }}
            />
            {/* Inner circle */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-xs"
              style={{ backgroundColor: cfg.bgRing }}
            >
              {renderCenterIcon(status, cfg.color, isDimmed)}
            </div>
          </div>

          {/* Node Title */}
          <p className="text-[13px] font-bold text-[#171717] mt-3 tracking-tight">
            Docker Sandbox
          </p>

          {/* Status badge */}
          <div
            className="mt-2 px-3 py-0.5 rounded-full flex items-center gap-1.5 transition-colors"
            style={{ backgroundColor: cfg.bgRing }}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${isRunning || isAnimating ? "animate-pulse" : ""}`}
              style={{ backgroundColor: cfg.color }}
            />
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: cfg.color }}
            >
              {cfg.label}
            </span>
          </div>

          {/* Container ID */}
          {data.containerId && (isRunning || status === "stopped") && (
            <p className="text-[9px] text-[#737373] font-mono mt-2 truncate max-w-[140px]">
              {data.containerId}
            </p>
          )}
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-[#F07845] !border-2 !border-white !-left-1.5 shadow-sm"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-[#F07845] !border-2 !border-white !-right-1.5 shadow-sm"
      />
    </div>
  );
}

export default memo(DockerNode);
