"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/hooks/useAuth";

interface TipTapEditorProps {
  content?: Record<string, unknown>;
  onChange?: (content: Record<string, unknown>) => void;
  placeholder?: string;
  editable?: boolean;
}

// ── Toolbar button ───────────────────────────────────────

function ToolbarBtn({
  onClick,
  active,
  title,
  disabled,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  disabled?: boolean;
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
      disabled={disabled}
      className={`rounded px-2 py-1 text-sm transition-colors disabled:opacity-40 ${
        active
          ? "bg-accent text-gray-900"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}

// ── Main editor ──────────────────────────────────────────

export default function TipTapEditor({
  content,
  onChange,
  placeholder = "Write your post...",
  editable = true,
}: TipTapEditorProps) {
  const { user } = useAuth();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Image.configure({
        inline: false,
        HTMLAttributes: { class: "rounded-xl max-w-full my-4" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: content ?? { type: "doc", content: [] },
    editable,
    onUpdate({ editor }) {
      onChange?.(editor.getJSON() as Record<string, unknown>);
    },
  });

  if (!editor) return null;

  // ── Upload image and insert into editor ──────────────────
  async function handleImageUpload(file: File) {
    if (!user) return;
    const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!ALLOWED.includes(file.type)) return;
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5MB."); return; }

    setUploading(true);
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("post-images").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("post-images").getPublicUrl(path);
      // Insert image node at current cursor position
      editor.chain().focus().setImage({ src: data.publicUrl }).run();
      // Add a paragraph after so the user can keep typing
      editor.chain().focus().createParagraphNear().run();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  // ── Read-only ────────────────────────────────────────────
  if (!editable) {
    return (
      <div className="prose prose-gray max-w-none text-gray-900">
        <EditorContent editor={editor} />
      </div>
    );
  }

  // ── Editor ───────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Hidden file input for image uploads */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
        }}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 px-3 py-2">
        <ToolbarBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}>↩</ToolbarBtn>
        <ToolbarBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}>↪</ToolbarBtn>

        <div className="mx-1 h-5 w-px bg-gray-200" />

        <ToolbarBtn title="Heading 1" active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</ToolbarBtn>
        <ToolbarBtn title="Heading 2" active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarBtn>
        <ToolbarBtn title="Heading 3" active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarBtn>

        <div className="mx-1 h-5 w-px bg-gray-200" />

        <ToolbarBtn title="Bold" active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></ToolbarBtn>
        <ToolbarBtn title="Italic" active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></ToolbarBtn>
        <ToolbarBtn title="Underline" active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}><span className="underline">U</span></ToolbarBtn>
        <ToolbarBtn title="Strikethrough" active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}><span className="line-through">S</span></ToolbarBtn>
        <ToolbarBtn title="Inline Code" active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}>{"</>"}</ToolbarBtn>

        <div className="mx-1 h-5 w-px bg-gray-200" />

        <ToolbarBtn title="Align Left" active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}>≡</ToolbarBtn>
        <ToolbarBtn title="Align Center" active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}>☰</ToolbarBtn>
        <ToolbarBtn title="Align Right" active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}>≡</ToolbarBtn>

        <div className="mx-1 h-5 w-px bg-gray-200" />

        <ToolbarBtn title="Bullet List" active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}>•≡</ToolbarBtn>
        <ToolbarBtn title="Ordered List" active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}>1≡</ToolbarBtn>

        <div className="mx-1 h-5 w-px bg-gray-200" />

        <ToolbarBtn title="Blockquote" active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝</ToolbarBtn>
        <ToolbarBtn title="Code Block" active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}>{"{ }"}</ToolbarBtn>
        <ToolbarBtn title="Divider"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</ToolbarBtn>

        <div className="mx-1 h-5 w-px bg-gray-200" />

        <ToolbarBtn title="Add Link" active={editor.isActive("link")}
          onClick={() => {
            const url = window.prompt("Enter URL:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
            else editor.chain().focus().unsetLink().run();
          }}>🔗</ToolbarBtn>

        {/* ── Image upload button ── */}
        <ToolbarBtn
          title="Insert Image"
          disabled={uploading}
          onClick={() => imageInputRef.current?.click()}
        >
          {uploading ? (
            <span className="text-xs">↑</span>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 8.25A2.25 2.25 0 015.25 6h13.5A2.25 2.25 0 0121 8.25v7.5A2.25 2.25 0 0118.75 18H5.25A2.25 2.25 0 013 15.75V8.25z" />
            </svg>
          )}
        </ToolbarBtn>
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="prose prose-gray max-w-none px-5 py-4 text-gray-900
          [&_.ProseMirror]:min-h-75
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror_img]:rounded-xl
          [&_.ProseMirror_img]:max-w-full
          [&_.ProseMirror_img]:my-4
          [&_.ProseMirror_img]:cursor-default
          [&_.ProseMirror_img.ProseMirror-selectednode]:ring-2
          [&_.ProseMirror_img.ProseMirror-selectednode]:ring-accent
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
      />

      {uploading && (
        <div className="border-t border-gray-100 px-5 py-2 text-xs text-gray-400">
          Uploading image...
        </div>
      )}
    </div>
  );
}
