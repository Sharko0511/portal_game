"use client";

import Link from "next/link";
import { useBaohay, Post } from "@/hooks/blog/usePost";
import ArticleListByLevel from "@/components/blog/ArticleListByLevel";
import { useLng } from "@/hooks/useLng";
import { useClientTranslation } from "@/hooks/useClientTranslation";

const LEVEL_LABELS: Record<string, string> = {
  A1: "A1 - Beginner",
  A2: "A2 - Elementary",
  B1: "B1 - Intermediate",
  B2: "B2 - Upper Intermediate",
  C1: "C1 - Advanced",
  C2: "C2 - Proficiency",
};

function extractExcerpt(content: Record<string, unknown>, maxLen = 220): string {
  const parts: string[] = [];
  function walk(node: unknown) {
    if (!node || typeof node !== "object") return;
    const n = node as Record<string, unknown>;
    // TipTap leaf text node
    if (n.type === "text" && typeof n.text === "string") { parts.push(n.text); return; }
    // blocks array (our BlocksDoc format)
    if (Array.isArray(n.blocks)) (n.blocks as unknown[]).forEach(walk);
    // content array (TipTap doc/paragraph children)
    if (Array.isArray(n.content)) (n.content as unknown[]).forEach(walk);
    // content object (each text block's TipTap doc is an object, not array)
    else if (n.content && typeof n.content === "object") walk(n.content);
  }
  walk(content);
  const text = parts.join(" ").trim();
  return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + "…" : text;
}

// ── Hero — full-screen-width, 2×2 grid of squares ─────────────

function HeroDetailCard({ post, className = "" }: { post: Post; className?: string }) {
  const lng = useLng();
  const { t } = useClientTranslation(lng, "blog");
  return (
    <Link
      href={`/blog/${post.id}`}
      className={`group flex flex-col gap-4 rounded-2xl bg-[#1b5e20] py-6 px-2 hover:bg-[#236b27] transition-colors ${className}`}
    >
      {/* Badge + reading time */}
      <div className="flex items-center justify-between gap-2">
        {post.level && (
          <span className="inline-flex h-7.5 items-center justify-center rounded-full bg-[#F47121] px-3 text-sm font-semibold text-white">
            {LEVEL_LABELS[post.level] ?? post.level}
          </span>
        )}
        {post.reading_time > 0 && (
          <span className="shrink-0 text-sm text-white/60">{post.reading_time} {t("reading_time")}</span>
        )}
      </div>
      {/* Title */}
      <h2 className="text-xl font-bold text-white leading-snug group-hover:underline sm:text-2xl">
        {post.title}
      </h2>
      {/* Excerpt */}
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
        <div className="flex h-full items-center justify-center bg-[#164a18]">
          <span className="text-7xl font-bold text-white/20">{post.title.charAt(0)}</span>
        </div>
      )}
    </Link>
  );
}

function BaohayHero({ lng, first, second }: { lng: string; first: Post; second?: Post }) {
  return (
    <section className="w-full bg-[#1b5e20] px-4 py-6 md:px-21 md:py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-white/60">
        <Link href={`/${lng}`} className="hover:text-white">Trang chủ</Link>
        <span>›</span>
        <span className="font-medium text-white">Báo hay</span>
      </nav>

      {/* Row 1: [image | detail] */}
      <div className="mb-3 grid grid-cols-2 gap-6">
        <HeroCoverCell post={first} className="h-72" />
        <HeroDetailCard post={first} className="h-72" />
      </div>

      {/* Separator between rows */}
      {second && <div className="my-8 h-px bg-white/20" />}

      {/* Row 2: [detail | image] */}
      {second && (
        <div className="grid grid-cols-2 gap-6">
          <HeroDetailCard post={second} className="h-72" />
          <HeroCoverCell post={second} className="h-72" />
        </div>
      )}
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function BaohayPage() {
  const { data: posts, isLoading } = useBaohay();
  const lng = useLng();

  const [first, second] = posts ?? [];

  return (
    <>
      {/* Hero — full screen width, outside any max-w container */}
      {isLoading ? (
        <div className="h-[60vh] w-full animate-pulse bg-gray-100" />
      ) : (
        first && <BaohayHero lng={lng} first={first} second={second} />
      )}

      {/* Article list — constrained width */}
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
