"use client";

import { use, useState } from "react";
import Link from "next/link";
import { BlocksRenderer, BlocksDoc } from "@/components/blog/BlockEditor";
import TipTapEditor from "@/components/blog/TipTapEditor";
import LikeButton from "@/components/blog/LikeButton";
import FollowButton from "@/components/blog/FollowButton";
import CommentSection from "@/components/blog/CommentSection";
import ShareButton from "@/components/blog/ShareButton";
import { usePost, useBaohay, useAudiochat, Post } from "@/hooks/blog/usePost";
import { useAuth } from "@/hooks/useAuth";
import { useLng } from "@/hooks/useLng";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

// ── Helpers ───────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const LEVEL_LABELS: Record<string, string> = {
  A1: "A1 - Beginner",
  A2: "A2 - Elementary",
  B1: "B1 - Intermediate",
  B2: "B2 - Upper Intermediate",
  C1: "C1 - Advanced",
  C2: "C2 - Proficiency",
};

const CATEGORY_LABELS: Record<string, string> = {
  baohay: "Báo hay",
  audiochat: "Audio chat",
  blog: "Blog",
};

// ── Audio Player ─────────────────────────────────────────────

function AudioPlayer({ src }: { src: string }) {
  const [playing, setPlaying] = useState(false);

  function toggle() {
    const audio = document.getElementById("post-audio") as HTMLAudioElement | null;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  }

  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border bg-gray-50 px-5 py-4">
      <button
        type="button"
        onClick={toggle}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background hover:bg-foreground/85 transition-colors"
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing
          ? <span className="text-sm">❚❚</span>
          : <span className="ml-0.5 text-sm">▶</span>
        }
      </button>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-xs text-muted-foreground">Limiting your screentime? Listen instead.</p>
        {/* Fake waveform bars */}
        <div className="flex h-6 items-end gap-px overflow-hidden">
          {Array.from({ length: 60 }, (_, i) => (
            <div
              key={i}
              className="w-1 shrink-0 rounded-sm bg-gray-300"
              style={{ height: `${20 + Math.sin(i * 0.7) * 14 + Math.random() * 8}%` }}
            />
          ))}
        </div>
      </div>
      <audio id="post-audio" src={src} onEnded={() => setPlaying(false)} />
    </div>
  );
}

// ── Popular posts sidebar ─────────────────────────────────────

function PopularSidebar({ currentId, category }: { currentId: string; category: string }) {
  const baohayQuery = useBaohay();
  const audiochatQuery = useAudiochat();

  const posts = category === "baohay"
    ? (baohayQuery.data ?? [])
    : category === "audiochat"
    ? (audiochatQuery.data ?? [])
    : [];

  const popular = posts.filter((p) => p.id !== currentId).slice(0, 3);

  if (!popular.length) return null;

  return (
    <aside className="hidden xl:block w-72 shrink-0">
      <div className="sticky top-8">
        <h3 className="mb-3 text-base font-semibold text-foreground">Bài viết phổ biến</h3>
        <div className="mb-1 border-t-2 border-gray-800" />
        <div>
          {popular.map((p, i) => (
            <Link key={p.id} href={`/blog/${p.id}`} className={`group flex gap-3 py-3 ${i !== 0 ? "border-t-2 border-gray-300" : ""}`}>
              <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                {p.cover_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.cover_image_url}
                    alt={p.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground line-clamp-3 group-hover:underline">
                  {p.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(p.created_at)}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-3 flex justify-end">
          <Link
            href={`/${category}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Xem thêm <span>↗</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}

// ── Main post content ─────────────────────────────────────────

function PostContent({ id }: { id: string }) {
  const { profile } = useAuth();
  const postQuery = usePost(id);
  const lng = useLng();

  if (postQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-6 py-8">
        <div className="h-8 w-2/3 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-4 w-1/3 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (postQuery.isError) {
    const errMsg = (postQuery.error as Error).message ?? "";
    const is403 = errMsg.includes("403");
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        {is403 ? (
          <>
            <p className="text-sm text-muted-foreground">You need to be logged in to read this post.</p>
            <Link
              href={`/${lng}/login`}
              className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-foreground hover:bg-accent/85"
            >
              Log in to continue
            </Link>
          </>
        ) : (
          <>
            <p className="text-red-600">Post not found.</p>
            <Link href={`/${lng}/blog`} className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Feed
            </Link>
          </>
        )}
      </div>
    );
  }

  if (!postQuery.data) return null;

  const post = postQuery.data;
  const isAuthor = profile?.id === post.author_id;
  const isAdmin = profile?.role === "admin";
  const categoryLabel = CATEGORY_LABELS[post.category] ?? post.category;
  const hasStats = post.word_count > 0 || post.event_encounters > 0 || post.cards_count > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 xl:px-21">

      {/* ── Full-width header ── */}
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={`/${lng}`} className="hover:text-foreground">Trang chủ</Link>
        <span>›</span>
        <Link href={`/${lng}/${post.category}`} className="font-medium text-[#317F5F] hover:text-[#317F5F]/80">
          {categoryLabel}
        </Link>
      </nav>

      {/* Title */}
      <h1 className="mb-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
        {post.title}
      </h1>

      {/* Date + edit */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{formatDate(post.created_at)}</span>
        {(isAuthor || isAdmin) && (
          <Link
            href={`/${lng}/blog/${post.id}/edit`}
            className="rounded-full border border-border px-4 py-1 text-xs text-muted-foreground hover:bg-gray-50"
          >
            Edit Post
          </Link>
        )}
      </div>

      {/* Audio player */}
      {post.audio_url && <AudioPlayer src={post.audio_url} />}

      {/* Cover image */}
      {post.cover_image_url && (
        <figure className="mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full rounded-2xl object-cover"
          />
          {post.cover_image_caption && (
            <figcaption className="mt-2 text-center text-xs text-muted-foreground italic">
              {post.cover_image_caption}
            </figcaption>
          )}
        </figure>
      )}

      <div className="flex gap-10">
        {/* ── Article column ── */}
        <article className="min-w-0 flex-1">

          {/* Level badge */}
          {post.level && (
            <div className="mb-6">
              <span className="inline-block rounded-full bg-orange-400 px-3 py-1 text-xs font-semibold text-white">
                {LEVEL_LABELS[post.level] ?? post.level}
              </span>
            </div>
          )}

          {/* Body content */}
          <div className="mb-10">
            {post.content?.type === "blocks"
              ? <BlocksRenderer doc={post.content as unknown as BlocksDoc} />
              : <TipTapEditor content={post.content} editable={false} />
            }
          </div>

          {/* Stats row */}
          {hasStats && (
            <div className="mb-10 grid grid-cols-3 gap-x-4 py-8">
              {post.word_count > 0 && (
                <div className="border-b-2 border-gray-300 pb-3">
                  <p className="text-4xl font-bold text-foreground">{post.word_count.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">words</p>
                </div>
              )}
              {post.event_encounters > 0 && (
                <div className="border-b-2 border-gray-300 pb-3">
                  <p className="text-4xl font-bold text-foreground">{post.event_encounters}</p>
                  <p className="text-sm text-muted-foreground">event encounters</p>
                </div>
              )}
              {post.cards_count > 0 && (
                <div className="border-b-2 border-gray-300 pb-3">
                  <p className="text-4xl font-bold text-foreground">{post.cards_count}</p>
                  <p className="text-sm text-muted-foreground">cards</p>
                </div>
              )}
            </div>
          )}

          {/* Player Feedback */}
          {post.player_feedback.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-4 text-2xl font-bold text-foreground">Player Feedback</h2>
              {post.feedback_intro && (
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  {post.feedback_intro}
                </p>
              )}
              <div className="space-y-4">
                {post.player_feedback.map((fb, i) => (
                  <blockquote
                    key={i}
                    className="rounded-2xl border border-border bg-gray-50 px-6 py-5 text-sm leading-relaxed text-foreground"
                  >
                    &ldquo;{fb.content}&rdquo;
                  </blockquote>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">tags</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-white px-3 py-1 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Author block */}
          <div className="mb-8 flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-foreground font-bold text-lg">
              {post.author_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                an article by
              </p>
              <p className="font-semibold text-foreground">{post.author_name}</p>
            </div>
            <FollowButton targetUserId={post.author_id} />
          </div>

          {/* Share + Like */}
          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              spread the words
            </p>
            <div className="flex items-center gap-3">
              <LikeButton postId={post.id} likeCount={post.like_count} />
              <ShareButton title={post.title} />
            </div>
          </div>

          {/* Comments */}
          {profile && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <CommentSection postId={post.id} />
            </div>
          )}
        </article>

        {/* ── Sidebar ── */}
        <PopularSidebar currentId={post.id} category={post.category} />
      </div>
    </div>
  );
}

export default function PostPage({ params }: PostPageProps) {
  const { id } = use(params);
  return <PostContent id={id} />;
}
