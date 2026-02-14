"use client";

import { useEffect, useRef, type ReactNode } from "react";

export interface ContextMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed z-50 min-w-[180px] py-1 rounded-[6px] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg animate-in fade-in zoom-in-95"
      style={{ left: x, top: y }}
      role="menu"
    >
      {items.map((item, i) => (
        <button
          key={i}
          type="button"
          onClick={() => {
            item.onClick();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 h-9 text-sm text-left text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
          role="menuitem"
        >
          {item.icon && <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </div>
  );
}
