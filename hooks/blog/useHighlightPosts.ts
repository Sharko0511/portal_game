"use client";

import { useQuery } from "@tanstack/react-query";

export interface HighlightPost {
  id: string;
  title: string;
  cover_image_url: string | null;
  like_count: number;
  comment_count: number;
  author_name: string;
  author_id: string;
  created_at: string;
  slug: string;
}

export function useHighlightPosts() {
  const query = useQuery<{ popular: HighlightPost[]; recent: HighlightPost[] }>({
    queryKey: ["highlight-posts"],
    queryFn: async () => {
      const res = await fetch("/api/blog/posts/highlights");
      if (!res.ok) return { popular: [], recent: [] };
      const json = await res.json();
      return json.data ?? { popular: [], recent: [] };
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    popular: query.data?.popular ?? [],
    recent: query.data?.recent ?? [],
    isLoading: query.isLoading,
  };
}
