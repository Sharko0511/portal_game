"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/admin-fetch";

export interface FollowProfile {
  id: string;
  display_name: string;
}

// ── Follow status ────────────────────────────────────────

export function useFollowStatus(targetUserId: string) {
  return useQuery<boolean>({
    queryKey: ["follow-status", targetUserId],
    queryFn: async () => {
      const res = await adminFetch(`/api/blog/users/${targetUserId}/follow`);
      if (!res.ok) return false;
      const json = await res.json();
      return json.data?.following ?? false;
    },
    enabled: !!targetUserId,
  });
}

// ── Toggle follow ────────────────────────────────────────

export function useToggleFollow(targetUserId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await adminFetch(`/api/blog/users/${targetUserId}/follow`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Failed to toggle follow");
      return json.data.following as boolean;
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["follow-status", targetUserId] });
      const prev = qc.getQueryData<boolean>(["follow-status", targetUserId]);
      qc.setQueryData(["follow-status", targetUserId], (old: boolean | undefined) => !old);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) {
        qc.setQueryData(["follow-status", targetUserId], ctx.prev);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["follow-status", targetUserId] });
      qc.invalidateQueries({ queryKey: ["followers", targetUserId] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

// ── Followers list ───────────────────────────────────────

export function useFollowers(userId: string) {
  return useQuery<FollowProfile[]>({
    queryKey: ["followers", userId],
    queryFn: async () => {
      const res = await adminFetch(`/api/blog/users/${userId}/followers`);
      if (!res.ok) return [];
      const json = await res.json();
      return (json.data ?? []).map(
        (r: { follower_id: string; profiles: FollowProfile }) => r.profiles
      );
    },
    enabled: !!userId,
  });
}

// ── Following list ───────────────────────────────────────

export function useFollowing(userId: string) {
  return useQuery<FollowProfile[]>({
    queryKey: ["following", userId],
    queryFn: async () => {
      const res = await adminFetch(`/api/blog/users/${userId}/following`);
      if (!res.ok) return [];
      const json = await res.json();
      return (json.data ?? []).map(
        (r: { following_id: string; profiles: FollowProfile }) => r.profiles
      );
    },
    enabled: !!userId,
  });
}
