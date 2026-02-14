"use client";

import { useEffect, useCallback, useState } from "react";
import { ArrowLeft, MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSubModules } from "@/hooks/use-submodules";
import { useChecklist, useCreateChecklistItem, useUpdateChecklistItem, useDeleteChecklistItem, useReorderChecklist } from "@/hooks/use-checklist";
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from "@/hooks/use-notes";
import { useFiles, useDeleteFile, useDownloadFile } from "@/hooks/use-files";
import { useUpdateSubModule, useDeleteSubModule } from "@/hooks/use-submodules";
import { useToast } from "@/components/ui/toast";
import { StatusBadge } from "./status-badge";
import { ChecklistList } from "@/components/checklist/checklist-list";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";
import { DatePicker } from "@/components/ui/date-picker";
import { NoteList } from "@/components/notes/note-list";
import { FileList } from "@/components/files/file-list";

export function SubModuleDetailPanel() {
  const { activePanel, closePanel } = useUIStore();
  const { toast } = useToast();
  const { data: subModules = [] } = useSubModules(activePanel?.moduleId ?? null);
  const subModule = activePanel ? subModules.find((s) => s._id === activePanel.subModuleId) : null;
  const { data: checklistItems = [] } = useChecklist(activePanel?.subModuleId ?? null);
  const { data: notes = [] } = useNotes("submodule", activePanel?.subModuleId ?? null);
  const { data: files = [] } = useFiles(activePanel?.subModuleId ?? null);
  const createChecklist = useCreateChecklistItem(activePanel?.subModuleId ?? null);
  const updateChecklist = useUpdateChecklistItem();
  const deleteChecklist = useDeleteChecklistItem();
  const reorderChecklist = useReorderChecklist();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const deleteFile = useDeleteFile();
  const downloadFile = useDownloadFile();
  const updateSubModule = useUpdateSubModule(activePanel?.subModuleId ?? null);
  const deleteSubModule = useDeleteSubModule(activePanel?.subModuleId ?? null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    },
    [closePanel]
  );

  useEffect(() => {
    if (activePanel) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [activePanel, handleKeyDown]);

  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editTitle, setEditTitle] = useState(subModule?.title ?? "");
  const [editDescription, setEditDescription] = useState(subModule?.description ?? "");

  useEffect(() => {
    if (subModule) {
      setEditTitle(subModule.title);
      setEditDescription(subModule.description ?? "");
    }
  }, [subModule?._id, subModule?.title, subModule?.description]);

  async function handleSaveDetails() {
    if (!subModule) return;
    try {
      await updateSubModule.mutateAsync({
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      });
      toast("Submodule updated", "success");
      setIsEditingDetails(false);
    } catch (e) {
      toast(String((e as Error).message), "error");
    }
  }

  if (!activePanel) return null;
  if (!subModule) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={closePanel}
      />
      <div className="fixed right-0 top-0 bottom-0 z-45 w-full sm:max-w-[480px] lg:max-w-[560px] bg-[var(--color-bg)] border-l border-[var(--color-border)] overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="sticky top-0 bg-[var(--color-bg)] border-b border-[var(--color-border)] px-5 py-3 flex items-center gap-3 z-10">
          <button
            onClick={closePanel}
            className="p-1 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="heading-lg text-[var(--color-text-primary)] flex-1 truncate">
            {subModule.title}
          </h2>
          <Dropdown
            trigger={
              <button className="p-1 rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            }
          >
            <DropdownItem
              icon={<Pencil className="h-4 w-4" />}
              onClick={() => setIsEditingDetails(true)}
            >
              Edit details
            </DropdownItem>
            <DropdownItem
              icon={<Trash2 className="h-4 w-4" />}
              danger
              onClick={async () => {
                try {
                  await deleteSubModule.mutateAsync();
                  closePanel();
                  toast("SubModule deleted", "success");
                } catch (e) {
                  toast(String((e as Error).message), "error");
                }
              }}
            >
              Delete SubModule
            </DropdownItem>
          </Dropdown>
        </div>

        <div className="p-5 space-y-6">
          {isEditingDetails ? (
            <div className="space-y-4">
              <Input
                label="Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Submodule title"
              />
              <Textarea
                label="Description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveDetails}>
                  Save
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setIsEditingDetails(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              {subModule.description && (
                <p className="body-text text-[var(--color-text-secondary)]">{subModule.description}</p>
              )}
            </>
          )}

          <div className="h-px bg-[var(--color-border)]" />

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="body-sm text-[var(--color-text-secondary)]">Status:</span>
              <StatusBadge
                status={subModule.status}
                onStatusChange={(status) =>
                  updateSubModule.mutate({ status })
                }
              />
            </div>
            <DatePicker
              value={subModule.dueDate}
              onChange={(dateStr) =>
                updateSubModule.mutate({ dueDate: dateStr ?? undefined })
              }
            />
          </div>

          <div className="h-px bg-[var(--color-border)]" />

          <ChecklistList
            items={checklistItems}
            subModuleId={activePanel.subModuleId}
            onToggle={async (id) => {
              const item = checklistItems.find((i) => i._id === id);
              if (!item) return;
              try {
                await updateChecklist.mutateAsync({ id, isCompleted: !item.isCompleted });
              } catch (e) {
                toast(String((e as Error).message), "error");
              }
            }}
            onAdd={async (title) => {
              try {
                await createChecklist.mutateAsync({ title });
              } catch (e) {
                toast(String((e as Error).message), "error");
              }
            }}
            onDelete={async (id) => {
              try {
                await deleteChecklist.mutateAsync(id as string);
              } catch (e) {
                toast(String((e as Error).message), "error");
              }
            }}
            onReorder={async (ids) => {
              try {
                await reorderChecklist.mutateAsync(ids);
              } catch (e) {
                toast(String((e as Error).message), "error");
              }
            }}
          />

          <div className="h-px bg-[var(--color-border)]" />

          <NoteList
            notes={notes}
            entityType="submodule"
            entityId={subModule._id}
            roadmapId={activePanel.roadmapId}
            onSave={async (id, html) => {
              try {
                await updateNote.mutateAsync({ id: id as string, content: html });
              } catch (e) {
                toast(String((e as Error).message), "error");
              }
            }}
            onAdd={async (html) => {
              try {
                await createNote.mutateAsync({
                  entityType: "submodule",
                  entityId: subModule._id,
                  roadmapId: activePanel.roadmapId,
                  content: html,
                });
              } catch (e) {
                toast(String((e as Error).message), "error");
              }
            }}
            onDelete={async (id) => {
              try {
                await deleteNote.mutateAsync(id as string);
              } catch (e) {
                toast(String((e as Error).message), "error");
              }
            }}
          />

          <div className="h-px bg-[var(--color-border)]" />

          <FileList
            files={files}
            subModuleId={activePanel.subModuleId}
            roadmapId={activePanel.roadmapId}
            onDelete={async (id) => {
              try {
                await deleteFile.mutateAsync(id as string);
                toast("File removed", "success");
              } catch (e) {
                toast(String((e as Error).message), "error");
              }
            }}
            onDownload={async (file) => {
              try {
                const { downloadUrl } = await downloadFile.mutateAsync(file._id as string);
                window.open(downloadUrl, "_blank");
              } catch (e) {
                toast(String((e as Error).message), "error");
              }
            }}
          />
        </div>
      </div>
    </>
  );
}
