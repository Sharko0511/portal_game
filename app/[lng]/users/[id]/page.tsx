"use client";

import { use } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserCard from "@/components/blog/UserCard";
import PostList from "@/components/blog/PostList";
import { useUserPosts } from "@/hooks/blog/useUserPosts";
import { getSupabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useLng } from "@/hooks/useLng";

interface UserPageProps {
  params: Promise<{ id: string }>;
}

interface UserProfile {
  id: string;
  display_name: string;
  created_at: string;
}

function UserProfileContent({ userId }: { userId: string }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const postsQuery = useUserPosts(userId);
  const lng = useLng();

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) { setProfileLoading(false); return; }

    supabase
      .from("profiles")
      .select("id, display_name, created_at")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        setUserProfile(data as UserProfile | null);
        setProfileLoading(false);
      });
  }, [userId]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {/* Back */}
      <div className="mb-6">
        <Link href={`/${lng}/blog`} className="text-sm text-gray-500 hover:text-gray-900">
          ← Back to Feed
        </Link>
      </div>

      {/* User card */}
      <div className="mb-8">
        {profileLoading ? (
          <div className="h-36 animate-pulse rounded-2xl border border-gray-200 bg-gray-100" />
        ) : userProfile ? (
          <UserCard
            userId={userProfile.id}
            displayName={userProfile.display_name}
            joinedAt={userProfile.created_at}
          />
        ) : (
          <p className="text-sm text-red-600">User not found.</p>
        )}
      </div>

      {/* Posts section */}
      <div>
        <div className="mb-3">
          <p className="text-sm text-gray-500">Posts</p>
        </div>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          {userProfile?.display_name ?? "..."}&apos;s Posts
        </h2>

        <PostList
          posts={postsQuery.data ?? []}
          loading={postsQuery.isLoading}
          emptyMessage="No posts yet, or you need to follow this user to see their posts."
        />
      </div>
    </div>
  );
}

export default function UserProfilePage({ params }: UserPageProps) {
  const { id } = use(params);
  return (
    <ProtectedRoute>
      <UserProfileContent userId={id} />
    </ProtectedRoute>
  );
}
