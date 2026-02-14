"use client";

import { useState } from "react";
import { ChevronRight, MoreHorizontal, Pencil, Trash2, Plus, List } from "lucide-react";
import type { Module, SubModule } from "@/types";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";
import { SubModuleCard } from "@/components/submodule/submodule-card";
import { SubModuleForm } from "@/components/submodule/submodule-form";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { DragHandle } from "@/components/ui/sortable-item";

type ModuleWithExtras = Module & { submodules?: SubModule[]; progress?: number };

interface ModuleCardProps {
  module: ModuleWithExtras;
  onEdit?: (module: ModuleWithExtras) => void;
  onDelete?: (module: ModuleWithExtras) => void;
  onDeleteSubModule?: (subModule: SubModule & { progress?: number }) => void;
}

export function ModuleCard({ module, onEdit, onDelete, onDeleteSubModule }: ModuleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showAddSubModule, setShowAddSubModule] = useState(false);
  const subModules = module.submodules ?? [];
  const progress = module.progress ?? 0;

  return (
    <div className="border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)]">
      <div className="flex items-center gap-2 px-3 py-3 hover:bg-[var(--color-surface-hover)] transition-colors rounded-lg">
        <div onClick={(e) => e.stopPropagation()}>
          <DragHandle id={module._id} />
        </div>

        <div
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
        >
          <ChevronRight
            className={`h-4 w-4 text-[var(--color-text-tertiary)] transition-transform duration-200 flex-shrink-0 ${
              expanded ? "rotate-90" : ""
            }`}
          />
          <div className="flex-1 min-w-0">
            <h3 className="heading-md text-[var(--color-text-primary)] truncate">{module.title}</h3>
            <p className="body-sm text-[var(--color-text-tertiary)]">
              {subModules.length} submodule{subModules.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ProgressBar value={progress} size="compact" showLabel className="w-28" />
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown
              trigger={
                <button className="p-1 rounded text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              }
            >
              <DropdownItem icon={<Pencil className="h-4 w-4" />} onClick={() => onEdit?.(module)}>
                Edit
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem icon={<Trash2 className="h-4 w-4" />} danger onClick={() => onDelete?.(module)}>
                Delete
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[var(--color-border)] px-4 py-3">
          {subModules.length > 0 ? (
            <div className="ml-4 space-y-2">
              {subModules.map((sm) => (
                <SubModuleCard key={sm._id} subModule={sm} onDelete={onDeleteSubModule} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<List className="h-10 w-10" />}
              headline="No submodules"
              description="Add submodules to track specific tasks."
              action={
                <Button variant="ghost" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowAddSubModule(true)}>
                  Add SubModule
                </Button>
              }
            />
          )}
          <div className="ml-4 mt-3">
            <Button variant="ghost" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowAddSubModule(true)}>
              Add SubModule
            </Button>
          </div>
        </div>
      )}

      <SubModuleForm
        open={showAddSubModule}
        onClose={() => setShowAddSubModule(false)}
        moduleId={module._id}
      />
    </div>
  );
}
