"use client";

import { useAuth } from "@/hooks/useAuth";
import { useFollowing, useFollowers } from "@/hooks/blog/useFollow";
import UserSearchPanel from "./UserSearchPanel";
import FeedSidebarUserList from "./FeedSidebarUserList";

export default function FeedLeftSidebar() {
  const { user } = useAuth();

  const followingQuery = useFollowing(user?.id ?? "");
  const followersQuery = useFollowers(user?.id ?? "");

  return (
    <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto space-y-5 pb-4">
      <UserSearchPanel />

      <hr className="border-border" />

      <FeedSidebarUserList
        title="Following"
        users={followingQuery.data ?? []}
        loading={followingQuery.isLoading}
      />

      <hr className="border-border" />

      <FeedSidebarUserList
        title="Followers"
        users={followersQuery.data ?? []}
        loading={followersQuery.isLoading}
      />
    </div>
  );
}
