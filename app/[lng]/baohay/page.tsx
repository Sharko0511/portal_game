"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Headphones } from "lucide-react";
import { useBaohay, Post, PostLevel } from "@/hooks/blog/usePost";
import { useHotCategories } from "@/hooks/blog/useHotCategories";
import ArticleListByHotCategory from "@/components/blog/ArticleListByHotCategory";
import { useLng } from "@/hooks/useLng";
import { useClientTranslation } from "@/hooks/useClientTranslation";

const LEVEL_LABELS: Record<PostLevel, string> = {
  A1: "A1 - Beginner",
  A2: "A2 - Elementary",
  B1: "B1 - Intermediate",
  B2: "B2 - Upper Intermediate",
  C1: "C1 - Advanced",
  C2: "C2 - Proficiency",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function extractExcerpt(
  content: Record<string, unknown>,
  maxLen = 220,
): string {
  const parts: string[] = [];
  function walk(node: unknown) {
    if (!node || typeof node !== "object") return;
    const n = node as Record<string, unknown>;
    if (n.type === "text" && typeof n.text === "string") {
      parts.push(n.text);
      return;
    }
    if (Array.isArray(n.blocks)) (n.blocks as unknown[]).forEach(walk);
    if (Array.isArray(n.content)) (n.content as unknown[]).forEach(walk);
    else if (n.content && typeof n.content === "object") walk(n.content);
  }
  walk(content);
  const text = parts.join(" ").trim();
  return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + "…" : text;
}

// ── Hero components ────────────────────────────────────────────

function HeroDetailCard({
  post,
  className = "",
}: {
  post: Post;
  className?: string;
}) {
  const lng = useLng();
  const { t } = useClientTranslation(lng, "blog");
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex flex-col gap-4 rounded-2xl bg-brand-footer py-6 px-2 hover:bg-brand-footer-hover transition-colors ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        {post.level && (
          <span className="inline-flex h-7.5 items-center justify-center rounded-full bg-brand-orange px-3 text-sm font-semibold text-white">
            {LEVEL_LABELS[post.level] ?? post.level}
          </span>
        )}
        {post.reading_time > 0 && (
          <span className="shrink-0 text-sm text-white/60">
            {post.reading_time} {t("reading_time")}
          </span>
        )}
      </div>
      <h2 className="text-xl font-bold text-white leading-snug group-hover:underline sm:text-2xl">
        {post.title}
      </h2>
      <p className="text-sm text-white/60 line-clamp-5 leading-relaxed">
        {extractExcerpt(post.content)}
      </p>
    </Link>
  );
}

function HeroCoverCell({
  post,
  className = "",
}: {
  post: Post;
  className?: string;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group block overflow-hidden rounded-2xl ${className}`}
    >
      {post.cover_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-brand-footer-dark">
          <span className="text-7xl font-bold text-white/20">
            {post.title.charAt(0)}
          </span>
        </div>
      )}
    </Link>
  );
}

function BaohayHero({
  lng,
  first,
  second,
}: {
  lng: string;
  first: Post;
  second?: Post;
}) {
  const { t } = useClientTranslation(lng, "blog");
  return (
    <section className="w-full bg-brand-footer py-6 md:py-8 flex justify-center">
      <div className="w-full max-w-[1600px] px-4 md:px-21">
        <nav className="mb-4 flex items-center gap-1.5 text-sm text-white/60">
          <Link href={`/${lng}`} className="hover:text-white">
            {t("breadcrumb.home")}
          </Link>
          <span>›</span>
          <span className="font-medium text-white">
            {t("breadcrumb.baohay")}
          </span>
        </nav>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-6">
          <HeroDetailCard
            post={first}
            className="order-1 h-auto md:order-2 md:h-72"
          />
          <HeroCoverCell
            post={first}
            className="order-2 h-56 md:order-1 md:h-72"
          />
        </div>
        {second && <div className="mt-8 mb-2 md:my-8 h-px bg-white/20" />}
        {second && (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-6">
            <HeroDetailCard post={second} className="h-auto md:h-72" />
            <HeroCoverCell post={second} className="h-56 md:h-72" />
          </div>
        )}
      </div>
    </section>
  );
}

// ── Flat article list (used on level page) ─────────────────────

function FlatArticleList({ posts }: { posts: Post[] }) {
  const lng = useLng();
  const { t } = useClientTranslation(lng, "blog");

  if (!posts.length) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No articles yet.
      </p>
    );
  }

  return (
    <div>
      {posts.map((post, i) => (
        <div
          key={post.id}
          className={i !== 0 ? "mt-6 border-t border-border pt-6" : ""}
        >
          {/* Mobile */}
          <Link href={`/blog/${post.slug}`} className="group block md:hidden">
            <div className="relative h-48 w-full overflow-hidden rounded-xl bg-gray-100">
              {post.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-100">
                  <span className="text-2xl font-bold text-gray-300">
                    {post.title.charAt(0)}
                  </span>
                </div>
              )}
              {post.audio_url && (
                <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-brand-orange px-2 py-0.5 text-xs font-semibold text-white">
                  <Headphones className="h-3 w-3" /> Audio
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {post.level && (
                  <span className="inline-flex items-center rounded-full bg-brand-orange px-2 py-0.5 text-xs font-semibold text-white">
                    {LEVEL_LABELS[post.level]}
                  </span>
                )}
                {post.reading_time > 0 && (
                  <span>
                    {post.reading_time} {t("reading_time")}
                  </span>
                )}
              </div>
              <span>{formatDate(post.created_at)}</span>
            </div>
            <h3 className="mt-1 text-lg font-semibold text-foreground leading-snug group-hover:underline">
              {post.title}
            </h3>
          </Link>

          {/* Desktop */}
          <div className="hidden md:grid grid-cols-12 gap-x-12 items-start">
            <Link
              href={`/blog/${post.slug}`}
              className="col-span-3 block overflow-hidden rounded-xl"
            >
              <div className="relative h-40 w-full overflow-hidden rounded-xl bg-gray-100">
                {post.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-100">
                    <span className="text-2xl font-bold text-gray-300">
                      {post.title.charAt(0)}
                    </span>
                  </div>
                )}
                {post.audio_url && (
                  <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-brand-orange px-2 py-0.5 text-xs font-semibold text-white">
                    <Headphones className="h-3 w-3" /> Audio
                  </span>
                )}
              </div>
            </Link>
            <Link
              href={`/blog/${post.slug}`}
              className="col-span-9 group flex flex-col gap-3 pt-1"
            >
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  {post.level && (
                    <span className="inline-flex items-center rounded-full bg-brand-orange px-2 py-0.5 text-xs font-semibold text-white">
                      {LEVEL_LABELS[post.level]}
                    </span>
                  )}
                  {post.reading_time > 0 && (
                    <span>
                      {post.reading_time} {t("reading_time")}
                    </span>
                  )}
                </div>
                <span>{formatDate(post.created_at)}</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground leading-snug group-hover:underline">
                {post.title}
              </h3>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── "You may like" section ──────────────────────────────────────

function YouMayLike({
  posts,
  category,
  currentLevel,
}: {
  posts: Post[];
  category: string;
  currentLevel: PostLevel;
}) {
  const other = posts.filter((p) => p.level !== currentLevel).slice(0, 3);
  if (!other.length) return null;

  return (
    <section className="mt-12 border-t border-border pt-8">
      <div className="md:grid md:grid-cols-12 md:gap-x-12">
        <div className="mb-4 md:mb-0 md:col-span-4">
          <h2 className="text-2xl font-bold text-foreground">You may like</h2>
          <Link
            href={`/${category}`}
            className="mt-1 inline-block text-sm text-muted-foreground hover:text-foreground"
          >
            more on this topic ↗
          </Link>
        </div>
        <div className="md:col-span-8 space-y-4">
          {other.map((post, i) => (
            <div
              key={post.id}
              className={i !== 0 ? "border-t border-border pt-4" : ""}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="group flex gap-4 items-start"
              >
                <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  {post.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-100">
                      <span className="text-lg font-bold text-gray-300">
                        {post.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {post.reading_time > 0 && (
                      <span>{post.reading_time} phút đọc</span>
                    )}
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  <h3 className="mt-1 text-sm font-semibold text-foreground leading-snug group-hover:underline">
                    {post.title}
                  </h3>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Page content ───────────────────────────────────────────────

function BaohayContent() {
  const { data: posts, isLoading } = useBaohay();
  const hotCategoriesQuery = useHotCategories(8);
  const lng = useLng();
  const { t } = useClientTranslation(lng, "blog");
  const [first, second] = posts ?? [];

  return (
    <>
      {isLoading ? (
        <div className="h-[60vh] w-full animate-pulse bg-gray-100" />
      ) : (
        first && <BaohayHero lng={lng} first={first} second={second} />
      )}

      <div className="w-full flex justify-center">
        <div className="w-full max-w-[1600px] px-4 pt-12 pb-12 md:px-6 xl:px-21">
          {isLoading || hotCategoriesQuery.isLoading ? (
            <div className="space-y-4">
              <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
            </div>
          ) : (
            <ArticleListByHotCategory
              categories={hotCategoriesQuery.data ?? []}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default function BaohayPage() {
  return (
    <Suspense
      fallback={<div className="h-64 w-full animate-pulse bg-gray-100" />}
    >
      <BaohayContent />
    </Suspense>
  );
}
