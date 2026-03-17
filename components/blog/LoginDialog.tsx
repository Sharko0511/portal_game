"use client";

import Link from "next/link";
import { useLng } from "@/hooks/useLng";

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginDialog({ open, onClose }: LoginDialogProps) {
  const lng = useLng();

  if (!open) return null;

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

        <h2 className="mb-2 text-xl font-bold text-foreground">Sign in to continue</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          You need an account to like, comment, and follow authors.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href={`/${lng}/login`}
            onClick={onClose}
            className="flex items-center justify-center rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/85"
          >
            Log in
          </Link>
          <Link
            href={`/${lng}/register`}
            onClick={onClose}
            className="flex items-center justify-center rounded-full bg-[#a4c639] px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-[#a4c639]/85"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
