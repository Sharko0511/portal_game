import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const revalidate = 300; // revalidate every 5 minutes

export async function GET(): Promise<NextResponse> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("theme_config")
    .select("variable, theme, value")
    .order("theme")
    .order("group_name")
    .order("variable");

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  // Shape: { light: { '--brand-primary': '#317f5f', ... }, dark: { ... } }
  const palette: Record<string, Record<string, string>> = { light: {}, dark: {} };
  for (const row of data ?? []) {
    if (!palette[row.theme]) palette[row.theme] = {};
    palette[row.theme][row.variable] = row.value;
  }

  return NextResponse.json(
    { data: palette },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" } }
  );
}
