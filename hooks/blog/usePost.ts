"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/admin-fetch";

export type PostCategory = "blog" | "baohay" | "audiochat";
export type PostLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type PostVisibility = "private" | "share" | "public";

export interface PlayerFeedback {
  content: string;
}

export interface Post {
  id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  title: string;
  content: Record<string, unknown>;
  cover_image_url: string | null;
  cover_image_caption: string | null;
  slug: string;
  visibility: PostVisibility;
  created_at: string;
  updated_at: string;
  like_count: number;
  comment_count: number;
  // article fields
  category: PostCategory;
  level: PostLevel | null;
  audio_url: string | null;
  reading_time: number;
  tags: string[];
  word_count: number;
  event_encounters: number;
  cards_count: number;
  feedback_intro: string | null;
  player_feedback: PlayerFeedback[];
}

// ── Fetch single post ────────────────────────────────────

export function usePost(id: string) {
  return useQuery<Post>({
    queryKey: ["post", id],
    queryFn: async () => {
      const res = await fetch(`/api/blog/posts/${id}`);
      if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);
      const json = await res.json();
      return json.data as Post;
    },
    enabled: !!id,
  });
}

// ── Fetch baohay posts (public) ──────────────────────────

export function useBaohay() {
  return useQuery<Post[]>({
    queryKey: ["baohay"],
    queryFn: async () => {
      const res = await fetch("/api/blog/baohay");
      if (!res.ok) throw new Error(`Failed to fetch baohay: ${res.status}`);
      const json = await res.json();
      return json.data as Post[];
    },
  });
}

// ── Fetch audiochat posts (public) ───────────────────────

export function useAudiochat() {
  return useQuery<Post[]>({
    queryKey: ["audiochat"],
    queryFn: async () => {
      const res = await fetch("/api/blog/audiochat");
      if (!res.ok) throw new Error(`Failed to fetch audiochat: ${res.status}`);
      const json = await res.json();
      return json.data as Post[];
    },
  });
}

// ── Search public posts ──────────────────────────────────

export interface SearchParams {
  q?: string;
  level?: PostLevel | "";
  tag?: string;
  category?: PostCategory | "";
  limit?: number;
  offset?: number;
}

export function useSearch(params: SearchParams) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.level) query.set("level", params.level);
  if (params.tag) query.set("tag", params.tag);
  if (params.category) query.set("category", params.category);
  if (params.limit) query.set("limit", String(params.limit));
  if (params.offset) query.set("offset", String(params.offset));

  const qs = query.toString();

  return useQuery<Post[]>({
    queryKey: ["search", qs],
    queryFn: async () => {
      const res = await fetch(`/api/blog/search${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error(`Search failed: ${res.status}`);
      const json = await res.json();
      return json.data as Post[];
    },
  });
}

// ── Create post ──────────────────────────────────────────

interface CreatePostInput {
  title: string;
  content: Record<string, unknown>;
  cover_image_url?: string | null;
  cover_image_caption?: string | null;
  visibility?: PostVisibility;
  category?: PostCategory;
  level?: PostLevel | null;
  audio_url?: string | null;
  reading_time?: number;
  tags?: string[];
  word_count?: number;
  event_encounters?: number;
  cards_count?: number;
  feedback_intro?: string | null;
  player_feedback?: PlayerFeedback[];
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
  cover_image_caption?: string | null;
  visibility?: PostVisibility;
  category?: PostCategory;
  level?: PostLevel | null;
  audio_url?: string | null;
  reading_time?: number;
  tags?: string[];
  word_count?: number;
  event_encounters?: number;
  cards_count?: number;
  feedback_intro?: string | null;
  player_feedback?: PlayerFeedback[];
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
