import type { ChecklistItem, Module, SubModule } from "@/types";

export function getSubModuleProgress(
  items: ChecklistItem[],
  subModuleId: string
): number {
  const filtered = items.filter((i) => i.subModuleId === subModuleId);
  if (filtered.length === 0) return 0;
  const completed = filtered.filter((i) => i.isCompleted).length;
  return Math.round((completed / filtered.length) * 100);
}

export function getModuleProgress(
  subModules: SubModule[],
  checklistItems: ChecklistItem[],
  moduleId: string
): number {
  const subs = subModules.filter((s) => s.moduleId === moduleId);
  if (subs.length === 0) return 0;
  const total = subs.reduce(
    (acc, sm) => acc + getSubModuleProgress(checklistItems, sm._id),
    0
  );
  return Math.round(total / subs.length);
}

export function getRoadmapProgress(
  modules: Module[],
  subModules: SubModule[],
  checklistItems: ChecklistItem[],
  roadmapId: string
): number {
  const mods = modules.filter((m) => m.roadmapId === roadmapId);
  if (mods.length === 0) return 0;
  const total = mods.reduce(
    (acc, m) =>
      acc + getModuleProgress(subModules, checklistItems, m._id),
    0
  );
  return Math.round(total / mods.length);
}
