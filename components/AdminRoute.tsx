"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import ProtectedRoute from "./ProtectedRoute";

function AdminCheck({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && profile && profile.role !== "admin") {
      router.push("/");
    }
  }, [loading, profile, router]);

  if (loading) return null;
  if (!profile || profile.role !== "admin") return null;

  return children;
}

export default function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminCheck>{children}</AdminCheck>
    </ProtectedRoute>
  );
}
