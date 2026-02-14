"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChecklistItem } from "@/types";

const BASE = "/api/v1";

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, credentials: "include" });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? res.statusText);
  if (json.success === false) throw new Error(json.error?.message ?? "Request failed");
  return json.data;
}

export function useChecklist(subModuleId: string | null) {
  return useQuery({
    queryKey: ["checklist", subModuleId],
    queryFn: () =>
      fetcher<ChecklistItem[]>(`${BASE}/submodules/${subModuleId}/checklist`),
    enabled: !!subModuleId,
  });
}

export function useCreateChecklistItem(subModuleId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string }) =>
      fetcher<ChecklistItem>(`${BASE}/submodules/${subModuleId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: (_, __, ctx) => {
      qc.invalidateQueries({ queryKey: ["checklist", subModuleId] });
      qc.invalidateQueries({ queryKey: ["roadmap"] });
      qc.invalidateQueries({ queryKey: ["roadmaps"] });
    },
  });
}

export function useUpdateChecklistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; title?: string; isCompleted?: boolean }) =>
      fetcher<ChecklistItem>(`${BASE}/checklist/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checklist"] });
      qc.invalidateQueries({ queryKey: ["roadmap"] });
      qc.invalidateQueries({ queryKey: ["roadmaps"] });
    },
  });
}

export function useDeleteChecklistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetcher<{ deleted: boolean }>(`${BASE}/checklist/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checklist"] });
      qc.invalidateQueries({ queryKey: ["roadmap"] });
      qc.invalidateQueries({ queryKey: ["roadmaps"] });
    },
  });
}

export function useReorderChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      fetcher<{ updated: number }>(`${BASE}/checklist/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checklist"] });
      qc.invalidateQueries({ queryKey: ["roadmap"] });
      qc.invalidateQueries({ queryKey: ["roadmaps"] });
    },
  });
}
