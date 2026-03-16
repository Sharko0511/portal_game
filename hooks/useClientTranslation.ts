"use client";

import { useState, useEffect } from "react";

// Module-level cache: key = "lng:ns" → flat key-value map
const cache = new Map<string, Record<string, string>>();

export function useClientTranslation(lng: string, ns: string) {
  const cacheKey = `${lng}:${ns}`;
  const [translations, setTranslations] = useState<Record<string, string>>(
    () => cache.get(cacheKey) ?? {}
  );
  const [isLoading, setIsLoading] = useState(!cache.has(cacheKey));

  useEffect(() => {
    if (cache.has(cacheKey)) {
      setTranslations(cache.get(cacheKey)!);
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
        cache.set(cacheKey, data);
        setTranslations(data);
      })
      .catch(() => {
        // On failure keep empty translations — keys used as fallback
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
   * Falls back to the key itself if not found.
   */
  function t(key: string): string {
    return translations[key] ?? key;
  }

  /** Invalidate cache for this (lng, ns) — used after admin saves a change */
  function invalidate() {
    cache.delete(cacheKey);
  }

  return { t, isLoading, invalidate };
}
