"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/admin-fetch";

// ── Fetch like status ────────────────────────────────────

export function useLikeStatus(postId: string) {
  return useQuery<boolean>({
    queryKey: ["like", postId],
    queryFn: async () => {
      const res = await adminFetch(`/api/blog/posts/${postId}/like`);
      if (!res.ok) return false;
      const json = await res.json();
      return json.data?.liked ?? false;
    },
    enabled: !!postId,
  });
}

// ── Toggle like ──────────────────────────────────────────

export function useToggleLike(postId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await adminFetch(`/api/blog/posts/${postId}/like`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Failed to toggle like");
      return json.data.liked as boolean;
    },
    // Optimistic update
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["like", postId] });
      const prev = qc.getQueryData<boolean>(["like", postId]);
      qc.setQueryData(["like", postId], (old: boolean | undefined) => !old);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      // Roll back on error
      if (ctx?.prev !== undefined) {
        qc.setQueryData(["like", postId], ctx.prev);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["like", postId] });
      qc.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
}
