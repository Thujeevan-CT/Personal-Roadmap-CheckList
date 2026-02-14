"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SubModule } from "@/types";

const BASE = "/api/v1";

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, credentials: "include" });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? res.statusText);
  if (json.success === false) throw new Error(json.error?.message ?? "Request failed");
  return json.data;
}

export function useSubModules(moduleId: string | null) {
  return useQuery({
    queryKey: ["submodules", moduleId],
    queryFn: () => fetcher<SubModule[]>(`${BASE}/modules/${moduleId}/submodules`),
    enabled: !!moduleId,
  });
}

export function useCreateSubModule(moduleId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; description?: string; status?: string }) =>
      fetcher<SubModule>(`${BASE}/modules/${moduleId}/submodules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submodules", moduleId] });
      qc.invalidateQueries({ queryKey: ["modules"] });
      qc.invalidateQueries({ queryKey: ["roadmap"] });
      qc.invalidateQueries({ queryKey: ["roadmaps"] });
    },
  });
}

export function useUpdateSubModule(id: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title?: string; description?: string; status?: string; dueDate?: string | null }) =>
      fetcher<SubModule>(`${BASE}/submodules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submodules"] });
      qc.invalidateQueries({ queryKey: ["modules"] });
      qc.invalidateQueries({ queryKey: ["roadmap"] });
      qc.invalidateQueries({ queryKey: ["roadmaps"] });
    },
  });
}

export function useDeleteSubModule(id: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetcher<{ deleted: boolean }>(`${BASE}/submodules/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submodules"] });
      qc.invalidateQueries({ queryKey: ["modules"] });
      qc.invalidateQueries({ queryKey: ["roadmap"] });
      qc.invalidateQueries({ queryKey: ["roadmaps"] });
    },
  });
}

export function useReorderSubModules() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      fetcher<{ updated: number }>(`${BASE}/submodules/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submodules"] });
      qc.invalidateQueries({ queryKey: ["roadmap"] });
      qc.invalidateQueries({ queryKey: ["roadmaps"] });
    },
  });
}
