import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase";

export interface LeaderboardScore {
  id: string;
  player_name: string;
  game: string;
  score: number;
  created_at: string;
}

export function useLeaderboard(activeGame: string) {
  return useQuery<LeaderboardScore[]>({
    queryKey: ["leaderboard", activeGame],
    queryFn: async () => {
      const supabase = getSupabase();
      if (!supabase) return [];
      let query = supabase
        .from("scores")
        .select("*")
        .order("score", { ascending: false })
        .limit(20);
      if (activeGame !== "all") {
        query = query.eq("game", activeGame);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data as LeaderboardScore[]) || [];
    },
    staleTime: 30 * 1000,
  });
}
