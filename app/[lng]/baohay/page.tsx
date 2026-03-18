"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useBaohay, Post, PostLevel } from "@/hooks/blog/usePost";
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

function extractExcerpt(content: Record<string, unknown>, maxLen = 220): string {
  const parts: string[] = [];
  function walk(node: unknown) {
    if (!node || typeof node !== "object") return;
    const n = node as Record<string, unknown>;
    if (n.type === "text" && typeof n.text === "string") { parts.push(n.text); return; }
    if (Array.isArray(n.blocks)) (n.blocks as unknown[]).forEach(walk);
    if (Array.isArray(n.content)) (n.content as unknown[]).forEach(walk);
    else if (n.content && typeof n.content === "object") walk(n.content);
  }
  walk(content);
  const text = parts.join(" ").trim();
  return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + "…" : text;
}

// ── Hero components ────────────────────────────────────────────

function HeroDetailCard({ post, className = "" }: { post: Post; className?: string }) {
  const lng = useLng();
  const { t } = useClientTranslation(lng, "blog");
  return (
    <Link
      href={`/blog/${post.id}`}
      className={`group flex flex-col gap-4 rounded-2xl bg-brand-footer py-6 px-2 hover:bg-brand-footer-hover transition-colors ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        {post.level && (
          <span className="inline-flex h-7.5 items-center justify-center rounded-full bg-brand-orange px-3 text-sm font-semibold text-white">
            {LEVEL_LABELS[post.level] ?? post.level}
          </span>
        )}
        {post.reading_time > 0 && (
          <span className="shrink-0 text-sm text-white/60">{post.reading_time} {t("reading_time")}</span>
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

function HeroCoverCell({ post, className = "" }: { post: Post; className?: string }) {
  return (
    <Link
      href={`/blog/${post.id}`}
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
          <span className="text-7xl font-bold text-white/20">{post.title.charAt(0)}</span>
        </div>
      )}
    </Link>
  );
}

function BaohayHero({ lng, first, second }: { lng: string; first: Post; second?: Post }) {
  return (
    <section className="w-full bg-brand-footer px-4 py-6 md:px-21 md:py-8">
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-white/60">
        <Link href={`/${lng}`} className="hover:text-white">Trang chủ</Link>
        <span>›</span>
        <span className="font-medium text-white">Báo hay</span>
      </nav>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-6">
        <HeroDetailCard post={first} className="order-1 h-auto md:order-2 md:h-72" />
        <HeroCoverCell post={first} className="order-2 h-56 md:order-1 md:h-72" />
      </div>
      {second && <div className="mt-8 mb-2 md:my-8 h-px bg-white/20" />}
      {second && (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-6">
          <HeroDetailCard post={second} className="h-auto md:h-72" />
          <HeroCoverCell post={second} className="h-56 md:h-72" />
        </div>
      )}
    </section>
  );
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
                  <span className="inline-flex items-center rounded-full bg-brand-orange px-2 py-0.5 text-xs font-semibold text-white">
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
                    <span className="inline-flex items-center rounded-full bg-brand-orange px-2 py-0.5 text-xs font-semibold text-white">
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

// ── Page content ───────────────────────────────────────────────

function BaohayContent() {
  const { data: posts, isLoading } = useBaohay();
  const lng = useLng();
  const searchParams = useSearchParams();
  const levelParam = searchParams.get("level") as PostLevel | null;

  const isLevelPage = !!(levelParam && VALID_LEVELS.includes(levelParam));
  const levelPosts = isLevelPage ? (posts ?? []).filter((p) => p.level === levelParam) : [];
  const [first, second] = posts ?? [];

  if (isLevelPage && levelParam) {
    return (
      <>
        {/* Level hero */}
        <section
          className="w-full px-4 py-8 md:px-21 md:py-10"
          className="bg-brand-footer"
        >
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-white/70">
            <Link href={`/${lng}`} className="hover:text-white">Trang chủ</Link>
            <span>›</span>
            <Link href={`/${lng}/baohay`} className="hover:text-white">Báo hay</Link>
            <span>›</span>
            <span className="font-medium text-brand-lime-bright">{LEVEL_LABELS[levelParam]}</span>
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
              <YouMayLike posts={posts ?? []} category="baohay" currentLevel={levelParam} />
            </>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      {isLoading ? (
        <div className="h-[60vh] w-full animate-pulse bg-gray-100" />
      ) : (
        first && <BaohayHero lng={lng} first={first} second={second} />
      )}

      <div className="px-4 pt-12 pb-12 md:px-6 xl:px-21">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
          </div>
        ) : (
          <ArticleListByLevel posts={posts ?? []} category="baohay" />
        )}
      </div>
    </>
  );
}

export default function BaohayPage() {
  return (
    <Suspense fallback={<div className="h-64 w-full animate-pulse bg-gray-100" />}>
      <BaohayContent />
    </Suspense>
  );
}
