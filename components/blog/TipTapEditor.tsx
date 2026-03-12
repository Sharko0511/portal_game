"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";

interface TipTapEditorProps {
  content?: Record<string, unknown>;
  onChange?: (content: Record<string, unknown>) => void;
  placeholder?: string;
  editable?: boolean;
}

// Toolbar button
function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={`rounded px-2 py-1 text-sm transition-colors ${
        active
          ? "bg-[#c8e63d] text-gray-900"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}

export default function TipTapEditor({
  content,
  onChange,
  placeholder = "Write your post...",
  editable = true,
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: content ?? { type: "doc", content: [] },
    editable,
    onUpdate({ editor }) {
      onChange?.(editor.getJSON() as Record<string, unknown>);
    },
  });

  if (!editor) return null;

  // ── Read-only mode ─────────────────────────────────────
  if (!editable) {
    return (
      <div className="prose prose-gray max-w-none text-gray-900">
        <EditorContent editor={editor} />
      </div>
    );
  }

  // ── Editor mode ────────────────────────────────────────
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 px-3 py-2">
        {/* Undo / Redo */}
        <ToolbarBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          ↩
        </ToolbarBtn>
        <ToolbarBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          ↪
        </ToolbarBtn>

        <div className="mx-1 h-5 w-px bg-gray-200" />

        {/* Headings */}
        <ToolbarBtn
          title="Heading 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          H1
        </ToolbarBtn>
        <ToolbarBtn
          title="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarBtn>
        <ToolbarBtn
          title="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarBtn>

        <div className="mx-1 h-5 w-px bg-gray-200" />

        {/* Inline formatting */}
        <ToolbarBtn
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <span className="underline">U</span>
        </ToolbarBtn>
        <ToolbarBtn
          title="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <span className="line-through">S</span>
        </ToolbarBtn>
        <ToolbarBtn
          title="Code"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          {"</>"}
        </ToolbarBtn>

        <div className="mx-1 h-5 w-px bg-gray-200" />

        {/* Alignment */}
        <ToolbarBtn
          title="Align Left"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          ≡
        </ToolbarBtn>
        <ToolbarBtn
          title="Align Center"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          ☰
        </ToolbarBtn>
        <ToolbarBtn
          title="Align Right"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          ≡
        </ToolbarBtn>

        <div className="mx-1 h-5 w-px bg-gray-200" />

        {/* Lists */}
        <ToolbarBtn
          title="Bullet List"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •≡
        </ToolbarBtn>
        <ToolbarBtn
          title="Ordered List"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1≡
        </ToolbarBtn>

        <div className="mx-1 h-5 w-px bg-gray-200" />

        {/* Block */}
        <ToolbarBtn
          title="Blockquote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          ❝
        </ToolbarBtn>
        <ToolbarBtn
          title="Code Block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          {"{ }"}
        </ToolbarBtn>
        <ToolbarBtn
          title="Horizontal Rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          —
        </ToolbarBtn>

        <div className="mx-1 h-5 w-px bg-gray-200" />

        {/* Link */}
        <ToolbarBtn
          title="Add Link"
          active={editor.isActive("link")}
          onClick={() => {
            const url = window.prompt("Enter URL:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
            else editor.chain().focus().unsetLink().run();
          }}
        >
          🔗
        </ToolbarBtn>
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="prose prose-gray max-w-none px-5 py-4 text-gray-900 focus:outline-none [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
      />
    </div>
  );
}
