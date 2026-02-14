"use client";

import { List, GitBranch } from "lucide-react";

type ViewMode = "list" | "visual";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex border border-[var(--color-border)] rounded-[6px] overflow-hidden">
      <button
        onClick={() => onChange("list")}
        className={`
          flex items-center gap-1.5 px-3 h-8 text-sm font-medium transition-colors cursor-pointer
          ${
            value === "list"
              ? "bg-[var(--color-primary)] text-white"
              : "bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
          }
        `}
      >
        <List className="h-4 w-4" />
        List
      </button>
      <button
        onClick={() => onChange("visual")}
        className={`
          flex items-center gap-1.5 px-3 h-8 text-sm font-medium transition-colors cursor-pointer border-l border-[var(--color-border)]
          ${
            value === "visual"
              ? "bg-[var(--color-primary)] text-white"
              : "bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
          }
        `}
      >
        <GitBranch className="h-4 w-4" />
        Visual
      </button>
    </div>
  );
}
