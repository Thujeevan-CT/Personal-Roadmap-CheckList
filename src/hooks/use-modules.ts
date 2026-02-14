"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Module } from "@/types";

const BASE = "/api/v1";

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, credentials: "include" });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? res.statusText);
  if (json.success === false) throw new Error(json.error?.message ?? "Request failed");
  return json.data;
}

export function useModules(roadmapId: string | null) {
  return useQuery({
    queryKey: ["modules", roadmapId],
    queryFn: () => fetcher<Module[]>(`${BASE}/roadmaps/${roadmapId}/modules`),
    enabled: !!roadmapId,
  });
}

export function useCreateModule(roadmapId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; description?: string }) =>
      fetcher<Module>(`${BASE}/roadmaps/${roadmapId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: (_, __, ctx) => {
      qc.invalidateQueries({ queryKey: ["modules", roadmapId] });
      qc.invalidateQueries({ queryKey: ["roadmap", roadmapId] });
      qc.invalidateQueries({ queryKey: ["roadmaps"] });
    },
  });
}

export function useUpdateModule(id: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title?: string; description?: string }) =>
      fetcher<Module>(`${BASE}/modules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["modules"] });
      qc.invalidateQueries({ queryKey: ["roadmap"] });
      qc.invalidateQueries({ queryKey: ["roadmaps"] });
    },
  });
}

export function useDeleteModule(id: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetcher<{ deleted: boolean }>(`${BASE}/modules/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["modules"] });
      qc.invalidateQueries({ queryKey: ["roadmap"] });
      qc.invalidateQueries({ queryKey: ["roadmaps"] });
    },
  });
}

export function useReorderModules() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      fetcher<{ updated: number }>(`${BASE}/modules/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["modules"] });
      qc.invalidateQueries({ queryKey: ["roadmap"] });
      qc.invalidateQueries({ queryKey: ["roadmaps"] });
    },
  });
}
