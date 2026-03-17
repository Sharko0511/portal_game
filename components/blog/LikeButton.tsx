"use client";

import { useLikeStatus, useToggleLike } from "@/hooks/blog/useLike";
import { useAuth } from "@/hooks/useAuth";
import { useLng } from "@/hooks/useLng";
import { useClientTranslation } from "@/hooks/useClientTranslation";

interface LikeButtonProps {
  postId: string;
  likeCount: number;
  onLoginRequired?: () => void;
}

export default function LikeButton({ postId, likeCount, onLoginRequired }: LikeButtonProps) {
  const { user } = useAuth();
  const lng = useLng();
  const { t } = useClientTranslation(lng, "blog_post");
  const statusQuery = useLikeStatus(postId);
  const toggle = useToggleLike(postId);

  const liked = statusQuery.data ?? false;
  const pending = toggle.isPending;

  return (
    <button
      onClick={() => { if (!user) { onLoginRequired?.(); return; } toggle.mutate(); }}
      disabled={!!user && (pending || statusQuery.isLoading)}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
        liked
          ? "border-[#c8e63d] bg-[#c8e63d] text-foreground"
          : "border-border bg-white text-muted-foreground hover:border-gray-400 hover:text-foreground"
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
        {liked ? t("liked") : t("like")} · {likeCount}
      </span>
    </button>
  );
}
