import { getSupabaseAdmin } from "./supabase-server";

export const SUPPORTED_LANGUAGES = ["en", "vi"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "en";

/**
 * Server-side translation helper.
 * Queries Supabase directly — use in Server Components and API routes.
 */
export async function getTranslation(
  lng: string,
  ns: string
): Promise<(key: string) => string> {
  const language = SUPPORTED_LANGUAGES.includes(lng as Language)
    ? lng
    : DEFAULT_LANGUAGE;

  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from("translations")
    .select("key, value")
    .eq("language", language)
    .eq("namespace", ns);

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    map[row.key] = row.value;
  }

  return (key: string) => map[key] ?? key;
}
