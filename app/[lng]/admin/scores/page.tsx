"use client";

import { useState } from "react";
import { useAdminScores, useDeleteScore, useResetLeaderboard } from "@/hooks/admin/useAdminScores";
import Button from "@/components/Button";

const GAMES = ["snake", "pong", "breakout"];

export default function AdminScores() {
  const [game, setGame] = useState("");
  const [page, setPage] = useState(1);

  const scoresQuery = useAdminScores(page, game);
  const deleteScore = useDeleteScore();
  const resetLeaderboard = useResetLeaderboard();

  const scores = scoresQuery.data?.data ?? [];
  const total = scoresQuery.data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  async function handleDelete(scoreId: string) {
    if (!confirm("Delete this score?")) return;
    await deleteScore.mutateAsync(scoreId);
  }

  async function handleReset() {
    const gameToReset = prompt(`Enter game name to reset (${GAMES.join(", ")}):`);
    if (!gameToReset || !GAMES.includes(gameToReset)) {
      alert("Invalid game name");
      return;
    }
    if (!confirm(`Reset ALL scores for ${gameToReset}? This cannot be undone.`)) return;
    await resetLeaderboard.mutateAsync(gameToReset);
    alert(`${gameToReset} leaderboard reset`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Scores</h1>
        <div className="flex gap-2">
          <select
            value={game}
            onChange={(e) => {
              setGame(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm"
          >
            <option value="">All Games</option>
            {GAMES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <Button onClick={handleReset} variant="danger">
            Reset Leaderboard
          </Button>
        </div>
      </div>

      {scoresQuery.isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <>
          <div className="rounded-2xl border border-border bg-gray-50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-muted-foreground">
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3">Game</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {scores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No scores found
                    </td>
                  </tr>
                ) : (
                  scores.map((s) => (
                    <tr key={s.id} className="border-b border-border/50">
                      <td className="px-4 py-3">{s.player_name}</td>
                      <td className="px-4 py-3 capitalize">{s.game}</td>
                      <td className="px-4 py-3 font-mono text-foreground">{s.score}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(s.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          onClick={() => handleDelete(s.id)}
                          variant="danger-ghost"
                          size="sm"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="secondary"
                size="sm"
              >
                Prev
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                variant="secondary"
                size="sm"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
