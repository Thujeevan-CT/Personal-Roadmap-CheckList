"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useCreateRoadmap, useUpdateRoadmap } from "@/hooks/use-roadmaps";

const EMOJI_OPTIONS = ["📋", "🗺️", "🚀", "☁️", "📚", "💼", "🎯", "🏠", "💰", "🎓", "✈️", "🇩🇪", "🇺🇸", "🇬🇧", "🇯🇵", "⚡", "🔧", "📱", "🖥️", "🎨", "📊", "🧪", "🏗️", "🌍", "💡", "🔒", "📝", "🎵", "🏋️", "❤️"];

interface RoadmapFormProps {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  roadmapId?: string;
  folderId?: string | null;
  initialData?: { icon?: string; title: string; description?: string };
}

export function RoadmapForm({
  open,
  onClose,
  mode = "create",
  roadmapId,
  folderId,
  initialData,
}: RoadmapFormProps) {
  const [icon, setIcon] = useState(initialData?.icon || "📋");
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [titleError, setTitleError] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const createRoadmap = useCreateRoadmap();
  const updateRoadmap = useUpdateRoadmap(roadmapId ?? null);

  useEffect(() => {
    if (open) {
      setIcon(initialData?.icon || "📋");
      setTitle(initialData?.title || "");
      setDescription(initialData?.description || "");
      setTitleError("");
    }
  }, [open, initialData]);

  async function handleSubmit() {
    if (!title.trim()) {
      setTitleError("Title is required");
      return;
    }
    if (mode === "create") {
      try {
        const created = await createRoadmap.mutateAsync({
          title: title.trim(),
          description: description.trim() || undefined,
          icon: icon || undefined,
          folderId: folderId ?? null,
        });
        toast("Roadmap created successfully", "success");
        onClose();
        router.push(`/roadmap/${created._id}`);
      } catch (e) {
        toast(String((e as Error).message), "error");
      }
    } else {
      if (!roadmapId) {
        toast("Missing roadmap id for edit", "error");
        return;
      }
      try {
        await updateRoadmap.mutateAsync({
          title: title.trim(),
          description: description.trim() || undefined,
          icon: icon || undefined,
        });
        toast("Roadmap updated successfully", "success");
        onClose();
      } catch (e) {
        toast(String((e as Error).message), "error");
      }
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        {mode === "create" ? "Create Roadmap" : "Edit Roadmap"}
      </DialogHeader>
      <DialogBody>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-[var(--color-text-primary)] mb-1.5 block">
              Icon
            </label>
            <div className="relative">
              <button
                onClick={() => setShowEmojis(!showEmojis)}
                className="h-10 w-10 rounded-[6px] border border-[var(--color-border)] flex items-center justify-center text-xl hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
              >
                {icon}
              </button>
              {showEmojis && (
                <div className="absolute top-12 left-0 z-10 p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg grid grid-cols-6 gap-1">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      onClick={() => {
                        setIcon(e);
                        setShowEmojis(false);
                      }}
                      className="h-9 w-9 rounded flex items-center justify-center text-lg hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Input
            label="Title"
            placeholder="e.g., Germany Relocation"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError("");
            }}
            error={titleError}
            autoFocus
          />
          <Textarea
            label="Description"
            placeholder="Brief description of this roadmap..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {mode === "create" ? "Create Roadmap" : "Save Changes"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
