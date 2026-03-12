"use client";

import { useState } from "react";
import { Comment } from "@/hooks/blog/useComments";
import { useAuth } from "@/hooks/useAuth";

interface CommentItemProps {
  comment: Comment;
  onDelete: (id: string) => void;
  deleting?: boolean;
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function CommentItem({ comment, onDelete, deleting }: CommentItemProps) {
  const { profile } = useAuth();
  const [confirming, setConfirming] = useState(false);

  const canDelete =
    profile?.id === comment.author_id || profile?.role === "admin";

  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
        {comment.profiles?.display_name?.charAt(0).toUpperCase() ?? "?"}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="mb-0.5 flex items-baseline gap-2">
          <span className="text-sm font-medium text-gray-900">
            {comment.profiles?.display_name ?? "Unknown"}
          </span>
          <span className="text-xs text-gray-400">{formatRelative(comment.created_at)}</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>

        {/* Delete */}
        {canDelete && (
          <div className="mt-1">
            {confirming ? (
              <span className="text-xs text-gray-400">
                Delete?{" "}
                <button
                  onClick={() => { onDelete(comment.id); setConfirming(false); }}
                  disabled={deleting}
                  className="text-red-500 hover:underline"
                >
                  Yes
                </button>{" "}
                ·{" "}
                <button
                  onClick={() => setConfirming(false)}
                  className="text-gray-500 hover:underline"
                >
                  No
                </button>
              </span>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
