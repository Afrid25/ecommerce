"use client";

import { useState, useEffect } from "react";
import { signIn, signUp, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // 🔒 Redirect if already logged in
  useEffect(() => {
    if (session) {
      router.replace("/admin");
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

  const bootstrapAdminIfNeeded = async (email: string) => {
    const response = await fetch("/api/admin/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      return;
    }

    await response.json().catch(() => null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return; // prevent double submit

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

      await bootstrapAdminIfNeeded(form.email.trim());
      router.replace("/admin"); // better than push
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    setError("");
    setForm({
      name: "",
      email: "",
      password: "",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-black">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            {isSignUp ? "Create Admin Account" : "Admin Access"}
          </h1>
          <p className="text-lg opacity-60">
            {isSignUp
              ? "Register your admin account"
              : "Sign in to manage your store"}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="border border-red-500 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <div>
              <label className="block text-sm font-bold uppercase opacity-60 mb-2">
                Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                className="w-full border px-4 py-3 bg-white dark:bg-gray-900"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold uppercase opacity-60 mb-2">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateForm("email", e.target.value)}
              className="w-full border px-4 py-3 bg-white dark:bg-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase opacity-60 mb-2">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateForm("password", e.target.value)}
              className="w-full border px-4 py-3 bg-white dark:bg-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 font-bold text-lg bg-black text-white dark:bg-white dark:text-black disabled:opacity-50"
          >
            {loading
              ? isSignUp
                ? "Creating..."
                : "Signing in..."
              : isSignUp
              ? "Create Account"
              : "Sign In"}
          </button>
        </form>

        {/* Toggle */}
        <div className="text-center mt-6 border-t pt-6">
          <p className="text-sm opacity-60 mb-2">
            {isSignUp
              ? "Already have an account?"
              : "Don't have an account?"}
          </p>
          <button
            onClick={toggleMode}
            className="text-sm font-bold uppercase"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
