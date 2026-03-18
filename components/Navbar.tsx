"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Search, Menu, X, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLng } from "@/hooks/useLng";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingsDropdown } from "@/components/SettingsDropdown";
import UserMenu from "./UserMenu";
import { useClientTranslation } from "@/hooks/useClientTranslation";

export default function Navbar() {
  const { user, profile, loading } = useAuth();
  const lng = useLng();
  const { t } = useClientTranslation(lng, "common");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    const handleScroll = () => {
      const currentY = window.scrollY;
      const el = headerRef.current;
      if (!el) return;
      if (currentY > lastScrollY.current && currentY > 60) {
        el.style.transition = "transform 300ms ease";
        el.style.transform = "translateY(-100%)";
      } else if (currentY < lastScrollY.current) {
        el.style.transition = "transform 200ms ease";
        el.style.transform = "translateY(0)";
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-40 w-full border-b bg-background"
      >
        <div className="w-full flex h-14 items-center justify-between px-4 md:px-6 xl:px-21">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={`/${lng}`} className="flex items-center">
              <span className="font-bold text-[26px] xl:text-2xl 2xl:text-3xl whitespace-nowrap">
                The Good Learning
              </span>
              <span className="text-brand-primary text-[26px] xl:text-2xl 2xl:text-3xl">
                .
              </span>
            </Link>
          </div>

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden h-8 w-8"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>

          <div className="hidden xl:flex items-center gap-4 2xl:gap-6">
            <Link
              href={`/${lng}`}
              className="text-sm 2xl:text-base font-semibold transition-colors hover:text-brand-primary whitespace-nowrap"
            >
              {t("navigation.home")}
            </Link>
            <Link
              href={`/${lng}/baohay`}
              className="text-sm 2xl:text-base font-semibold transition-colors hover:text-brand-primary whitespace-nowrap"
            >
              {t("navigation.blog")}
            </Link>
            <Link
              href={`/${lng}/audiochat`}
              className="text-sm 2xl:text-base font-semibold transition-colors hover:text-brand-primary whitespace-nowrap"
            >
              {t("navigation.audio")}
            </Link>
            <Link
              href={`/${lng}/games`}
              className="text-sm 2xl:text-base font-semibold transition-colors hover:text-brand-primary whitespace-nowrap"
            >
              {t("navigation.games")}
            </Link>
            {user && profile && (
              <Link
                href={`/${lng}/blog`}
                className="text-sm 2xl:text-base font-semibold transition-colors hover:text-brand-primary whitespace-nowrap"
              >
                {t("navigation.feed")}
              </Link>
            )}

            <div ref={searchWrapperRef} className="relative flex items-center">
              <div
                className={`flex items-center overflow-hidden transition-all duration-300 ease-in-out ${searchOpen ? "w-50 opacity-100 mr-1" : "w-0 opacity-0 mr-0"}`}
              >
                <div className="relative w-full">
                  <Input
                    ref={searchRef}
                    type="text"
                    placeholder={t("search.placeholder")}
                    className="pr-8 rounded-full border-mediumgray focus-visible:ring-0 focus-visible:ring-offset-0 h-8 text-sm bg-brand-dark/50 placeholder:text-[#eeeeee] focus:placeholder:text-transparent text-white"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#eeeeee] hover:text-white transition-colors"
                    aria-label="Submit search"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {/* Toggle button */}
              <button
                onClick={() => {
                  const next = !searchOpen;
                  setSearchOpen(next);
                  if (next) setTimeout(() => searchRef.current?.focus(), 50);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent transition-colors"
                aria-label="Toggle search"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>

            {/* Auth */}
            {!loading && (
              <>
                {user && profile ? (
                  <>
                    {profile.role === "admin" && (
                      <Link
                        href={`/${lng}/admin`}
                        className="text-sm font-semibold text-muted-foreground transition-colors hover:text-brand-primary whitespace-nowrap"
                      >
                        {t("navigation.admin")}
                      </Link>
                    )}
                    <UserMenu />
                  </>
                ) : (
                  <>
                    <Link
                      href={`/${lng}/login`}
                      className="text-sm font-semibold text-muted-foreground transition-colors hover:text-brand-primary whitespace-nowrap"
                    >
                      {t("navigation.login")}
                    </Link>
                    <Link
                      href={`/${lng}/register`}
                      className="rounded-full bg-brand-lime px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-brand-lime/85 whitespace-nowrap"
                    >
                      {t("navigation.register")}
                    </Link>
                  </>
                )}
              </>
            )}

            <SettingsDropdown />
          </div>
        </div>
      </header>

      {/* Mobile menu — full-screen overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background xl:hidden">
          {/* Overlay header */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
            <Link
              href={`/${lng}`}
              onClick={() => setMobileOpen(false)}
              className="flex items-center"
            >
              <span className="font-bold text-xl">The Good Learning</span>
              <span className="text-brand-primary text-xl">.</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Scrollable body */}
          <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("search.placeholder")}
                className="h-10 rounded-full border-border bg-muted pl-10 pr-4 focus-visible:ring-1 focus-visible:ring-brand-primary"
              />
            </div>

            {/* Nav links */}
            <nav className="flex flex-col">
              {[
                { href: `/${lng}`, label: t("navigation.home") },
                { href: `/${lng}/baohay`, label: t("navigation.blog") },
                { href: `/${lng}/audiochat`, label: t("navigation.audio") },
                { href: `/${lng}/games`, label: t("navigation.games") },
                ...(user && profile
                  ? [{ href: `/${lng}/blog`, label: t("navigation.feed") }]
                  : []),
                ...(user && profile?.role === "admin"
                  ? [{ href: `/${lng}/admin`, label: t("navigation.admin") }]
                  : []),
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between border-b border-border py-4 text-lg font-semibold transition-colors hover:text-brand-primary"
                >
                  {label}
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </nav>

            {/* Settings */}
            <SettingsDropdown mobile />

            {/* Auth */}
            {!loading &&
              (user && profile ? (
                <div className="mt-6">
                  <UserMenu />
                </div>
              ) : (
                <div className="mt-6 flex flex-col gap-3 pb-8">
                  <Link
                    href={`/${lng}/register`}
                    onClick={() => setMobileOpen(false)}
                    className="flex h-11 items-center justify-center rounded-full bg-brand-lime font-semibold text-foreground transition-colors hover:bg-brand-lime/85"
                  >
                    {t("navigation.register")}
                  </Link>
                  <Link
                    href={`/${lng}/login`}
                    onClick={() => setMobileOpen(false)}
                    className="flex h-11 items-center justify-center rounded-full border border-border font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t("navigation.login")}
                  </Link>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
}
