"use client";

import { useEffect, useRef, useCallback, type ReactNode } from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md";
}

function Dialog({ open, onClose, children, size = "sm" }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  const maxW = size === "sm" ? "max-w-[480px]" : "max-w-[640px]";

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/50 animate-in fade-in"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className={`relative ${maxW} w-full sm:mx-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-t-xl sm:rounded-lg p-6 animate-in slide-in-from-bottom sm:zoom-in-95 fade-in max-h-[90vh] overflow-y-auto`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}

function DialogHeader({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="heading-lg text-[var(--color-text-primary)]">{children}</h2>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-md text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

function DialogBody({ children }: { children: ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

function DialogFooter({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-end gap-3 mt-6">{children}</div>;
}

export { Dialog, DialogHeader, DialogBody, DialogFooter };
