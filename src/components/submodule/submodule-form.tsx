"use client";

import { useState, useEffect } from "react";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useCreateSubModule } from "@/hooks/use-submodules";

interface SubModuleFormProps {
  open: boolean;
  onClose: () => void;
  moduleId: string;
}

export function SubModuleForm({ open, onClose, moduleId }: SubModuleFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState("");
  const { toast } = useToast();
  const createSubModule = useCreateSubModule(moduleId);

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setTitleError("");
    }
  }, [open]);

  async function handleSubmit() {
    if (!title.trim()) {
      setTitleError("Title is required");
      return;
    }
    try {
      await createSubModule.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      toast("Submodule added", "success");
      onClose();
    } catch (e) {
      toast(String((e as Error).message), "error");
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>Add SubModule</DialogHeader>
      <DialogBody>
        <div className="flex flex-col gap-4">
          <Input
            label="Title"
            placeholder="e.g., Gather Documents"
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
        <Button onClick={handleSubmit}>Add SubModule</Button>
      </DialogFooter>
    </Dialog>
  );
}
