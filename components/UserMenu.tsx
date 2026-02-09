"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function UserMenu() {
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    await signOut();
    setOpen(false);
    router.push("/");
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-foreground/70 transition-colors hover:border-accent/30 hover:text-accent"
      >
        {profile?.display_name || "User"}
        <svg
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-white/10 bg-card py-1 shadow-lg z-50">
          <div className="border-b border-white/10 px-4 py-2">
            <p className="text-sm font-medium">{profile?.display_name}</p>
            <p className="text-xs text-foreground/50">{profile?.role}</p>
          </div>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-foreground/70 hover:bg-card-hover hover:text-accent"
          >
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-sm text-danger hover:bg-card-hover"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
