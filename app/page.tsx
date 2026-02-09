"use client";

import Link from "next/link";
import { useGamesConfig } from "@/hooks/useGamesConfig";
import { useSiteStatus } from "@/hooks/useSiteStatus";

export default function Home() {
  const gamesQuery = useGamesConfig();
  const statusQuery = useSiteStatus();

  const loading = gamesQuery.isLoading || statusQuery.isLoading;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-foreground/50">Loading...</div>
      </div>
    );
  }

  if (statusQuery.data?.maintenance_mode) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">🔧</div>
          <h1 className="mb-2 text-2xl font-bold text-accent">
            Under Maintenance
          </h1>
          <p className="text-foreground/60">
            We&apos;re making some improvements. Please check back soon!
          </p>
        </div>
      </div>
    );
  }

  const games = gamesQuery.data ?? [];
  const gameColors: Record<string, string> = {
    snake: "#4ade80",
    pong: "#38bdf8",
    breakout: "#a78bfa",
  };

  return (
    <div>
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-4xl font-bold text-accent">
          {statusQuery.data?.site_name || "Game Portal"}
        </h1>
        <p className="text-foreground/60">
          A collection of classic games built with vanilla JS &amp; Canvas
        </p>
      </div>

      {games.length === 0 ? (
        <div className="text-center text-foreground/50">
          No games available at the moment.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="group rounded-xl border border-white/10 bg-card p-6 transition-all hover:border-accent/30 hover:bg-card-hover"
            >
              <div className="mb-4 text-5xl">{game.icon}</div>
              <h2
                className="mb-2 text-xl font-semibold"
                style={{ color: gameColors[game.id] || "#00e5ff" }}
              >
                {game.display_name}
              </h2>
              <p className="text-sm text-foreground/50">{game.description}</p>
              <div className="mt-4 text-sm font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                Play Now →
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
