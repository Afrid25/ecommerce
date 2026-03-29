"use client";

import { useState, useEffect } from "react";
import { signIn, signUp, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserLoginPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  useEffect(() => {
    if (session) {
      router.replace("/");
    }
  }, [session, router]);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!form.email.includes("@")) return "Invalid email";
    if (form.password.length < 8) return "Password must be at least 8 characters";
    if (isSignUp && !form.name.trim()) return "Name is required";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      let result;

      if (isSignUp) {
        result = await signUp.email({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        });
      } else {
        result = await signIn.email({
          email: form.email.trim(),
          password: form.password,
        });
      }

      if (result?.error) {
        setError(result.error.message || "Authentication failed");
        return;
      }

      router.replace("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    setError("");
    setForm({ name: "", email: "", password: "", phone: "" });
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black tracking-tight md:text-4xl">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {isSignUp ? "Sign up for a MATVerse account" : "Sign in to your MATVerse account"}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Phone (optional)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none"
                  placeholder="01XXXXXXXXX"
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateForm("email", e.target.value)}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateForm("password", e.target.value)}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none"
              placeholder="Min 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-editorial-primary w-full disabled:opacity-50"
          >
            {loading
              ? isSignUp ? "Creating account..." : "Signing in..."
              : isSignUp ? "Create Account" : "Sign In"
            }
          </button>
        </form>

        <div className="mt-6 border-t border-[var(--border)] pt-6 text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
          </p>
          <button onClick={toggleMode} className="mt-1 text-sm font-bold text-[var(--primary)]">
            {isSignUp ? "Sign In" : "Create Account"}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--text-secondary)]">
          Login is optional. You can <Link href="/checkout" className="font-semibold text-[var(--primary)]">checkout as a guest</Link> without an account.
        </p>
      </div>
    </div>
  );
}
