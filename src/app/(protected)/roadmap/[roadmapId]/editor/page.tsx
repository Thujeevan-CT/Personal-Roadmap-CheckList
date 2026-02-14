"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { use } from "react";
import { notFound } from "next/navigation";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
  type NodeTypes,
  type OnConnect,
  addEdge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useRoadmap } from "@/hooks/use-roadmaps";
import { useLayout, useSaveLayout } from "@/hooks/use-layout";
import { RoadmapNode } from "@/components/visual/roadmap-node";
import { ModuleNode } from "@/components/visual/module-node";
import { SubModuleNode } from "@/components/visual/submodule-node";
import { EditorToolbar } from "@/components/visual/editor-toolbar";
import { getLayoutedElements, type LayoutDirection } from "@/components/visual/auto-layout";
import { useToast } from "@/components/ui/toast";
import { ToastProvider } from "@/components/ui/toast";
import { useVisualStore } from "@/stores/visual-store";

const nodeTypes: NodeTypes = {
  roadmapNode: RoadmapNode,
  moduleNode: ModuleNode,
  submoduleNode: SubModuleNode,
};

type ModuleWithSubs = { _id: string; title: string; progress?: number; submodules?: { _id: string; title: string; status: string; progress?: number }[] };

function buildGraph(
  roadmap: { _id: string; title: string; icon?: string; progress?: number; },
  modules: ModuleWithSubs[],
  direction: LayoutDirection
) {
  const progress = roadmap.progress ?? 0;
  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];

  initialNodes.push({
    id: roadmap._id,
    type: "roadmapNode",
    position: { x: 0, y: 0 },
    data: { label: roadmap.title, icon: roadmap.icon || "📋", progress, moduleCount: modules.length },
  });

  modules.forEach((mod) => {
    const subModules = mod.submodules ?? [];
    const modProgress = mod.progress ?? 0;
    initialNodes.push({
      id: mod._id,
      type: "moduleNode",
      position: { x: 0, y: 0 },
      data: { label: mod.title, progress: modProgress, subModuleCount: subModules.length },
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
      initialNodes.push({
        id: sm._id,
        type: "submoduleNode",
        position: { x: 0, y: 0 },
        data: { label: sm.title, status: sm.status, progress: sm.progress ?? 0 },
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

function applyLayoutToNodes(nodes: Node[], layoutNodes: { entityId: string; position: { x: number; y: number } }[]): Node[] {
  const byId = new Map(layoutNodes.map((n) => [n.entityId, n]));
  return nodes.map((node) => {
    const pos = byId.get(node.id);
    return pos ? { ...node, position: pos.position } : node;
  });
}

type SaveStatus = "saved" | "saving" | "unsaved" | "error";

function EditorInner({ roadmapId }: { roadmapId: string }) {
  const { data: roadmapData } = useRoadmap(roadmapId);
  const { data: layoutData } = useLayout(roadmapId);
  const saveLayout = useSaveLayout(roadmapId);
  const roadmap = roadmapData?.roadmap;
  const modules = roadmapData?.modules ?? [];
  const layoutDirection = useVisualStore((s) => s.layoutDirection);
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    if (!roadmap) return { nodes: [], edges: [] };
    const { nodes, edges } = buildGraph(roadmap, modules as ModuleWithSubs[], layoutDirection);
    if (layoutData?.nodes?.length) {
      const withPos = applyLayoutToNodes(nodes, layoutData.nodes);
      return { nodes: withPos, edges: layoutData.edges?.length ? layoutData.edges.map((e) => ({ id: e.id, source: e.source, target: e.target, type: "smoothstep" as const })) : edges };
    }
    return { nodes, edges };
  }, [roadmap, modules, layoutData, layoutDirection]);
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [undoStack, setUndoStack] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [redoStack, setRedoStack] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { toast } = useToast();

  function pushUndo() {
    setUndoStack((prev) => [...prev.slice(-49), { nodes: [...nodes], edges: [...edges] }]);
    setRedoStack([]);
    setSaveStatus("unsaved");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => handleSave(), 30000);
  }

  const onConnect: OnConnect = useCallback(
    (params) => {
      pushUndo();
      setEdges((eds) => addEdge({ ...params, type: "smoothstep", style: { stroke: "var(--color-border)", strokeWidth: 2 } }, eds));
    },
    [nodes, edges]
  );

  function handleUndo() {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((r) => [...r, { nodes: [...nodes], edges: [...edges] }]);
    setUndoStack((u) => u.slice(0, -1));
    setNodes(prev.nodes);
    setEdges(prev.edges);
    setSaveStatus("unsaved");
  }

  function handleRedo() {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((u) => [...u, { nodes: [...nodes], edges: [...edges] }]);
    setRedoStack((r) => r.slice(0, -1));
    setNodes(next.nodes);
    setEdges(next.edges);
    setSaveStatus("unsaved");
  }

  function handleAutoLayout() {
    pushUndo();
    const { nodes: newNodes, edges: newEdges } = getLayoutedElements(
      [...nodes],
      [...edges],
      layoutDirection
    );
    setNodes(newNodes);
    setEdges(newEdges);
    setTimeout(() => fitView({ padding: 0.2 }), 50);
  }

  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    try {
      const layoutNodes = nodes.map((n) => ({
        entityId: n.id,
        entityType: n.type === "roadmapNode" ? "roadmap" : n.type === "moduleNode" ? "module" : "submodule",
        position: n.position,
      }));
      const layoutEdges = edges.map((e) => ({ id: e.id, source: e.source, target: e.target }));
      await saveLayout.mutateAsync({ nodes: layoutNodes, edges: layoutEdges });
      setSaveStatus("saved");
      toast("Layout saved", "success");
    } catch (e) {
      setSaveStatus("error");
      toast(String((e as Error).message), "error");
    }
  }, [nodes, edges, saveLayout, toast]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [nodes, edges, undoStack, redoStack]);

  return (
    <div className="h-screen flex flex-col">
      <EditorToolbar
        roadmapId={roadmapId}
        roadmapTitle={roadmap?.title ?? ""}
        saveStatus={saveStatus}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onAutoLayout={handleAutoLayout}
        onZoomIn={() => zoomIn()}
        onZoomOut={() => zoomOut()}
        onFitView={() => fitView({ padding: 0.2 })}
        onSave={handleSave}
        zoomLevel={zoomLevel}
      />
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={(changes) => {
            const hasDrag = changes.some((c) => c.type === "position" && c.dragging);
            if (hasDrag) pushUndo();
            onNodesChange(changes);
          }}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          nodesDraggable
          nodesConnectable
          fitView
          fitViewOptions={{ padding: 0.2 }}
          onMoveEnd={() => setZoomLevel(getZoom())}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--color-border)" />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function EditorPage({ params }: { params: Promise<{ roadmapId: string }> }) {
  const { roadmapId } = use(params);
  const { data, isLoading } = useRoadmap(roadmapId);
  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!data) return notFound();

  return (
    <ToastProvider>
      <ReactFlowProvider>
        <EditorInner roadmapId={roadmapId} />
      </ReactFlowProvider>
    </ToastProvider>
  );
}
