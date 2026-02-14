"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
}

function Dropdown({ trigger, children, align = "right" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("keydown", handleKey);
      return () => {
        document.removeEventListener("mousedown", handleClick);
        document.removeEventListener("keydown", handleKey);
      };
    }
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={`
            absolute top-full mt-1 z-30 min-w-[180px]
            bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[6px]
            py-1 animate-in fade-in zoom-in-95
            ${align === "right" ? "right-0" : "left-0"}
          `}
          role="menu"
        >
          <div onClick={() => setOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  icon?: ReactNode;
}

function DropdownItem({ children, onClick, danger, icon }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-2 px-3 h-9 text-sm transition-colors text-left cursor-pointer
        ${
          danger
            ? "text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]"
            : "text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
        }
      `}
      role="menuitem"
    >
      {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

function DropdownSeparator() {
  return <div className="h-px bg-[var(--color-border)] my-1" />;
}

export { Dropdown, DropdownItem, DropdownSeparator };
