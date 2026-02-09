import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetchJson, adminFetch } from "@/lib/admin-fetch";

export interface AdminScore {
  id: string;
  player_name: string;
  game: string;
  score: number;
  created_at: string;
}

export function useAdminScores(page: number, game: string) {
  return useQuery<{ data: AdminScore[]; total: number }>({
    queryKey: ["admin", "scores", { page, game }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (game) params.set("game", game);
      return adminFetchJson<{ data: AdminScore[]; total: number }>(
        `/api/admin/scores?${params}`
      );
    },
    placeholderData: (prev) => prev,
  });
}

export function useDeleteScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (scoreId: string) => {
      const res = await adminFetch(`/api/admin/scores/${scoreId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "scores"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

export function useResetLeaderboard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (game: string) => {
      const res = await adminFetch("/api/admin/scores/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game }),
      });
      if (!res.ok) throw new Error("Failed to reset");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "scores"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}
