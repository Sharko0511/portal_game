"use client";

import { useState } from "react";
import {
  useAdminScores,
  useDeleteScore,
  useResetLeaderboard,
} from "@/hooks/admin/useAdminScores";
import Button from "@/components/Button";
import ConfirmDialog from "@/components/ui/confirm-dialog";

const GAMES = ["snake", "pong", "breakout"];

export default function AdminScores() {
  const [game, setGame] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetTargetGame, setResetTargetGame] = useState<string>(GAMES[0]);
  const [resetMessage, setResetMessage] = useState<string>("");
  const [resetError, setResetError] = useState<string>("");

  const scoresQuery = useAdminScores(page, game);
  const deleteScore = useDeleteScore();
  const resetLeaderboard = useResetLeaderboard();

  const scores = scoresQuery.data?.data ?? [];
  const total = scoresQuery.data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  function handleDelete(scoreId: string) {
    setDeleteTargetId(scoreId);
  }

  async function handleDeleteConfirm() {
    if (!deleteTargetId) return;
    await deleteScore.mutateAsync(deleteTargetId);
    setDeleteTargetId(null);
  }

  function handleResetOpen() {
    setResetError("");
    setResetMessage("");
    setResetTargetGame(game && GAMES.includes(game) ? game : GAMES[0]);
    setShowResetDialog(true);
  }

  async function handleResetConfirm() {
    setResetError("");
    try {
      await resetLeaderboard.mutateAsync(resetTargetGame);
      setShowResetDialog(false);
      setResetMessage(`${resetTargetGame} leaderboard reset`);
    } catch (e) {
      setResetError(
        e instanceof Error ? e.message : "Failed to reset leaderboard",
      );
    }
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
          <Button onClick={handleResetOpen} variant="danger">
            Reset Leaderboard
          </Button>
        </div>
      </div>

      {resetMessage && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {resetMessage}
        </p>
      )}

      {resetError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {resetError}
        </p>
      )}

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
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No scores found
                    </td>
                  </tr>
                ) : (
                  scores.map((s) => (
                    <tr key={s.id} className="border-b border-border/50">
                      <td className="px-4 py-3">{s.player_name}</td>
                      <td className="px-4 py-3 capitalize">{s.game}</td>
                      <td className="px-4 py-3 font-mono text-foreground">
                        {s.score}
                      </td>
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

      {deleteTargetId && (
        <ConfirmDialog
          title="Delete Score"
          message="Delete this score?"
          confirmLabel="Delete Score"
          loading={deleteScore.isPending}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTargetId(null)}
        />
      )}

      {showResetDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">
              Reset Leaderboard
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Reset ALL scores for selected game? This cannot be undone.
            </p>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-foreground">
                Game
              </label>
              <select
                value={resetTargetGame}
                onChange={(e) => setResetTargetGame(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
              >
                {GAMES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <Button
                size="md"
                variant="danger"
                onClick={handleResetConfirm}
                disabled={resetLeaderboard.isPending}
              >
                {resetLeaderboard.isPending ? "Resetting..." : "Reset"}
              </Button>
              <Button
                size="md"
                variant="secondary"
                onClick={() => setShowResetDialog(false)}
                disabled={resetLeaderboard.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
