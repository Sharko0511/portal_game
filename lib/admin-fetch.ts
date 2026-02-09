import { getSupabase } from "./supabase";

export async function getAdminToken(): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || "";
}

export async function adminFetch(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const token = await getAdminToken();
  return fetch(url, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function adminFetchJson<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const res = await adminFetch(url, init);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
