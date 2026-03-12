"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfileScores } from "@/hooks/useProfileScores";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import Button from "@/components/Button";

function ProfileContent() {
  const { profile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");

  const scoresQuery = useProfileScores(profile?.id);
  const updateProfile = useUpdateProfile();

  const scores = scoresQuery.data ?? [];

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
    }
  }, [profile]);

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

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-foreground/40 focus:ring-2 focus:ring-[#c8e63d]/20"
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

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
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
