"use client";

import Link from "next/link";
import { useLng } from "@/hooks/useLng";
import { useGamesConfig } from "@/hooks/useGamesConfig";

const gameGradients: Record<string, string> = {
  snake: "from-emerald-400 to-green-600",
  pong: "from-sky-400 to-blue-600",
  breakout: "from-violet-400 to-purple-600",
};

export default function GamesPage() {
  const lng = useLng();
  const gamesQuery = useGamesConfig();
  const games = gamesQuery.data ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Bonus</p>
      </div>
      <div className="mb-8 flex items-start justify-between">
        <h1 className="text-3xl font-bold text-foreground">Mini Games</h1>
        <Link href={`/${lng}/leaderboard`} className="text-sm text-muted-foreground hover:text-foreground">
          Leaderboard →
        </Link>
      </div>

      {gamesQuery.isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : games.length === 0 ? (
        <p className="text-sm text-muted-foreground">No games available at the moment.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/${lng}/games/${game.id}`}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
            >
              <div
                className={`flex h-40 items-center justify-center bg-gradient-to-br ${
                  gameGradients[game.id] || "from-gray-400 to-gray-600"
                }`}
              >
                <span className="text-6xl drop-shadow">{game.icon}</span>
              </div>
              <div className="p-5">
                <h3 className="mb-1 text-lg font-semibold text-foreground">{game.display_name}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{game.description}</p>
                <span className="inline-block rounded-full border border-border px-3 py-0.5 text-xs text-muted-foreground transition-colors group-hover:border-[#c8e63d] group-hover:bg-[#c8e63d] group-hover:text-foreground">
                  Play Now
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
