"use client";

import { useState, useEffect } from "react";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useCreateModule, useUpdateModule } from "@/hooks/use-modules";

interface ModuleFormProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  roadmapId?: string;
  moduleId?: string;
  initialData?: { title: string; description?: string };
}

export function ModuleForm({
  open,
  onClose,
  mode,
  roadmapId,
  moduleId,
  initialData,
}: ModuleFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [titleError, setTitleError] = useState("");
  const { toast } = useToast();
  const createModule = useCreateModule(roadmapId ?? null);
  const updateModule = useUpdateModule(moduleId ?? null);

  useEffect(() => {
    if (open) {
      setTitle(initialData?.title ?? "");
      setDescription(initialData?.description ?? "");
      setTitleError("");
    }
  }, [open, initialData]);

  async function handleSubmit() {
    if (!title.trim()) {
      setTitleError("Title is required");
      return;
    }
    if (mode === "create") {
      if (!roadmapId) {
        toast("Missing roadmap", "error");
        return;
      }
      try {
        await createModule.mutateAsync({
          title: title.trim(),
          description: description.trim() || undefined,
        });
        toast("Module created", "success");
        onClose();
      } catch (e) {
        toast(String((e as Error).message), "error");
      }
    } else {
      if (!moduleId) {
        toast("Missing module", "error");
        return;
      }
      try {
        await updateModule.mutateAsync({
          title: title.trim(),
          description: description.trim() || undefined,
        });
        toast("Module updated", "success");
        onClose();
      } catch (e) {
        toast(String((e as Error).message), "error");
      }
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        {mode === "create" ? "Add Module" : "Edit Module"}
      </DialogHeader>
      <DialogBody>
        <div className="flex flex-col gap-4">
          <Input
            label="Title"
            placeholder="e.g., Visa & Immigration"
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
            placeholder="Brief description (optional)"
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
          {mode === "create" ? "Add Module" : "Save Changes"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
