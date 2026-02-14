"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Download, Archive, Trash2, FolderInput } from "lucide-react";
import type { Roadmap } from "@/types";
import { getRelativeTime } from "@/lib/utils/date";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";
import { useExportRoadmap, useUpdateRoadmap } from "@/hooks/use-roadmaps";
import { useToast } from "@/components/ui/toast";

const statusLabel: Record<Roadmap["status"], string> = {
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

interface RoadmapCardProps {
  roadmap: Roadmap & { progress?: number };
  onDelete?: (roadmap: Roadmap & { progress?: number }) => void;
  onMoveToFolder?: (roadmap: Roadmap & { progress?: number }) => void;
}

export function RoadmapCard({ roadmap, onDelete, onMoveToFolder }: RoadmapCardProps) {
  const progress = roadmap.progress ?? 0;
  const router = useRouter();
  const exportRoadmap = useExportRoadmap(roadmap._id);
  const updateRoadmap = useUpdateRoadmap(roadmap._id);
  const { toast } = useToast();

  async function handleEdit() {
    router.push(`/roadmap/${roadmap._id}`);
  }

  async function handleExport() {
    try {
      const data = await exportRoadmap.mutateAsync();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safeTitle = roadmap.title?.trim() || "roadmap";
      link.download = `${safeTitle.replace(/\s+/g, "-").toLowerCase()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast("Roadmap exported", "success");
    } catch (e) {
      toast(String((e as Error).message), "error");
    }
  }

  async function handleArchive() {
    try {
      await updateRoadmap.mutateAsync({ status: "archived" });
      toast("Roadmap archived", "success");
    } catch (e) {
      toast(String((e as Error).message), "error");
    }
  }

  return (
    <div
      className="group relative border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] hover:border-[var(--color-primary)]/30 transition-colors"
      onContextMenu={(e) => e.stopPropagation()}
    >
      <Link
        href={`/roadmap/${roadmap._id}`}
        className="block p-4 no-underline"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">{roadmap.icon || "📋"}</span>
            <h3 className="heading-md text-[var(--color-text-primary)] truncate">
              {roadmap.title}
            </h3>
          </div>
        </div>

        {roadmap.description && (
          <p className="body-sm text-[var(--color-text-secondary)] line-clamp-2 mb-3">
            {roadmap.description}
          </p>
        )}

        <ProgressBar value={progress} showLabel className="mb-3" />

        <div className="flex items-center justify-between">
          <Badge variant={roadmap.status}>{statusLabel[roadmap.status]}</Badge>
          <span className="body-sm text-[var(--color-text-tertiary)]">
            {getRelativeTime(roadmap.updatedAt)}
          </span>
        </div>
      </Link>

      <div
        className="absolute top-3 right-3"
        onClick={(e) => e.stopPropagation()}
      >
        <Dropdown
          trigger={
            <button className="p-1.5 rounded-md text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 hover:bg-[var(--color-surface-hover)] transition-all cursor-pointer">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          }
        >
          <DropdownItem icon={<Pencil className="h-4 w-4" />} onClick={handleEdit}>
            Edit
          </DropdownItem>
          <DropdownItem icon={<Download className="h-4 w-4" />} onClick={handleExport}>
            Export as JSON
          </DropdownItem>
          <DropdownItem icon={<Archive className="h-4 w-4" />} onClick={handleArchive}>
            Archive
          </DropdownItem>
          {onMoveToFolder && (
            <DropdownItem icon={<FolderInput className="h-4 w-4" />} onClick={() => onMoveToFolder(roadmap)}>
              Move to folder
            </DropdownItem>
          )}
          <DropdownSeparator />
          <DropdownItem
            icon={<Trash2 className="h-4 w-4" />}
            danger
            onClick={() => onDelete?.(roadmap)}
          >
            Delete
          </DropdownItem>
        </Dropdown>
      </div>
    </div>
  );
}
