"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe, Moon, Sun, Settings } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"
import { useEffect, useState } from "react"

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "vi", label: "Tiếng Việt" },
]

export function SettingsDropdown() {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const currentLang = pathname?.split("/")[1] || "en"

  useEffect(() => { setMounted(true) }, [])

  const switchLanguage = (lang: string) => {
    const newPath = pathname?.replace(/^\/[^/]+/, `/${lang}`) || `/${lang}`
    router.push(newPath)
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
        <Settings className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Settings</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 cursor-pointer">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center text-xs font-normal text-muted-foreground">
            <Globe className="mr-2 h-4 w-4" />
            Language
          </DropdownMenuLabel>
          {LANGUAGES.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={currentLang === lang.code ? "bg-accent cursor-pointer" : "cursor-pointer"}
            >
              <span className="ml-6">{lang.label}</span>
              {currentLang === lang.code && <span className="ml-auto text-xs text-[#317F5F]">Active</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center text-xs font-normal text-muted-foreground">
            {theme === "dark" ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
            Theme
          </DropdownMenuLabel>
          {(["light", "dark", "system"] as const).map((t) => (
            <DropdownMenuItem
              key={t}
              onClick={() => setTheme(t)}
              className={theme === t ? "bg-accent cursor-pointer" : "cursor-pointer"}
            >
              <span className="ml-6 capitalize">{t}</span>
              {theme === t && <span className="ml-auto text-xs text-[#317F5F]">Active</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
