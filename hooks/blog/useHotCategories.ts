import { useQuery } from "@tanstack/react-query";
import { Post } from "@/hooks/blog/usePost";

export interface HotCategoryWithPosts {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  is_hot: boolean;
  is_active: boolean;
  sort_order: number;
  posts: Post[];
}

export function useHotCategories(limitPerCategory = 6) {
  return useQuery<HotCategoryWithPosts[]>({
    queryKey: ["site", "hot-categories", { limitPerCategory }],
    queryFn: async () => {
      const res = await fetch(
        `/api/site/hot-categories-with-posts?limitPerCategory=${limitPerCategory}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Failed to fetch hot categories");
      return (json.data ?? []) as HotCategoryWithPosts[];
    },
  });
}
