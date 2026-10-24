import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { TerminalSquare } from "lucide-react";

export type ToolNodeType = Node<{
  functionName: string;
  inputs: { key: string; value: string; type: "number" | "string" | "array" }[];
  output: string;
}, "tool">;

export default function ToolNode({ data }: NodeProps<ToolNodeType>) {
  // Extract reason if it exists, otherwise fallback to function name
  const reasonInput = data.inputs.find((i) => i.key === "reason" || i.key === "arguments.reason");
  const headerTitle = reasonInput ? reasonInput.value : data.functionName;
  
  // Filter reason out of the visual inputs list
  const displayInputs = data.inputs.filter((i) => i.key !== "reason" && i.key !== "arguments.reason");

  return (
    <div className="w-[380px] bg-white border border-[#E7E5E4] rounded-[22px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col font-mono text-[12px] overflow-hidden group select-none">
      {/* Top Handle (Target) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-[#F07845] !border-2 !border-white !-top-1.5 shadow-sm transition-transform group-hover:scale-110"
      />

      {/* Clean Mac-like Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#F8F7F5] border-b border-[#E7E5E4]">
        <div className="flex items-center gap-2 flex-1 min-w-0 pr-4">
          <TerminalSquare className="w-4 h-4 text-[#F07845] flex-shrink-0" />
          <span className="text-[#171717] font-bold truncate text-[11px]" title={headerTitle}>
            {headerTitle}
          </span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E7E5E4]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#E7E5E4]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#E7E5E4]" />
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 text-[11px]">
        {/* Inputs */}
        <div>
          <div className="text-[#737373] mb-1.5 font-semibold">
            {">>> Input Parameters:"}
          </div>
          <div className="pl-3 flex flex-col gap-1">
            {displayInputs.map((inp, i) => (
              <div key={i} className="flex">
                <span className="text-[#D85C5C] font-semibold">{inp.key}</span>
                <span className="text-[#737373] mx-1">:</span>
                <span
                  className={
                    inp.type === "number"
                      ? "text-[#24966B]"
                      : inp.type === "string"
                      ? "text-[#F07845]"
                      : "text-[#171717]"
                  }
                >
                  {inp.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Output */}
        <div>
          <div className="text-[#737373] mb-1.5 font-semibold">
            {">>> Sandbox Output:"}
          </div>
          <div className="pl-3 p-2 rounded-lg bg-[#F8F7F5] border border-[#E7E5E4] text-[#24966B] font-semibold whitespace-pre-wrap">
            {data.output}
          </div>
        </div>
      </div>
    </div>
  );
}
