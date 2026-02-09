import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetchJson, adminFetch } from "@/lib/admin-fetch";

export interface AdminUser {
  id: string;
  display_name: string;
  email: string;
  role: "admin" | "user";
  is_banned: boolean;
  created_at: string;
  score_count: number;
}

export function useAdminUsers(page: number, search: string) {
  return useQuery<{ data: AdminUser[]; total: number }>({
    queryKey: ["admin", "users", { page, search }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      return adminFetchJson<{ data: AdminUser[]; total: number }>(
        `/api/admin/users?${params}`
      );
    },
    placeholderData: (prev) => prev,
  });
}

export function useToggleBan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      isBanned,
    }: {
      userId: string;
      isBanned: boolean;
    }) => {
      const res = await adminFetch(`/api/admin/users/${userId}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_banned: !isBanned }),
      });
      if (!res.ok) throw new Error("Failed to toggle ban");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useChangeRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: string;
    }) => {
      const res = await adminFetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed to change role");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await adminFetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
