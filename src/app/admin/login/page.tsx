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
    secretCode: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        // Send signup request to our custom admin signup endpoint
        const res = await fetch("/api/auth/admin-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            secretCode: form.secretCode,
          }),
        });

        const result = await res.json();

        if (result.error) {
          setError(result.error.message || result.error);
        } else {
          // After successful signup, automatically sign in the user
          const signInResult = await signIn.email({
            email: form.email,
            password: form.password,
          });
          
          if (signInResult.error) {
            // If auto-signin fails, redirect to login page
            setError("Account created! Please log in with your credentials.");
            setIsSignUp(false);
          } else {
            router.push("/admin");
          }
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
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-sm border p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {isSignUp ? "Create Admin Account" : "Admin Login"}
          </h1>
          <p className="text-gray-500 mt-2">
            {isSignUp ? "Set up your admin account" : "Sign in to manage your store"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Admin Name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="••••••••"
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secret Code <span className="text-gray-400">(for admin signup only)</span>
            </label>
            <input
              type="password"
              required
              value={form.secretCode}
              onChange={(e) => setForm({ ...form, secretCode: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Enter secret code"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold disabled:bg-gray-400"
          >
            {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="text-indigo-600 hover:underline font-medium"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
