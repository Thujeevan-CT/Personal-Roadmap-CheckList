"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const variantConfig: Record<ToastVariant, { accent: string; icon: ReactNode }> = {
  success: {
    accent: "bg-[var(--color-success)]",
    icon: <CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" />,
  },
  error: {
    accent: "bg-[var(--color-danger)]",
    icon: <XCircle className="h-5 w-5 text-[var(--color-danger)]" />,
  },
  info: {
    accent: "bg-[var(--color-primary)]",
    icon: <Info className="h-5 w-5 text-[var(--color-primary)]" />,
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-2), { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 flex flex-col gap-2 sm:max-w-[360px] w-auto pointer-events-none">
        {toasts.map((t) => {
          const config = variantConfig[t.variant];
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-start gap-3 p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg overflow-hidden animate-in slide-in-from-right"
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.accent}`} />
              <div className="ml-1 flex-shrink-0 mt-0.5">{config.icon}</div>
              <p className="flex-1 text-sm text-[var(--color-text-primary)]">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 p-0.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
