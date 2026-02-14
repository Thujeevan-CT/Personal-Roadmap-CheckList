interface ProgressBarProps {
  value: number;
  size?: "compact" | "standard";
  showLabel?: boolean;
  className?: string;
}

function ProgressBar({ value, size = "standard", showLabel = false, className = "" }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const trackHeight = size === "compact" ? "h-1.5" : "h-2";
  const fillColor = clamped >= 100 ? "bg-[var(--color-success)]" : "bg-[var(--color-primary)]";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex-1 ${trackHeight} rounded-full bg-[var(--color-border)] overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${fillColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-[var(--color-text-secondary)] tabular-nums min-w-[32px] text-right">
          {clamped}%
        </span>
      )}
    </div>
  );
}

export { ProgressBar };
