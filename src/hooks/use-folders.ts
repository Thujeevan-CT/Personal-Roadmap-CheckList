"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE = "/api/v1";

export interface Folder {
  _id: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, credentials: "include" });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? res.statusText);
  if (json.success === false) throw new Error(json.error?.message ?? "Request failed");
  return json.data;
}

export function useFolders() {
  return useQuery({
    queryKey: ["folders"],
    queryFn: () => fetcher<Folder[]>(`${BASE}/folders`),
  });
}

export function useCreateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string }) =>
      fetcher<Folder>(`${BASE}/folders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["folders"] }),
  });
}

