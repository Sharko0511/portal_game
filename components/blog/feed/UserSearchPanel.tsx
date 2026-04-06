"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useUserSearch } from "@/hooks/blog/useUserSearch";
import { useFollowers } from "@/hooks/blog/useFollow";
import { useAuth } from "@/hooks/useAuth";
import FollowButton from "@/components/blog/FollowButton";
import { useLng } from "@/hooks/useLng";

export default function UserSearchPanel() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lng = useLng();

  const { user } = useAuth();
  const { data: results = [], isLoading } = useUserSearch(query);
  const { data: followers = [] } = useFollowers(user?.id ?? "");

  const followerIds = useMemo(
    () => new Set(followers.map((f) => f.id)),
    [followers]
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const showDropdown = open && query.length >= 2;

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-gray-50 px-3 py-2">
        <svg
          className="h-4 w-4 shrink-0 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" strokeWidth="2" />
          <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search people..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {isLoading && (
          <div className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-border border-t-foreground" />
        )}
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-border bg-white shadow-lg">
          {results.length === 0 && !isLoading ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">No users found</p>
          ) : (
            <ul>
              {results.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50"
                >
                  <Link
                    href={`/${lng}/users/${user.id}`}
                    className="flex min-w-0 flex-1 items-center gap-2"
                    onClick={() => setOpen(false)}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-lime-bright text-xs font-bold">
                      {user.display_name.charAt(0).toUpperCase()}
                    </span>
                    <span className="truncate text-sm font-medium">{user.display_name}</span>
                    {followerIds.has(user.id) && (
                      <span
                        title="Follows you"
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-500"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-2.5 w-2.5">
                          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                        </svg>
                      </span>
                    )}
                  </Link>
                  <FollowButton targetUserId={user.id} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
