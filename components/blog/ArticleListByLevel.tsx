"use client";

import Link from "next/link";
import { Headphones } from "lucide-react";
import { Post, PostLevel } from "@/hooks/blog/usePost";
import { useLng } from "@/hooks/useLng";
import { useClientTranslation } from "@/hooks/useClientTranslation";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const LEVEL_LABELS: Record<PostLevel, string> = {
  A1: "A1 - Beginner",
  A2: "A2 - Elementary",
  B1: "B1 - Intermediate",
  B2: "B2 - Upper Intermediate",
  C1: "C1 - Advanced",
  C2: "C2 - Proficiency",
};

const LEVEL_ORDER: PostLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

// ── Level group — 3-column grid (4 | 3 | 5) ──────────────────

interface LevelGroupProps {
  level: PostLevel;
  posts: Post[];
  category: string;
  first?: boolean;
  last?: boolean;
}

function LevelGroup({ level, posts, category, first, last }: LevelGroupProps) {
  const lng = useLng();
  const { t } = useClientTranslation(lng, "blog");
  return (
    <section className={`${first ? "" : "border-t border-border pt-8"}`}>

      {/* ── Mobile layout ── */}
      <div className="md:hidden">
        <h2 className="mb-4 text-2xl font-bold text-foreground">{LEVEL_LABELS[level]}</h2>
        {posts.map((post, i) => (
          <div key={post.id} className={i !== 0 ? "mt-6 border-t-2 border-gray-200 pt-6" : ""}>
            <Link href={`/blog/${post.id}`} className="group block">
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
                    <span className="text-2xl font-bold text-gray-300">{post.title.charAt(0)}</span>
                  </div>
                )}
                {post.audio_url && (
                  <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-brand-orange px-2 py-0.5 text-xs font-semibold text-white">
                    <Headphones className="h-3 w-3" /> Audio
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                {post.reading_time > 0 && <span>{post.reading_time} {t("reading_time")}</span>}
                <span>{formatDate(post.created_at)}</span>
              </div>
              <h3 className="mt-1 text-lg font-semibold text-foreground leading-snug group-hover:underline">
                {post.title}
              </h3>
            </Link>
          </div>
        ))}
        <div className="mt-6 mb-4 flex justify-end">
          <Link
            href={`/${category}?level=${level}`}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            {t("more_on_topic")} ↗
          </Link>
        </div>
      </div>

      {/* ── Desktop layout ── */}
      <div className="hidden md:block">
        {posts.map((post, i) => (
          <div key={post.id} className={`grid grid-cols-12 gap-x-12 gap-y-4 items-start mb-8 ${last ? "last:mb-0" : ""}`}>

            {/* Col 1 (4/12) — level heading only on first row */}
            <div className="col-span-4">
              {i === 0 ? (
                <>
                  <h2 className="text-2xl font-bold text-foreground">{LEVEL_LABELS[level]}</h2>
                  <Link
                    href={`/${category}?level=${level}`}
                    className="mt-1 inline-block text-sm text-muted-foreground hover:text-foreground"
                  >
                    {t("more_on_topic")} ↗
                  </Link>
                </>
              ) : null}
            </div>

            {/* Cols 2+3 (8/12) */}
            <div className={`col-span-8 grid grid-cols-8 gap-x-14 items-start ${i !== 0 ? "border-t-2 border-gray-200 pt-8" : ""}`}>
              <Link href={`/blog/${post.id}`} className="col-span-3 block overflow-hidden rounded-xl">
                <div className="relative h-50 w-full overflow-hidden rounded-xl bg-gray-100">
                  {post.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-100">
                      <span className="text-2xl font-bold text-gray-300">{post.title.charAt(0)}</span>
                    </div>
                  )}
                  {post.audio_url && (
                    <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-brand-orange px-2 py-0.5 text-xs font-semibold text-white">
                      <Headphones className="h-3 w-3" /> Audio
                    </span>
                  )}
                </div>
              </Link>
              <Link href={`/blog/${post.id}`} className="col-span-5 group flex flex-col justify-between gap-3 self-stretch pt-1">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  {post.reading_time > 0 && <span>{post.reading_time} {t("reading_time")}</span>}
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

    </section>
  );
}

// ── Main export ───────────────────────────────────────────────

interface ArticleListByLevelProps {
  posts: Post[];
  category: string;
}

export default function ArticleListByLevel({ posts, category }: ArticleListByLevelProps) {
  const grouped = new Map<PostLevel, Post[]>();
  for (const post of posts) {
    if (!post.level) continue;
    const list = grouped.get(post.level) ?? [];
    list.push(post);
    grouped.set(post.level, list);
  }

  const levels = LEVEL_ORDER.filter((l) => grouped.has(l));

  if (levels.length === 0) {
    return <p className="py-12 text-center text-sm text-muted-foreground">No articles yet.</p>;
  }

  return (
    <div>
      {levels.map((level, i) => (
        <LevelGroup key={level} level={level} posts={grouped.get(level)!} category={category} first={i === 0} last={i === levels.length - 1} />
      ))}
    </div>
  );
}
