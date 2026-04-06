"use client"

import type * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = string // "light" | "dark" | "system" | any custom theme name

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "system",
  setTheme: () => null,
})

export function ThemeProvider({ children, defaultTheme = "system" }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)

  // Load persisted theme on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null
    if (stored) setThemeState(stored)
  }, [])

  const setTheme = (t: Theme) => {
    localStorage.setItem("theme", t)
    setThemeState(t)
  }

  useEffect(() => {
    const root = window.document.documentElement
    // Remove any previously applied theme classes
    root.className = root.className
      .split(" ")
      .filter((c) => !c || c.startsWith("__") || c === "")
      .join(" ")
      .trim()

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      const handler = (e: MediaQueryListEvent) => {
        root.classList.remove("light", "dark")
        root.classList.add(e.matches ? "dark" : "light")
      }
      mq.addEventListener("change", handler)
      return () => mq.removeEventListener("change", handler)
    }
    root.classList.add(theme)
  }, [theme])

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  )

}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
