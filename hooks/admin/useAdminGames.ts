import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetchJson, adminFetch } from "@/lib/admin-fetch";

export interface AdminGameConfig {
  id: string;
  display_name: string;
  description: string;
  icon: string;
  enabled: boolean;
  config: Record<string, number>;
}

export function useAdminGames() {
  return useQuery<AdminGameConfig[]>({
    queryKey: ["admin", "games"],
    queryFn: async () => {
      const res = await adminFetchJson<{ data: AdminGameConfig[] }>(
        "/api/admin/games"
      );
      return res.data;
    },
  });
}

export function useUpdateAdminGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      gameId,
      patch,
    }: {
      gameId: string;
      patch: Record<string, unknown>;
    }) => {
      const res = await adminFetch(`/api/admin/games/${gameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed to update game");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "games"] });
      queryClient.invalidateQueries({ queryKey: ["games", "config"] });
    },
  });
}
