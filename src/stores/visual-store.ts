"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LayoutDirection = "horizontal" | "vertical";

interface VisualStore {
  layoutDirection: LayoutDirection;
  setLayoutDirection: (dir: LayoutDirection) => void;
}

export const useVisualStore = create<VisualStore>()(
  persist(
    (set) => ({
      layoutDirection: "horizontal",
      setLayoutDirection: (layoutDirection) => set({ layoutDirection }),
    }),
    {
      name: "visual-layout-settings",
    }
  )
);

