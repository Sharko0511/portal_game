"use client";

import { createContext, useEffect, useState, useCallback, ReactNode } from "react";
import { getSupabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Profile } from "@/lib/auth";

const SESSION_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours
const SESSION_CHECK_INTERVAL_MS = 60 * 1000; // check every minute
const SESSION_LOGIN_TIME_KEY = "session_login_time";

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  sessionExpired: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  async function fetchProfile(userId: string): Promise<Profile | null> {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    return data as Profile | null;
  }

  async function refreshProfile() {
    if (!user) return;
    const p = await fetchProfile(user.id);
    if (p) setProfile(p);
  }

  function isSessionExpired(): boolean {
    const loginTime = localStorage.getItem(SESSION_LOGIN_TIME_KEY);
    if (!loginTime) return false;
    return Date.now() - Number(loginTime) > SESSION_DURATION_MS;
  }

  const handleSessionExpired = useCallback(async () => {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem(SESSION_LOGIN_TIME_KEY);
    setUser(null);
    setProfile(null);
    setSessionExpired(true);
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        supabase.auth.signOut();
        setLoading(false);
        return;
      }
      const u = session?.user ?? null;
      if (u && isSessionExpired()) {
        handleSessionExpired().then(() => setLoading(false));
        return;
      }
      setUser(u);
      if (u) {
        fetchProfile(u.id).then((p) => {
          setProfile(p);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchProfile(u.id).then((p) => setProfile(p));
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Periodically check session expiration
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      if (isSessionExpired()) {
        handleSessionExpired();
      }
    }, SESSION_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user, handleSessionExpired]);

  async function signIn(email: string, password: string) {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase not configured");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    localStorage.setItem(SESSION_LOGIN_TIME_KEY, String(Date.now()));
    setSessionExpired(false);
  }

  async function signUp(email: string, password: string, displayName: string) {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase not configured");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) throw error;
  }

  async function signOut() {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem(SESSION_LOGIN_TIME_KEY);
    setUser(null);
    setProfile(null);
    setSessionExpired(false);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        sessionExpired,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
