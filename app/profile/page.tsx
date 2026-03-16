"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfileScores } from "@/hooks/useProfileScores";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import Button from "@/components/Button";

function ProfileContent() {
  const { profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [telegramStatus, setTelegramStatus] = useState<"idle" | "pending" | "loading">("idle");
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scoresQuery = useProfileScores(profile?.id);
  const updateProfile = useUpdateProfile();

  const scores = scoresQuery.data ?? [];

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
    }
    // Stop polling once telegram is linked
    if (profile?.telegram_chat_id && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
      setTelegramStatus("idle");
    }
  }, [profile]);

  // Clean up poll on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function handleConnectTelegram() {
    setTelegramStatus("loading");
    const supabase = (await import("@/lib/supabase")).getSupabase();
    const session = (await supabase?.auth.getSession())?.data.session;
    const res = await fetch("/api/telegram/link", {
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    const json = await res.json();
    if (json.data?.deep_link) {
      setDeepLink(json.data.deep_link);
      setTelegramStatus("pending");
      // Poll every 3s to see if the user has linked
      pollRef.current = setInterval(() => {
        refreshProfile();
      }, 3000);
    } else {
      setTelegramStatus("idle");
    }
  }

  async function handleDisconnectTelegram() {
    setTelegramStatus("loading");
    const supabase = (await import("@/lib/supabase")).getSupabase();
    const session = (await supabase?.auth.getSession())?.data.session;
    await fetch("/api/telegram/link", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    await refreshProfile();
    setDeepLink(null);
    setTelegramStatus("idle");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setMessage("");
    try {
      await updateProfile.mutateAsync({
        profileId: profile.id,
        displayName,
      });
      setMessage("Profile updated!");
    } catch {
      setMessage("Failed to update profile");
    }
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40 focus:ring-2 focus:ring-[#c8e63d]/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900">Email</label>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
          <div className="flex gap-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900">Role</label>
              <p className="text-sm text-gray-500">{profile.role}</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900">Member since</label>
              <p className="text-sm text-foreground/50">
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          {message && (
            <p className={`text-sm ${message.includes("Failed") ? "text-red-600" : "text-green-700"}`}>
              {message}
            </p>
          )}
          <Button
            type="submit"
            disabled={updateProfile.isPending}
            size="lg"
          >
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-1 text-lg font-semibold">Telegram Notifications</h2>
        <p className="mb-4 text-sm text-gray-500">
          Link your Telegram account to receive a notification when authors you follow post new content.
        </p>
        {profile.telegram_chat_id ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-green-700 font-medium">Connected</span>
            <Button
              type="button"
              size="lg"
              disabled={telegramStatus === "loading"}
              onClick={handleDisconnectTelegram}
            >
              {telegramStatus === "loading" ? "Disconnecting..." : "Disconnect"}
            </Button>
          </div>
        ) : telegramStatus === "pending" && deepLink ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              Click the button to open Telegram. When the bot opens, click <b>START</b> to link your account.
            </p>
            <a
              href={deepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg bg-[#229ED9] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a8bc4]"
            >
              Open Telegram & Link Account
            </a>
            <p className="text-xs text-gray-500">
              Button not working? Open <b>@gameportal_notify_bot</b> in Telegram and send this command manually:
            </p>
            <code className="block rounded bg-gray-100 px-3 py-2 text-xs text-gray-800 select-all">
              /start {deepLink.split("start=")[1]}
            </code>
          </div>
        ) : (
          <Button
            type="button"
            size="lg"
            disabled={telegramStatus === "loading"}
            onClick={handleConnectTelegram}
          >
            {telegramStatus === "loading" ? "Generating link..." : "Connect Telegram"}
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">My Scores</h2>
        {scoresQuery.isLoading ? (
          <p className="text-sm text-gray-500">Loading scores...</p>
        ) : scores.length === 0 ? (
          <p className="text-sm text-gray-500">No scores yet. Go play some games!</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500 text-xs uppercase tracking-wide">
                <th className="pb-2">#</th>
                <th className="pb-2">Game</th>
                <th className="pb-2">Score</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s, i) => (
                <tr key={s.id} className="border-b border-gray-200/50">
                  <td className="py-2 text-gray-500">{i + 1}</td>
                  <td className="py-2 capitalize">{s.game}</td>
                  <td className="py-2 font-mono font-semibold text-gray-900">{s.score}</td>
                  <td className="py-2 text-foreground/50">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
