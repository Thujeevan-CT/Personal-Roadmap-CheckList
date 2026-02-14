"use client";

import { MoreHorizontal, Pencil, Trash2, AlertTriangle } from "lucide-react";
import type { SubModule } from "@/types";
import { StatusBadge } from "./status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";
import { useUIStore } from "@/stores/ui-store";

interface SubModuleCardProps {
  subModule: SubModule & { progress?: number };
  onDelete?: (subModule: SubModule & { progress?: number }) => void;
}

export function SubModuleCard({ subModule, onDelete }: SubModuleCardProps) {
  const progress = subModule.progress ?? 0;
  const openPanel = useUIStore((s) => s.openPanel);

  const isOverdue =
    subModule.dueDate &&
    new Date(subModule.dueDate) < new Date() &&
    subModule.status !== "completed";

  function handleClick() {
    openPanel({
      subModuleId: subModule._id,
      moduleId: subModule.moduleId,
      roadmapId: subModule.roadmapId,
    });
  }

  return (
    <div
      onClick={handleClick}
      className="group flex items-center gap-3 px-4 py-3 border border-[var(--color-border)] rounded-[6px] bg-[var(--color-bg)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="heading-md text-[var(--color-text-primary)] truncate">
            {subModule.title}
          </span>
          <StatusBadge status={subModule.status} />
        </div>
        <div className="flex items-center gap-3">
          <ProgressBar value={progress} size="compact" showLabel className="w-24" />
          {subModule.dueDate && (
            <span
              className={`body-sm flex items-center gap-1 ${
                isOverdue ? "text-[var(--color-danger)]" : "text-[var(--color-text-tertiary)]"
              }`}
            >
              {isOverdue && <AlertTriangle className="h-3 w-3" />}
              Due: {new Date(subModule.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <Dropdown
          trigger={
            <button className="p-1 rounded text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 hover:bg-[var(--color-surface)] transition-all cursor-pointer">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          }
        >
          <DropdownItem icon={<Pencil className="h-4 w-4" />} onClick={handleClick}>
            Edit
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem icon={<Trash2 className="h-4 w-4" />} danger onClick={() => onDelete?.(subModule)}>
            Delete
          </DropdownItem>
        </Dropdown>
      </div>
    </div>
  );
}
