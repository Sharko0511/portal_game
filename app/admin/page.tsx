"use client";

import { useAdminStats, AdminStats } from "@/hooks/admin/useAdminStats";

export default function AdminDashboard() {
  const statsQuery = useAdminStats();

  if (statsQuery.isLoading) {
    return <div className="text-gray-500">Loading stats...</div>;
  }

  if (statsQuery.isError || !statsQuery.data) {
    return <div className="text-red-600">Failed to load stats</div>;
  }

  const stats: AdminStats = statsQuery.data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={stats.total_users} icon="👥" />
        <StatCard title="Total Scores" value={stats.total_scores} icon="🏆" />
        <StatCard title="Scores Today" value={stats.scores_today} icon="📈" />
        <StatCard
          title="Most Popular"
          value={stats.most_popular_game?.game || "—"}
          subtitle={stats.most_popular_game ? `${stats.most_popular_game.count} plays` : undefined}
          icon="🎮"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-semibold">Top Players</h2>
          {stats.top_players.length === 0 ? (
            <p className="text-sm text-gray-500">No players yet</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {stats.top_players.map((p, i) => (
                  <tr key={i} className="border-b border-gray-200/50">
                    <td className="py-2 text-gray-500">{i + 1}</td>
                    <td className="py-2">{p.display_name}</td>
                    <td className="py-2 text-right font-mono font-semibold text-gray-900">{p.total_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-semibold">Recent Scores</h2>
          {stats.recent_scores.length === 0 ? (
            <p className="text-sm text-gray-500">No scores yet</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {stats.recent_scores.map((s, i) => (
                  <tr key={i} className="border-b border-gray-200/50">
                    <td className="py-2">{s.player_name}</td>
                    <td className="py-2 capitalize text-gray-500">{s.game}</td>
                    <td className="py-2 text-right font-mono font-semibold text-gray-900">{s.score}</td>
                    <td className="py-2 text-right text-xs text-gray-500">
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

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-2 text-2xl">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{title}</div>
      {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
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
