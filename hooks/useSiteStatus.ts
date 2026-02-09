import { useQuery } from "@tanstack/react-query";

export interface SiteStatus {
  maintenance_mode: boolean;
  site_name: string;
}

export function useSiteStatus() {
  return useQuery<SiteStatus>({
    queryKey: ["site", "status"],
    queryFn: async () => {
      const res = await fetch("/api/site/status");
      if (!res.ok) throw new Error("Failed to fetch site status");
      const data = await res.json();
      return data.data;
    },
    staleTime: 60 * 1000,
  });
}
