"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import ProtectedRoute from "./ProtectedRoute";
import { useLng } from "@/hooks/useLng";

function AdminCheck({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const lng = useLng();

  useEffect(() => {
    if (!loading && profile && profile.role !== "admin") {
      router.push(`/${lng}`);
    }
  }, [loading, profile, router, lng]);

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
