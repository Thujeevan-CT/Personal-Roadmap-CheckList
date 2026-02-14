"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
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
import type { ChecklistItem as ChecklistItemType } from "@/types";
import { ChecklistItem } from "./checklist-item";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CheckSquare } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface ChecklistListProps {
  items: ChecklistItemType[];
  subModuleId?: string;
  onToggle?: (id: string) => void | Promise<void>;
  onAdd?: (title: string) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  onReorder?: (ids: string[]) => void | Promise<void>;
}

export function ChecklistList({
  items: initialItems,
  subModuleId,
  onToggle,
  onAdd,
  onDelete,
  onReorder,
}: ChecklistListProps) {
  const [localItems, setLocalItems] = useState(initialItems);
  const [newTitle, setNewTitle] = useState("");
  const items = onToggle !== undefined ? initialItems : localItems;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const completed = items.filter((i) => i.isCompleted).length;
  const total = items.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  function handleToggle(id: string) {
    if (onToggle) {
      void onToggle(id);
      return;
    }
    setLocalItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, isCompleted: !i.isCompleted } : i))
    );
  }

  function handleDelete(id: string) {
    if (onDelete) {
      void onDelete(id);
      return;
    }
    setLocalItems((prev) => prev.filter((i) => i._id !== id));
  }

  function handleAdd() {
    if (!newTitle.trim()) return;
    if (onAdd) {
      void onAdd(newTitle.trim());
      setNewTitle("");
      return;
    }
    const newItem: ChecklistItemType = {
      _id: `cl-new-${Date.now()}`,
      subModuleId: "",
      roadmapId: "",
      title: newTitle.trim(),
      isCompleted: false,
      order: items.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLocalItems((prev) => [...prev, newItem]);
    setNewTitle("");
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i._id === active.id);
      const newIndex = items.findIndex((i) => i._id === over.id);
      const reordered = arrayMove([...items], oldIndex, newIndex);
      const ids = reordered.map((i) => i._id);
      if (onReorder) {
        void onReorder(ids);
        return;
      }
      setLocalItems(reordered);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="heading-md text-[var(--color-text-primary)]">Checklist</h4>
        <span className="body-sm text-[var(--color-text-tertiary)]">
          {completed}/{total} completed
        </span>
      </div>
      <ProgressBar value={progress} size="compact" className="mb-3" />

      {items.length > 0 ? (
        <DndContextAny
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContextAny items={items.map((i) => i._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-0.5">
              {items.map((item) => (
                <ChecklistItem
                  key={item._id}
                  item={item}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContextAny>
        </DndContextAny>
      ) : (
        <EmptyState
          icon={<CheckSquare className="h-8 w-8" />}
          headline="No checklist items"
          description="Add items to track your progress."
          action={null}
        />
      )}

      <div className="flex items-center gap-3 h-10 mt-1 pl-7">
        <div className="h-[18px] w-[18px] rounded border border-dashed border-[var(--color-border)] flex-shrink-0" />
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
            if (e.key === "Escape") setNewTitle("");
          }}
          placeholder="Add an item..."
          className="flex-1 text-sm bg-transparent border-none outline-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
        />
      </div>
    </div>
  );
}
