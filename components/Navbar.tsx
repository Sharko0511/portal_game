"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const { user, profile, loading } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 shrink-0">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-lg font-semibold text-gray-900 tracking-tight">
          The Good Learning<span className="text-[#317F5F]">.</span>
        </Link>
        <div className="flex items-center gap-7 text-sm">
          <Link
            href="/"
            className="text-gray-500 transition-colors hover:text-gray-900"
          >
            Home
          </Link>
          <Link
            href="/leaderboard"
            className="text-gray-500 transition-colors hover:text-gray-900"
          >
            Leaderboard
          </Link>
          {user && (
            <Link
              href="/blog"
              className="text-gray-500 transition-colors hover:text-gray-900"
            >
              Blog
            </Link>
          )}

          {!loading && (
            <>
              {user && profile ? (
                <>
                  {profile.role === "admin" && (
                    <Link
                      href="/admin"
                      className="text-gray-500 transition-colors hover:text-gray-900"
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
                    className="text-gray-500 transition-colors hover:text-gray-900"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full bg-[#c8e63d] px-4 py-1.5 text-sm font-medium text-gray-900 transition-colors hover:bg-[#c8e63d]/85"
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
