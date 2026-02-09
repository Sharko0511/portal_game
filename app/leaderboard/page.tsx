"use client";

import { useState } from "react";
import Link from "next/link";
import { useGamesConfig } from "@/hooks/useGamesConfig";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import Button from "@/components/Button";

export default function Leaderboard() {
  const [activeGame, setActiveGame] = useState("all");
  const gamesQuery = useGamesConfig();
  const scoresQuery = useLeaderboard(activeGame);

  const games = gamesQuery.data ?? [];
  const scores = scoresQuery.data ?? [];

  function getGameDisplay(gameId: string): { name: string; icon: string } {
    const game = games.find((g) => g.id === gameId);
    return game
      ? { name: game.display_name, icon: game.icon }
      : { name: gameId, icon: "" };
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

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          onClick={() => setActiveGame("all")}
          variant={activeGame === "all" ? "primary" : "secondary"}
          size="lg"
        >
          All Games
        </Button>
        {games.map((g) => (
          <Button
            key={g.id}
            onClick={() => setActiveGame(g.id)}
            variant={activeGame === g.id ? "primary" : "secondary"}
            size="lg"
          >
            {g.icon} {g.display_name}
          </Button>
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
            {scoresQuery.isLoading ? (
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
              scores.map((s, i) => {
                const gameDisplay = getGameDisplay(s.game);
                return (
                  <tr
                    key={s.id}
                    className="border-b border-white/5 transition-colors hover:bg-white/5"
                  >
                    <td className="px-6 py-3 font-mono">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </td>
                    <td className="px-6 py-3 font-medium">{s.player_name}</td>
                    <td className="px-6 py-3">
                      {gameDisplay.icon} {gameDisplay.name}
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-accent">
                      {s.score}
                    </td>
                    <td className="px-6 py-3 text-right text-foreground/40">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
