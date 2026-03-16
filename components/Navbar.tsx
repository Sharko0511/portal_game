"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { Search, Menu, X, ArrowRight } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useLng } from "@/hooks/useLng"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SettingsDropdown } from "@/components/SettingsDropdown"
import UserMenu from "./UserMenu"

export default function Navbar() {
  const { user, profile, loading } = useAuth()
  const lng = useLng()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const searchWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!searchOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [searchOpen])

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
      <div className="w-full flex h-14 items-center justify-between px-4 md:px-6 xl:px-[84px]">

        {/* Logo */}
        <div className="flex items-center">
          <Link href={`/${lng}`} className="flex items-center">
            <span className="font-bold text-xl xl:text-2xl 2xl:text-3xl whitespace-nowrap">
              The Good Learning
            </span>
            <span className="text-[#317F5F] text-xl xl:text-2xl 2xl:text-3xl">.</span>
          </Link>
        </div>

        {/* Spacer — pushes nav to far right on desktop */}
        <div className="flex-1" />

        {/* Mobile toggle — visible until lg */}
        <Button
          variant="ghost"
          size="icon"
          className="xl:hidden h-8 w-8"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Desktop nav — only at lg+ */}
        <div className="hidden xl:flex items-center space-x-4 2xl:space-x-6">
          <Link href={`/${lng}`}
            className="text-sm 2xl:text-base font-semibold transition-colors hover:text-[#317F5F] whitespace-nowrap">
            Trang chủ
          </Link>
          <Link href={`/${lng}/blog`}
            className="text-sm 2xl:text-base font-semibold transition-colors hover:text-[#317F5F] whitespace-nowrap">
            Báo hay
          </Link>
          <Link href={`/${lng}/audio`}
            className="text-sm 2xl:text-base font-semibold transition-colors hover:text-[#317F5F] whitespace-nowrap">
            Audio chất
          </Link>
          <Link href={`/${lng}/games`}
            className="text-sm 2xl:text-base font-semibold transition-colors hover:text-[#317F5F] whitespace-nowrap">
            Games
          </Link>

          {/* Search — expandable */}
          <div ref={searchWrapperRef} className="relative flex items-center">
            {/* Expanded input with submit icon inside */}
            <div className={`flex items-center overflow-hidden transition-all duration-300 ease-in-out ${searchOpen ? "w-[200px] opacity-100 mr-1" : "w-0 opacity-0 mr-0"}`}>
              <div className="relative w-full">
                <Input
                  ref={searchRef}
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="pr-8 rounded-full border-[#8C9199] focus-visible:ring-0 focus-visible:ring-offset-0 h-8 text-sm bg-[rgba(34,93,45,0.50)] placeholder:text-[#eeeeee] focus:placeholder:text-transparent text-white"
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
                const next = !searchOpen
                setSearchOpen(next)
                if (next) setTimeout(() => searchRef.current?.focus(), 50)
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent transition-colors"
              aria-label="Toggle search"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          <SettingsDropdown />

          {/* Auth */}
          {!loading && (
            <>
              {user && profile ? (
                <>
                  {profile.role === "admin" && (
                    <Link href={`/${lng}/admin`}
                      className="text-sm font-semibold text-gray-500 transition-colors hover:text-[#317F5F] whitespace-nowrap">
                      Admin
                    </Link>
                  )}
                  <UserMenu />
                </>
              ) : (
                <>
                  <Link href={`/${lng}/login`}
                    className="text-sm font-semibold text-gray-500 transition-colors hover:text-[#317F5F] whitespace-nowrap">
                    Đăng nhập
                  </Link>
                  <Link
                    href={`/${lng}/register`}
                    className="rounded-full bg-[#a4c639] px-3 py-1.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-[#a4c639]/85 whitespace-nowrap"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile menu — shown below lg */}
      {mobileOpen && (
        <div className="xl:hidden px-4 py-4 border-t border-gray-200 bg-white">
          <nav className="flex flex-col space-y-4">
            <Link href={`/${lng}`} onClick={() => setMobileOpen(false)}
              className="text-base font-semibold hover:text-[#317F5F] py-1">Trang chủ</Link>
            <Link href={`/${lng}/blog`} onClick={() => setMobileOpen(false)}
              className="text-base font-semibold hover:text-[#317F5F] py-1">Báo hay</Link>
            <Link href={`/${lng}/audio`} onClick={() => setMobileOpen(false)}
              className="text-base font-semibold hover:text-[#317F5F] py-1">Audio chất</Link>
            <Link href={`/${lng}/games`} onClick={() => setMobileOpen(false)}
              className="text-base font-semibold hover:text-[#317F5F] py-1">Games</Link>

            {/* Mobile search */}
            <div className="relative w-full py-1">
              <Input
                type="text"
                placeholder="Tìm kiếm..."
                className="pr-8 rounded-full border-[#8C9199] focus-visible:ring-0 focus-visible:ring-offset-0 h-9 bg-[rgba(34,93,45,0.50)] placeholder:text-[#eeeeee] focus:placeholder:text-transparent text-white"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#eeeeee]" />
            </div>

            <div className="flex justify-start py-1">
              <SettingsDropdown />
            </div>

            {!loading && (
              user && profile ? (
                <div className="py-1"><UserMenu /></div>
              ) : (
                <>
                  <Link href={`/${lng}/login`} onClick={() => setMobileOpen(false)}
                    className="text-base font-semibold text-gray-500 hover:text-[#317F5F] py-1">Đăng nhập</Link>
                  <Link href={`/${lng}/register`} onClick={() => setMobileOpen(false)}
                    className="inline-block w-fit rounded-full bg-[#a4c639] px-5 py-2 font-semibold text-gray-900 hover:bg-[#a4c639]/85">
                    Đăng ký
                  </Link>
                </>
              )
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
