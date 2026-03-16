"use client";

import { use } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import TipTapEditor from "@/components/blog/TipTapEditor";
import { BlocksRenderer, BlocksDoc } from "@/components/blog/BlockEditor";
import LikeButton from "@/components/blog/LikeButton";
import FollowButton from "@/components/blog/FollowButton";
import CommentSection from "@/components/blog/CommentSection";
import ShareButton from "@/components/blog/ShareButton";
import { usePost } from "@/hooks/blog/usePost";
import { useAuth } from "@/hooks/useAuth";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function PostContent({ id }: { id: string }) {
  const { profile } = useAuth();
  const postQuery = usePost(id);

  if (postQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-8 w-2/3 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-4 w-1/3 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (postQuery.isError || !postQuery.data) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-red-600">Post not found or you don&apos;t have access.</p>
        <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-900">
          ← Back to Feed
        </Link>
      </div>
    );
  }

  const post = postQuery.data;
  const isAuthor = profile?.id === post.author_id;
  const isAdmin = profile?.role === "admin";

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back */}
      <div className="mb-6">
        <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-900">
          ← Back to Feed
        </Link>
      </div>

      {/* Cover image */}
      {post.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="mb-8 h-64 w-full rounded-2xl object-cover sm:h-80"
        />
      )}

      {/* Meta + Follow */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="font-medium text-gray-900">{post.author_name}</span>
          <span>·</span>
          <span>{formatDate(post.created_at)}</span>
          {post.updated_at !== post.created_at && (
            <>
              <span>·</span>
              <span className="text-xs">edited {formatDate(post.updated_at)}</span>
            </>
          )}
        </div>
        <FollowButton targetUserId={post.author_id} />
      </div>

      {/* Title */}
      <h1 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl">{post.title}</h1>

      {/* Stats row */}
      <div className="mb-8 flex items-center gap-6 border-b border-gray-100 pb-6 text-sm text-gray-500">
        <span>{post.like_count} likes</span>
        <span>{post.comment_count} comments</span>
        {(isAuthor || isAdmin) && (
          <Link
            href={`/blog/${post.id}/edit`}
            className="ml-auto rounded-full border border-gray-200 px-4 py-1 text-xs text-gray-600 hover:bg-gray-50"
          >
            Edit Post
          </Link>
        )}
      </div>

      {/* Content */}
      <div className="mb-12">
        {post.content?.type === "blocks"
          ? <BlocksRenderer doc={post.content as unknown as BlocksDoc} />
          : <TipTapEditor content={post.content} editable={false} />
        }
      </div>

      {/* Like + Share */}
      <div className="mb-8 flex items-center gap-3">
        <LikeButton postId={post.id} likeCount={post.like_count} />
        <ShareButton title={post.title} />
      </div>

      {/* Comments */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}

export default function PostPage({ params }: PostPageProps) {
  const { id } = use(params);
  return (
    <ProtectedRoute>
      <PostContent id={id} />
    </ProtectedRoute>
  );
}
