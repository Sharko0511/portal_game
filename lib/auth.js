import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "./supabase-server";

export async function getUser(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  const supabase = getSupabaseAdmin();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  return { user, profile };
}

export async function requireAuth(request) {
  const result = await getUser(request);
  if (!result) {
    return {
      error: NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "You must be logged in to perform this action" } },
        { status: 401 }
      ),
    };
  }
  return result;
}

export async function requireAdmin(request) {
  const result = await getUser(request);
  if (!result) {
    return {
      error: NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "You must be logged in to perform this action" } },
        { status: 401 }
      ),
    };
  }

  if (result.profile.role !== "admin") {
    return {
      error: NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Admin access required" } },
        { status: 403 }
      ),
    };
  }

  return result;
}
