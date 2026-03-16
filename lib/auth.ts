import { NextResponse, NextRequest } from "next/server";
import { getSupabaseAdmin } from "./supabase-server";
import { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  display_name: string;
  email: string;
  role: "admin" | "user";
  is_banned: boolean;
  created_at: string;
  updated_at: string;
  telegram_chat_id: number | null;
}

export interface AuthResult {
  user: User;
  profile: Profile;
  error?: never;
}

export interface AuthError {
  error: NextResponse;
  user?: never;
  profile?: never;
}

export async function getUser(request: NextRequest): Promise<AuthResult | null> {
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

  return { user, profile: profile as Profile };
}

export async function requireAuth(request: NextRequest): Promise<AuthResult | AuthError> {
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

export async function requireAdmin(request: NextRequest): Promise<AuthResult | AuthError> {
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
