"use client"

import { seedTranslationCache } from "@/hooks/useClientTranslation"

interface Props {
  seed: Record<string, Record<string, string>>
  children: React.ReactNode
}

/**
 * Seeds the client translation cache synchronously during render —
 * before any child component calls useClientTranslation.
 * This runs on both server (SSR) and client (hydration), so both sides
 * start with the same translations and there's no hydration mismatch.
 */
export function TranslationSeed({ seed, children }: Props) {
  seedTranslationCache(seed)
  return <>{children}</>
}
