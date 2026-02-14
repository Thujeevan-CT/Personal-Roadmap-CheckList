"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { Roadmap, Module, SubModule } from "@/types";

export interface RoadmapDetailResponse {
  roadmap: Roadmap & { progress?: number };
  modules: (Module & { submodules?: (SubModule & { progress?: number })[]; progress?: number })[];
}

const BASE = "/api/v1";

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, credentials: "include" });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? res.statusText);
  if (json.success === false) throw new Error(json.error?.message ?? "Request failed");
  return json.data;
}

export function useRoadmaps() {
  return useQuery({
    queryKey: ["roadmaps"],
    queryFn: () => fetcher<Roadmap[]>(`${BASE}/roadmaps`),
  });
}

export function useRoadmap(id: string | null) {
  return useQuery({
    queryKey: ["roadmap", id],
    queryFn: () => fetcher<RoadmapDetailResponse>(`${BASE}/roadmaps/${id}`),
    enabled: !!id,
  });
}

export function useCreateRoadmap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; description?: string; icon?: string; folderId?: string | null }) =>
      fetcher<Roadmap>(`${BASE}/roadmaps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roadmaps"] }),
  });
}

export function useUpdateRoadmap(id: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title?: string; description?: string; icon?: string; status?: string; folderId?: string | null }) =>
      fetcher<Roadmap>(`${BASE}/roadmaps/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: (_, __, ctx) => {
      qc.invalidateQueries({ queryKey: ["roadmaps"] });
      if (id) qc.invalidateQueries({ queryKey: ["roadmap", id] });
    },
  });
}

export function useDeleteRoadmap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetcher<{ deleted: boolean }>(`${BASE}/roadmaps/${id}`, { method: "DELETE" }),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["roadmaps"] });
      qc.invalidateQueries({ queryKey: ["roadmap", id] });
    },
  });
}

export function useReorderRoadmaps() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      fetcher<{ updated: number }>(`${BASE}/roadmaps/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roadmaps"] }),
  });
}

export function useImportRoadmap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string; icon?: string; modules: unknown[] }) =>
      fetcher<Roadmap>(`${BASE}/roadmaps/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roadmaps"] }),
  });
}

export function useExportRoadmap(id: string | null) {
  return useMutation({
    mutationFn: () =>
      fetcher<Record<string, unknown>>(`${BASE}/roadmaps/${id}/export`),
  });
}
