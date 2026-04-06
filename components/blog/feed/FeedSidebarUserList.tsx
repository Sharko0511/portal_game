"use client";

import { useState } from "react";
import Link from "next/link";
import { FollowProfile } from "@/hooks/blog/useFollow";
import FollowButton from "@/components/blog/FollowButton";
import { useLng } from "@/hooks/useLng";

const AVATAR_COLORS = [
  "bg-blue-200 text-blue-800",
  "bg-purple-200 text-purple-800",
  "bg-green-200 text-green-800",
  "bg-orange-200 text-orange-800",
  "bg-pink-200 text-pink-800",
  "bg-teal-200 text-teal-800",
];

function avatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

interface Props {
  title: string;
  users: FollowProfile[];
  loading: boolean;
}

const MAX_VISIBLE = 5;

export default function FeedSidebarUserList({ title, users, loading }: Props) {
  const [expanded, setExpanded] = useState(false);
  const lng = useLng();

  const visible = expanded ? users : users.slice(0, MAX_VISIBLE);
  const hasMore = users.length > MAX_VISIBLE;

  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title} {!loading && <span>({users.length})</span>}
      </h3>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-7 w-7 animate-pulse rounded-full bg-gray-200" />
              <div className="h-3 flex-1 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <p className="text-xs text-muted-foreground">None yet</p>
      ) : (
        <>
          <ul className="space-y-1">
            {visible.map((user) => (
              <li key={user.id} className="flex items-center gap-2">
                <Link
                  href={`/${lng}/users/${user.id}`}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-1 hover:bg-gray-100"
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColor(user.id)}`}
                  >
                    {user.display_name.charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate text-sm">{user.display_name}</span>
                </Link>
                <FollowButton targetUserId={user.id} />
              </li>
            ))}
          </ul>

          {hasMore && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 text-xs text-muted-foreground hover:text-foreground"
            >
              {expanded ? "Show less" : `+${users.length - MAX_VISIBLE} more`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
