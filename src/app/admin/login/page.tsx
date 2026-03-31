"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp, useSession } from "@/lib/auth-client";

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

  useEffect(() => {
    if (session) {
      router.replace("/admin");
    }
  }, [router, session]);

  const bootstrapAdminIfNeeded = async (email: string) => {
    await fetch("/api/admin/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
  };

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,106,0,0.18),_transparent_32%),linear-gradient(135deg,#0d160e_0%,#17311a_50%,#efe2d3_50%,#f8f4ee_100%)] px-4 py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[2.5rem] border border-white/10 bg-black/20 p-8 text-white backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">
            MATVerse Admin
          </p>
          <h1 className="mt-5 font-display text-5xl leading-none md:text-6xl">
            Run products, orders, offers, and support from one control room.
          </h1>
          <p className="mt-5 text-sm leading-7 text-white/75">
            Secure admin access for catalog operations, content changes, and revenue visibility.
          </p>
        </div>

        <div className="rounded-[2.5rem] border border-[var(--border)] bg-white/88 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.14)] backdrop-blur">
          <h2 className="text-3xl font-semibold text-[#16311a]">
            {isSignUp ? "Create admin account" : "Admin access"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
            {isSignUp ? "Register the first admin or add another approved operator." : "Sign in to manage MATVerse."}
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
                const result = isSignUp
                  ? await signUp.email({
                      name: form.name,
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

                await bootstrapAdminIfNeeded(form.email);
                router.replace("/admin");
              } catch (err) {
                setError(err instanceof Error ? err.message : "Authentication failed");
              } finally {
                setLoading(false);
              }
            }}
            className="mt-8 space-y-4"
          >
            {isSignUp ? (
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Admin name"
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
              {loading ? "Please wait" : isSignUp ? "Create admin account" : "Sign in"}
            </button>
          </form>

          <button
            onClick={() => {
              setIsSignUp((value) => !value);
              setError("");
            }}
            className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]"
          >
            {isSignUp ? "Use existing admin account" : "Create first admin account"}
          </button>
        </div>
      </div>
    </section>
  );
}
