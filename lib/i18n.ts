import { getSupabaseAdmin } from "./supabase-server";

export const DEFAULT_LANGUAGE = "en";

/**
 * Server-side translation helper.
 * Queries Supabase directly — use in Server Components and API routes.
 */
export async function getTranslation(
  lng: string,
  ns: string
): Promise<(key: string) => string> {
  const language = lng || DEFAULT_LANGUAGE;

  const supabase = getSupabaseAdmin();

  let { data } = await supabase
    .from("translations")
    .select("key, value")
    .eq("language", language)
    .eq("namespace", ns);

  // Fall back to EN if the language has no data (e.g. was deleted)
  if ((!data || data.length === 0) && language !== "en") {
    const res = await supabase
      .from("translations")
      .select("key, value")
      .eq("language", "en")
      .eq("namespace", ns);
    data = res.data;
  }

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    map[row.key] = row.value;
  }

  return (key: string) => map[key] ?? key;
}
