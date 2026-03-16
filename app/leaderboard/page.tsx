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
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
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

      <div className="rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
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
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : scores.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  No scores yet. Play a game and save your score!
                </td>
              </tr>
            ) : (
              scores.map((s, i) => {
                const gameDisplay = getGameDisplay(s.game);
                return (
                  <tr
                    key={s.id}
                    className="border-b border-gray-200/50 transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-3 font-mono">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </td>
                    <td className="px-6 py-3 font-medium">{s.player_name}</td>
                    <td className="px-6 py-3">
                      {gameDisplay.icon} {gameDisplay.name}
                    </td>
                    <td className="px-6 py-3 text-right font-mono font-semibold text-gray-900">
                      {s.score}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-500">
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
