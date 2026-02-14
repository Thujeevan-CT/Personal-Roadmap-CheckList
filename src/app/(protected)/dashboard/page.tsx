"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { Roadmap } from "@/types";
import { Plus, Upload, Map /* , FolderPlus */ } from "lucide-react";
import { useRoadmaps, useDeleteRoadmap, useUpdateRoadmap } from "@/hooks/use-roadmaps";
import { useFolders /* , useCreateFolder */ } from "@/hooks/use-folders";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { RoadmapCard } from "@/components/roadmap/roadmap-card";
import { FolderCard } from "@/components/roadmap/folder-card";
import { RoadmapForm } from "@/components/roadmap/roadmap-form";
import { RoadmapImport } from "@/components/roadmap/roadmap-import";
import { ContextMenu } from "@/components/ui/context-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

function DashboardContent() {
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [roadmapToDelete, setRoadmapToDelete] = useState<(Roadmap & { progress?: number }) | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  // New Folder flow (commented for now)
  // const [showCreateFolder, setShowCreateFolder] = useState(false);
  // const [newFolderName, setNewFolderName] = useState("");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; folderId: string | null } | null>(null);
  const [roadmapToMove, setRoadmapToMove] = useState<(Roadmap & { progress?: number }) | null>(null);
  const { data: roadmaps = [], isLoading, error } = useRoadmaps();
  const { data: folders = [] } = useFolders();
  const deleteRoadmap = useDeleteRoadmap();
  const updateRoadmap = useUpdateRoadmap(roadmapToMove?._id ?? "");
  // const createFolder = useCreateFolder();
  const { toast } = useToast();

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get("new") === "1") {
      setShowCreate(true);
    }
  }, [searchParams]);

  async function handleConfirmDelete() {
    if (!roadmapToDelete) return;
    const id = roadmapToDelete._id;
    setRoadmapToDelete(null);
    try {
      await deleteRoadmap.mutateAsync(id);
      toast("Roadmap deleted", "success");
    } catch (e) {
      toast(String((e as Error).message), "error");
    }
  }

  // async function handleCreateFolder() {
  //   if (!newFolderName.trim()) return;
  //   try {
  //     await createFolder.mutateAsync({ name: newFolderName.trim() });
  //     setNewFolderName("");
  //     setShowCreateFolder(false);
  //   } catch (e) {
  //     toast(String((e as Error).message), "error");
  //   }
  // }

  function openContextMenu(x: number, y: number, folderId: string | null) {
    setContextMenu({ x, y, folderId });
  }

  function handleContextNewRoadmap() {
    if (contextMenu?.folderId !== undefined && contextMenu?.folderId !== null) {
      setSelectedFolderId(contextMenu.folderId);
    } else {
      setSelectedFolderId(null);
    }
    setShowCreate(true);
  }

  async function handleMoveToFolder(folderId: string | null) {
    if (!roadmapToMove) return;
    try {
      await updateRoadmap.mutateAsync({ folderId });
      toast("Roadmap moved", "success");
      setRoadmapToMove(null);
    } catch (e) {
      toast(String((e as Error).message), "error");
    }
  }

  const atRoot = selectedFolderId === null;
  const visibleRoadmaps = atRoot
    ? roadmaps.filter((r) => !r.folderId)
    : roadmaps.filter((r) => r.folderId === selectedFolderId);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="heading-xl text-[var(--color-text-primary)]">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Upload className="h-4 w-4" />}
            onClick={() => setShowImport(true)}
          >
            <span className="hidden sm:inline">Import JSON</span>
            <span className="sm:hidden">Import</span>
          </Button>
          {/* New Folder flow (commented for now)
          <Button
            variant="ghost"
            size="sm"
            icon={<FolderPlus className="h-4 w-4" />}
            onClick={() => setShowCreateFolder(true)}
          >
            <span className="hidden sm:inline">New Folder</span>
            <span className="sm:hidden">Folder</span>
          </Button>
          */}
          <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>
            <span className="hidden sm:inline">New Roadmap</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {error && (
        <p className="body-sm text-[var(--color-danger)] mb-4">{String(error.message)}</p>
      )}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[140px] rounded-lg" />
          ))}
        </div>
      ) : visibleRoadmaps.length > 0 || folders.length > 0 || !atRoot ? (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          onContextMenu={(e) => {
            e.preventDefault();
            openContextMenu(e.clientX, e.clientY, selectedFolderId);
          }}
        >
          {!atRoot && (
            <FolderCard
              folder={{ _id: "up", name: "Back to root", order: -1, createdAt: "", updatedAt: "" }}
              onOpen={() => setSelectedFolderId(null)}
              onContextMenu={(e, folderId) => openContextMenu(e.clientX, e.clientY, folderId)}
            />
          )}
          {atRoot &&
            folders.map((f) => (
              <FolderCard
                key={f._id}
                folder={f}
                onOpen={() => setSelectedFolderId(f._id)}
                onContextMenu={(e, folderId) => openContextMenu(e.clientX, e.clientY, folderId)}
              />
            ))}
          {visibleRoadmaps.map((r) => (
            <RoadmapCard
              key={r._id}
              roadmap={r}
              onDelete={(roadmap) => setRoadmapToDelete(roadmap)}
              onMoveToFolder={(roadmap) => setRoadmapToMove(roadmap)}
            />
          ))}
        </div>
      ) : (
        <div
          onContextMenu={(e) => {
            e.preventDefault();
            openContextMenu(e.clientX, e.clientY, selectedFolderId);
          }}
        >
          <EmptyState
            icon={<Map className="h-12 w-12" />}
            headline="No roadmaps yet"
            description="Create your first roadmap or import one from JSON."
            action={
              <div className="flex gap-2">
                <Button onClick={() => setShowCreate(true)} icon={<Plus className="h-4 w-4" />}>
                  Create Roadmap
                </Button>
              </div>
            }
          />
        </div>
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            {
              label: "New Roadmap",
              icon: <Plus className="h-4 w-4" />,
              onClick: handleContextNewRoadmap,
            },
            // New Folder flow (commented for now)
            // {
            //   label: "New Folder",
            //   icon: <FolderPlus className="h-4 w-4" />,
            //   onClick: () => setShowCreateFolder(true),
            // },
          ]}
        />
      )}

      <RoadmapForm
        open={showCreate}
        onClose={() => setShowCreate(false)}
        folderId={selectedFolderId}
      />
      {/* New Folder flow (commented for now)
      <Dialog open={showCreateFolder} onClose={() => setShowCreateFolder(false)}>
        <DialogHeader onClose={() => setShowCreateFolder(false)}>
          New folder
        </DialogHeader>
        <DialogBody>
          <input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className="w-full h-9 px-3 py-1.5 rounded-[6px] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-[var(--color-border-focus)]"
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setShowCreateFolder(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateFolder}>Create</Button>
        </DialogFooter>
      </Dialog>
      */}
      <RoadmapImport open={showImport} onClose={() => setShowImport(false)} />

      <Dialog open={!!roadmapToDelete} onClose={() => setRoadmapToDelete(null)}>
        <DialogHeader onClose={() => setRoadmapToDelete(null)}>Delete roadmap?</DialogHeader>
        <DialogBody>
          <p className="body-text text-[var(--color-text-secondary)]">
            This will permanently delete <strong className="text-[var(--color-text-primary)]">{roadmapToDelete?.title}</strong> and
            all its modules, submodules, checklist items, notes, and files. This cannot be undone.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setRoadmapToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={!!roadmapToMove} onClose={() => setRoadmapToMove(null)}>
        <DialogHeader onClose={() => setRoadmapToMove(null)}>Move to folder</DialogHeader>
        <DialogBody>
          <p className="body-sm text-[var(--color-text-secondary)] mb-3">
            Move <strong className="text-[var(--color-text-primary)]">{roadmapToMove?.title}</strong> to:
          </p>
          <div className="flex flex-col gap-0.5 max-h-[240px] overflow-y-auto">
            <button
              type="button"
              onClick={() => handleMoveToFolder(null)}
              className="text-left px-3 py-2 rounded-[6px] text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
            >
              No folder (root)
            </button>
            {folders.map((f) => (
              <button
                key={f._id}
                type="button"
                onClick={() => handleMoveToFolder(f._id)}
                className="text-left px-3 py-2 rounded-[6px] text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
              >
                {f.name}
              </button>
            ))}
          </div>
        </DialogBody>
      </Dialog>
    </div>
  );
}

function DashboardPageFallback() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <Skeleton className="h-8 w-40" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[140px] rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <DashboardContent />
    </Suspense>
  );
}
