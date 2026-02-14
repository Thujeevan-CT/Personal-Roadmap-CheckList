"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE = "/api/v1";

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, credentials: "include" });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? res.statusText);
  if (json.success === false) throw new Error(json.error?.message ?? "Request failed");
  return json.data;
}

export interface LayoutData {
  nodes: { entityId: string; entityType: string; position: { x: number; y: number }; width?: number; height?: number }[];
  edges: { id: string; source: string; target: string; type?: string; label?: string }[];
  viewport?: { x: number; y: number; zoom: number };
}

export function useLayout(roadmapId: string | null) {
  return useQuery({
    queryKey: ["layout", roadmapId],
    queryFn: () => fetcher<LayoutData>(`${BASE}/roadmaps/${roadmapId}/layout`),
    enabled: !!roadmapId,
  });
}

export function useSaveLayout(roadmapId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: LayoutData) =>
      fetcher<LayoutData>(`${BASE}/roadmaps/${roadmapId}/layout`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: (_, __, ctx) => {
      qc.invalidateQueries({ queryKey: ["layout", roadmapId] });
    },
  });
}
