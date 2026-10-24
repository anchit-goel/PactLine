import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

export type AttributeNodeType = Node<{
  label: string;
  color?: string;
}, "attribute">;

export default function AttributeNode({ data }: NodeProps<AttributeNodeType>) {
  const color = data.color || "#24966B"; // default green
  return (
    <div 
      className="px-5 py-2 rounded-full border border-[#E7E5E4] bg-white shadow-xs flex items-center justify-center transition-all hover:scale-105 select-none"
      style={{ boxShadow: `0 2px 10px ${color}15` }}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!w-2.5 !h-2.5 !border-2 !border-white !-left-1 shadow-xs"
        style={{ background: color }}
      />
      
      <span 
        className="text-[11px] font-mono tracking-wider font-bold uppercase" 
        style={{ color: color }}
      >
        {data.label}
      </span>
      
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!w-2.5 !h-2.5 !border-2 !border-white !-right-1 shadow-xs"
        style={{ background: color }}
      />
    </div>
  );
}
