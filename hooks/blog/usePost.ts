"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/admin-fetch";

export interface Post {
  id: string;
  author_id: string;
  author_name: string;
  title: string;
  content: Record<string, unknown>;
  cover_image_url: string | null;
  slug: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  like_count: number;
  comment_count: number;
}

// ── Fetch single post ────────────────────────────────────

export function usePost(id: string) {
  return useQuery<Post>({
    queryKey: ["post", id],
    queryFn: async () => {
      const res = await adminFetch(`/api/blog/posts/${id}`);
      if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);
      const json = await res.json();
      return json.data as Post;
    },
    enabled: !!id,
  });
}

// ── Create post ──────────────────────────────────────────

interface CreatePostInput {
  title: string;
  content: Record<string, unknown>;
  cover_image_url?: string | null;
  published?: boolean;
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePostInput) => {
      const res = await adminFetch("/api/blog/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Failed to create post");
      return json.data as Post;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

// ── Update post ──────────────────────────────────────────

interface UpdatePostInput {
  id: string;
  title?: string;
  content?: Record<string, unknown>;
  cover_image_url?: string | null;
  published?: boolean;
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: UpdatePostInput) => {
      const res = await adminFetch(`/api/blog/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Failed to update post");
      return json.data as Post;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["post", vars.id] });
    },
  });
}
