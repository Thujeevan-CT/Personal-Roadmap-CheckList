"use client";

import { useState, useRef, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
} from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

interface DatePickerProps {
  value?: string;
  onChange?: (date: string | undefined) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder = "Set due date" }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const ref = useRef<HTMLDivElement>(null);
  const selected = value ? new Date(value) : undefined;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  function handleSelect(d: Date) {
    onChange?.(format(d, "yyyy-MM-dd"));
    setOpen(false);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange?.(undefined);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 h-9 px-3 rounded-[6px] border border-[var(--color-border)] text-sm hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
      >
        <Calendar className="h-4 w-4 text-[var(--color-text-tertiary)]" />
        <span className={selected ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)]"}>
          {selected ? format(selected, "MMM d, yyyy") : placeholder}
        </span>
        {selected && (
          <button onClick={handleClear} className="p-0.5 rounded hover:bg-[var(--color-surface)] cursor-pointer">
            <X className="h-3 w-3 text-[var(--color-text-tertiary)]" />
          </button>
        )}
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-30 w-[280px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1 rounded hover:bg-[var(--color-surface-hover)] cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 text-[var(--color-text-secondary)]" />
            </button>
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1 rounded hover:bg-[var(--color-surface-hover)] cursor-pointer"
            >
              <ChevronRight className="h-4 w-4 text-[var(--color-text-secondary)]" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0 mb-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="h-9 flex items-center justify-center text-xs font-medium text-[var(--color-text-tertiary)]">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0">
            {days.map((d, i) => {
              const isSelected = selected && isSameDay(d, selected);
              const isCurrentMonth = isSameMonth(d, currentMonth);
              const isTodayDate = isToday(d);
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(d)}
                  className={`
                    h-9 w-9 flex items-center justify-center text-sm rounded-full transition-colors cursor-pointer
                    ${!isCurrentMonth ? "text-[var(--color-text-tertiary)]" : "text-[var(--color-text-primary)]"}
                    ${isSelected ? "bg-[var(--color-primary)] text-white" : ""}
                    ${isTodayDate && !isSelected ? "border border-[var(--color-primary)]" : ""}
                    ${!isSelected ? "hover:bg-[var(--color-surface-hover)]" : ""}
                  `}
                >
                  {format(d, "d")}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
