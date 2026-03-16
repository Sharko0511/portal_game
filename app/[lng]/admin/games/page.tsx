"use client";

import { useEffect, useState } from "react";
import { useAdminGames, useUpdateAdminGame, AdminGameConfig } from "@/hooks/admin/useAdminGames";
import Button from "@/components/Button";

const CONFIG_FIELDS: Record<string, string[]> = {
  snake: ["speed", "grid_size", "score_per_food"],
  pong: ["ball_speed", "ai_speed", "win_score"],
  breakout: ["ball_speed", "lives", "brick_rows", "brick_cols"],
};

export default function AdminGames() {
  const gamesQuery = useAdminGames();
  const updateGame = useUpdateAdminGame();
  const [games, setGames] = useState<AdminGameConfig[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (gamesQuery.data) {
      setGames(gamesQuery.data);
    }
  }, [gamesQuery.data]);

  async function toggleEnabled(gameId: string, enabled: boolean) {
    await updateGame.mutateAsync({ gameId, patch: { enabled: !enabled } });
  }

  async function saveConfig(gameId: string, config: Record<string, number>) {
    setSavingId(gameId);
    setMessage("");
    try {
      await updateGame.mutateAsync({ gameId, patch: { config } });
      setMessage(`${gameId} config saved`);
    } catch {
      setMessage("Failed to save");
    }
    setSavingId(null);
  }

  function handleConfigChange(gameId: string, field: string, value: string) {
    setGames((prev) =>
      prev.map((g) =>
        g.id === gameId
          ? { ...g, config: { ...g.config, [field]: parseInt(value) || 0 } }
          : g
      )
    );
  }

  if (gamesQuery.isLoading) {
    return <p className="text-gray-500">Loading...</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Game Configuration</h1>

      {message && (
        <p className={`text-sm ${message.includes("Failed") ? "text-red-600" : "text-green-700"}`}>
          {message}
        </p>
      )}

      <div className="space-y-4">
        {games.map((g) => (
          <div key={g.id} className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{g.icon}</span>
                <div>
                  <h3 className="font-semibold">{g.display_name}</h3>
                  <p className="text-sm text-gray-500">{g.description}</p>
                </div>
              </div>
              <Button
                onClick={() => toggleEnabled(g.id, g.enabled)}
                variant={g.enabled ? "success" : "ghost"}
              >
                {g.enabled ? "Enabled" : "Disabled"}
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(CONFIG_FIELDS[g.id] || []).map((field) => (
                <div key={field}>
                  <label className="mb-1 block text-xs text-gray-500">
                    {field.replace(/_/g, " ")}
                  </label>
                  <input
                    type="number"
                    value={g.config[field] || 0}
                    onChange={(e) => handleConfigChange(g.id, field, e.target.value)}
                    className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-sm"
                  />
                </div>
              ))}
            </div>

            <Button
              onClick={() => saveConfig(g.id, g.config)}
              disabled={savingId === g.id}
              size="lg"
              className="mt-4"
            >
              {savingId === g.id ? "Saving..." : "Save Config"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
