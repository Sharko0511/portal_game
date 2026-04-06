"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin-fetch";

export interface UserSearchResult {
  id: string;
  display_name: string;
}

export function useUserSearch(query: string) {
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  return useQuery<UserSearchResult[]>({
    queryKey: ["user-search", debounced],
    queryFn: async () => {
      const res = await adminFetch(
        `/api/blog/users/search?q=${encodeURIComponent(debounced)}&limit=10`
      );
      if (!res.ok) return [];
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: debounced.length >= 2,
    staleTime: 30 * 1000,
  });
}
