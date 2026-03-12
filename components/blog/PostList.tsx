"use client";

import { Post } from "@/hooks/blog/usePost";
import PostCard from "./PostCard";

interface PostListProps {
  posts: Post[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function PostList({
  posts,
  loading = false,
  emptyMessage = "No posts yet.",
}: PostListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl border border-gray-200 bg-gray-100"
          />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-gray-200">
        <p className="text-sm text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  const [featured, ...rest] = posts;

  return (
    <div className="space-y-4">
      {/* First post is featured */}
      <PostCard post={featured} featured />

      {/* Rest are compact */}
      {rest.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {rest.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
