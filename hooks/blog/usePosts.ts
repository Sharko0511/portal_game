"use client";

import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/admin-fetch";
import { Post } from "./usePost";

interface UsePostsOptions {
  author?: string;
  limit?: number;
  offset?: number;
}

export function usePosts(options: UsePostsOptions = {}) {
  const { author, limit = 20, offset = 0 } = options;

  return useQuery<Post[]>({
    queryKey: ["posts", { author, limit, offset }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (author) params.set("author", author);
      params.set("limit", String(limit));
      params.set("offset", String(offset));

      const res = await adminFetch(`/api/blog/posts?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
      const json = await res.json();
      return json.data as Post[];
    },
  });
}
