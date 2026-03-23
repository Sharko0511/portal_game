"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe, Moon, Sun, Monitor, Settings } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"
import { useEffect, useState } from "react"

interface LanguageOption {
  code: string
  label: string
}

function langLabel(code: string): string {
  try {
    return new Intl.DisplayNames([code, "en"], { type: "language" }).of(code) ?? code.toUpperCase()
  } catch {
    return code.toUpperCase()
  }
}

interface ThemeOption {
  value: string
  label: string
}

const FALLBACK_THEMES: ThemeOption[] = [
  { value: "light", label: "Light" },
  { value: "dark",  label: "Dark"  },
]

function themeIcon(theme: string) {
  if (theme === "dark")   return <Moon className="h-3.5 w-3.5" />
  if (theme === "system") return <Monitor className="h-3.5 w-3.5" />
  return <Sun className="h-3.5 w-3.5" />
}

export function SettingsDropdown({ mobile = false }: { mobile?: boolean }) {
  const router   = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [themes, setThemes]   = useState<ThemeOption[]>(FALLBACK_THEMES)
  const [languages, setLanguages] = useState<LanguageOption[]>([
    { code: "en", label: "English" },
    { code: "vi", label: "Tiếng Việt" },
  ])

  const currentLang = pathname?.split("/")[1] || "en"

  useEffect(() => { setMounted(true) }, [])

  // Fetch available languages from DB
  useEffect(() => {
    fetch("/api/i18n/languages")
      .then((r) => r.json())
      .then(({ data }: { data: string[] }) => {
        if (!Array.isArray(data) || data.length === 0) return
        setLanguages(data.map((code) => ({ code, label: langLabel(code) })))
      })
      .catch(() => { /* keep fallback */ })
  }, [])

  // Fetch available themes from DB, append System
  useEffect(() => {
    fetch("/api/theme")
      .then((r) => r.json())
      .then(({ data }: { data: Record<string, unknown> }) => {
        if (!data) return
        const options: ThemeOption[] = Object.keys(data).map((n) => ({
          value: n,
          label: n.charAt(0).toUpperCase() + n.slice(1),
        }))
        setThemes(options)
      })
      .catch(() => { /* keep fallback */ })
  }, [])

  const switchLanguage = (lang: string) => {
    const newPath = pathname?.replace(/^\/[^/]+/, `/${lang}`) || `/${lang}`
    router.push(newPath)
  }

  // ── Mobile inline version ─────────────────────────────────────
  if (mobile) {
    return (
      <div className="flex flex-col gap-5 border-t border-border pt-6">
        {/* Language */}
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>Language</span>
          </div>
          <div className="flex gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                className={`flex-1 rounded-full border py-2.5 text-sm font-semibold transition-colors
                  ${currentLang === lang.code
                    ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                    : "border-border text-foreground hover:border-brand-primary hover:text-brand-primary"}`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            {!mounted || theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span>Theme</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {themes.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex-1 rounded-full border py-2.5 text-sm font-semibold transition-colors
                  ${mounted && theme === value
                    ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                    : "border-border text-foreground hover:border-brand-primary hover:text-brand-primary"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Desktop icon + dropdown version ──────────────────────────
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
        <Settings className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    )
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 cursor-pointer data-[state=open]:pointer-events-auto data-[state=open]:cursor-pointer">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44 p-3 font-(family-name:--font-montserrat)">

        {/* Language */}
        <div className="flex items-center gap-1.5 mb-2 text-xs text-muted-foreground">
          <Globe className="h-3.5 w-3.5" />
          <span>Language</span>
        </div>
        <div className="flex flex-col gap-0.5 mb-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-accent
                ${currentLang === lang.code
                  ? "font-semibold text-brand-primary"
                  : "text-foreground"}`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <div className="h-px bg-border mb-3" />

        {/* Theme */}
        <div className="flex items-center gap-1.5 mb-2 text-xs text-muted-foreground">
          {themeIcon(theme)}
          <span>Theme</span>
        </div>
        <div className="flex flex-col gap-0.5">
          {themes.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-accent
                ${theme === value
                  ? "font-semibold text-brand-primary"
                  : "text-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
