"use client";

import { useRef, useState, useCallback, useEffect, DragEvent } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import {
  Details,
  DetailsContent,
  DetailsSummary,
} from "@tiptap/extension-details";
import { Tooltip } from "./extensions/Tooltip";
import { CustomDetailsSummary } from "./extensions/CustomDetailsSummary";
import { useAuth } from "@/hooks/useAuth";

// ── Block types ──────────────────────────────────────────

export type TextBlock = {
  id: string;
  type: "text";
  content: Record<string, unknown>;
};
export type ImageBlock = {
  id: string;
  type: "image";
  url: string;
  caption?: string;
};
export type Block = TextBlock | ImageBlock;

export interface BlocksDoc {
  type: "blocks";
  blocks: Block[];
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function emptyTextBlock(): TextBlock {
  return {
    id: uid(),
    type: "text",
    content: { type: "doc", content: [{ type: "paragraph" }] },
  };
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
      className={`cursor-pointer rounded px-1.5 py-1 text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

// ── Single text block (its own TipTap instance) ──────────

function TextBlockEditor({
  block,
  onChange,
  onDelete,
  showDelete,
}: {
  block: TextBlock;
  onChange: (content: Record<string, unknown>) => void;
  onDelete: () => void;
  showDelete: boolean;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Write here..." }),
      Details.configure({
        persist: true,
        HTMLAttributes: {
          class: "details",
        },
        renderToggleButton: ({ element, isOpen }) => {
          element.className = "details-toggle-btn";
          element.setAttribute(
            "aria-label",
            isOpen ? "Collapse details content" : "Expand details content",
          );
          element.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          `;
        },
      }),
      CustomDetailsSummary,
      DetailsContent,
      Tooltip,
    ],
    content: block.content,
    onUpdate({ editor }) {
      onChange(editor.getJSON() as Record<string, unknown>);
    },
  });

  if (!editor) return null;

  return (
    <div className="group relative rounded-xl border border-border bg-white">
      {/* Mini toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5">
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
        <div className="mx-1 h-4 w-px bg-gray-200" />
        <ToolbarBtn
          title="H1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          H1
        </ToolbarBtn>
        <ToolbarBtn
          title="H2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </ToolbarBtn>
        <div className="mx-1 h-4 w-px bg-gray-200" />
        <ToolbarBtn
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •≡
        </ToolbarBtn>
        <ToolbarBtn
          title="Ordered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1≡
        </ToolbarBtn>
        <div className="mx-1 h-4 w-px bg-gray-200" />
        <ToolbarBtn
          title="Blockquote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          ❝
        </ToolbarBtn>
        <ToolbarBtn
          title="Code block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          {"{ }"}
        </ToolbarBtn>
        <ToolbarBtn
          title="Link"
          active={editor.isActive("link")}
          onClick={() => {
            const url = window.prompt("Enter URL:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
            else editor.chain().focus().unsetLink().run();
          }}
        >
          🔗
        </ToolbarBtn>

        <ToolbarBtn
          title="Add Tooltip"
          active={editor.isActive("tooltip")}
          onClick={() => {
            if (editor.isActive("tooltip")) {
              editor.chain().focus().unsetTooltip().run();
            } else {
              const text = window.prompt("Enter tooltip explanation:");
              if (text) {
                editor.chain().focus().setTooltip(text).run();
              }
            }
          }}
        >
          💬
        </ToolbarBtn>

        <ToolbarBtn
          title="Collapsible"
          active={editor.isActive("details")}
          onClick={() => {
            if (editor.isActive("details")) {
              editor.chain().focus().unsetDetails().run();
            } else {
              editor.chain().focus().setDetails().run();
            }
          }}
        >
          ↕
        </ToolbarBtn>

        {/* Delete block button */}
        {showDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="ml-auto rounded px-2 py-1 text-xs text-muted-foreground hover:bg-red-50 hover:text-red-500"
            title="Remove this text block"
          >
            ✕
          </button>
        )}
      </div>

      <EditorContent
        editor={editor}
        className="prose prose-gray max-w-none px-4 py-3 text-foreground text-sm
          [&_.ProseMirror]:min-h-16 [&_.ProseMirror]:outline-none"
      />
    </div>
  );
}

// ── Single image block ───────────────────────────────────

function ImageBlockEditor({
  block,
  onChange,
  onDelete,
  userId,
}: {
  block: ImageBlock;
  onChange: (updates: Partial<ImageBlock>) => void;
  onDelete: () => void;
  userId: string | undefined;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function uploadFile(file: File) {
    if (!userId) return;
    const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!ALLOWED.includes(file.type)) {
      alert("Only JPEG, PNG, WebP, GIF allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB.");
      return;
    }

    setUploading(true);
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      const ext = file.name.split(".").pop();
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("post-images")
        .upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("post-images").getPublicUrl(path);
      onChange({ url: data.publicUrl });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div className="group relative rounded-xl border border-border bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Image Block
        </span>
        <button
          type="button"
          onClick={onDelete}
          className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-red-50 hover:text-red-500"
          title="Remove image block"
        >
          ✕
        </button>
      </div>

      {block.url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.url}
            alt={block.caption ?? ""}
            className="w-full rounded-lg object-cover max-h-96"
          />
          <input
            type="text"
            value={block.caption ?? ""}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="Add caption (optional)..."
            className="mt-2 w-full rounded-lg border border-border bg-gray-50 px-3 py-1.5 text-xs text-muted-foreground outline-none focus:border-gray-300 placeholder:text-muted-foreground"
          />
        </>
      ) : (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f);
            }}
          />
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-10 transition-colors
              ${dragOver ? "border-blue-400 bg-blue-50" : "border-border bg-gray-50 hover:border-gray-400 hover:bg-gray-100"}`}
          >
            {uploading ? (
              <p className="text-sm text-muted-foreground">Uploading...</p>
            ) : (
              <>
                <span className="text-3xl">🖼️</span>
                <p className="text-sm font-medium text-muted-foreground">
                  Click or drag to upload
                </p>
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG, WebP, GIF — max 5MB
                </p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Add-block button row ─────────────────────────────────

function AddBlockRow({
  onAddText,
  onAddImage,
  uploading,
}: {
  onAddText: () => void;
  onAddImage: () => void;
  uploading: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-px bg-gray-100" />
      <button
        type="button"
        onClick={onAddText}
        className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-gray-50 hover:text-foreground transition-colors"
      >
        + Text block
      </button>
      <button
        type="button"
        onClick={onAddImage}
        disabled={uploading}
        className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-gray-50 hover:text-foreground transition-colors disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "+ Image block"}
      </button>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

// ── Read-only block renderer ─────────────────────────────

function ReadOnlyTextBlock({ content }: { content: Record<string, unknown> }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: true }),
      Details.configure({
        HTMLAttributes: {
          class: "details",
        },
      }),
      CustomDetailsSummary,
      DetailsContent,
      Tooltip,
    ],
    content,
    editable: false,
  });

  // Add click handler for summary in readonly mode
  useEffect(() => {
    if (!editor) return;

    const handleSummaryClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const summary = target.closest(".details summary");
      if (!summary) return;

      const details = summary.closest(".details");
      if (!details) return;

      // Toggle the details node
      const isOpen = details.classList.contains("is-open");

      if (isOpen) {
        details.classList.remove("is-open");
        const content = details.querySelector('[data-type="detailsContent"]');
        if (content) content.setAttribute("hidden", "true");
      } else {
        details.classList.add("is-open");
        const content = details.querySelector('[data-type="detailsContent"]');
        if (content) content.removeAttribute("hidden");
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener("click", handleSummaryClick);

    return () => {
      editorElement.removeEventListener("click", handleSummaryClick);
    };
  }, [editor]);

  if (!editor) return null;
  return (
    <div className="prose prose-gray max-w-none text-foreground readonly-view">
      <EditorContent editor={editor} />
    </div>
  );
}

export function BlocksRenderer({ doc }: { doc: BlocksDoc }) {
  return (
    <div className="space-y-6">
      {doc.blocks.map((block) => (
        <div key={block.id}>
          {block.type === "text" && (
            <ReadOnlyTextBlock content={block.content} />
          )}
          {block.type === "image" && (
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={block.url}
                alt={block.caption ?? ""}
                className="w-full rounded-xl"
              />
              {block.caption && (
                <figcaption className="mt-2 text-center text-sm text-muted-foreground">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main BlockEditor ─────────────────────────────────────

interface BlockEditorProps {
  value: BlocksDoc;
  onChange: (doc: BlocksDoc) => void;
}

export default function BlockEditor({ value, onChange }: BlockEditorProps) {
  const { user } = useAuth();
  const blocks = value.blocks;

  const update = useCallback(
    (newBlocks: Block[]) => {
      onChange({ type: "blocks", blocks: newBlocks });
    },
    [onChange],
  );

  function updateBlock(id: string, patch: Partial<Block>) {
    update(
      blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)),
    );
  }

  function deleteBlock(id: string) {
    const next = blocks.filter((b) => b.id !== id);
    update(next.length === 0 ? [emptyTextBlock()] : next);
  }

  function addTextAfter(afterIndex: number) {
    const newBlocks = [...blocks];
    newBlocks.splice(afterIndex + 1, 0, emptyTextBlock());
    update(newBlocks);
  }

  function addImageAfter(afterIndex: number) {
    const imageBlock: ImageBlock = { id: uid(), type: "image", url: "" };
    const newBlocks = [...blocks];
    newBlocks.splice(afterIndex + 1, 0, imageBlock);
    update(newBlocks);
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => (
        <div key={block.id} className="space-y-3">
          {block.type === "text" && (
            <TextBlockEditor
              block={block}
              onChange={(content) => updateBlock(block.id, { content })}
              onDelete={() => deleteBlock(block.id)}
              showDelete={blocks.length > 1}
            />
          )}
          {block.type === "image" && (
            <ImageBlockEditor
              block={block}
              onChange={(patch) => updateBlock(block.id, patch)}
              onDelete={() => deleteBlock(block.id)}
              userId={user?.id}
            />
          )}
          {/* Add-block row after each block */}
          <AddBlockRow
            onAddText={() => addTextAfter(i)}
            onAddImage={() => addImageAfter(i)}
            uploading={false}
          />
        </div>
      ))}
    </div>
  );
}
