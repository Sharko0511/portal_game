"use client";

import { useFollowStatus, useToggleFollow } from "@/hooks/blog/useFollow";
import { useAuth } from "@/hooks/useAuth";

interface FollowButtonProps {
  targetUserId: string;
  /** Show follower count alongside button */
  followerCount?: number;
}

export default function FollowButton({ targetUserId, followerCount }: FollowButtonProps) {
  const { user } = useAuth();
  const statusQuery = useFollowStatus(targetUserId);
  const toggle = useToggleFollow(targetUserId);

  // Don't show the button for your own profile
  if (!user || user.id === targetUserId) return null;

  const following = statusQuery.data ?? false;
  const pending = toggle.isPending;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => toggle.mutate()}
        disabled={pending || statusQuery.isLoading}
        className={`rounded-full border px-5 py-2 text-sm font-medium transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
          following
            ? "border-gray-300 bg-white text-gray-700 hover:border-red-300 hover:text-red-600"
            : "border-transparent bg-[#c8e63d] text-gray-900 hover:bg-[#c8e63d]/85"
        }`}
      >
        {pending ? "..." : following ? "Following" : "Follow"}
      </button>

      {followerCount !== undefined && (
        <span className="text-sm text-gray-500">
          {followerCount} {followerCount === 1 ? "follower" : "followers"}
        </span>
      )}
    </div>
  );
}
