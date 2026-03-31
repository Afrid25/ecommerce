"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";

type Props = {
  mode: "login" | "signup";
  audience?: "user" | "admin";
  redirectTo?: string;
};

export default function LoginCardSection({
  mode,
  audience = "user",
  redirectTo = audience === "admin" ? "/admin" : "/profile",
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const isSignup = mode === "signup";

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,106,0,0.18),_transparent_32%),linear-gradient(135deg,#0f160f_0%,#18331d_50%,#efe2d3_50%,#f8f4ee_100%)] px-4 py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2.5rem] border border-white/10 bg-black/20 p-8 text-white backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">
            {audience === "admin" ? "Secure Admin Access" : "Optional Account"}
          </p>
          <h1 className="mt-5 font-display text-5xl leading-none md:text-6xl">
            {audience === "admin" ? "Operate the store with confidence." : "Sign in faster next time."}
          </h1>
          <p className="mt-5 text-sm leading-7 text-white/75">
            {audience === "admin"
              ? "Use your admin credentials to manage products, orders, campaigns, and storefront settings."
              : "Create an account to keep order history and speed up future checkouts. Buying still works without login."}
          </p>
        </div>

        <div className="rounded-[2.5rem] border border-[var(--border)] bg-white/88 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.14)] backdrop-blur">
          <h2 className="text-3xl font-semibold text-[#16311a]">
            {isSignup ? "Create account" : "Welcome back"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
            {isSignup ? "Set up your MATVerse profile." : "Sign in to continue."}
          </p>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setLoading(true);
              setError("");

              try {
                const result = isSignup
                  ? await signUp.email({
                      name: form.name || form.email.split("@")[0],
                      email: form.email,
                      password: form.password,
                    })
                  : await signIn.email({
                      email: form.email,
                      password: form.password,
                    });

                if (result?.error) {
                  setError(result.error.message || "Authentication failed");
                  return;
                }

                router.push(redirectTo);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Authentication failed");
              } finally {
                setLoading(false);
              }
            }}
            className="mt-8 space-y-4"
          >
            {isSignup ? (
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
                className="w-full rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] px-5 py-4"
              />
            ) : null}
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email address"
              className="w-full rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] px-5 py-4"
            />
            {isSignup && audience !== "admin" ? (
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone (optional)"
                className="w-full rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] px-5 py-4"
              />
            ) : null}
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Password"
              className="w-full rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] px-5 py-4"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#16311a] px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-60"
            >
              {loading ? "Please wait" : isSignup ? "Create account" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
