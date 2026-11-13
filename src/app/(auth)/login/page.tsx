"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      username: String(form.get("username") || ""),
      password: String(form.get("password") || ""),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid username or password");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <label className="block space-y-1.5">
        <span className="text-sm text-cream-dim">Username</span>
        <input
          name="username"
          autoComplete="username"
          required
          className="w-full rounded-xl border border-line bg-ink-soft px-4 py-3 outline-none ring-amber/40 focus:ring-2"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm text-cream-dim">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-line bg-ink-soft px-4 py-3 outline-none ring-amber/40 focus:ring-2"
        />
      </label>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-amber py-3.5 font-semibold text-ink hover:bg-amber-deep disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <div className="animate-rise">
        <p className="text-sm uppercase tracking-[0.2em] text-amber">Movie Night</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-cream">Welcome back</h1>
        <p className="mt-2 text-cream-dim">Sign in to match movies with your friends.</p>
        <Suspense fallback={<p className="mt-8 text-cream-dim">Loading…</p>}>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-cream-dim">
          No account?{" "}
          <Link href="/register" className="text-amber hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
