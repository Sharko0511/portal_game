"use client";

import { useState, useEffect, useRef } from "react";

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

// Module-level cache: key = "lng:ns" → { data, expiresAt }
const cache = new Map<string, { data: Record<string, string>; expiresAt: number }>();

function cacheGet(key: string): Record<string, string> | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return undefined; }
  return entry.data;
}

function cacheSet(key: string, data: Record<string, string>) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

/** Seed the cache from server-fetched data. Called synchronously before render. */
export function seedTranslationCache(seed: Record<string, Record<string, string>>) {
  for (const [key, value] of Object.entries(seed)) {
    if (!cacheGet(key)) cacheSet(key, value);
  }
}

export function useClientTranslation(lng: string, ns: string) {
  const cacheKey = `${lng}:${ns}`;
  const [trackedKey, setTrackedKey] = useState(cacheKey);
  const [translations, setTranslations] = useState<Record<string, string>>(
    () => cacheGet(cacheKey) ?? {}
  );
  const [isLoading, setIsLoading] = useState(!cacheGet(cacheKey));
  // Keep last successfully loaded translations to avoid key flash during language switch
  const stableTranslations = useRef<Record<string, string>>(cacheGet(cacheKey) ?? {});

  // Synchronous state update during render — if the key changed and cache already
  // has the data (e.g. 2nd/3rd language switch), apply it immediately without waiting
  // for useEffect. This makes cached switches instant.
  if (trackedKey !== cacheKey) {
    setTrackedKey(cacheKey);
    const cached = cacheGet(cacheKey);
    if (cached) {
      stableTranslations.current = cached;
      setTranslations(cached);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }

  useEffect(() => {
    const cached = cacheGet(cacheKey);
    if (cached) {
      stableTranslations.current = cached;
      setTranslations(cached);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetch(`/api/i18n/${lng}/${ns}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        const data: Record<string, string> = json.data ?? {};
        cacheSet(cacheKey, data);
        stableTranslations.current = data;
        setTranslations(data);
      })
      .catch(() => {
        // On failure keep previous translations visible
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lng, ns, cacheKey]);

  /**
   * Resolves a dot-notation key, e.g. t("navigation.home") → "Home"
   * While loading a new language, falls back to the previous language's text
   * so raw keys are never shown during a language switch.
   */
  function t(key: string): string {
    return translations[key] ?? stableTranslations.current[key] ?? key;
  }

  /** Invalidate cache for this (lng, ns) — used after admin saves a change */
  function invalidate() {
    cache.delete(cacheKey);
  }

  return { t, isLoading, invalidate };
}
