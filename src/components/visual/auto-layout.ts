import dagre from "dagre";
import type { Node, Edge } from "@xyflow/react";

export type LayoutDirection = "horizontal" | "vertical";

export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: LayoutDirection = "horizontal"
) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction === "horizontal" ? "LR" : "TB",
    nodesep: 60,
    ranksep: 80,
  });

  nodes.forEach((node) => {
    g.setNode(node.id, {
      width: node.measured?.width ?? (node.type === "roadmapNode" ? 240 : node.type === "moduleNode" ? 200 : 180),
      height: node.measured?.height ?? (node.type === "roadmapNode" ? 90 : node.type === "moduleNode" ? 80 : 60),
    });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const dagreNode = g.node(node.id);
    const width = node.measured?.width ?? (node.type === "roadmapNode" ? 240 : node.type === "moduleNode" ? 200 : 180);
    const height = node.measured?.height ?? (node.type === "roadmapNode" ? 90 : node.type === "moduleNode" ? 80 : 60);
    return {
      ...node,
      position: {
        x: dagreNode.x - width / 2,
        y: dagreNode.y - height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
