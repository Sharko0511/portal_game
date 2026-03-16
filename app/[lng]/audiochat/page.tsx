"use client";

import Link from "next/link";
import { useAudiochat } from "@/hooks/blog/usePost";
import ArticleListByLevel from "@/components/blog/ArticleListByLevel";
import { useLng } from "@/hooks/useLng";

// ── Page ──────────────────────────────────────────────────────

export default function AudiochatPage() {
  const { data: posts, isLoading } = useAudiochat();
  const lng = useLng();

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={`/${lng}`} className="hover:text-foreground">Trang chủ</Link>
        <span>›</span>
        <span className="font-medium text-[#c8e63d]">Audio chat</span>
      </nav>

      {/* Hero banner */}
      <div className="mb-12 overflow-hidden rounded-3xl relative min-h-48 flex items-end">
        {/* Dark background with subtle texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700" />
        {/* Decorative audio illustration */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-8xl opacity-20 select-none">
          🎧
        </div>
        <div className="relative z-10 p-8">
          <p className="text-2xl font-bold text-white sm:text-3xl">
            Cải thiện khả năng nghe qua audio.
          </p>
        </div>
      </div>

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
  );
}
