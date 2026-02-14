"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { FileAttachment } from "@/types";

const BASE = "/api/v1";

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, credentials: "include" });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? res.statusText);
  if (json.success === false) throw new Error(json.error?.message ?? "Request failed");
  return json.data;
}

export function useFiles(subModuleId: string | null) {
  return useQuery({
    queryKey: ["files", subModuleId],
    queryFn: () =>
      fetcher<FileAttachment[]>(`${BASE}/submodules/${subModuleId}/files`),
    enabled: !!subModuleId,
  });
}

export function usePresignUpload() {
  return useMutation({
    mutationFn: (body: {
      roadmapId: string;
      subModuleId: string;
      fileName: string;
      contentType?: string;
    }) =>
      fetcher<{ uploadUrl: string; key: string }>(`${BASE}/files/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
  });
}

export function useRegisterFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      subModuleId: string;
      roadmapId: string;
      fileName: string;
      fileKey: string;
      fileSize: number;
      mimeType?: string;
    }) =>
      fetcher<FileAttachment>(`${BASE}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["files", data.subModuleId] });
    },
  });
}

export function useDeleteFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetcher<{ deleted: boolean }>(`${BASE}/files/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["files"] }),
  });
}

export function useDownloadFile() {
  return useMutation({
    mutationFn: (id: string) =>
      fetcher<{ downloadUrl: string; fileName: string }>(`${BASE}/files/${id}/download`),
  });
}
