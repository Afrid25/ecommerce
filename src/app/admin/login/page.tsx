"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        const result = await signUp.email({
          name: form.name,
          email: form.email,
          password: form.password,
        });
        if (result.error) {
          setError(result.error.message || "Sign up failed");
        } else {
          router.push("/admin");
        }
      } else {
        const result = await signIn.email({
          email: form.email,
          password: form.password,
        });
        if (result.error) {
          setError(result.error.message || "Login failed");
        } else {
          router.push("/admin");
        }
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white dark:bg-black">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            {isSignUp ? "Create Account" : "Admin Access"}
          </h1>
          <p className="text-lg opacity-60">
            {isSignUp ? "Set up your admin account" : "Sign in to manage your store"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 mb-8">
          {/* Name Field (Sign Up Only) */}
          {isSignUp && (
            <div>
              <label className="block text-sm font-bold tracking-widest uppercase opacity-60 mb-3">
                Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Admin Name"
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 px-4 py-3 focus:outline-none focus:border-black dark:focus:border-white transition"
              />
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-bold tracking-widest uppercase opacity-60 mb-3">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@example.com"
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 px-4 py-3 focus:outline-none focus:border-black dark:focus:border-white transition"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-bold tracking-widest uppercase opacity-60 mb-3">
              Password
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              minLength={8}
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 px-4 py-3 focus:outline-none focus:border-black dark:focus:border-white transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black dark:bg-white text-white dark:text-black py-4 font-bold text-lg tracking-wide hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* Toggle Sign Up / Sign In */}
        <div className="text-center border-t border-gray-200 dark:border-gray-800 pt-6">
          <p className="text-sm opacity-60 mb-3">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
          </p>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="text-sm font-bold tracking-widest uppercase hover:opacity-60 transition"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
