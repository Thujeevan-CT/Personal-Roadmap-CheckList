interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-[6px] bg-[var(--color-border)] ${className}`}
      style={style}
    />
  );
}

function SkeletonLine({ width = "100%" }: { width?: string }) {
  return <Skeleton className="h-4" style={{ width }} />;
}

function SkeletonCard() {
  return (
    <div className="p-4 border border-[var(--color-border)] rounded-lg space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="flex justify-between">
        <Skeleton className="h-[22px] w-16 rounded" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export { Skeleton, SkeletonLine, SkeletonCard };
