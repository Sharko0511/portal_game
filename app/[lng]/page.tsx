"use client";

import Link from "next/link";
import { useLng } from "@/hooks/useLng";
import { useSiteStatus } from "@/hooks/useSiteStatus";
import { useGamesConfig } from "@/hooks/useGamesConfig";

const gameGradients: Record<string, string> = {
  snake: "from-emerald-400 to-green-600",
  pong: "from-sky-400 to-blue-600",
  breakout: "from-violet-400 to-purple-600",
};

export default function HomePage() {
  const lng = useLng();
  const statusQuery = useSiteStatus();
  const gamesQuery = useGamesConfig();

  if (statusQuery.data?.maintenance_mode) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">🔧</div>
          <h1 className="mb-2 text-2xl font-bold">Under Maintenance</h1>
          <p className="text-gray-500">We are making some improvements. Please check back soon!</p>
        </div>
      </div>
    );
  }

  const games = gamesQuery.data ?? [];

  return (
    <div>
      {/* Hero */}
      <div className="-mx-6 -mt-8 mb-12 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-6 py-20">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#c8e63d]">
            The Good Learning
          </p>
          <h1 className="mb-4 text-4xl font-bold leading-tight text-white sm:text-5xl">
            Learn. Share.<br />Grow Together.
          </h1>
          <p className="mb-8 text-lg text-gray-400">
            A place to read, write, and discuss ideas. Follow writers you love and get notified when they post.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href={`/${lng}/blog`}
              className="rounded-full bg-[#c8e63d] px-6 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-[#c8e63d]/85"
            >
              Read the Blog
            </Link>
            <Link
              href={`/${lng}/register`}
              className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Start Writing
            </Link>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#c8e63d]/10" />
        <div className="absolute -bottom-10 right-20 h-40 w-40 rounded-full bg-[#c8e63d]/5" />
      </div>

      {/* Games section */}
      {games.length > 0 && (
        <>
          <div className="mb-3">
            <p className="text-sm text-gray-500">Bonus</p>
          </div>
          <div className="mb-8 flex items-start justify-between">
            <h2 className="text-3xl font-bold text-gray-900">Mini Games</h2>
            <Link
              href={`/${lng}/leaderboard`}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Leaderboard →
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <Link
                key={game.id}
                href={`/${lng}/games/${game.id}`}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
              >
                <div
                  className={`flex h-40 items-center justify-center bg-gradient-to-br ${
                    gameGradients[game.id] || "from-gray-400 to-gray-600"
                  }`}
                >
                  <span className="text-6xl drop-shadow">{game.icon}</span>
                </div>
                <div className="p-5">
                  <h3 className="mb-1 text-lg font-semibold text-gray-900">{game.display_name}</h3>
                  <p className="mb-4 text-sm text-gray-500">{game.description}</p>
                  <span className="inline-block rounded-full border border-gray-200 px-3 py-0.5 text-xs text-gray-500 transition-colors group-hover:border-[#c8e63d] group-hover:bg-[#c8e63d] group-hover:text-gray-900">
                    Play Now
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
