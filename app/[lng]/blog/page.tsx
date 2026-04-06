"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import PostList from "@/components/blog/PostList";
import FeedLeftSidebar from "@/components/blog/feed/FeedLeftSidebar";
import FeedRightSidebar from "@/components/blog/feed/FeedRightSidebar";
import { usePosts } from "@/hooks/blog/usePosts";
import { useLng } from "@/hooks/useLng";
import { useClientTranslation } from "@/hooks/useClientTranslation";

function BlogFeedContent() {
  const postsQuery = usePosts();
  const lng = useLng();
  const { t } = useClientTranslation(lng, "common");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={`/${lng}`} className="hover:text-foreground">{t("navigation.home")}</Link>
        <span>›</span>
        <span className="font-medium text-foreground">{t("navigation.feed")}</span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <h1 className="text-3xl font-bold text-foreground">Your Feed</h1>
        <div className="flex items-center gap-3">
          <p className="hidden max-w-xs text-right text-sm text-muted-foreground sm:block">
            Posts from people you follow
          </p>
          <Link
            href={`/${lng}/blog/new`}
            className="rounded-full bg-brand-lime-bright px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-brand-lime-bright/85"
          >
            + New Post
          </Link>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr_260px]">
        <aside className="hidden lg:block">
          <FeedLeftSidebar />
        </aside>

        <main className="min-w-0">
          <PostList
            posts={postsQuery.data ?? []}
            loading={postsQuery.isLoading}
            emptyMessage="No posts yet. Follow people or write your first post!"
            singleColumn
          />
        </main>

        <aside className="hidden lg:block">
          <FeedRightSidebar />
        </aside>
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <ProtectedRoute>
      <BlogFeedContent />
    </ProtectedRoute>
  );
}
