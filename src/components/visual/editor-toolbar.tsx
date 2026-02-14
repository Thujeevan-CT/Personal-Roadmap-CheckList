"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  LayoutGrid,
  ZoomIn,
  ZoomOut,
  Maximize,
  Save,
  MoreHorizontal,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";

type SaveStatus = "saved" | "saving" | "unsaved" | "error";

interface EditorToolbarProps {
  roadmapId: string;
  roadmapTitle: string;
  saveStatus: SaveStatus;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onAutoLayout: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onSave: () => void;
  zoomLevel: number;
}

const saveStatusDisplay: Record<SaveStatus, { label: string; icon: React.ReactNode; color: string }> = {
  saved: {
    label: "All changes saved",
    icon: <Check className="h-4 w-4" />,
    color: "text-[var(--color-text-secondary)]",
  },
  saving: {
    label: "Saving...",
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    color: "text-[var(--color-text-secondary)]",
  },
  unsaved: {
    label: "Unsaved changes",
    icon: <div className="h-2 w-2 rounded-full bg-[var(--color-warning)]" />,
    color: "text-[var(--color-warning)]",
  },
  error: {
    label: "Save failed",
    icon: <div className="h-2 w-2 rounded-full bg-[var(--color-danger)]" />,
    color: "text-[var(--color-danger)]",
  },
};

export function EditorToolbar({
  roadmapId,
  roadmapTitle,
  saveStatus,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onAutoLayout,
  onZoomIn,
  onZoomOut,
  onFitView,
  onSave,
  zoomLevel,
}: EditorToolbarProps) {
  const status = saveStatusDisplay[saveStatus];

  return (
    <div className="h-12 border-b border-[var(--color-border)] bg-[var(--color-bg)] flex items-center px-4 gap-3 sticky top-0 z-10">
      <Link
        href={`/roadmap/${roadmapId}`}
        className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors no-underline"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back to Roadmap</span>
      </Link>

      <div className="w-px h-5 bg-[var(--color-border)]" />
      <span className="heading-md text-[var(--color-text-primary)] truncate max-w-[200px]">
        {roadmapTitle}
      </span>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded-[6px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded-[6px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-[var(--color-border)] mx-1" />

        <button
          onClick={onAutoLayout}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-[6px] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
          title="Auto Layout"
        >
          <LayoutGrid className="h-4 w-4" />
          <span className="hidden md:inline">Auto Layout</span>
        </button>

        <div className="w-px h-5 bg-[var(--color-border)] mx-1" />

        <button onClick={onZoomOut} className="p-1.5 rounded-[6px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer">
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={onFitView}
          className="px-2 py-1 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] rounded transition-colors cursor-pointer tabular-nums"
        >
          {Math.round(zoomLevel * 100)}%
        </button>
        <button onClick={onZoomIn} className="p-1.5 rounded-[6px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer">
          <ZoomIn className="h-4 w-4" />
        </button>
        <button onClick={onFitView} className="p-1.5 rounded-[6px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer" title="Fit View">
          <Maximize className="h-4 w-4" />
        </button>
      </div>

      <div className="w-px h-5 bg-[var(--color-border)]" />

      <div className={`flex items-center gap-1.5 text-sm ${status.color}`}>
        {status.icon}
        <span className="hidden lg:inline">{status.label}</span>
      </div>

      <Button size="sm" onClick={onSave} disabled={saveStatus === "saved" || saveStatus === "saving"} icon={<Save className="h-4 w-4" />}>
        Save
      </Button>
    </div>
  );
}
