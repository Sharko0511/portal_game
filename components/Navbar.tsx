"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const { user, profile, loading } = useAuth();

  return (
    <nav className="border-b border-white/10 bg-card shrink-0">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-xl font-bold text-accent">
          Game Portal
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="text-foreground/70 transition-colors hover:text-accent"
          >
            Home
          </Link>
          <Link
            href="/leaderboard"
            className="text-foreground/70 transition-colors hover:text-accent"
          >
            Leaderboard
          </Link>

          {!loading && (
            <>
              {user && profile ? (
                <>
                  {profile.role === "admin" && (
                    <Link
                      href="/admin"
                      className="text-foreground/70 transition-colors hover:text-accent"
                    >
                      Admin
                    </Link>
                  )}
                  <UserMenu />
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-foreground/70 transition-colors hover:text-accent"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg bg-accent px-3 py-1.5 font-medium text-background transition-colors hover:bg-accent/80"
                  >
                    Register
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
