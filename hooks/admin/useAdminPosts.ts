import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetchJson, adminFetch } from "@/lib/admin-fetch";

export interface AdminPost {
  id: string;
  title: string;
  slug: string;
  author_id: string;
  author_name: string;
  author_role: "admin" | "user";
  visibility: "private" | "share" | "public";
  category: "blog" | "baohay" | "audiochat";
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null;
  tags: string[];
  reading_time: number;
  word_count: number;
  cover_image_url: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminPostsParams {
  page: number;
  search: string;
  visibility: string;
  level: string;
  category: string;
  sort: string;
}

export function useAdminPosts(params: AdminPostsParams) {
  return useQuery<{ data: AdminPost[]; total: number; page: number; totalPages: number }>({
    queryKey: ["admin", "posts", params],
    queryFn: async () => {
      const p = new URLSearchParams({ page: String(params.page), limit: "10" });
      if (params.search) p.set("search", params.search);
      if (params.visibility !== "all") p.set("visibility", params.visibility);
      if (params.level !== "all") p.set("level", params.level);
      if (params.category !== "all") p.set("category", params.category);
      if (params.sort) p.set("sort", params.sort);
      return adminFetchJson(`/api/admin/posts?${p}`);
    },
    placeholderData: (prev) => prev,
  });
}

export interface PostCounts {
  total: number;
  public: number;
  share: number;
  private: number;
}

export function useAdminPostsCounts(params: Omit<AdminPostsParams, "page" | "visibility" | "sort">) {
  return useQuery<PostCounts>({
    queryKey: ["admin", "posts", "counts", params],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (params.search) p.set("search", params.search);
      if (params.level !== "all") p.set("level", params.level);
      if (params.category !== "all") p.set("category", params.category);
      return adminFetchJson(`/api/admin/posts/stats?${p}`);
    },
  });
}

export function useAdminChangeVisibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      postId,
      visibility,
    }: {
      postId: string;
      visibility: "private" | "share" | "public";
    }) => {
      const res = await adminFetch(`/api/admin/posts/${postId}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility }),
      });
      if (!res.ok) throw new Error("Failed to update visibility");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
    },
  });
}

export function useAdminDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const res = await adminFetch(`/api/blog/posts/${postId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete post");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
    },
  });
}
