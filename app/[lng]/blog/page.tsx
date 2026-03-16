"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import PostList from "@/components/blog/PostList";
import { usePosts } from "@/hooks/blog/usePosts";
import { useLng } from "@/hooks/useLng";

function BlogFeedContent() {
  const postsQuery = usePosts();
  const lng = useLng();

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="mb-3">
        <p className="text-sm text-gray-500">Blog</p>
      </div>
      <div className="mb-8 flex items-start justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Your Feed</h1>
        <div className="flex items-center gap-3">
          <p className="hidden max-w-xs text-right text-sm text-gray-500 sm:block">
            Posts from people you follow
          </p>
          <Link
            href={`/${lng}/blog/new`}
            className="rounded-full bg-[#c8e63d] px-5 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-[#c8e63d]/85"
          >
            + New Post
          </Link>
        </div>
      </div>

      <PostList
        posts={postsQuery.data ?? []}
        loading={postsQuery.isLoading}
        emptyMessage="No posts yet. Follow people or write your first post!"
      />
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
