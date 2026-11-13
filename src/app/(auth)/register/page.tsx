"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const username = String(form.get("username") || "");
    const password = String(form.get("password") || "");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setError(data.error || "Registration failed");
      return;
    }

    const login = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    setLoading(false);
    if (login?.error) {
      setError("Account created, but sign-in failed. Try logging in.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <div className="animate-rise">
        <p className="text-sm uppercase tracking-[0.2em] text-amber">Movie Night</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-cream">Join in</h1>
        <p className="mt-2 text-cream-dim">Pick a username and password. That&apos;s it.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm text-cream-dim">Username</span>
            <input
              name="username"
              autoComplete="username"
              required
              minLength={2}
              pattern="[A-Za-z0-9_]+"
              title="Letters, numbers, and underscores only"
              className="w-full rounded-xl border border-line bg-ink-soft px-4 py-3 outline-none ring-amber/40 focus:ring-2"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm text-cream-dim">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={4}
              className="w-full rounded-xl border border-line bg-ink-soft px-4 py-3 outline-none ring-amber/40 focus:ring-2"
            />
          </label>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-amber py-3.5 font-semibold text-ink hover:bg-amber-deep disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-cream-dim">
          Already have an account?{" "}
          <Link href="/login" className="text-amber hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
