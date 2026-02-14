"use client";

import { Folder } from "lucide-react";
import type { Folder as FolderType } from "@/hooks/use-folders";

interface FolderCardProps {
  folder: FolderType;
  onOpen: () => void;
  onContextMenu?: (e: React.MouseEvent, folderId: string | null) => void;
}

export function FolderCard({ folder, onOpen, onContextMenu }: FolderCardProps) {
  const folderId = folder._id === "up" ? null : folder._id;
  return (
    <button
      onClick={onOpen}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu?.(e, folderId);
      }}
      className="group relative w-full h-full text-left border border-[var(--color-border)] rounded-xl bg-[var(--color-bg)] hover:border-[var(--color-primary)]/30 transition-colors cursor-pointer px-5 py-4 flex items-center gap-3"
    >
      <div className="h-10 w-10 rounded-[12px] bg-[var(--color-primary-light)] flex items-center justify-center flex-shrink-0">
        <Folder className="h-5 w-5 text-[var(--color-primary)]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="heading-md text-[var(--color-text-primary)] truncate">
            {folder.name}
          </span>
        </div>
        <p className="body-sm text-[var(--color-text-tertiary)] truncate">
          Folder
        </p>
      </div>
    </button>
  );
}

