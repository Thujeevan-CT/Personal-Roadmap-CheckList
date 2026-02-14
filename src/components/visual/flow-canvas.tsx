"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  type OnConnect,
  addEdge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Lock, Pencil, Maximize } from "lucide-react";
import { RoadmapNode } from "./roadmap-node";
import { ModuleNode } from "./module-node";
import { SubModuleNode } from "./submodule-node";
import { getLayoutedElements, type LayoutDirection } from "./auto-layout";
import type { Roadmap, Module, SubModule } from "@/types";
import { useVisualStore } from "@/stores/visual-store";

const nodeTypes: NodeTypes = {
  roadmapNode: RoadmapNode,
  moduleNode: ModuleNode,
  submoduleNode: SubModuleNode,
};

type ModuleWithSubs = Module & { submodules?: (SubModule & { progress?: number })[]; progress?: number };

interface FlowCanvasProps {
  roadmap: Roadmap & { progress?: number };
  modules?: ModuleWithSubs[];
  editable?: boolean;
}

function buildGraph(
  roadmap: Roadmap & { progress?: number },
  modules: ModuleWithSubs[] = [],
  direction: LayoutDirection
) {
  const progress = roadmap.progress ?? 0;
  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];

  initialNodes.push({
    id: roadmap._id,
    type: "roadmapNode",
    position: { x: 0, y: 0 },
    data: {
      label: roadmap.title,
      icon: roadmap.icon || "📋",
      progress,
      moduleCount: modules.length,
    },
  });

  modules.forEach((mod) => {
    const subModules = mod.submodules ?? [];
    const modProgress = mod.progress ?? 0;

    initialNodes.push({
      id: mod._id,
      type: "moduleNode",
      position: { x: 0, y: 0 },
      data: {
        label: mod.title,
        progress: modProgress,
        subModuleCount: subModules.length,
      },
    });

    initialEdges.push({
      id: `e-${roadmap._id}-${mod._id}`,
      source: roadmap._id,
      target: mod._id,
      type: "smoothstep",
      style: { stroke: "var(--color-border)", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "var(--color-border)" },
    });

    subModules.forEach((sm) => {
      const smProgress = sm.progress ?? 0;

      initialNodes.push({
        id: sm._id,
        type: "submoduleNode",
        position: { x: 0, y: 0 },
        data: {
          label: sm.title,
          status: sm.status,
          progress: smProgress,
        },
      });

      initialEdges.push({
        id: `e-${mod._id}-${sm._id}`,
        source: mod._id,
        target: sm._id,
        type: "smoothstep",
        style: { stroke: "var(--color-border)", strokeWidth: 2 },
      });
    });
  });

  return getLayoutedElements(initialNodes, initialEdges, direction);
}

export function FlowCanvas({ roadmap, modules = [], editable = false }: FlowCanvasProps) {
  const [mode, setMode] = useState<"lock" | "edit">(editable ? "edit" : "lock");
  const isEditable = mode === "edit";
  const router = useRouter();
  const searchParams = useSearchParams();
  const layoutDirection = useVisualStore((s) => s.layoutDirection);
  const setLayoutDirection = useVisualStore((s) => s.setLayoutDirection);

  const urlLayout = searchParams.get("layout");
  const effectiveDirection: LayoutDirection =
    urlLayout === "vertical" || urlLayout === "horizontal"
      ? (urlLayout as LayoutDirection)
      : layoutDirection;

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => buildGraph(roadmap, modules, effectiveDirection),
    [roadmap, modules, effectiveDirection]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const onConnect: OnConnect = useCallback(
    (params) => {
      if (!isEditable) return;
      setEdges((eds) =>
        addEdge(
          { ...params, type: "smoothstep", style: { stroke: "var(--color-border)", strokeWidth: 2 } },
          eds
        )
      );
    },
    [isEditable, setEdges]
  );

  function updateLayoutDirection(dir: LayoutDirection) {
    setLayoutDirection(dir);
    const params = new URLSearchParams(searchParams.toString());
    params.set("layout", dir);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="relative h-full w-full min-h-[500px] border border-[var(--color-border)] rounded-lg overflow-hidden">
      {!editable && (
        <div className="absolute top-3 right-3 z-[5] flex items-center gap-2">
          <div className="flex border border-[var(--color-border)] rounded-[6px] overflow-hidden bg-[var(--color-bg)]">
            <button
              onClick={() => setMode("lock")}
              className={`flex items-center gap-1.5 px-3 h-8 text-sm font-medium transition-colors cursor-pointer ${
                mode === "lock"
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              Lock
            </button>
            <button
              onClick={() => setMode("edit")}
              className={`flex items-center gap-1.5 px-3 h-8 text-sm font-medium transition-colors cursor-pointer border-l border-[var(--color-border)] ${
                mode === "edit"
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          </div>
          <div className="flex border border-[var(--color-border)] rounded-[6px] overflow-hidden bg-[var(--color-bg)]">
            <button
              onClick={() => updateLayoutDirection("horizontal")}
              className={`flex items-center gap-1.5 px-2.5 h-8 text-xs font-medium transition-colors cursor-pointer ${
                effectiveDirection === "horizontal"
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              H
            </button>
            <button
              onClick={() => updateLayoutDirection("vertical")}
              className={`flex items-center gap-1.5 px-2.5 h-8 text-xs font-medium transition-colors cursor-pointer border-l border-[var(--color-border)] ${
                effectiveDirection === "vertical"
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              V
            </button>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={isEditable ? onNodesChange : undefined}
        onEdgesChange={isEditable ? onEdgesChange : undefined}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        nodesDraggable={isEditable}
        nodesConnectable={isEditable}
        elementsSelectable={isEditable}
        panOnDrag
        zoomOnScroll
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--color-border)" />
        <Controls
          showInteractive={false}
          className="!border !border-[var(--color-border)] !rounded-[6px] [&>button]:!border-[var(--color-border)] [&>button]:!bg-[var(--color-bg)]"
        />
      </ReactFlow>
    </div>
  );
}
