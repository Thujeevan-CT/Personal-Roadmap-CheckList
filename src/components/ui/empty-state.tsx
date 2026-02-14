import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  headline: string;
  description: string;
  action?: ReactNode;
}

function EmptyState({ icon, headline, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-[var(--color-text-tertiary)] mb-2">{icon}</div>
      <h3 className="heading-md text-[var(--color-text-primary)] mb-1">{headline}</h3>
      <p className="body-sm text-[var(--color-text-secondary)] max-w-[320px] mb-4">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}

export { EmptyState };
