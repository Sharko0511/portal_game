"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useLng } from "@/hooks/useLng";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const { user, profile, loading } = useAuth();
  const lng = useLng();

  return (
    <nav className="bg-white border-b border-gray-200 shrink-0">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href={`/${lng}`} className="text-lg font-semibold text-gray-900 tracking-tight">
          The Good Learning<span className="text-[#317F5F]">.</span>
        </Link>
        <div className="flex items-center gap-7 text-sm">
          <Link href={`/${lng}/blog`} className="font-medium text-gray-900 transition-colors hover:text-[#317F5F]">
            Blog
          </Link>
          <Link href={`/${lng}/leaderboard`} className="text-gray-500 transition-colors hover:text-gray-900">
            Leaderboard
          </Link>
          <Link href={`/${lng}/games`} className="text-gray-500 transition-colors hover:text-gray-900">
            Games
          </Link>

          {!loading && (
            <>
              {user && profile ? (
                <>
                  {profile.role === "admin" && (
                    <Link href={`/${lng}/admin`} className="text-gray-500 transition-colors hover:text-gray-900">
                      Admin
                    </Link>
                  )}
                  <UserMenu />
                </>
              ) : (
                <>
                  <Link href={`/${lng}/login`} className="text-gray-500 transition-colors hover:text-gray-900">
                    Login
                  </Link>
                  <Link
                    href={`/${lng}/register`}
                    className="rounded-full bg-[#a4c639] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#a4c639]/85"
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
