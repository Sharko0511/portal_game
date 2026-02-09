import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetchJson, adminFetch } from "@/lib/admin-fetch";

export interface SiteConfig {
  key: string;
  value: string | boolean;
  description: string;
}

export function useAdminConfig() {
  return useQuery<SiteConfig[]>({
    queryKey: ["admin", "config"],
    queryFn: async () => {
      const res = await adminFetchJson<{ data: SiteConfig[] }>("/api/admin/config");
      return res.data;
    },
  });
}

export function useUpdateAdminConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      key,
      value,
    }: {
      key: string;
      value: string | boolean;
    }) => {
      const res = await adminFetch("/api/admin/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error("Failed to save config");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "config"] });
      queryClient.invalidateQueries({ queryKey: ["site", "status"] });
    },
  });
}
