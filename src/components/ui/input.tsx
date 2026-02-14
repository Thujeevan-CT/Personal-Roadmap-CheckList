"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-[var(--color-text-primary)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            h-9 px-3 text-sm rounded-[6px] border outline-none
            bg-[var(--color-bg)] text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-tertiary)]
            transition-colors duration-150
            ${
              error
                ? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-2 focus:ring-[var(--color-danger-light)]"
                : "border-[var(--color-border)] focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
            }
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-[var(--color-text-tertiary)]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-[var(--color-text-primary)]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            px-3 py-2 text-sm rounded-[6px] border outline-none resize-none
            bg-[var(--color-bg)] text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-tertiary)]
            transition-colors duration-150
            ${
              error
                ? "border-[var(--color-danger)] focus:border-[var(--color-danger)]"
                : "border-[var(--color-border)] focus:border-[var(--color-border-focus)]"
            }
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export { Textarea };
