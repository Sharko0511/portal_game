import { getSupabase } from "./supabase";

export async function getAdminToken(): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || "";
}

function handleUnauthorized() {
  const supabase = getSupabase();
  if (supabase) supabase.auth.signOut();
  localStorage.removeItem("session_login_time");
  window.location.href = "/login?expired=1";
}

export async function adminFetch(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const token = await getAdminToken();
  const res = await fetch(url, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 401) {
    handleUnauthorized();
  }
  return res;
}

export async function adminFetchJson<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const res = await adminFetch(url, init);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
