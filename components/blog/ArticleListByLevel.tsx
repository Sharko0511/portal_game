"use client";

import Link from "next/link";
import { Post, PostLevel } from "@/hooks/blog/usePost";

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

// ── Single article row ────────────────────────────────────────

function ArticleRow({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.id}`}
      className="group flex items-center gap-4 border-t border-border py-4 hover:bg-gray-50 transition-colors -mx-2 px-2 rounded-xl"
    >
      {/* Thumbnail */}
      <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {post.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
            <span className="text-xl font-bold text-gray-300">{post.title.charAt(0)}</span>
          </div>
        )}
      </div>

      {/* Reading time + date — fixed width column */}
      <div className="flex w-28 shrink-0 flex-col gap-0.5 text-xs text-muted-foreground">
        {post.reading_time > 0 && <span>{post.reading_time} phút đọc</span>}
        <span>{formatDate(post.created_at)}</span>
      </div>

      {/* Title — takes remaining space */}
      <h3 className="flex-1 font-semibold text-foreground line-clamp-2 group-hover:underline">
        {post.title}
      </h3>
    </Link>
  );
}

// ── Level group ───────────────────────────────────────────────

interface LevelGroupProps {
  level: PostLevel;
  posts: Post[];
  category: string;
}

function LevelGroup({ level, posts, category }: LevelGroupProps) {
  return (
    <section className="py-8">
      {/* Heading + "more on this topic" on separate lines */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground">{LEVEL_LABELS[level]}</h2>
        <Link
          href={`/${category}?level=${level}`}
          className="mt-1 inline-block text-xs text-muted-foreground hover:text-foreground"
        >
          more on this topic ↗
        </Link>
      </div>
      <div>
        {posts.map((post) => (
          <ArticleRow key={post.id} post={post} />
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
    <div className="divide-y divide-border">
      {levels.map((level) => (
        <LevelGroup key={level} level={level} posts={grouped.get(level)!} category={category} />
      ))}
    </div>
  );
}
