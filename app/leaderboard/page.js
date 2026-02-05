"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { games } from "@/lib/games";

export default function Leaderboard() {
  const [scores, setScores] = useState([]);
  const [activeGame, setActiveGame] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScores();
  }, [activeGame]);

  async function fetchScores() {
    setLoading(true);
    const supabase = getSupabase();
    if (!supabase) { setLoading(false); return; }
    let query = supabase
      .from("scores")
      .select("*")
      .order("score", { ascending: false })
      .limit(20);

    if (activeGame !== "all") {
      query = query.eq("game", activeGame);
    }

    const { data, error } = await query;
    if (!error && data) {
      setScores(data);
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm text-foreground/50 hover:text-accent">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-accent">Leaderboard</h1>
        <div />
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveGame("all")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeGame === "all"
              ? "bg-accent text-background"
              : "border border-white/10 text-foreground/70 hover:bg-card"
          }`}
        >
          All Games
        </button>
        {games.map((g) => (
          <button
            key={g.id}
            onClick={() => setActiveGame(g.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeGame === g.id
                ? "bg-accent text-background"
                : "border border-white/10 text-foreground/70 hover:bg-card"
            }`}
          >
            {g.icon} {g.title}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-foreground/50">
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Player</th>
              <th className="px-6 py-3">Game</th>
              <th className="px-6 py-3 text-right">Score</th>
              <th className="px-6 py-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-foreground/30">
                  Loading...
                </td>
              </tr>
            ) : scores.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-foreground/30">
                  No scores yet. Play a game and save your score!
                </td>
              </tr>
            ) : (
              scores.map((s, i) => (
                <tr
                  key={s.id}
                  className="border-b border-white/5 transition-colors hover:bg-white/5"
                >
                  <td className="px-6 py-3 font-mono">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </td>
                  <td className="px-6 py-3 font-medium">{s.player_name}</td>
                  <td className="px-6 py-3 capitalize">{s.game}</td>
                  <td className="px-6 py-3 text-right font-mono text-accent">
                    {s.score}
                  </td>
                  <td className="px-6 py-3 text-right text-foreground/40">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
