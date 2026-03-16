"use client";

import { useState } from "react";
import BlockEditor, { BlocksDoc } from "./BlockEditor";
import ImageUpload from "./ImageUpload";
import { PostCategory, PostLevel, PlayerFeedback } from "@/hooks/blog/usePost";

export interface PostFormValues {
  title: string;
  content: Record<string, unknown>;
  cover_image_url: string | null;
  cover_image_caption: string | null;
  published: boolean;
  category: PostCategory;
  level: PostLevel | null;
  audio_url: string | null;
  reading_time: number;
  tags: string[];
  word_count: number;
  event_encounters: number;
  cards_count: number;
  feedback_intro: string | null;
  player_feedback: PlayerFeedback[];
}

interface PostFormProps {
  initialValues?: Partial<PostFormValues>;
  onSubmit: (values: PostFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  loading?: boolean;
  isAdmin?: boolean;
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
  return {
    type: "blocks",
    blocks: [{ id: Math.random().toString(36).slice(2), type: "text", content }],
  };
}

const LEVEL_LABELS: Record<PostLevel, string> = {
  A1: "A1 - Beginner",
  A2: "A2 - Elementary",
  B1: "B1 - Intermediate",
  B2: "B2 - Upper Intermediate",
  C1: "C1 - Advanced",
  C2: "C2 - Proficiency",
};

export default function PostForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Publish",
  loading = false,
  isAdmin = false,
}: PostFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [doc, setDoc] = useState<BlocksDoc>(() => toBlocksDoc(initialValues?.content));
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(initialValues?.cover_image_url ?? null);
  const [coverImageCaption, setCoverImageCaption] = useState(initialValues?.cover_image_caption ?? "");
  const [published, setPublished] = useState(initialValues?.published ?? true);
  const [error, setError] = useState<string | null>(null);

  // Admin-only fields
  const [category, setCategory] = useState<PostCategory>(initialValues?.category ?? "blog");
  const [level, setLevel] = useState<PostLevel | "">(initialValues?.level ?? "");
  const [audioUrl, setAudioUrl] = useState(initialValues?.audio_url ?? "");
  const [readingTime, setReadingTime] = useState(initialValues?.reading_time ?? 0);
  const [tagInput, setTagInput] = useState(initialValues?.tags?.join(", ") ?? "");
  const [wordCount, setWordCount] = useState(initialValues?.word_count ?? 0);
  const [eventEncounters, setEventEncounters] = useState(initialValues?.event_encounters ?? 0);
  const [cardsCount, setCardsCount] = useState(initialValues?.cards_count ?? 0);
  const [feedbackIntro, setFeedbackIntro] = useState(initialValues?.feedback_intro ?? "");
  const [playerFeedback, setPlayerFeedback] = useState<PlayerFeedback[]>(
    initialValues?.player_feedback ?? []
  );

  function addFeedback() {
    setPlayerFeedback((prev) => [...prev, { content: "" }]);
  }

  function updateFeedback(index: number, value: string) {
    setPlayerFeedback((prev) => prev.map((f, i) => (i === index ? { content: value } : f)));
  }

  function removeFeedback(index: number) {
    setPlayerFeedback((prev) => prev.filter((_, i) => i !== index));
  }

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

    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await onSubmit({
        title: title.trim(),
        content: doc as unknown as Record<string, unknown>,
        cover_image_url: coverImageUrl,
        cover_image_caption: coverImageCaption.trim() || null,
        published,
        category,
        level: (level as PostLevel) || null,
        audio_url: audioUrl.trim() || null,
        reading_time: readingTime,
        tags,
        word_count: wordCount,
        event_encounters: eventEncounters,
        cards_count: cardsCount,
        feedback_intro: feedbackIntro.trim() || null,
        player_feedback: playerFeedback.filter((f) => f.content.trim()),
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
      <div>
        <ImageUpload label="Cover Image (optional)" onUpload={setCoverImageUrl} />
        {coverImageUrl && (
          <input
            type="text"
            value={coverImageCaption}
            onChange={(e) => setCoverImageCaption(e.target.value)}
            placeholder="Cover image caption (optional)..."
            className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gray-400"
          />
        )}
      </div>

      {/* Block editor */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Content</label>
        <p className="mb-3 text-xs text-muted-foreground">
          Mix text and image blocks freely. Use the <strong>+ Text block</strong> / <strong>+ Image block</strong> buttons between blocks to add more.
        </p>
        <BlockEditor value={doc} onChange={setDoc} />
      </div>

      {/* ── Admin-only fields ──────────────────────────────── */}
      {isAdmin && (
        <div className="space-y-5 rounded-2xl border border-border bg-gray-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Article Settings</p>

          {/* Category + Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PostCategory)}
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-gray-400"
              >
                <option value="blog">Blog</option>
                <option value="baohay">Báo hay</option>
                <option value="audiochat">Audio chat</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">CEFR Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as PostLevel | "")}
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-gray-400"
              >
                <option value="">None</option>
                {(Object.entries(LEVEL_LABELS) as [PostLevel, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Audio URL */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Audio URL</label>
            <input
              type="url"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="https://… (leave blank if no audio)"
              className="w-full rounded-xl border border-border bg-white px-4 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gray-400"
            />
          </div>

          {/* Reading time + Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Reading time (min)</label>
              <input
                type="number" min={0}
                value={readingTime}
                onChange={(e) => setReadingTime(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Word count</label>
              <input
                type="number" min={0}
                value={wordCount}
                onChange={(e) => setWordCount(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Event encounters</label>
              <input
                type="number" min={0}
                value={eventEncounters}
                onChange={(e) => setEventEncounters(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Cards</label>
              <input
                type="number" min={0}
                value={cardsCount}
                onChange={(e) => setCardsCount(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-gray-400"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Tags</label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="case studies, localization, culture (comma-separated)"
              className="w-full rounded-xl border border-border bg-white px-4 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gray-400"
            />
            {/* Preview chips */}
            {tagInput && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tagInput.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                  <span key={tag} className="rounded-full border border-border bg-white px-3 py-0.5 text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Player Feedback */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Feedback intro</label>
            <textarea
              value={feedbackIntro}
              onChange={(e) => setFeedbackIntro(e.target.value)}
              rows={3}
              placeholder="Intro paragraph above the feedback quotes..."
              className="w-full rounded-xl border border-border bg-white px-4 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gray-400 resize-none"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Player feedback quotes</label>
              <button
                type="button"
                onClick={addFeedback}
                className="rounded-full border border-border bg-white px-3 py-1 text-xs text-muted-foreground hover:bg-gray-50"
              >
                + Add quote
              </button>
            </div>
            <div className="space-y-2">
              {playerFeedback.map((fb, i) => (
                <div key={i} className="flex gap-2">
                  <textarea
                    value={fb.content}
                    onChange={(e) => updateFeedback(i, e.target.value)}
                    rows={2}
                    placeholder={`Quote ${i + 1}…`}
                    className="flex-1 rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gray-400 resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeedback(i)}
                    className="self-start rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-red-50 hover:text-red-500"
                  >✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
