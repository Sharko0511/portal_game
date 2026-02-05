import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const supabase = getSupabaseAdmin();

  // Total users
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Total scores
  const { count: totalScores } = await supabase
    .from("scores")
    .select("*", { count: "exact", head: true });

  // Scores today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: scoresToday } = await supabase
    .from("scores")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  // Most popular game (by score count)
  const { data: gameScores } = await supabase
    .from("scores")
    .select("game");

  const gameCounts = {};
  (gameScores || []).forEach((s) => {
    gameCounts[s.game] = (gameCounts[s.game] || 0) + 1;
  });
  const mostPopularGame = Object.entries(gameCounts)
    .sort((a, b) => b[1] - a[1])[0];

  // Top 5 players
  const { data: allScores } = await supabase
    .from("scores")
    .select("user_id, player_name, score")
    .not("user_id", "is", null);

  const playerTotals = {};
  (allScores || []).forEach((s) => {
    if (!playerTotals[s.user_id]) {
      playerTotals[s.user_id] = { display_name: s.player_name, total_score: 0 };
    }
    playerTotals[s.user_id].total_score += s.score;
  });
  const topPlayers = Object.values(playerTotals)
    .sort((a, b) => b.total_score - a.total_score)
    .slice(0, 5);

  // Recent 10 scores
  const { data: recentScores } = await supabase
    .from("scores")
    .select("player_name, game, score, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  return NextResponse.json({
    total_users: totalUsers || 0,
    total_scores: totalScores || 0,
    scores_today: scoresToday || 0,
    most_popular_game: mostPopularGame
      ? { game: mostPopularGame[0], count: mostPopularGame[1] }
      : null,
    top_players: topPlayers,
    recent_scores: recentScores || [],
  });
}
