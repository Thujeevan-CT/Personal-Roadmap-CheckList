"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, FileText } from "lucide-react";
import type { Note } from "@/types";
import { NoteEditor } from "./note-editor";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getRelativeTime } from "@/lib/utils/date";

interface NoteListProps {
  notes: Note[];
  entityType: string;
  entityId: string;
  roadmapId?: string;
  onSave?: (id: string, html: string) => void | Promise<void>;
  onAdd?: (html: string) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
}

export function NoteList({
  notes: initialNotes,
  entityType,
  entityId,
  roadmapId,
  onSave,
  onAdd,
  onDelete,
}: NoteListProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const notesFromProps = onSave !== undefined ? initialNotes : notes;

  function handleSave(id: string, html: string) {
    if (onSave) {
      void onSave(id, html);
      setEditingId(null);
      return;
    }
    setNotes((prev) =>
      prev.map((n) => (n._id === id ? { ...n, content: html, updatedAt: new Date().toISOString() } : n))
    );
    setEditingId(null);
  }

  function handleAdd(html: string) {
    if (onAdd) {
      void onAdd(html);
      setIsAdding(false);
      return;
    }
    const newNote: Note = {
      _id: `n-new-${Date.now()}`,
      entityType: entityType as Note["entityType"],
      entityId,
      roadmapId: "",
      content: html,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [...prev, newNote]);
    setIsAdding(false);
  }

  function handleDelete(id: string) {
    if (onDelete) {
      void onDelete(id);
      return;
    }
    setNotes((prev) => prev.filter((n) => n._id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="heading-md text-[var(--color-text-primary)]">
          Notes {notesFromProps.length > 0 && `(${notesFromProps.length})`}
        </h4>
        {!isAdding && notesFromProps.length > 0 && (
          <Button variant="ghost" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setIsAdding(true)}>
            Add Note
          </Button>
        )}
      </div>

      {notesFromProps.length === 0 && !isAdding ? (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          headline="No notes yet"
          description="Add notes to document important details."
          action={
            <Button variant="ghost" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setIsAdding(true)}>
              Add Note
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {notesFromProps.map((note) =>
            editingId === note._id ? (
              <NoteEditor
                key={note._id}
                content={note.content}
                onSave={(html) => handleSave(note._id, html)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                key={note._id}
                className="group p-3 rounded-[6px] bg-[var(--color-surface)] border border-[var(--color-border)]"
              >
                <div
                  className="prose prose-sm max-w-none text-sm text-[var(--color-text-primary)] [&_a]:text-[var(--color-primary)] [&_a]:underline [&_blockquote]:border-l-3 [&_blockquote]:border-[var(--color-primary)] [&_blockquote]:pl-3 [&_code]:bg-[var(--color-border)] [&_code]:px-1 [&_code]:rounded"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-border)]">
                  <span className="text-xs text-[var(--color-text-tertiary)]">
                    {getRelativeTime(note.updatedAt)}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingId(note._id)}
                      className="p-1 rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="p-1 rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {isAdding && (
        <div className="mt-2">
          <NoteEditor content="" onSave={handleAdd} onCancel={() => setIsAdding(false)} />
        </div>
      )}
    </div>
  );
}
