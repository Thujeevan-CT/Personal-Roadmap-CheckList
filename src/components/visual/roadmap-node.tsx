"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ProgressBar } from "@/components/ui/progress-bar";

interface RoadmapNodeData {
  label: string;
  icon: string;
  progress: number;
  moduleCount: number;
  [key: string]: unknown;
}

function RoadmapNodeComponent({ data }: NodeProps) {
  const d = data as unknown as RoadmapNodeData;
  return (
    <div className="w-[240px] p-4 rounded-lg bg-[var(--color-primary-light)] border-2 border-[var(--color-primary)]">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{d.icon || "📋"}</span>
        <span className="heading-md text-[var(--color-primary)] truncate">{d.label}</span>
      </div>
      <ProgressBar value={d.progress} size="compact" showLabel />
      <p className="caption text-[var(--color-text-secondary)] mt-1">
        {d.moduleCount} module{d.moduleCount !== 1 ? "s" : ""}
      </p>
      <Handle type="source" position={Position.Bottom} className="!bg-[var(--color-primary)] !w-2 !h-2 !border-0" />
    </div>
  );
}

export const RoadmapNode = memo(RoadmapNodeComponent);
