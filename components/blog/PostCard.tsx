"use client";

import Link from "next/link";
import { Post } from "@/hooks/blog/usePost";

/** Extract plain text preview from TipTap JSON */
function extractPreview(content: Record<string, unknown>, maxLen = 120): string {
  const parts: string[] = [];

  function walk(node: unknown) {
    if (!node || typeof node !== "object") return;
    const n = node as Record<string, unknown>;
    if (n.type === "text" && typeof n.text === "string") {
      parts.push(n.text);
    }
    if (Array.isArray(n.content)) {
      (n.content as unknown[]).forEach(walk);
    }
  }

  walk(content);
  const text = parts.join(" ").trim();
  return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + "…" : text;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface PostCardProps {
  post: Post;
  featured?: boolean;
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  const preview = extractPreview(post.content);

  if (featured) {
    // Large card — full-width with big image
    return (
      <Link
        href={`/blog/${post.id}`}
        className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
      >
        {/* Cover */}
        <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 sm:h-80">
          {post.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-5xl font-bold text-gray-300">
                {post.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
            <span className="font-medium text-gray-700">{post.author_name}</span>
            <span>·</span>
            <span>{formatDate(post.created_at)}</span>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900 group-hover:underline">
            {post.title}
          </h2>
          {preview && (
            <p className="mb-4 text-sm text-gray-500 line-clamp-2">{preview}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>{post.like_count} likes</span>
            <span>{post.comment_count} comments</span>
            <span className="ml-auto inline-block rounded-full border border-gray-200 px-3 py-0.5 text-gray-500">
              Read
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Compact card — thumbnail left, content right
  return (
    <Link
      href={`/blog/${post.id}`}
      className="group flex gap-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm"
    >
      {/* Thumbnail */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {post.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-xl font-bold text-gray-300">
              {post.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
          <span className="font-medium text-gray-700">{post.author_name}</span>
          <span>·</span>
          <span>{formatDate(post.created_at)}</span>
        </div>
        <h3 className="mb-1 text-sm font-semibold text-gray-900 group-hover:underline line-clamp-2">
          {post.title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{post.like_count} likes</span>
          <span>{post.comment_count} comments</span>
          <span className="ml-auto inline-block rounded-full border border-gray-200 px-2.5 py-0.5 text-gray-500">
            Read
          </span>
        </div>
      </div>
    </Link>
  );
}
