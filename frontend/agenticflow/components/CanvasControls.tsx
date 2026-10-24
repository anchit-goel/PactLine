"use client";

import React from "react";
import { useReactFlow } from "@xyflow/react";
import { Plus, Minus, Maximize, Lock, Unlock } from "lucide-react";

interface CanvasControlsProps {
  isLocked?: boolean;
  onToggleLock?: () => void;
}

export default function CanvasControls({ isLocked, onToggleLock }: CanvasControlsProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="absolute bottom-8 left-8 z-50 flex flex-col gap-1.5 bg-white/95 backdrop-blur-xl border border-[#E7E5E4] p-1.5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] select-none">
      <button
        onClick={() => zoomIn()}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-[#737373] hover:bg-[#F8F7F5] hover:text-[#171717] transition-all active:scale-90 group relative cursor-pointer"
        title="Zoom In"
      >
        <Plus className="w-4 h-4" />
        <span className="absolute left-full ml-3 px-2 py-1 bg-[#171717] text-[10px] text-white rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Zoom In (+)
        </span>
      </button>

      <div className="h-px bg-[#E7E5E4] mx-1.5" />

      <button
        onClick={() => zoomOut()}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-[#737373] hover:bg-[#F8F7F5] hover:text-[#171717] transition-all active:scale-90 group relative cursor-pointer"
        title="Zoom Out"
      >
        <Minus className="w-4 h-4" />
        <span className="absolute left-full ml-3 px-2 py-1 bg-[#171717] text-[10px] text-white rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Zoom Out (-)
        </span>
      </button>

      <div className="h-px bg-[#E7E5E4] mx-1.5" />

      <button
        onClick={() => fitView({ duration: 800 })}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-[#737373] hover:bg-[#F8F7F5] hover:text-[#171717] transition-all active:scale-90 group relative cursor-pointer"
        title="Fit View"
      >
        <Maximize className="w-4 h-4" />
        <span className="absolute left-full ml-3 px-2 py-1 bg-[#171717] text-[10px] text-white rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Fit View (F)
        </span>
      </button>

      {onToggleLock && (
        <>
          <div className="h-px bg-[#E7E5E4] mx-1.5" />
          <button
            onClick={onToggleLock}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-90 group relative cursor-pointer ${
              isLocked 
                ? "text-[#F07845] bg-[#FFF0E8] hover:bg-[#FFE6D9]" 
                : "text-[#737373] hover:bg-[#F8F7F5] hover:text-[#171717]"
            }`}
            title={isLocked ? "Unlock Canvas" : "Lock Canvas"}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            <span className="absolute left-full ml-3 px-2 py-1 bg-[#171717] text-[10px] text-white rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {isLocked ? "Unlock Nodes" : "Lock Nodes"}
            </span>
          </button>
        </>
      )}
    </div>
  );
}
