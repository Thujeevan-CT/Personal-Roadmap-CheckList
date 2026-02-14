"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useToast } from "@/components/ui/toast";
import { usePresignUpload, useRegisterFile } from "@/hooks/use-files";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];
const MAX_SIZE = 10 * 1024 * 1024;

interface FileUploadProps {
  onUpload?: (file: { fileName: string; fileSize: number; mimeType: string }) => void;
  subModuleId?: string;
  roadmapId?: string;
  onUploadComplete?: () => void;
}

export function FileUpload({
  onUpload,
  subModuleId,
  roadmapId,
  onUploadComplete,
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const presign = usePresignUpload();
  const register = useRegisterFile();
  const isRealUpload = Boolean(subModuleId && roadmapId);

  function validate(file: File): boolean {
    if (file.size > MAX_SIZE) {
      toast("File too large (max 10MB)", "error");
      return false;
    }
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.endsWith(".txt")) {
      toast("File type not supported", "error");
      return false;
    }
    return true;
  }

  async function doRealUpload(file: File) {
    if (!subModuleId || !roadmapId) return;
    setUploading(true);
    setUploadName(file.name);
    setProgress(20);
    try {
      const { uploadUrl, key } = await presign.mutateAsync({
        roadmapId,
        subModuleId,
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
      });
      setProgress(50);
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
      setProgress(80);
      await register.mutateAsync({
        subModuleId,
        roadmapId,
        fileName: file.name,
        fileKey: key,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
      });
      setProgress(100);
      toast("File uploaded", "success");
      onUploadComplete?.();
    } catch (e) {
      toast(String((e as Error).message), "error");
    } finally {
      setUploading(false);
      setUploadName("");
      setProgress(0);
    }
  }

  function simulateUpload(file: File) {
    if (!validate(file)) return;
    setUploading(true);
    setUploadName(file.name);
    setProgress(0);

    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 30;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setUploading(false);
        setUploadName("");
        onUpload?.({ fileName: file.name, fileSize: file.size, mimeType: file.type });
        toast("File uploaded", "success");
      }
      setProgress(Math.min(p, 100));
    }, 300);
  }

  function handleFile(file: File) {
    if (!validate(file)) return;
    if (isRealUpload) {
      void doRealUpload(file);
      return;
    }
    simulateUpload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      className={`
        flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed transition-colors cursor-pointer
        ${
          dragOver
            ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
            : "border-[var(--color-border)] hover:border-[var(--color-text-tertiary)]"
        }
      `}
    >
      <input ref={inputRef} type="file" className="hidden" onChange={handleChange} />
      {uploading ? (
        <div className="w-full space-y-2 text-center">
          <p className="body-sm text-[var(--color-text-primary)] truncate">{uploadName}</p>
          <ProgressBar value={progress} size="compact" />
        </div>
      ) : (
        <>
          <Upload className="h-6 w-6 text-[var(--color-text-tertiary)]" />
          <p className="body-sm text-[var(--color-text-secondary)] text-center">
            Drop files here or click to upload
          </p>
          <p className="text-xs text-[var(--color-text-tertiary)]">Max 10MB</p>
        </>
      )}
    </div>
  );
}
