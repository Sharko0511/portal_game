"use client";

import Link from "next/link";
import {
  useHighlightPosts,
  HighlightPost,
} from "@/hooks/blog/useHighlightPosts";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function PostMiniCard({ post }: { post: HighlightPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="flex items-start gap-2 rounded-lg p-1.5 hover:bg-gray-100"
    >
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {post.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200">
            <span className="text-sm font-bold text-gray-400">
              {post.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-xs font-medium leading-snug text-foreground">
          {post.title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {post.like_count} likes · {formatDate(post.created_at)}
        </p>
      </div>
    </Link>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-2">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-gray-200" />
          <div className="flex-1 space-y-1.5 pt-1">
            <div className="h-2.5 animate-pulse rounded bg-gray-200" />
            <div className="h-2 w-2/3 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FeedRightSidebar() {
  const { popular, recent, isLoading } = useHighlightPosts();

  return (
    <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto space-y-5 pb-4">
      {/* Popular */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Most Popular
        </h3>
        {isLoading ? (
          <SkeletonRows />
        ) : popular.length === 0 ? (
          <p className="text-xs text-muted-foreground">No posts yet</p>
        ) : (
          <ul className="space-y-1">
            {popular.map((post) => (
              <li key={post.id}>
                <PostMiniCard post={post} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <hr className="border-border" />

      {/* Recent */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Most Recent
        </h3>
        {isLoading ? (
          <SkeletonRows />
        ) : recent.length === 0 ? (
          <p className="text-xs text-muted-foreground">No posts yet</p>
        ) : (
          <ul className="space-y-1">
            {recent.map((post) => (
              <li key={post.id}>
                <PostMiniCard post={post} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
