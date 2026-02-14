"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";

const DndContextAny = DndContext as any;
const SortableContextAny = SortableContext as any;
import type { Module, SubModule } from "@/types";
import { ModuleCard } from "./module-card";
import { SortableItem } from "@/components/ui/sortable-item";
import { useReorderModules } from "@/hooks/use-modules";
import { useToast } from "@/components/ui/toast";

type ModuleWithExtras = Module & { submodules?: SubModule[]; progress?: number };

interface ModuleListProps {
  modules: ModuleWithExtras[];
  roadmapId?: string;
  onEditModule?: (module: ModuleWithExtras) => void;
  onDeleteModule?: (module: ModuleWithExtras) => void;
  onDeleteSubModule?: (subModule: SubModule & { progress?: number }) => void;
}

export function ModuleList({ modules, roadmapId, onEditModule, onDeleteModule, onDeleteSubModule }: ModuleListProps) {
  const reorderModules = useReorderModules();
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = modules.findIndex((i) => i._id === active.id);
    const newIndex = modules.findIndex((i) => i._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove([...modules], oldIndex, newIndex);
    const newIds = reordered.map((m) => m._id);
    try {
      await reorderModules.mutateAsync(newIds);
      toast("Order updated", "success");
    } catch (e) {
      toast(String((e as Error).message), "error");
    }
  }

  return (
    <DndContextAny
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContextAny items={modules.map((m) => m._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {modules.map((m) => (
            <SortableItem key={m._id} id={m._id}>
              <ModuleCard module={m} onEdit={onEditModule} onDelete={onDeleteModule} onDeleteSubModule={onDeleteSubModule} />
            </SortableItem>
          ))}
        </div>
      </SortableContextAny>
    </DndContextAny>
  );
}
