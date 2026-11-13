"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { InstallHint } from "@/components/InstallHint";

type SessionRow = {
  id: string;
  name: string;
  inviteCode: string;
  role: string;
  createdAt: string;
};

export default function HomePage() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/sessions");
    const data = await res.json();
    setSessions(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createSession(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not create session");
      return;
    }
    setName("");
    window.location.href = `/sessions/${data.id}/feed`;
  }

  async function joinSession(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/sessions/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not join");
      return;
    }
    setInviteCode("");
    window.location.href = `/sessions/${data.id}/feed`;
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 py-8">
      <header className="mb-6 flex items-start justify-between gap-4 animate-rise">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-amber">Movie Night</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-cream">
            Hey{session?.user?.name ? `, ${session.user.name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-cream-dim">Your sessions, ready to swipe.</p>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-xl border border-line px-3 py-2 text-sm text-cream-dim hover:text-cream"
        >
          Sign out
        </button>
      </header>

      <InstallHint />

      {error ? (
        <p className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <section className="mb-6 space-y-3 animate-rise">
        <form onSubmit={createSession} className="rounded-2xl border border-line bg-panel/70 p-4">
          <h2 className="font-display text-lg text-cream">Create a session</h2>
          <div className="mt-3 flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Friday night crew"
              required
              className="min-w-0 flex-1 rounded-xl border border-line bg-ink-soft px-3 py-2.5 outline-none ring-amber/40 focus:ring-2"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-amber px-4 font-semibold text-ink hover:bg-amber-deep disabled:opacity-60"
            >
              Create
            </button>
          </div>
        </form>

        <form onSubmit={joinSession} className="rounded-2xl border border-line bg-panel/70 p-4">
          <h2 className="font-display text-lg text-cream">Join with invite code</h2>
          <div className="mt-3 flex gap-2">
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="ABCD1234"
              required
              className="min-w-0 flex-1 rounded-xl border border-line bg-ink-soft px-3 py-2.5 uppercase tracking-wider outline-none ring-amber/40 focus:ring-2"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl border border-line px-4 font-medium text-cream hover:bg-ink-soft disabled:opacity-60"
            >
              Join
            </button>
          </div>
        </form>
      </section>

      <section className="animate-rise">
        <h2 className="mb-3 font-display text-xl text-cream">Your sessions</h2>
        {loading ? (
          <p className="text-cream-dim">Loading…</p>
        ) : sessions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-cream-dim">
            No sessions yet. Create one or join with a code.
          </p>
        ) : (
          <ul className="space-y-2">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/sessions/${s.id}/feed`}
                  className="flex items-center justify-between rounded-2xl border border-line bg-panel/60 px-4 py-3 transition hover:border-amber/40 hover:bg-panel"
                >
                  <div>
                    <p className="font-medium text-cream">{s.name}</p>
                    <p className="text-xs text-cream-dim">
                      {s.role} · code {s.inviteCode}
                    </p>
                  </div>
                  <span className="text-amber">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
