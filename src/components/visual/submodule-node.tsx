"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { SubModuleStatus } from "@/types";

interface SubModuleNodeData {
  label: string;
  status: SubModuleStatus;
  progress: number;
  [key: string]: unknown;
}

const statusColor: Record<SubModuleStatus, string> = {
  not_started: "border-[var(--color-border)]",
  in_progress: "border-[var(--color-warning)]",
  completed: "border-[var(--color-success)]",
  blocked: "border-[var(--color-danger)]",
};

const statusDot: Record<SubModuleStatus, string> = {
  not_started: "bg-[var(--color-text-tertiary)]",
  in_progress: "bg-[var(--color-warning)]",
  completed: "bg-[var(--color-success)]",
  blocked: "bg-[var(--color-danger)]",
};

const statusLabel: Record<SubModuleStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
  blocked: "Blocked",
};

function SubModuleNodeComponent({ data }: NodeProps) {
  const d = data as unknown as SubModuleNodeData;
  return (
    <div className={`w-[180px] px-3 py-2.5 rounded-[6px] bg-[var(--color-bg)] border-2 ${statusColor[d.status]}`}>
      <Handle type="target" position={Position.Top} className="!bg-[var(--color-border)] !w-2 !h-2 !border-0" />
      <div className="flex items-center gap-1.5 mb-1">
        <div className={`h-2 w-2 rounded-full flex-shrink-0 ${statusDot[d.status]}`} />
        <p className="text-sm text-[var(--color-text-primary)] truncate">{d.label}</p>
      </div>
      <div className="flex items-center justify-between">
        <span className="caption text-[var(--color-text-tertiary)]">{statusLabel[d.status]}</span>
        <span className="caption text-[var(--color-text-tertiary)] tabular-nums">{d.progress}%</span>
      </div>
    </div>
  );
}

export const SubModuleNode = memo(SubModuleNodeComponent);
