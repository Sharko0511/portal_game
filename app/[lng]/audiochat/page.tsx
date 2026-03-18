"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAudiochat, Post, PostLevel } from "@/hooks/blog/usePost";
import ArticleListByLevel from "@/components/blog/ArticleListByLevel";
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

const VALID_LEVELS: PostLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ── Flat article list (used on level page) ─────────────────────

function FlatArticleList({ posts }: { posts: Post[] }) {
  const lng = useLng();
  const { t } = useClientTranslation(lng, "blog");

  if (!posts.length) {
    return <p className="py-12 text-center text-sm text-muted-foreground">No articles yet.</p>;
  }

  return (
    <div>
      {posts.map((post, i) => (
        <div key={post.id} className={i !== 0 ? "mt-6 border-t border-border pt-6" : ""}>
          {/* Mobile */}
          <Link href={`/blog/${post.id}`} className="group block md:hidden">
            <div className="h-48 w-full overflow-hidden rounded-xl bg-gray-100">
              {post.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-100">
                  <span className="text-2xl font-bold text-gray-300">{post.title.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {post.level && (
                  <span className="inline-flex items-center rounded-full bg-[#F47121] px-2 py-0.5 text-xs font-semibold text-white">
                    {LEVEL_LABELS[post.level]}
                  </span>
                )}
                {post.reading_time > 0 && <span>{post.reading_time} {t("reading_time")}</span>}
              </div>
              <span>{formatDate(post.created_at)}</span>
            </div>
            <h3 className="mt-1 text-lg font-semibold text-foreground leading-snug group-hover:underline">{post.title}</h3>
          </Link>

          {/* Desktop */}
          <div className="hidden md:grid grid-cols-12 gap-x-12 items-start">
            <Link href={`/blog/${post.id}`} className="col-span-3 block overflow-hidden rounded-xl">
              <div className="h-40 w-full overflow-hidden rounded-xl bg-gray-100">
                {post.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-100">
                    <span className="text-2xl font-bold text-gray-300">{post.title.charAt(0)}</span>
                  </div>
                )}
              </div>
            </Link>
            <Link href={`/blog/${post.id}`} className="col-span-9 group flex flex-col gap-3 pt-1">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  {post.level && (
                    <span className="inline-flex items-center rounded-full bg-[#F47121] px-2 py-0.5 text-xs font-semibold text-white">
                      {LEVEL_LABELS[post.level]}
                    </span>
                  )}
                  {post.reading_time > 0 && <span>{post.reading_time} {t("reading_time")}</span>}
                </div>
                <span>{formatDate(post.created_at)}</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground leading-snug group-hover:underline">{post.title}</h3>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── "You may like" section ──────────────────────────────────────

function YouMayLike({ posts, category, currentLevel }: { posts: Post[]; category: string; currentLevel: PostLevel }) {
  const other = posts.filter((p) => p.level !== currentLevel).slice(0, 3);
  if (!other.length) return null;

  return (
    <section className="mt-12 border-t border-border pt-8">
      <div className="md:grid md:grid-cols-12 md:gap-x-12">
        <div className="mb-4 md:mb-0 md:col-span-4">
          <h2 className="text-2xl font-bold text-foreground">You may like</h2>
          <Link href={`/${category}`} className="mt-1 inline-block text-sm text-muted-foreground hover:text-foreground">
            more on this topic ↗
          </Link>
        </div>
        <div className="md:col-span-8 space-y-4">
          {other.map((post, i) => (
            <div key={post.id} className={i !== 0 ? "border-t border-border pt-4" : ""}>
              <Link href={`/blog/${post.id}`} className="group flex gap-4 items-start">
                <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  {post.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-100">
                      <span className="text-lg font-bold text-gray-300">{post.title.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {post.reading_time > 0 && <span>{post.reading_time} phút đọc</span>}
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  <h3 className="mt-1 text-sm font-semibold text-foreground leading-snug group-hover:underline">{post.title}</h3>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Page content (needs Suspense for useSearchParams) ──────────

function AudiochatContent() {
  const { data: posts, isLoading } = useAudiochat();
  const lng = useLng();
  const { t } = useClientTranslation(lng, "audiochat");
  const searchParams = useSearchParams();
  const levelParam = searchParams.get("level") as PostLevel | null;

  const isLevelPage = !!(levelParam && VALID_LEVELS.includes(levelParam));
  const levelPosts = isLevelPage ? (posts ?? []).filter((p) => p.level === levelParam) : [];

  if (isLevelPage && levelParam) {
    return (
      <>
        {/* Level hero */}
        <section
          className="w-full px-4 py-8 md:px-6 xl:px-21"
          style={{ background: "linear-gradient(135deg, #004d40 0%, #00695c 60%, #2e7d32 100%)" }}
        >
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-white/70">
            <Link href={`/${lng}`} className="hover:text-white">Trang chủ</Link>
            <span>›</span>
            <Link href={`/${lng}/audiochat`} className="hover:text-white">Audio chất</Link>
            <span>›</span>
            <span className="font-medium text-[#c8e63d]">{LEVEL_LABELS[levelParam]}</span>
          </nav>
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Trình độ tiếng Anh {levelParam}
          </h1>
        </section>

        {/* Articles */}
        <div className="px-4 pt-12 pb-12 md:px-6 xl:px-21">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
              <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
            </div>
          ) : (
            <>
              <FlatArticleList posts={levelPosts} />
              <YouMayLike posts={posts ?? []} category="audiochat" currentLevel={levelParam} />
            </>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      {/* Hero — full screen width */}
      <section className="relative w-full h-52 md:h-64 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80"
          alt="Audio chat hero"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full flex-col justify-between px-4 py-6 md:px-6 xl:px-21">
          <nav className="flex items-center gap-1.5 text-sm text-white/70">
            <Link href={`/${lng}`} className="hover:text-white">{t("breadcrumb.home")}</Link>
            <span>›</span>
            <span className="font-medium text-[#c8e63d]">Audio chat</span>
          </nav>
          <p className="text-2xl font-bold text-white md:text-3xl">
            {t("hero.tagline")}
          </p>
        </div>
      </section>

      {/* Article list */}
      <div className="px-4 pt-12 pb-12 md:px-6 xl:px-21">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
            <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
          </div>
        ) : (
          <ArticleListByLevel posts={posts ?? []} category="audiochat" />
        )}
      </div>
    </>
  );
}

export default function AudiochatPage() {
  return (
    <Suspense fallback={<div className="h-64 w-full animate-pulse bg-gray-100" />}>
      <AudiochatContent />
    </Suspense>
  );
}
