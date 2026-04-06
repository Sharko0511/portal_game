import { getSupabaseAdmin } from "@/lib/supabase-server";

/**
 * Fetches theme variables from DB and builds a CSS string.
 * Called server-side in the root layout.
 * Returns "" silently if DB is unreachable — globals.css defaults take over.
 *
 * light  → :root { ... }
 * dark   → html.dark { ... }
 * other  → html.{name} { ... }
 */
export async function fetchThemeCss(): Promise<string> {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("theme_config")
      .select("variable, theme, value");

    if (error || !data?.length) return "";

    // Group by theme
    const byTheme: Record<string, Record<string, string>> = {};
    for (const row of data) {
      if (!byTheme[row.theme]) byTheme[row.theme] = {};
      byTheme[row.theme][row.variable] = row.value;
    }

    const toBlock = (vars: Record<string, string>) =>
      Object.entries(vars)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join("\n");

    const parts: string[] = [];

    for (const [theme, vars] of Object.entries(byTheme)) {
      if (!Object.keys(vars).length) continue;
      const selector = theme === "light" ? ":root" : `html.${theme}`;
      parts.push(`${selector} {\n${toBlock(vars)}\n}`);
    }

    return parts.join("\n");
  } catch {
    return "";
  }
}
