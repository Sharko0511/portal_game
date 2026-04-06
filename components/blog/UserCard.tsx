"use client";

import FollowButton from "./FollowButton";
import { useFollowers, useFollowing } from "@/hooks/blog/useFollow";

interface UserCardProps {
  userId: string;
  displayName: string;
  joinedAt?: string;
}

export default function UserCard({ userId, displayName, joinedAt }: UserCardProps) {
  const followersQ = useFollowers(userId);
  const followingQ = useFollowing(userId);

  const followerCount = followersQ.data?.length ?? 0;
  const followingCount = followingQ.data?.length ?? 0;

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      {/* Avatar + name */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-muted-foreground">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{displayName}</h2>
          {joinedAt && (
            <p className="text-xs text-muted-foreground">
              Joined {new Date(joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 flex gap-6 text-sm">
        <div>
          <span className="font-semibold text-foreground">{followerCount}</span>{" "}
          <span className="text-muted-foreground">followers</span>
        </div>
        <div>
          <span className="font-semibold text-foreground">{followingCount}</span>{" "}
          <span className="text-muted-foreground">following</span>
        </div>
      </div>

      {/* Follow button */}
      <FollowButton targetUserId={userId} followerCount={followerCount} />
    </div>
  );
}
