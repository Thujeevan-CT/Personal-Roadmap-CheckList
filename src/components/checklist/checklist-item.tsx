"use client";

import { Trash2, Check, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ChecklistItem as ChecklistItemType } from "@/types";

interface ChecklistItemProps {
  item: ChecklistItemType;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ChecklistItem({ item, onToggle, onDelete }: ChecklistItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group flex items-center gap-2 h-10">
      <button
        {...attributes}
        {...listeners}
        className="p-0.5 rounded text-[var(--color-text-tertiary)] sm:opacity-0 sm:group-hover:opacity-100 hover:text-[var(--color-text-secondary)] cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onToggle?.(item._id)}
        className={`
          h-[18px] w-[18px] rounded flex-shrink-0 border flex items-center justify-center transition-colors cursor-pointer
          ${
            item.isCompleted
              ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
              : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
          }
        `}
      >
        {item.isCompleted && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </button>
      <span
        className={`flex-1 text-sm ${
          item.isCompleted
            ? "text-[var(--color-text-tertiary)] line-through"
            : "text-[var(--color-text-primary)]"
        }`}
      >
        {item.title}
      </span>
      <button
        onClick={() => onDelete?.(item._id)}
        className="p-1 rounded text-[var(--color-text-tertiary)] sm:opacity-0 sm:group-hover:opacity-100 hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] transition-all cursor-pointer"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
