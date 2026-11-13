"use client";

import { FormEvent, use, useCallback, useEffect, useState } from "react";

type Member = {
  userId: string;
  username: string;
  role: "owner" | "member";
  joinedAt: string;
};

type SessionInfo = {
  id: string;
  name: string;
  inviteCode: string;
  role: "owner" | "member";
};

export default function MembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const [sRes, mRes] = await Promise.all([
      fetch(`/api/sessions/${id}`),
      fetch(`/api/sessions/${id}/members`),
    ]);
    const sData = await sRes.json();
    const mData = await mRes.json();
    if (sRes.ok) setSession(sData);
    if (mRes.ok) setMembers(mData);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addMember(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const res = await fetch(`/api/sessions/${id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not add member");
      return;
    }
    setUsername("");
    setMessage(`Added ${data.username}`);
    await load();
  }

  async function copyCode() {
    if (!session?.inviteCode) return;
    await navigator.clipboard.writeText(session.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-5 animate-rise">
      {session ? (
        <section className="rounded-2xl border border-line bg-panel/70 p-4">
          <h2 className="font-display text-lg text-cream">Invite code</h2>
          <p className="mt-1 text-sm text-cream-dim">Share this so friends can join.</p>
          <div className="mt-3 flex items-center gap-2">
            <code className="rounded-xl bg-ink-soft px-4 py-2 font-mono text-lg tracking-widest text-amber">
              {session.inviteCode}
            </code>
            <button
              type="button"
              onClick={() => void copyCode()}
              className="rounded-xl border border-line px-3 py-2 text-sm text-cream-dim hover:text-cream"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </section>
      ) : null}

      {session?.role === "owner" ? (
        <form onSubmit={addMember} className="rounded-2xl border border-line bg-panel/70 p-4">
          <h2 className="font-display text-lg text-cream">Add by username</h2>
          <div className="mt-3 flex gap-2">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="friend_username"
              required
              className="min-w-0 flex-1 rounded-xl border border-line bg-ink-soft px-3 py-2.5 outline-none ring-amber/40 focus:ring-2"
            />
            <button
              type="submit"
              className="rounded-xl bg-amber px-4 font-semibold text-ink hover:bg-amber-deep"
            >
              Add
            </button>
          </div>
        </form>
      ) : null}

      {message ? (
        <p className="text-sm text-sage">{message}</p>
      ) : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <section>
        <h2 className="mb-2 font-display text-lg text-cream">Members</h2>
        <ul className="space-y-2">
          {members.map((m) => (
            <li
              key={m.userId}
              className="flex items-center justify-between rounded-xl border border-line bg-panel/50 px-4 py-3"
            >
              <span className="font-medium text-cream">{m.username}</span>
              <span className="text-xs uppercase tracking-wide text-cream-dim">{m.role}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
