"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="hidden md:flex items-center gap-1 text-sm" aria-label="Breadcrumb">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <div key={idx} className="flex items-center gap-1">
            {idx > 0 && <ChevronRight className="h-4 w-4 text-[var(--color-text-tertiary)]" />}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors truncate max-w-[200px] no-underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-[var(--color-text-primary)] font-medium truncate max-w-[200px]">
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
