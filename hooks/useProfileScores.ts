import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase";

export interface ProfileScore {
  id: string;
  game: string;
  score: number;
  created_at: string;
}

export function useProfileScores(userId: string | undefined) {
  return useQuery<ProfileScore[]>({
    queryKey: ["profile", "scores", userId],
    queryFn: async () => {
      const supabase = getSupabase();
      if (!supabase || !userId) return [];
      const { data, error } = await supabase
        .from("scores")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data as ProfileScore[]) || [];
    },
    enabled: !!userId,
  });
}
