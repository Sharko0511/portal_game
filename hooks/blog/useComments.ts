"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/admin-fetch";

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  profiles: {
    id: string;
    display_name: string;
  };
}

// ── Fetch comments ───────────────────────────────────────

export function useComments(postId: string) {
  return useQuery<Comment[]>({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const res = await adminFetch(`/api/blog/posts/${postId}/comments`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data as Comment[];
    },
    enabled: !!postId,
  });
}

// ── Add comment ──────────────────────────────────────────

export function useAddComment(postId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const res = await adminFetch(`/api/blog/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Failed to post comment");
      return json.data as Comment;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", postId] });
      qc.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
}

// ── Delete comment ───────────────────────────────────────

export function useDeleteComment(postId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const res = await adminFetch(`/api/blog/comments/${commentId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Failed to delete comment");
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", postId] });
      qc.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
}
