"use client";

import { useState } from "react";
import TipTapEditor from "./TipTapEditor";
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

const EMPTY_DOC: Record<string, unknown> = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export default function PostForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Publish",
  loading = false,
}: PostFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [content, setContent] = useState<Record<string, unknown>>(
    initialValues?.content ?? EMPTY_DOC
  );
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
    initialValues?.cover_image_url ?? null
  );
  const [published, setPublished] = useState(initialValues?.published ?? true);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    const hasContent =
      Array.isArray((content as { content?: unknown[] }).content) &&
      ((content as { content?: unknown[] }).content ?? []).some(
        (node: unknown) =>
          (node as { content?: unknown[] }).content &&
          (node as { content?: unknown[] }).content!.length > 0
      );

    if (!hasContent) {
      setError("Post content cannot be empty.");
      return;
    }

    try {
      await onSubmit({ title: title.trim(), content, cover_image_url: coverImageUrl, published });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-900">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter post title..."
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-lg font-semibold text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
        />
      </div>

      {/* Cover image */}
      <ImageUpload
        label="Cover Image (optional)"
        onUpload={(url) => setCoverImageUrl(url)}
      />

      {/* Content */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-900">Content</label>
        <TipTapEditor
          content={content}
          onChange={setContent}
          placeholder="Write your post..."
        />
      </div>

      {/* Published toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPublished((p) => !p)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            published ? "bg-[#c8e63d]" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              published ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-sm text-gray-700">
          {published ? "Published — visible to followers" : "Draft — only visible to you"}
        </span>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-[#c8e63d] px-6 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-[#c8e63d]/85 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-full border border-gray-200 px-6 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
