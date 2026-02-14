"use client";

import { useState } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Archive,
  Trash2,
  ExternalLink,
  Layers,
} from "lucide-react";
import type { Module, SubModule } from "@/types";
import { useRoadmap, useDeleteRoadmap, useUpdateRoadmap } from "@/hooks/use-roadmaps";
import { useDeleteModule } from "@/hooks/use-modules";
import { useDeleteSubModule } from "@/hooks/use-submodules";
import { useUIStore } from "@/stores/ui-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";
import { EmptyState } from "@/components/ui/empty-state";
import { ViewToggle } from "@/components/roadmap/view-toggle";
import { RoadmapForm } from "@/components/roadmap/roadmap-form";
import { ModuleList } from "@/components/module/module-list";
import { ModuleForm } from "@/components/module/module-form";
import { FlowCanvas } from "@/components/visual/flow-canvas";
import { SubModuleDetailPanel } from "@/components/submodule/submodule-detail";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

const statusLabel: Record<string, string> = {
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

export default function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ roadmapId: string }>;
}) {
  const { roadmapId } = use(params);
  const router = useRouter();
  const { data, isLoading, error } = useRoadmap(roadmapId);
  const [viewMode, setViewMode] = useState<"list" | "visual">("list");
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddModule, setShowAddModule] = useState(false);
  const [moduleToEdit, setModuleToEdit] = useState<(Module & { submodules?: SubModule[]; progress?: number }) | null>(null);
  const [moduleToDelete, setModuleToDelete] = useState<(Module & { submodules?: SubModule[]; progress?: number }) | null>(null);
  const [subModuleToDelete, setSubModuleToDelete] = useState<(SubModule & { progress?: number }) | null>(null);
  const deleteRoadmap = useDeleteRoadmap();
  const deleteModule = useDeleteModule(moduleToDelete?._id ?? null);
  const deleteSubModule = useDeleteSubModule(subModuleToDelete?._id ?? null);
  const closePanel = useUIStore((s) => s.closePanel);
  const activePanel = useUIStore((s) => s.activePanel);
  const updateRoadmap = useUpdateRoadmap(roadmapId);
  const { toast } = useToast();

  async function handleConfirmDelete() {
    try {
      await deleteRoadmap.mutateAsync(roadmapId);
      toast("Roadmap deleted", "success");
      router.push("/dashboard");
    } catch (e) {
      toast(String((e as Error).message), "error");
    } finally {
      setShowDeleteConfirm(false);
    }
  }

  async function handleArchive(status: "active" | "archived") {
    try {
      await updateRoadmap.mutateAsync({ status });
      toast(status === "archived" ? "Roadmap archived" : "Roadmap unarchived", "success");
    } catch (e) {
      toast(String((e as Error).message), "error");
    }
  }

  async function handleConfirmDeleteModule() {
    if (!moduleToDelete) return;
    try {
      await deleteModule.mutateAsync();
      toast("Module deleted", "success");
      setModuleToDelete(null);
    } catch (e) {
      toast(String((e as Error).message), "error");
    }
  }

  async function handleConfirmDeleteSubModule() {
    if (!subModuleToDelete) return;
    try {
      await deleteSubModule.mutateAsync();
      if (activePanel?.subModuleId === subModuleToDelete._id) closePanel();
      toast("Submodule deleted", "success");
      setSubModuleToDelete(null);
    } catch (e) {
      toast(String((e as Error).message), "error");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  if (error || !data) return notFound();
  const { roadmap, modules } = data;
  const progress = (roadmap as { progress?: number }).progress ?? 0;

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{roadmap.icon || "📋"}</span>
            <div>
              <h1 className="heading-xl text-[var(--color-text-primary)]">{roadmap.title}</h1>
              {roadmap.description && (
                <p className="body-text text-[var(--color-text-secondary)] mt-0.5">
                  {roadmap.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={roadmap.status}>{statusLabel[roadmap.status]}</Badge>
            <Dropdown
              trigger={
                <button className="p-1.5 rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              }
            >
              <DropdownItem
                icon={<Pencil className="h-4 w-4" />}
                onClick={() => setShowEdit(true)}
              >
                Edit Details
              </DropdownItem>
              {roadmap.status === "archived" ? (
                <DropdownItem icon={<Archive className="h-4 w-4" />} onClick={() => handleArchive("active")}>
                  Unarchive
                </DropdownItem>
              ) : (
                <DropdownItem icon={<Archive className="h-4 w-4" />} onClick={() => handleArchive("archived")}>
                  Archive
                </DropdownItem>
              )}
              <DropdownSeparator />
              <DropdownItem
                icon={<Trash2 className="h-4 w-4" />}
                danger
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Roadmap
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <ProgressBar value={progress} showLabel className="max-w-xs" />
          <span className="body-sm text-[var(--color-text-tertiary)]">
            {modules.length} module{modules.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ViewToggle value={viewMode} onChange={setViewMode} />
            {viewMode === "visual" && (
              <a href={`/roadmap/${roadmap._id}/editor`}>
                <Button variant="ghost" size="sm" icon={<ExternalLink className="h-4 w-4" />}>
                  <span className="hidden sm:inline">Open Editor</span>
                </Button>
              </a>
            )}
          </div>
          {viewMode === "list" && (
            <Button variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowAddModule(true)}>
              Add Module
            </Button>
          )}
        </div>
      </div>

      <div className="h-px bg-[var(--color-border)] mb-6" />

      {viewMode === "list" ? (
        modules.length > 0 ? (
          <ModuleList
            modules={modules}
            roadmapId={roadmapId}
            onEditModule={setModuleToEdit}
            onDeleteModule={setModuleToDelete}
            onDeleteSubModule={setSubModuleToDelete}
          />
        ) : (
          <EmptyState
            icon={<Layers className="h-12 w-12" />}
            headline="No modules"
            description="Break your roadmap into modules to organize your plan."
            action={
                <Button variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={() => setShowAddModule(true)}>
                  Add Module
                </Button>
              }
          />
        )
      ) : (
        <div className="h-[calc(100vh-320px)] min-h-[500px]">
          <FlowCanvas roadmap={roadmap} modules={modules} />
        </div>
      )}

      <SubModuleDetailPanel />

      <RoadmapForm
        open={showEdit}
        onClose={() => setShowEdit(false)}
        mode="edit"
        roadmapId={roadmap._id}
        initialData={{
          icon: roadmap.icon,
          title: roadmap.title,
          description: roadmap.description,
        }}
      />

      <ModuleForm
        open={showAddModule}
        onClose={() => setShowAddModule(false)}
        mode="create"
        roadmapId={roadmapId}
      />
      <ModuleForm
        open={!!moduleToEdit}
        onClose={() => setModuleToEdit(null)}
        mode="edit"
        moduleId={moduleToEdit?._id}
        initialData={{
          title: moduleToEdit?.title ?? "",
          description: moduleToEdit?.description ?? "",
        }}
      />

      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <DialogHeader onClose={() => setShowDeleteConfirm(false)}>Delete roadmap?</DialogHeader>
        <DialogBody>
          <p className="body-text text-[var(--color-text-secondary)]">
            This will permanently delete <strong className="text-[var(--color-text-primary)]">{roadmap.title}</strong> and
            all its modules, submodules, checklist items, notes, and files. This cannot be undone.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={!!moduleToDelete} onClose={() => setModuleToDelete(null)}>
        <DialogHeader onClose={() => setModuleToDelete(null)}>Delete module?</DialogHeader>
        <DialogBody>
          <p className="body-text text-[var(--color-text-secondary)]">
            This will permanently delete <strong className="text-[var(--color-text-primary)]">{moduleToDelete?.title}</strong> and
            all its submodules, checklist items, notes, and files. This cannot be undone.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setModuleToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDeleteModule}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={!!subModuleToDelete} onClose={() => setSubModuleToDelete(null)}>
        <DialogHeader onClose={() => setSubModuleToDelete(null)}>Delete submodule?</DialogHeader>
        <DialogBody>
          <p className="body-text text-[var(--color-text-secondary)]">
            This will permanently delete <strong className="text-[var(--color-text-primary)]">{subModuleToDelete?.title}</strong> and
            its checklist items, notes, and files. This cannot be undone.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setSubModuleToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDeleteSubModule}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
