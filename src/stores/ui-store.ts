import { create } from "zustand";
import type { Theme } from "@/lib/theme";

interface UIStore {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  activeDialog: string | null;
  activePanel: { subModuleId: string; moduleId: string; roadmapId: string } | null;
  theme: Theme;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openDialog: (dialogId: string) => void;
  closeDialog: () => void;
  openPanel: (panel: { subModuleId: string; moduleId: string; roadmapId: string }) => void;
  closePanel: () => void;
  setTheme: (theme: Theme) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  activeDialog: null,
  activePanel: null,
  theme: "system",
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  openDialog: (dialogId) => set({ activeDialog: dialogId }),
  closeDialog: () => set({ activeDialog: null }),
  openPanel: (panel) => set({ activePanel: panel }),
  closePanel: () => set({ activePanel: null }),
  setTheme: (theme) => set({ theme }),
}));
