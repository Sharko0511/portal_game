import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

interface SiteStatus {
  maintenance_mode: boolean;
  site_name: string;
}

export async function GET(): Promise<NextResponse> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("site_config")
    .select("key, value")
    .in("key", ["maintenance_mode", "site_name"]);

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  const status: SiteStatus = {
    maintenance_mode: false,
    site_name: "The Good Learning",
  };

  data?.forEach((item) => {
    if (item.key === "maintenance_mode") {
      status.maintenance_mode = item.value === true || item.value === "true";
    } else if (item.key === "site_name") {
      status.site_name = String(item.value);
    }
  });

  return NextResponse.json({ data: status });
}
