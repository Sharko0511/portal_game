"use client";

import { useDeferredValue, useState } from "react";
import { ChevronDown } from "lucide-react";
import BlockEditor, { BlocksDoc } from "./BlockEditor";
import ImageUpload from "./ImageUpload";
import {
  PostCategory,
  PostLevel,
  PostVisibility,
  PlayerFeedback,
} from "@/hooks/blog/usePost";
import { useAdminCategorySearch } from "@/hooks/admin/useAdminCategories";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// ── Select built on Radix DropdownMenu (portal = no overflow) ──
interface SelectOption {
  value: string;
  label: string;
}
function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
}) {
  const selected = options.find((o) => o.value === value);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground outline-none transition-colors hover:border-gray-400 data-[state=open]:border-gray-400"
        >
          <span>{selected?.label ?? "—"}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 in-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-(--radix-dropdown-menu-trigger-width) p-1 duration-200 data-[state=open]:slide-in-from-top-1 data-[state=closed]:slide-out-to-top-1"
      >
        {options.map((o) => (
          <DropdownMenuItem
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-lg px-3 py-2 text-sm cursor-pointer ${o.value === value ? "font-semibold text-brand-primary bg-brand-primary/10 focus:bg-brand-primary/10" : ""}`}
          >
            {o.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export interface PostFormValues {
  title: string;
  content: Record<string, unknown>;
  cover_image_url: string | null;
  cover_image_caption: string | null;
  visibility: PostVisibility;
  category: PostCategory;
  categoryIds?: string[];
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
  initialCategoryOptions?: Array<{ id: string; slug: string; name: string }>;
  onSubmit: (values: PostFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  loading?: boolean;
  isAdmin?: boolean;
  /** When admin edits another user's post — locks title, cover image, content */
  readOnlyBase?: boolean;
}

function makeEmptyDoc(): BlocksDoc {
  return {
    type: "blocks",
    blocks: [
      {
        id: Math.random().toString(36).slice(2),
        type: "text",
        content: { type: "doc", content: [{ type: "paragraph" }] },
      },
    ],
  };
}

function toBlocksDoc(content: Record<string, unknown> | undefined): BlocksDoc {
  if (!content) return makeEmptyDoc();
  if (content.type === "blocks") return content as unknown as BlocksDoc;
  return {
    type: "blocks",
    blocks: [
      { id: Math.random().toString(36).slice(2), type: "text", content },
    ],
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
  initialCategoryOptions,
  onSubmit,
  onCancel,
  submitLabel = "Publish",
  loading = false,
  isAdmin = false,
  readOnlyBase = false,
}: PostFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [doc, setDoc] = useState<BlocksDoc>(() =>
    toBlocksDoc(initialValues?.content),
  );
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
    initialValues?.cover_image_url ?? null,
  );
  const [coverImageCaption, setCoverImageCaption] = useState(
    initialValues?.cover_image_caption ?? "",
  );
  const [visibility, setVisibility] = useState<PostVisibility>(
    initialValues?.visibility ?? "private",
  );
  const [error, setError] = useState<string | null>(null);

  // Admin-only fields
  const category: PostCategory = initialValues?.category ?? "blog";
  const initialCategoryMap = new Map(
    (initialCategoryOptions ?? []).map((item) => [item.id, item]),
  );
  const initialCategoryIds = initialValues?.categoryIds ?? [];
  const [primaryCategory, setPrimaryCategory] = useState<{
    id: string;
    slug: string;
    name: string;
  } | null>(() => {
    const id = initialCategoryIds[0];
    if (!id) return null;
    const found = initialCategoryMap.get(id);
    return found ? { id: found.id, slug: found.slug, name: found.name } : null;
  });
  const [subCategories, setSubCategories] = useState<
    Array<{ id: string; slug: string; name: string }>
  >(() =>
    initialCategoryIds
      .slice(1)
      .map((id) => initialCategoryMap.get(id))
      .filter(Boolean)
      .map((item) => ({ id: item!.id, slug: item!.slug, name: item!.name })),
  );
  const [primarySearch, setPrimarySearch] = useState("");
  const [subSearch, setSubSearch] = useState("");
  const deferredPrimarySearch = useDeferredValue(primarySearch);
  const deferredSubSearch = useDeferredValue(subSearch);
  const primarySearchQuery = useAdminCategorySearch(
    deferredPrimarySearch,
    isAdmin,
    8,
  );
  const subSearchQuery = useAdminCategorySearch(deferredSubSearch, isAdmin, 12);
  const [level, setLevel] = useState<PostLevel | "">(
    initialValues?.level ?? "",
  );
  const [audioUrl, setAudioUrl] = useState(initialValues?.audio_url ?? "");
  const [readingTime, setReadingTime] = useState(
    initialValues?.reading_time ?? 0,
  );
  const [tagInput, setTagInput] = useState(
    initialValues?.tags?.join(", ") ?? "",
  );
  const [wordCount, setWordCount] = useState(initialValues?.word_count ?? 0);
  const [eventEncounters, setEventEncounters] = useState(
    initialValues?.event_encounters ?? 0,
  );
  const [cardsCount, setCardsCount] = useState(initialValues?.cards_count ?? 0);
  const [feedbackIntro, setFeedbackIntro] = useState(
    initialValues?.feedback_intro ?? "",
  );
  const [playerFeedback, setPlayerFeedback] = useState<PlayerFeedback[]>(
    initialValues?.player_feedback ?? [],
  );

  function selectPrimaryCategory(item: {
    id: string;
    slug: string;
    name: string;
  }) {
    setPrimaryCategory(item);
    setSubCategories((prev) => prev.filter((c) => c.id !== item.id));
    setPrimarySearch("");
  }

  function addSubCategory(item: { id: string; slug: string; name: string }) {
    if (primaryCategory?.id === item.id) return;
    setSubCategories((prev) => {
      if (prev.some((c) => c.id === item.id)) return prev;
      return [...prev, item];
    });
    setSubSearch("");
  }

  function removeSubCategory(id: string) {
    setSubCategories((prev) => prev.filter((c) => c.id !== id));
  }

  function addFeedback() {
    setPlayerFeedback((prev) => [...prev, { content: "" }]);
  }

  function updateFeedback(index: number, value: string) {
    setPlayerFeedback((prev) =>
      prev.map((f, i) => (i === index ? { content: value } : f)),
    );
  }

  function removeFeedback(index: number) {
    setPlayerFeedback((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!readOnlyBase && !title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!readOnlyBase) {
      const hasContent = doc.blocks.some((b) => {
        if (b.type === "image") return true;
        const nodes = (b.content as { content?: unknown[] }).content ?? [];
        return nodes.some(
          (n: unknown) => (n as { content?: unknown[] }).content?.length,
        );
      });
      if (!hasContent) {
        setError("Post content cannot be empty.");
        return;
      }
    }

    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const orderedCategoryIds = primaryCategory
      ? [primaryCategory.id, ...subCategories.map((c) => c.id)]
      : [];
    const submitCategory = primaryCategory?.slug ?? category;

    if (isAdmin && !primaryCategory) {
      setError("Please select a primary category.");
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        content: doc as unknown as Record<string, unknown>,
        cover_image_url: coverImageUrl,
        cover_image_caption: coverImageCaption.trim() || null,
        visibility,
        category: submitCategory,
        categoryIds: isAdmin ? orderedCategoryIds : undefined,
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
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Title
        </label>
        {readOnlyBase ? (
          <div className="w-full rounded-xl border border-border bg-gray-50 px-4 py-3 text-lg font-semibold text-foreground select-none cursor-not-allowed opacity-70">
            {title || "—"}
          </div>
        ) : (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title..."
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-lg font-semibold text-foreground outline-none placeholder:text-muted-foreground focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
          />
        )}
      </div>

      {/* Cover image */}
      <div>
        {readOnlyBase ? (
          <div>
            <p className="mb-1.5 text-sm font-medium text-foreground">
              Cover Image
            </p>
            {coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImageUrl}
                alt="Cover"
                className="h-48 w-full rounded-xl object-cover opacity-70"
              />
            ) : (
              <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-border bg-gray-50 text-sm text-muted-foreground">
                No cover image
              </div>
            )}
          </div>
        ) : (
          <>
            <ImageUpload
              label="Cover Image (optional)"
              onUpload={setCoverImageUrl}
              initialUrl={coverImageUrl ?? undefined}
            />
            {coverImageUrl && (
              <input
                type="text"
                value={coverImageCaption}
                onChange={(e) => setCoverImageCaption(e.target.value)}
                placeholder="Cover image caption (optional)..."
                className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gray-400"
              />
            )}
          </>
        )}
      </div>

      {/* Block editor */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Content
        </label>
        {readOnlyBase ? (
          <div className="rounded-xl border border-dashed border-border bg-gray-50 px-4 py-3 text-sm text-muted-foreground cursor-not-allowed">
            Content editing is restricted to the original author.
          </div>
        ) : (
          <>
            <p className="mb-3 text-xs text-muted-foreground">
              Mix text and image blocks freely. Use the{" "}
              <strong>+ Text block</strong> / <strong>+ Image block</strong>{" "}
              buttons between blocks to add more.
            </p>
            <BlockEditor value={doc} onChange={setDoc} />
          </>
        )}
      </div>

      {/* ── Admin-only fields ──────────────────────────────── */}
      {isAdmin && (
        <div className="space-y-5 rounded-2xl border border-border bg-gray-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Article Settings
          </p>

          {/* Category + Level */}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Category
              </label>
              <div className="space-y-3 rounded-xl border border-border bg-white p-3">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Primary category
                  </p>
                  {primaryCategory && (
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full border border-brand-primary bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary">
                        {primaryCategory.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPrimaryCategory(null)}
                        className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-gray-50"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                  <input
                    type="text"
                    value={primarySearch}
                    onChange={(e) => setPrimarySearch(e.target.value)}
                    placeholder="Search primary category..."
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-gray-400"
                  />
                  <div className="mt-2">
                    {primarySearchQuery.isLoading && (
                      <p className="text-xs text-muted-foreground">
                        Searching...
                      </p>
                    )}
                    {!primarySearchQuery.isLoading &&
                      (primarySearchQuery.data ?? []).length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          No matching categories.
                        </p>
                      )}
                    {!primarySearchQuery.isLoading &&
                      (primarySearchQuery.data ?? []).length > 0 && (
                        <div className="flex w-full items-center gap-2 overflow-x-auto whitespace-nowrap pb-1">
                          {(primarySearchQuery.data ?? []).map((opt) => (
                            <button
                              key={`primary-${opt.id}`}
                              type="button"
                              onClick={() =>
                                selectPrimaryCategory({
                                  id: opt.id,
                                  slug: opt.slug,
                                  name: opt.name,
                                })
                              }
                              className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-gray-50"
                            >
                              {opt.name}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Sub categories
                  </p>
                  {subCategories.length > 0 && (
                    <div className="mb-2 flex gap-2 overflow-x-auto whitespace-nowrap pb-1">
                      {subCategories.map((item) => (
                        <button
                          key={`sub-selected-${item.id}`}
                          type="button"
                          onClick={() => removeSubCategory(item.id)}
                          className="shrink-0 rounded-full border border-border bg-gray-50 px-3 py-1 text-xs font-medium text-foreground hover:bg-gray-100"
                        >
                          {item.name} ✕
                        </button>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    value={subSearch}
                    onChange={(e) => setSubSearch(e.target.value)}
                    placeholder="Search sub categories..."
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-gray-400"
                  />
                  <div className="mt-2">
                    {subSearchQuery.isLoading && (
                      <p className="text-xs text-muted-foreground">
                        Searching...
                      </p>
                    )}
                    {!subSearchQuery.isLoading &&
                      (subSearchQuery.data ?? []).length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          No matching categories.
                        </p>
                      )}
                    {!subSearchQuery.isLoading &&
                      (subSearchQuery.data ?? []).length > 0 && (
                        <div className="flex w-full items-center gap-2 overflow-x-auto whitespace-nowrap pb-1">
                          {(subSearchQuery.data ?? []).map((opt) => {
                            const disabled =
                              primaryCategory?.id === opt.id ||
                              subCategories.some((item) => item.id === opt.id);
                            return (
                              <button
                                key={`sub-${opt.id}`}
                                type="button"
                                disabled={disabled}
                                onClick={() =>
                                  addSubCategory({
                                    id: opt.id,
                                    slug: opt.slug,
                                    name: opt.name,
                                  })
                                }
                                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
                                  disabled
                                    ? "cursor-not-allowed border-border bg-gray-100 text-muted-foreground"
                                    : "border-border text-foreground hover:bg-gray-50"
                                }`}
                              >
                                {opt.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                  </div>
                </div>

                {(primarySearchQuery.isError || subSearchQuery.isError) && (
                  <p className="text-xs text-red-500">
                    Failed to search categories.
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                CEFR Level
              </label>
              <SelectField
                value={level}
                onChange={(v) => setLevel(v as PostLevel | "")}
                options={[
                  { value: "", label: "None" },
                  ...(
                    Object.entries(LEVEL_LABELS) as [PostLevel, string][]
                  ).map(([val, label]) => ({ value: val, label })),
                ]}
              />
            </div>
          </div>

          {/* Audio URL */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Audio URL
            </label>
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
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Reading time (min)
              </label>
              <input
                type="number"
                min={0}
                value={readingTime}
                onChange={(e) => setReadingTime(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Word count
              </label>
              <input
                type="number"
                min={0}
                value={wordCount}
                onChange={(e) => setWordCount(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Event encounters
              </label>
              <input
                type="number"
                min={0}
                value={eventEncounters}
                onChange={(e) =>
                  setEventEncounters(parseInt(e.target.value) || 0)
                }
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Cards
              </label>
              <input
                type="number"
                min={0}
                value={cardsCount}
                onChange={(e) => setCardsCount(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-gray-400"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Tags
            </label>
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
                {tagInput
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-white px-3 py-0.5 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Player Feedback */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Feedback intro
            </label>
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
              <label className="text-sm font-medium text-foreground">
                Player feedback quotes
              </label>
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
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Visibility selector */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Visibility
        </label>
        <div className="flex gap-2">
          {(
            [
              "private",
              "share",
              ...(isAdmin ? ["public"] : []),
            ] as PostVisibility[]
          ).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVisibility(v)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors capitalize
                ${
                  visibility === v
                    ? v === "public"
                      ? "border-green-600 bg-green-600 text-white"
                      : v === "share"
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-gray-700 bg-gray-700 text-white"
                    : "border-border bg-white text-muted-foreground hover:bg-gray-50"
                }`}
            >
              {v === "private"
                ? "🔒 Private"
                : v === "share"
                  ? "👥 Share"
                  : "🌐 Public"}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {visibility === "private" && "Only you can see this post."}
          {visibility === "share" &&
            "Visible to your followers (login required)."}
          {visibility === "public" &&
            "Visible to everyone — appears in Báo hay / Audio chat."}
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-brand-dark px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark/85 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-full border-2 border-border px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
