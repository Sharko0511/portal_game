import { useMutation } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";

export function useUpdateProfile() {
  const { refreshProfile } = useAuth();
  return useMutation({
    mutationFn: async ({
      profileId,
      displayName,
    }: {
      profileId: string;
      displayName: string;
    }) => {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("id", profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      refreshProfile();
    },
  });
}
