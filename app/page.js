import Link from "next/link";
import { games } from "@/lib/games";

export default function Home() {
  return (
    <div>
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-4xl font-bold text-accent">Game Portal</h1>
        <p className="text-foreground/60">
          A collection of classic games built with vanilla JS &amp; Canvas
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <Link
            key={game.id}
            href={game.path}
            className="group rounded-xl border border-white/10 bg-card p-6 transition-all hover:border-accent/30 hover:bg-card-hover"
          >
            <div className="mb-4 text-5xl">{game.icon}</div>
            <h2
              className="mb-2 text-xl font-semibold"
              style={{ color: game.color }}
            >
              {game.title}
            </h2>
            <p className="text-sm text-foreground/50">{game.description}</p>
            <div className="mt-4 text-sm font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
              Play Now →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
