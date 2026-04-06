"use client";

import { Users, Trophy, TrendingUp, Gamepad2 } from "lucide-react";
import { useAdminStats, AdminStats } from "@/hooks/admin/useAdminStats";

export default function AdminDashboard() {
  const statsQuery = useAdminStats();

  if (statsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-100" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </div>
    );
  }

  if (statsQuery.isError || !statsQuery.data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
        Failed to load dashboard stats.
      </div>
    );
  }

  const stats: AdminStats = statsQuery.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Overview of platform activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.total_users}
          icon={<Users className="h-4 w-4" />}
          accent="brand-primary"
        />
        <StatCard
          title="Total Scores"
          value={stats.total_scores}
          icon={<Trophy className="h-4 w-4" />}
          accent="brand-orange"
        />
        <StatCard
          title="Scores Today"
          value={stats.scores_today}
          icon={<TrendingUp className="h-4 w-4" />}
          accent="brand-lime"
        />
        <StatCard
          title="Most Popular"
          value={stats.most_popular_game?.game ?? "—"}
          subtitle={stats.most_popular_game ? `${stats.most_popular_game.count} plays` : undefined}
          icon={<Gamepad2 className="h-4 w-4" />}
          accent="brand-dark"
        />
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Players */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold text-foreground">Top Players</h2>
          </div>
          {stats.top_players.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">No players yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-2.5 text-left font-medium">#</th>
                  <th className="px-5 py-2.5 text-left font-medium">Player</th>
                  <th className="px-5 py-2.5 text-right font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {stats.top_players.map((p, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="px-5 py-3 font-medium text-muted-foreground">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-foreground">{p.display_name}</td>
                    <td className="px-5 py-3 text-right font-mono font-semibold text-brand-primary">
                      {p.total_score.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Scores */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold text-foreground">Recent Scores</h2>
          </div>
          {stats.recent_scores.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">No scores yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-2.5 text-left font-medium">Player</th>
                  <th className="px-5 py-2.5 text-left font-medium">Game</th>
                  <th className="px-5 py-2.5 text-right font-medium">Score</th>
                  <th className="px-5 py-2.5 text-right font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_scores.map((s, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="px-5 py-3 font-medium text-foreground">{s.player_name}</td>
                    <td className="px-5 py-3 capitalize text-muted-foreground">{s.game}</td>
                    <td className="px-5 py-3 text-right font-mono font-semibold text-brand-primary">
                      {s.score.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-muted-foreground">
                      {formatTime(s.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const accentClasses: Record<string, string> = {
  "brand-primary": "bg-brand-primary/10 text-brand-primary",
  "brand-orange":  "bg-brand-orange/10 text-brand-orange",
  "brand-lime":    "bg-brand-lime/20 text-brand-dark",
  "brand-dark":    "bg-brand-dark/10 text-brand-dark",
};

function StatCard({
  title,
  value,
  subtitle,
  icon,
  accent,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className={`mb-3 inline-flex items-center justify-center rounded-xl p-2 ${accentClasses[accent]}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-foreground">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="mt-0.5 text-sm text-muted-foreground">{title}</div>
      {subtitle && <div className="mt-0.5 text-xs text-muted-foreground">{subtitle}</div>}
    </div>
  );
}

function formatTime(date: string) {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString();
}
