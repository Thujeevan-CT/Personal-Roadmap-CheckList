"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoteEditorProps {
  content?: string;
  onSave: (html: string) => void;
  onCancel: () => void;
}

function ToolbarButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded transition-colors cursor-pointer ${
        active
          ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
      }`}
    >
      {children}
    </button>
  );
}

export function NoteEditor({ content = "", onSave, onCancel }: NoteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Write your notes here..." }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[120px] max-h-[400px] overflow-y-auto p-3 outline-none text-[var(--color-text-primary)] [&_h1]:heading-xl [&_h2]:heading-lg [&_h3]:heading-md [&_p]:body-text [&_a]:text-[var(--color-primary)] [&_a]:underline [&_blockquote]:border-l-3 [&_blockquote]:border-[var(--color-primary)] [&_blockquote]:pl-3 [&_blockquote]:text-[var(--color-text-secondary)] [&_code]:bg-[var(--color-surface)] [&_code]:px-1 [&_code]:rounded [&_pre]:bg-[var(--color-surface)] [&_pre]:p-3 [&_pre]:rounded-[6px]",
      },
    },
  });

  if (!editor) return null;

  function handleAddLink() {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  }

  return (
    <div className="border border-[var(--color-border)] rounded-[6px] overflow-hidden">
      <div className="flex items-center gap-0.5 px-2 h-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex-wrap">
        <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <div className="w-px h-5 bg-[var(--color-border)] mx-1" />
        <ToolbarButton active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <div className="w-px h-5 bg-[var(--color-border)] mx-1" />
        <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <div className="w-px h-5 bg-[var(--color-border)] mx-1" />
        <ToolbarButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("link")} onClick={handleAddLink}>
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
      <div className="flex items-center justify-end gap-2 px-3 py-2 border-t border-[var(--color-border)]">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={() => onSave(editor.getHTML())}>
          Save
        </Button>
      </div>
    </div>
  );
}
