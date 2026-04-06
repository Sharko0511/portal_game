import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch, adminFetchJson } from "@/lib/admin-fetch";

export interface ThemeRow {
  variable: string;
  theme: string;
  value: string;
  label: string;
  group_name: string;
  description: string;
}

export function useAdminTheme() {
  return useQuery<ThemeRow[]>({
    queryKey: ["admin", "theme"],
    queryFn: async () => {
      const res = await adminFetchJson<{ data: ThemeRow[] }>("/api/admin/theme");
      return res.data;
    },
  });
}

export function useUpdateThemeVar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { variable: string; theme: string; value: string }) => {
      const res = await adminFetch("/api/admin/theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "theme"] }),
  });
}

export function useAddTheme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; copyFrom: string }) => {
      const res = await adminFetch("/api/admin/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? "Failed to add theme");
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "theme"] }),
  });
}

export function useDeleteTheme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (theme: string) => {
      const res = await adminFetch(`/api/admin/theme?theme=${encodeURIComponent(theme)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? "Failed to delete theme");
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "theme"] }),
  });
}
