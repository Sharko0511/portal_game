"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useLng } from "@/hooks/useLng";
import { useClientTranslation } from "@/hooks/useClientTranslation";

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginDialog({ open, onClose }: LoginDialogProps) {
  const { signIn } = useAuth();
  const lng = useLng();
  const { t } = useClientTranslation(lng, "auth");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      setEmail("");
      setPassword("");
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("login.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="mb-1 text-xl font-bold text-foreground">{t("login.title")}</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          You need an account to like, comment, and follow authors.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("login.email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40 focus:ring-2 focus:ring-[#c8e63d]/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("login.password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40 focus:ring-2 focus:ring-[#c8e63d]/20"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#c8e63d] px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-[#c8e63d]/85 disabled:opacity-60"
          >
            {loading ? t("login.submitting") : t("login.submit")}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t("login.no_account")}{" "}
          <Link
            href={`/${lng}/register`}
            onClick={onClose}
            className="font-medium text-foreground hover:underline"
          >
            {t("login.register_link")}
          </Link>
        </p>
      </div>
    </div>
  );
}
