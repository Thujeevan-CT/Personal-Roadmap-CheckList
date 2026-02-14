"use client";

import { useState } from "react";
import { Download, Trash2 } from "lucide-react";
import type { FileAttachment } from "@/types";
import { getRelativeTime } from "@/lib/utils/date";
import { useToast } from "@/components/ui/toast";
import { FileUpload } from "./file-upload";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.includes("pdf")) return "📄";
  if (mimeType.includes("image")) return "🖼️";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "📊";
  if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
  return "📎";
}

interface FileListProps {
  files: FileAttachment[];
  subModuleId?: string;
  roadmapId?: string;
  onDelete?: (id: string) => void | Promise<void>;
  onDownload?: (file: FileAttachment) => void | Promise<void>;
}

export function FileList({
  files: initialFiles,
  subModuleId,
  roadmapId,
  onDelete,
  onDownload,
}: FileListProps) {
  const [files, setFiles] = useState(initialFiles);
  const { toast } = useToast();
  const filesToShow = onDelete !== undefined ? initialFiles : files;

  function handleUpload(file: { fileName: string; fileSize: number; mimeType: string }) {
    if (onDelete) return;
    const newFile: FileAttachment = {
      _id: `f-new-${Date.now()}`,
      subModuleId: "",
      roadmapId: "",
      fileName: file.fileName,
      fileKey: "",
      fileSize: file.fileSize,
      mimeType: file.mimeType,
      createdAt: new Date().toISOString(),
    };
    setFiles((prev) => [...prev, newFile]);
  }

  function handleDelete(id: string) {
    if (onDelete) {
      void onDelete(id);
      return;
    }
    setFiles((prev) => prev.filter((f) => f._id !== id));
    toast("File removed", "success");
  }

  function handleDownload(file: FileAttachment) {
    if (onDownload) {
      void onDownload(file);
      return;
    }
    toast(`Downloading ${file.fileName}...`, "info");
  }

  return (
    <div>
      <h4 className="heading-md text-[var(--color-text-primary)] mb-3">
        Files {filesToShow.length > 0 && `(${filesToShow.length})`}
      </h4>

      {filesToShow.length > 0 && (
        <div className="space-y-1 mb-3">
          {filesToShow.map((file) => (
            <div
              key={file._id}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-[6px] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <span className="text-lg flex-shrink-0">{getFileIcon(file.mimeType)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--color-text-primary)] truncate">{file.fileName}</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  {formatFileSize(file.fileSize)} &middot; {getRelativeTime(file.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDownload(file)}
                  className="p-1 rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(file._id)}
                  className="p-1 rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {subModuleId && roadmapId ? (
        <FileUpload
          subModuleId={subModuleId}
          roadmapId={roadmapId}
          onUploadComplete={() => {}}
        />
      ) : (
        <FileUpload onUpload={handleUpload} />
      )}
    </div>
  );
}
