"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Note } from "@/types";

const BASE = "/api/v1";

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, credentials: "include" });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? res.statusText);
  if (json.success === false) throw new Error(json.error?.message ?? "Request failed");
  return json.data;
}

export function useNotes(entityType: "roadmap" | "module" | "submodule" | null, entityId: string | null) {
  return useQuery({
    queryKey: ["notes", entityType, entityId],
    queryFn: () =>
      fetcher<Note[]>(
        `${BASE}/notes?entityType=${entityType}&entityId=${entityId}`
      ),
    enabled: !!entityType && !!entityId,
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      entityType: "roadmap" | "module" | "submodule";
      entityId: string;
      roadmapId: string;
      content: string;
    }) =>
      fetcher<Note>(`${BASE}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["notes", data.entityType, data.entityId] });
    },
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      fetcher<Note>(`${BASE}/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetcher<{ deleted: boolean }>(`${BASE}/notes/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}
