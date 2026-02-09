import { useQuery } from "@tanstack/react-query";

export interface GameConfig {
  id: string;
  display_name: string;
  description: string;
  icon: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export function useGamesConfig() {
  return useQuery<GameConfig[]>({
    queryKey: ["games", "config"],
    queryFn: async () => {
      const res = await fetch("/api/games/config");
      if (!res.ok) throw new Error("Failed to fetch games config");
      const data = await res.json();
      return data.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGameConfig(gameId: string) {
  const query = useGamesConfig();
  return {
    ...query,
    data: query.data?.find((g) => g.id === gameId) ?? null,
  };
}
