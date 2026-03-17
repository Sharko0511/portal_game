"use client";

import Link from "next/link";
import { useAudiochat } from "@/hooks/blog/usePost";
import ArticleListByLevel from "@/components/blog/ArticleListByLevel";
import { useLng } from "@/hooks/useLng";
import { useClientTranslation } from "@/hooks/useClientTranslation";

// ── Page ──────────────────────────────────────────────────────

export default function AudiochatPage() {
  const { data: posts, isLoading } = useAudiochat();
  const lng = useLng();
  const { t } = useClientTranslation(lng, "audiochat");

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
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-between px-4 py-6 md:px-6 xl:px-21">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-white/70">
            <Link href={`/${lng}`} className="hover:text-white">{t("breadcrumb.home")}</Link>
            <span>›</span>
            <span className="font-medium text-[#c8e63d]">Audio chat</span>
          </nav>

          {/* Tagline */}
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
