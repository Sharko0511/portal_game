"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-8">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">Register</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Display Name", value: displayName, onChange: setDisplayName, type: "text" },
            { label: "Email", value: email, onChange: setEmail, type: "email" },
            { label: "Password", value: password, onChange: setPassword, type: "password" },
            { label: "Confirm Password", value: confirmPassword, onChange: setConfirmPassword, type: "password" },
          ].map(({ label, value, onChange, type }) => (
            <div key={label}>
              <label className="mb-1.5 block text-sm font-medium text-gray-900">{label}</label>
              <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-foreground/40 focus:ring-2 focus:ring-[#c8e63d]/20" />
            </div>
          ))}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} size="lg" className="w-full">
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href={`/${lng}/login`} className="font-medium text-gray-900 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
