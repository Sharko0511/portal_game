"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import Button from "@/components/Button";

function BannedMessage() {
  const { signOut } = useAuth();
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold text-red-600">Account Banned</h1>
      <p className="text-foreground/60">
        Your account has been banned. Contact an administrator for more info.
      </p>
      <Button onClick={signOut} variant="danger" size="lg">
        Logout
      </Button>
    </div>
  );
}

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading, sessionExpired } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(sessionExpired ? "/login?expired=1" : "/login");
    }
  }, [loading, user, sessionExpired, router]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  if (profile?.is_banned) {
    return <BannedMessage />;
  }

  return children;
}
