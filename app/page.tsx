"use client";

import Link from "next/link";
import { useGamesConfig } from "@/hooks/useGamesConfig";
import { useSiteStatus } from "@/hooks/useSiteStatus";

const gameGradients: Record<string, string> = {
  snake: "from-emerald-400 to-green-600",
  pong:  "from-sky-400 to-blue-600",
  breakout: "from-violet-400 to-purple-600",
};

export default function Home() {
  const gamesQuery = useGamesConfig();
  const statusQuery = useSiteStatus();
  const loading = gamesQuery.isLoading || statusQuery.isLoading;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (statusQuery.data?.maintenance_mode) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">Under Maintenance</div>
          <h1 className="mb-2 text-2xl font-bold">Under Maintenance</h1>
          <p className="text-gray-500">We are making some improvements. Please check back soon!</p>
        </div>
      </div>
    );
  }

  const games = gamesQuery.data ?? [];
  const siteName = statusQuery.data?.site_name || "The Good Learning";

  return (
    <div>
      <div className="-mx-6 -mt-8 mb-12 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-6 py-20">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-accent">Classic Games Collection</p>
          <h1 className="mb-4 text-4xl font-bold leading-tight text-white sm:text-5xl">
            Play. Compete.<br />Top the Leaderboard.
          </h1>
          <p className="mb-8 text-gray-400 text-lg">
            A collection of classic arcade games built with vanilla JS and Canvas.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/leaderboard" className="rounded-full bg-[#c8e63d] px-6 py-2.5 text-sm font-medium text-gray-900 hover:bg-[#c8e63d]/85 transition-colors">
              View Leaderboard
            </Link>
            <Link href="/register" className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors">
              Create Account
            </Link>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#c8e63d]/10" />
        <div className="absolute -bottom-10 right-20 h-40 w-40 rounded-full bg-[#c8e63d]/5" />
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-500">Games</p>
      </div>
      <div className="mb-8 flex items-start justify-between">
        <h2 className="text-3xl font-bold">{siteName}</h2>
        <p className="max-w-xs text-right text-sm text-gray-500">
          Pick a game, set a high score, and claim your spot on the leaderboard.
        </p>
      </div>

      {games.length === 0 ? (
        <p className="text-gray-500 text-sm">No games available at the moment.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Link key={game.id} href={`/games/${game.id}`} className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-md">
              <div className={`flex h-40 items-center justify-center bg-gradient-to-br ${gameGradients[game.id] || "from-gray-400 to-gray-600"}`}>
                <span className="text-6xl drop-shadow">{game.icon}</span>
              </div>
              <div className="p-5">
                <h3 className="mb-1 text-lg font-semibold text-gray-900">{game.display_name}</h3>
                <p className="mb-4 text-sm text-gray-500">{game.description}</p>
                <span className="inline-block rounded-full border border-gray-200 px-3 py-0.5 text-xs text-gray-500 group-hover:border-accent group-hover:bg-[#c8e63d] group-hover:text-gray-900 transition-colors">
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
