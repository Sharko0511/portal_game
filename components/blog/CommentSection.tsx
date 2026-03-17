"use client";

import { useState } from "react";
import CommentItem from "./CommentItem";
import { useComments, useAddComment, useDeleteComment } from "@/hooks/blog/useComments";
import { useAuth } from "@/hooks/useAuth";

interface CommentSectionProps {
  postId: string;
  onLoginRequired?: () => void;
}

export default function CommentSection({ postId, onLoginRequired }: CommentSectionProps) {
  const [text, setText] = useState("");
  const { user } = useAuth();
  const commentsQuery = useComments(postId);
  const addComment = useAddComment(postId);
  const deleteComment = useDeleteComment(postId);

  const comments = commentsQuery.data ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    await addComment.mutateAsync(trimmed);
    setText("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-foreground">Comments</h2>
        {!commentsQuery.isLoading && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {comments.length}
          </span>
        )}
      </div>

      {/* Add comment */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent);
              }
            }}
            placeholder="Write a comment... (Enter to submit)"
            rows={2}
            className="flex-1 resize-none rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
          />
          <button
            type="submit"
            disabled={!text.trim() || addComment.isPending}
            className="self-end rounded-full bg-[#c8e63d] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[#c8e63d]/85 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {addComment.isPending ? "..." : "Post"}
          </button>
        </form>
      ) : (
        <button
          onClick={onLoginRequired}
          className="w-full rounded-xl border border-border bg-gray-50 px-4 py-3 text-left text-sm text-muted-foreground hover:bg-gray-100 transition-colors"
        >
          Sign in to leave a comment...
        </button>
      )}

      {/* Error */}
      {addComment.isError && (
        <p className="text-xs text-red-500">
          {(addComment.error as Error).message}
        </p>
      )}

      {/* Comments list */}
      {commentsQuery.isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {comments.map((c) => (
            <div key={c.id} className="py-4 first:pt-0">
              <CommentItem
                comment={c}
                onDelete={(id) => deleteComment.mutate(id)}
                deleting={deleteComment.isPending}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
