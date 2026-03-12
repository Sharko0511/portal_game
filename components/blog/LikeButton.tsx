"use client";

import { useLikeStatus, useToggleLike } from "@/hooks/blog/useLike";

interface LikeButtonProps {
  postId: string;
  likeCount: number;
}

export default function LikeButton({ postId, likeCount }: LikeButtonProps) {
  const statusQuery = useLikeStatus(postId);
  const toggle = useToggleLike(postId);

  const liked = statusQuery.data ?? false;
  const pending = toggle.isPending;

  return (
    <button
      onClick={() => toggle.mutate()}
      disabled={pending || statusQuery.isLoading}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
        liked
          ? "border-[#c8e63d] bg-[#c8e63d] text-gray-900"
          : "border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900"
      }`}
    >
      <svg
        className={`h-4 w-4 transition-transform ${pending ? "scale-90" : liked ? "scale-110" : ""}`}
        fill={liked ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>
        {liked ? "Liked" : "Like"} · {likeCount}
      </span>
    </button>
  );
}
