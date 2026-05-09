import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch, adminFetchJson } from "@/lib/admin-fetch";

export interface AdminCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  is_hot: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface UpsertCategoryInput {
  name: string;
  slug?: string;
  description?: string | null;
  is_hot?: boolean;
  is_active?: boolean;
  sort_order?: number;
}

export function useAdminCategories(includeInactive = false, enabled = true) {
  return useQuery<AdminCategory[]>({
    queryKey: ["admin", "categories", { includeInactive }],
    enabled,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (includeInactive) params.set("includeInactive", "true");
      const res = await adminFetchJson<{ data: AdminCategory[] }>(
        `/api/admin/categories${params.toString() ? `?${params.toString()}` : ""}`
      );
      return res.data ?? [];
    },
  });
}

export function useAdminCategorySearch(query: string, enabled = true, limit = 12) {
  return useQuery<AdminCategory[]>({
    queryKey: ["admin", "categories", "search", { query, limit }],
    enabled,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      if (query.trim()) {
        params.set("q", query.trim());
      }
      const res = await adminFetchJson<{ data: AdminCategory[] }>(
        `/api/admin/categories?${params.toString()}`
      );
      return res.data ?? [];
    },
  });
}

export function useCreateAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpsertCategoryInput) => {
      const res = await adminFetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Failed to create category");
      return json.data as AdminCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });
}

export function useUpdateAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<UpsertCategoryInput> & { id: string }) => {
      const res = await adminFetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Failed to update category");
      return json.data as AdminCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });
}

export function useDeleteAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Failed to delete category");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });
}

export function useToggleAdminCategoryHot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_hot }: { id: string; is_hot: boolean }) => {
      const res = await adminFetch(`/api/admin/categories/${id}/hot`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_hot }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Failed to update hot category");
      return json.data as AdminCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });
}
