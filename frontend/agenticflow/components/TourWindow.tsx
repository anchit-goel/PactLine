"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import AgentNode, { type AgentNodeType } from "./AgentNode";
import AttributeNode from "./AttributeNode";
import UploadNode from "./UploadNode";
import DockerNode from "./DockerNode";
import NodeDetailModal from "./NodeDetailModal";
import { useViewMode } from "./ViewModeContext";
import {
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TourWindowProps {
  onClose: () => void;
}

interface TourStep {
  title: string;
  description: string;
  highlightNode?: string;
  focusNodes?: string[];   // nodes to fit in view (defaults to [highlightNode])
  openDetail?: string;
  detailTab?: "chart" | "review" | "code";
}

/* ------------------------------------------------------------------ */
/*  Tour Steps                                                         */
/* ------------------------------------------------------------------ */

const tourSteps: TourStep[] = [
  {
    title: "Welcome to Pactline",
    description: "This is the full fairness auditing workflow. Each card is a stage — from uploading data to the final PDF report. Let's walk through it.",
    focusNodes: ["dataset-upload", "docker-sandbox", "data-inspector"],
  },
  {
    title: "Upload Your Dataset",
    description: "Drag a CSV file here. Pactline supports up to 50MB with demographic attributes like gender, age, race, and income.",
    highlightNode: "dataset-upload",
  },
  {
    title: "Docker Sandbox",
    description: "All AI-generated code runs inside a secure Docker container. Your system stays completely isolated.",
    highlightNode: "docker-sandbox",
  },
  {
    title: "Dataset Auditor",
    description: "The first AI agent. It profiles your data — detects column types, missing values, and identifies protected attributes.",
    highlightNode: "data-inspector",
  },
  {
    title: "Analytics Dashboard",
    description: "Click on any agent to see its analytics. Interactive charts show disparity trends, feature imbalance, and demographic breakdowns.",
    highlightNode: "data-inspector",
    openDetail: "data-inspector",
    detailTab: "chart",
  },
  {
    title: "Review Summary",
    description: "The Review tab shows the agent's written analysis — bias severity assessment and recommended next steps.",
    highlightNode: "data-inspector",
    openDetail: "data-inspector",
    detailTab: "review",
  },
  {
    title: "Generated Code",
    description: "The Code tab shows the exact Python code the agent generated and executed in the Docker sandbox.",
    highlightNode: "data-inspector",
    openDetail: "data-inspector",
    detailTab: "code",
  },
  {
    title: "Bias Signal Attributes",
    description: "After profiling, attribute nodes appear between agents. Green = fair. Red = disparity. Purple = bias corrected!",
    highlightNode: "attr-gender",
    focusNodes: ["attr-gender", "attr-age", "attr-race", "attr-income"],
  },
  {
    title: "Agent Auditor",
    description: "Runs fairness algorithms (Disparate Impact, SHAP, etc.) and flags groups that fail the EEOC 4/5 rule.",
    highlightNode: "fairness-adjudicator",
  },
  {
    title: "Mitigation Expert",
    description: "Applies bias correction — Reweighing, Adversarial Debiasing — iterating until all groups pass fairness thresholds.",
    highlightNode: "mitigation-expert",
  },
  {
    title: "Report Writer",
    description: "Compiles everything into a polished PDF audit report — charts, code, findings, and recommendations.",
    highlightNode: "report-writer",
  },
  {
    title: "You're All Set!",
    description: "Close this tour and click RUN on the Dataset Auditor. Or switch to Test mode to preview with mock data — zero API tokens!",
    focusNodes: ["report-writer"],
  },
];

/* ------------------------------------------------------------------ */
/*  Pre-built workflow nodes & edges                                   */
/* ------------------------------------------------------------------ */

const AGENT_CARD_W = 300;
const AGENT_GAP_X = 600; // Gap when there are attributes
const AGENT_DIRECT_GAP_X = 400; // Gap when no attributes
const ATTR_SPACING_Y = 70;

const baseAgentX = 800; // Agent 1 (Dataset Auditor) starts at x=800
const baseAgentY = 170;

const tourNodes: any[] = [
  {
    id: "dataset-upload", type: "upload",
    position: { x: 100, y: 155 }, data: { isTourMode: true },
  },
  {
    id: "docker-sandbox", type: "docker",
    position: { x: 480, y: 200 }, data: { status: "running" },
  },
  {
    id: "data-inspector", type: "agent",
    position: { x: baseAgentX, y: baseAgentY },
    data: {
      title: "Dataset Auditor", iconType: "database",
      description: "Analyzes the source dataset for feature imbalances and demographic disparities.",
      inputLabel: "Raw Dataset", outputLabel: "Analyzed Data",
      inputVariant: "default", outputVariant: "active", hasRunButton: true,
      isTourMode: true,
      toolCalls: [
        { id: "mt-1", name: "bash", inputs: '{\n  "command": "python profile_dataset.py"\n}', output: '📊 Rows: 1,000 | Cols: 12\nProtected: gender, age, race, income' },
        { id: "mt-2", name: "bash", inputs: '{\n  "command": "python analyze.py"\n}', output: '✅ Profile saved to data_profile.json' },
      ],
    },
  },
  ...(["gender", "age", "race", "income"].map((attr, i) => {
    const attrX = baseAgentX + AGENT_CARD_W + (AGENT_GAP_X - AGENT_CARD_W) / 2 - 40;
    const agentCenterY = baseAgentY + 130;
    const totalH = 3 * ATTR_SPACING_Y;
    const startY = agentCenterY - totalH / 2;
    const colors: Record<string, string> = { gender: "#ff5252", age: "#ff5252", race: "#4edea3", income: "#4edea3" };
    return {
      id: `attr-${attr}`, type: "attribute",
      position: { x: attrX, y: startY + i * ATTR_SPACING_Y },
      data: { label: attr.charAt(0).toUpperCase() + attr.slice(1), color: colors[attr] || "#4edea3" },
    };
  })),
  {
    id: "fairness-adjudicator", type: "agent",
    position: { x: baseAgentX + AGENT_GAP_X, y: baseAgentY },
    data: {
      title: "Agent Auditor", iconType: "brain",
      inputLabel: "Clean Struct", outputLabel: "Filtered Data",
      inputVariant: "active", outputVariant: "active", isSelected: true, hasRunButton: true,
      isTourMode: true,
      toolCalls: [{ id: "mt-4", name: "bash", inputs: '{}', output: 'DI(gender): 0.67 ⚠️ FAIL\nDI(age): 0.72 ⚠️ FAIL' }],
    },
  },
  {
    id: "mitigation-expert", type: "agent",
    position: { x: baseAgentX + AGENT_GAP_X + AGENT_DIRECT_GAP_X, y: baseAgentY },
    data: {
      title: "Mitigation Expert", iconType: "code",
      description: "Applies bias mitigation algorithms (Reweighing, Adv. Debiasing) to rectify disparities.",
      inputLabel: "Biased Data", outputLabel: "Mitigated Data",
      inputVariant: "default", outputVariant: "active", hasRunButton: true,
      isTourMode: true,
      toolCalls: [{ id: "mt-9", name: "bash", inputs: '{}', output: 'Converged! DI(gender)=0.81 ✓\nDI(age)=0.83 ✓' }],
    },
  },
  {
    id: "report-writer", type: "agent",
    position: { x: baseAgentX + AGENT_GAP_X + AGENT_DIRECT_GAP_X * 2, y: baseAgentY },
    data: {
      title: "Report Writer", iconType: "code",
      description: "Compiles all audit outputs into a polished PDF report with charts and findings.",
      inputLabel: "All Reports", outputLabel: "Final PDF",
      inputVariant: "default", outputVariant: "active", hasRunButton: true,
      isTourMode: true,
      toolCalls: [{ id: "mt-12", name: "read_file", inputs: '{}', output: '✅ Report → fairness_audit_report.pdf\nFairness Score: 92/100 APPROVED' }],
    },
  },
];

const tourEdges: Edge[] = [
  { id: "te-1", source: "dataset-upload", target: "docker-sandbox", type: "default", animated: false, style: { stroke: "#958ea0", strokeWidth: 2, strokeDasharray: "6 4" } },
  { id: "te-2", source: "docker-sandbox", target: "data-inspector", type: "default", animated: false, style: { stroke: "#958ea0", strokeWidth: 2, strokeDasharray: "6 4" } },
  ...["gender", "age", "race", "income"].map((a) => ({
    id: `te-di-${a}`, source: "data-inspector", target: `attr-${a}`, type: "default" as const, animated: true,
    style: { stroke: a === "gender" || a === "age" ? "#ff5252" : "#4edea3", strokeWidth: 2, strokeDasharray: "6 4" },
  })),
  ...["gender", "age", "race", "income"].map((a) => ({
    id: `te-${a}-fa`, source: `attr-${a}`, target: "fairness-adjudicator", type: "default" as const, animated: true,
    style: { stroke: a === "gender" || a === "age" ? "#ff5252" : "#4edea3", strokeWidth: 2, strokeDasharray: "6 4" },
  })),
  { id: "te-fa-me", source: "fairness-adjudicator", target: "mitigation-expert", type: "default", animated: true, style: { stroke: "#d0bcff", strokeWidth: 2, strokeDasharray: "6 4" } },
  { id: "te-me-rw", source: "mitigation-expert", target: "report-writer", type: "default", animated: true, style: { stroke: "#d0bcff", strokeWidth: 2, strokeDasharray: "6 4" } },
];

/* ------------------------------------------------------------------ */
/*  Inner Flow                                                         */
/* ------------------------------------------------------------------ */

function TourFlow({
  step,
  currentStep,
  onNodeClick,
  onPopoverPos,
}: {
  step: TourStep;
  currentStep: number;
  onNodeClick: (id: string) => void;
  onPopoverPos: (pos: { x: number; y: number; side: "left" | "right" } | null) => void;
}) {
  const { fitView, getNodes } = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);

  const nodeTypes = useMemo(() => ({
    agent: AgentNode,
    attribute: AttributeNode,
    upload: UploadNode,
    docker: DockerNode,
  }), []);

  const [nodes, , onNodesChange] = useNodesState(tourNodes);
  const [edges, , onEdgesChange] = useEdgesState(tourEdges);

  const defaultEdgeOptions = useMemo(() => ({
    style: { stroke: "#d0bcff", strokeWidth: 2, filter: "drop-shadow(0 0 4px rgba(208, 188, 255, 0.6))" },
    animated: false,
  }), []);

  const handleNodeClick = useCallback((_: any, node: any) => {
    onNodeClick(node.id);
  }, [onNodeClick]);

  // Zoom into the highlighted node(s) on step change
  useEffect(() => {
    const timer = setTimeout(() => {
      const target = step.highlightNode;
      const focus = step.focusNodes || (target ? [target] : null);

      if (focus && focus.length > 0) {
        fitView({
          nodes: focus.map((id) => ({ id })),
          padding: 0.2,
          duration: 600,
          maxZoom: 1.4,
        });
      } else {
        // Fallback
        fitView({ padding: 0.15, duration: 600, maxZoom: 0.6 });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [currentStep, step.highlightNode, step.focusNodes, fitView]);

  // Track the highlighted node's screen position for popover placement
  useEffect(() => {
    const update = () => {
      const target = step.highlightNode;
      if (!target) {
        onPopoverPos(null);
        return;
      }

      const el = containerRef.current?.querySelector(`[data-id="${target}"]`);
      const container = containerRef.current;
      if (!el || !container) {
        onPopoverPos(null);
        return;
      }

      const nodeRect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Position relative to container
      const nodeCenterX = nodeRect.left + nodeRect.width / 2 - containerRect.left;
      const nodeCenterY = nodeRect.top + nodeRect.height / 2 - containerRect.top;

      // Decide side: place popover on whichever side has more room
      const side = nodeCenterX < containerRect.width / 2 ? "right" : "left";

      const popX = side === "right"
        ? nodeRect.right - containerRect.left + 20
        : nodeRect.left - containerRect.left - 20;

      const popY = nodeCenterY;

      onPopoverPos({ x: popX, y: popY, side });
    };

    // Update after fitView animation settles
    const t1 = setTimeout(update, 100);
    const t2 = setTimeout(update, 700);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [currentStep, step.highlightNode, onPopoverPos]);

  // Highlight the focused node
  const styledNodes = useMemo(() => {
    return nodes.map((n) => {
      const isFocused = step.highlightNode === n.id;
      const isInFocusGroup = step.focusNodes?.includes(n.id);
      const shouldHighlight = isFocused || isInFocusGroup;
      return {
        ...n,
        style: {
          ...((n as any).style || {}),
          opacity: step.highlightNode && !shouldHighlight ? 0.35 : 1,
          transition: "opacity 0.4s ease, filter 0.4s ease",
          filter: isFocused ? "drop-shadow(0 0 16px rgba(139, 92, 246, 0.6))" : "none",
        },
      };
    });
  }, [nodes, step.highlightNode, step.focusNodes]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={styledNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        panOnDrag
        zoomOnScroll
        minZoom={0.2}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        colorMode={"dark" as any}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2a2d37" />
      </ReactFlow>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main TourWindow                                                    */
/* ------------------------------------------------------------------ */

export default function TourWindow({ onClose }: TourWindowProps) {
  const { setShowTour, setTourTab } = useViewMode();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number; side: "left" | "right" } | null>(null);

  const step = tourSteps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === tourSteps.length - 1;

  const hasHighlight = !!step.highlightNode && !step.openDetail;

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  useEffect(() => {
    if (step.openDetail) {
      setDetailNodeId(step.openDetail);
      if (step.detailTab) {
        setTourTab(step.detailTab);
      }
    } else {
      setDetailNodeId(null);
    }
  }, [currentStep, step.openDetail, step.detailTab, setTourTab]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => { setShowTour(false); onClose(); }, 250);
  };

  const handleNext = () => {
    if (isLast) handleClose();
    else setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (!isFirst) setCurrentStep((s) => s - 1);
  };

  const handleNodeClick = (id: string) => {
    setDetailNodeId(id);
  };

  // Popover style — beside the node, centered, or bottom-right when modal is open
  const getPopoverStyle = (): React.CSSProperties => {
    const POPOVER_W = 320;

    // When detail modal is open, pin to bottom-right corner above the modal
    if (detailNodeId) {
      return {
        position: "fixed",
        bottom: "32px",
        right: "32px",
        width: `${POPOVER_W}px`,
        zIndex: 2100,
      };
    }

    if (hasHighlight && popoverPos) {
      const style: React.CSSProperties = {
        position: "absolute",
        top: `${popoverPos.y}px`,
        transform: "translateY(-50%)",
        width: `${POPOVER_W}px`,
        zIndex: 10,
      };
      if (popoverPos.side === "right") {
        style.left = `${popoverPos.x}px`;
      } else {
        style.left = `${popoverPos.x - POPOVER_W}px`;
      }
      return style;
    }

    // Center in the canvas for overview steps
    return {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: `${POPOVER_W}px`,
      zIndex: 10,
    };
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1500,
        display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: isVisible ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0)",
        backdropFilter: "blur(6px)", transition: "background-color 0.3s ease",
        padding: "20px",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: "100%", maxWidth: "1200px", height: "calc(100vh - 40px)",
          backgroundColor: "#F3F2EF", borderRadius: "22px",
          border: "1px solid #E7E5E4",
          boxShadow: "0 32px 80px rgba(0,0,0,0.12)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1)" : "scale(0.96)",
          transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderBottom: "1px solid #E7E5E4",
          background: "#FFFFFF",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "10px",
              background: "#FFF0E8", border: "1px solid rgba(240,120,69,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Sparkles width={16} height={16} color="#F07845" />
            </div>
            <div>
              <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#171717", margin: 0 }}>Interactive Tour</h2>
              <p style={{ fontSize: "11px", color: "#737373", margin: 0 }}>Step {currentStep + 1} of {tourSteps.length}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{ background: "none", border: "none", color: "#737373", cursor: "pointer", padding: "6px", borderRadius: "8px", display: "flex", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#171717")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#737373")}
          >
            <X width={18} height={18} />
          </button>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
          <ReactFlowProvider>
            <TourFlow
              step={step}
              currentStep={currentStep}
              onNodeClick={handleNodeClick}
              onPopoverPos={setPopoverPos}
            />
          </ReactFlowProvider>

          {/* Popover — positioned beside node or centered */}
          <div
              className="tour-popover"
              style={{
                ...getPopoverStyle(),
                backgroundColor: "#FFFFFF",
                borderRadius: "18px",
                border: "1px solid #E7E5E4",
                boxShadow: "0 16px 48px rgba(0,0,0,0.08)",
                transition: "top 0.4s ease-out, left 0.4s ease-out, bottom 0.4s ease-out, right 0.4s ease-out",
              }}
            >
              {/* Twitchy Arrow */}
              {hasHighlight && popoverPos && (
                <div
                  className="twitchy-arrow"
                  style={{
                    position: "absolute",
                    top: "50%",
                    marginTop: "-8px",
                    width: "16px",
                    height: "16px",
                    backgroundColor: "#FFFFFF",
                    borderLeft: popoverPos.side === "right" ? "1px solid #E7E5E4" : "none",
                    borderBottom: popoverPos.side === "right" ? "1px solid #E7E5E4" : "none",
                    borderRight: popoverPos.side === "left" ? "1px solid #E7E5E4" : "none",
                    borderTop: popoverPos.side === "left" ? "1px solid #E7E5E4" : "none",
                    left: popoverPos.side === "right" ? "-9px" : "auto",
                    right: popoverPos.side === "left" ? "-9px" : "auto",
                    transform: "rotate(45deg)",
                  }}
                />
              )}

              {/* Header bar */}
              <div style={{
                padding: "10px 14px",
                borderBottom: "1px solid #E7E5E4",
                background: "#FFF0E8",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                borderRadius: "18px 18px 0 0",
              }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#F07845", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Step {currentStep + 1} of {tourSteps.length}
                </span>
              </div>
              
              {/* Content */}
              <div style={{ padding: "14px 14px 10px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#171717", marginBottom: "6px", lineHeight: 1.3 }}>{step.title}</h3>
                <p style={{ fontSize: "12px", color: "#737373", lineHeight: 1.6, margin: 0 }}>{step.description}</p>
              </div>

              {/* Navigation */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px 12px" }}>
                <div>
                  {!isFirst && (
                    <button
                      onClick={handleBack}
                      style={{ background: "none", border: "none", fontSize: "11px", color: "#737373", cursor: "pointer", display: "flex", alignItems: "center", gap: "2px", transition: "color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#171717")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#737373")}
                    >
                      <ChevronLeft width={12} height={12} /> Back
                    </button>
                  )}
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  {tourSteps.map((_, i) => (
                    <div
                      key={i}
                      onClick={() => setCurrentStep(i)}
                      style={{
                        width: i === currentStep ? "16px" : "5px",
                        height: "5px", borderRadius: "3px",
                        backgroundColor: i === currentStep ? "#F07845" : i < currentStep ? "rgba(240,120,69,0.3)" : "#E7E5E4",
                        transition: "all 0.3s ease", cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  style={{
                    display: "flex", alignItems: "center", gap: "4px",
                    padding: "6px 14px", backgroundColor: "#F07845", color: "#fff",
                    borderRadius: "8px", border: "none", fontSize: "11px", fontWeight: 700,
                    cursor: "pointer", transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E06835")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F07845")}
                >
                  {isLast ? "Done" : "Next"}
                  {!isLast && <ChevronRight width={12} height={12} />}
                </button>
              </div>
          </div>
        </div>

        {/* NodeDetailModal */}
        {detailNodeId && (
          <NodeDetailModal
            nodeId={detailNodeId}
            onClose={() => setDetailNodeId(null)}
            forceTestMode={true}
          />
        )}
      </div>

      <style>{`
        .twitchy-arrow {
          animation: twitchyBounce 2s infinite cubic-bezier(0.36, 0, 0.66, -0.56);
        }

        @keyframes twitchyBounce {
          0%, 100% {
            transform: rotate(45deg) scale(1);
          }
          50% {
            transform: rotate(45deg) scale(1.15);
          }
        }
      `}</style>
    </div>
  );
}
