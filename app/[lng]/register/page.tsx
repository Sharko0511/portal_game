"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLng } from "@/hooks/useLng";
import Button from "@/components/Button";

export default function RegisterPage() {
  const { user, signUp } = useAuth();
  const router = useRouter();
  const lng = useLng();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.push(`/${lng}`);
  }, [user, router, lng]);

  if (user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (displayName.length < 2 || displayName.length > 30) {
      setError("Display name must be 2-30 characters");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, displayName);
      router.push(`/${lng}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40 focus:ring-2 focus:ring-brand-lime-bright/20";

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-8">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-foreground">Register</h1>
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Display Name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required
              autoComplete="name" className={inputClass} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              autoComplete="new-email" className={inputClass} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                autoComplete="new-password" className={`${inputClass} pr-10`} />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Confirm Password</label>
            <div className="relative">
              <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                autoComplete="new-password" className={`${inputClass} pr-10`} />
              <button type="button" onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} size="lg" className="w-full">
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href={`/${lng}/login`} className="font-medium text-foreground hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
