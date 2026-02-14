"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ProgressBar } from "@/components/ui/progress-bar";

interface ModuleNodeData {
  label: string;
  progress: number;
  subModuleCount: number;
  [key: string]: unknown;
}

function getBorderColor(progress: number) {
  if (progress === 0) return "border-[var(--color-border)]";
  if (progress >= 100) return "border-[var(--color-success)]";
  return "border-[var(--color-warning)]";
}

function ModuleNodeComponent({ data }: NodeProps) {
  const d = data as unknown as ModuleNodeData;
  return (
    <div className={`w-[200px] p-3 rounded-lg bg-[var(--color-bg)] border-2 ${getBorderColor(d.progress)}`}>
      <Handle type="target" position={Position.Top} className="!bg-[var(--color-border)] !w-2 !h-2 !border-0" />
      <p className="heading-md text-[var(--color-text-primary)] truncate mb-1">{d.label}</p>
      <ProgressBar value={d.progress} size="compact" showLabel />
      <p className="caption text-[var(--color-text-tertiary)] mt-1">
        {d.subModuleCount} submodule{d.subModuleCount !== 1 ? "s" : ""}
      </p>
      <Handle type="source" position={Position.Bottom} className="!bg-[var(--color-border)] !w-2 !h-2 !border-0" />
    </div>
  );
}

export const ModuleNode = memo(ModuleNodeComponent);
