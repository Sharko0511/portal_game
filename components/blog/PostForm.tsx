"use client";

import { useState } from "react";
import BlockEditor, { BlocksDoc } from "./BlockEditor";
import ImageUpload from "./ImageUpload";

export interface PostFormValues {
  title: string;
  content: Record<string, unknown>;
  cover_image_url: string | null;
  published: boolean;
}

interface PostFormProps {
  initialValues?: Partial<PostFormValues>;
  onSubmit: (values: PostFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  loading?: boolean;
}

function makeEmptyDoc(): BlocksDoc {
  return {
    type: "blocks",
    blocks: [{ id: Math.random().toString(36).slice(2), type: "text", content: { type: "doc", content: [{ type: "paragraph" }] } }],
  };
}

function toBlocksDoc(content: Record<string, unknown> | undefined): BlocksDoc {
  if (!content) return makeEmptyDoc();
  if (content.type === "blocks") return content as unknown as BlocksDoc;
  // Legacy TipTap doc — wrap as single text block
  return {
    type: "blocks",
    blocks: [{ id: Math.random().toString(36).slice(2), type: "text", content }],
  };
}

export default function PostForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Publish",
  loading = false,
}: PostFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [doc, setDoc] = useState<BlocksDoc>(() => toBlocksDoc(initialValues?.content));
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(initialValues?.cover_image_url ?? null);
  const [published, setPublished] = useState(initialValues?.published ?? true);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) { setError("Title is required."); return; }

    const hasContent = doc.blocks.some((b) => {
      if (b.type === "image") return true;
      const nodes = (b.content as { content?: unknown[] }).content ?? [];
      return nodes.some((n: unknown) => (n as { content?: unknown[] }).content?.length);
    });

    if (!hasContent) { setError("Post content cannot be empty."); return; }

    try {
      await onSubmit({
        title: title.trim(),
        content: doc as unknown as Record<string, unknown>,
        cover_image_url: coverImageUrl,
        published,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter post title..."
          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-lg font-semibold text-foreground outline-none placeholder:text-muted-foreground focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
        />
      </div>

      {/* Cover image */}
      <ImageUpload label="Cover Image (optional)" onUpload={setCoverImageUrl} />

      {/* Block editor */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Content</label>
        <p className="mb-3 text-xs text-muted-foreground">
          Mix text and image blocks freely. Use the <strong>+ Text block</strong> / <strong>+ Image block</strong> buttons between blocks to add more.
        </p>
        <BlockEditor value={doc} onChange={setDoc} />
      </div>

      {/* Published toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPublished((p) => !p)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${published ? "bg-accent" : "bg-gray-200"}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${published ? "translate-x-6" : "translate-x-1"}`} />
        </button>
        <span className="text-sm text-foreground">
          {published ? "Published — visible to followers" : "Draft — only visible to you"}
        </span>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <button type="submit" disabled={loading}
          className="rounded-full bg-accent px-6 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/85 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={loading}
            className="rounded-full border border-border px-6 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
