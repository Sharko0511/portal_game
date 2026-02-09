import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase";

interface SaveScoreParams {
  game: string;
  score: number;
  playerName: string;
  userId?: string;
}

export function useSaveScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ game, score, playerName, userId }: SaveScoreParams) => {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");
      const row: Record<string, unknown> = {
        player_name: playerName,
        score,
        game,
      };
      if (userId) row.user_id = userId;
      const { error } = await supabase.from("scores").insert(row);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["profile", "scores"] });
    },
  });
}
