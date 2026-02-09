import { useQuery } from "@tanstack/react-query";
import { adminFetchJson } from "@/lib/admin-fetch";

export interface AdminStats {
  total_users: number;
  total_scores: number;
  scores_today: number;
  most_popular_game: { game: string; count: number } | null;
  top_players: { display_name: string; total_score: number }[];
  recent_scores: {
    player_name: string;
    game: string;
    score: number;
    created_at: string;
  }[];
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: () => adminFetchJson<AdminStats>("/api/admin/stats"),
  });
}
