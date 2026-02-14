type BadgeVariant =
  | "active"
  | "completed"
  | "blocked"
  | "not_started"
  | "in_progress"
  | "archived";

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  active: "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
  completed: "bg-[var(--color-success-light)] text-green-700",
  blocked: "bg-[var(--color-danger-light)] text-red-700",
  not_started: "bg-gray-100 text-gray-600",
  in_progress: "bg-[var(--color-warning-light)] text-amber-700",
  archived: "bg-gray-100 text-gray-500",
};

function Badge({ variant, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center h-[22px] px-2 rounded text-xs font-medium
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeVariant };
