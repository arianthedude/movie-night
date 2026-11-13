"use client";

import { useCallback, useEffect, useState } from "react";
import { FeedMovie, MovieCard } from "./MovieCard";

export function SwipeFeed({ sessionId }: { sessionId: string }) {
  const [movies, setMovies] = useState<FeedMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [anim, setAnim] = useState<"" | "swipe-left" | "swipe-right">("");
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/sessions/${sessionId}/feed`);
    const data = await res.json();
    setMovies(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const current = movies[0];

  async function swipe(action: "like" | "skip") {
    if (!current || busy) return;
    setBusy(true);
    setAnim(action === "like" ? "swipe-right" : "swipe-left");

    await new Promise((r) => setTimeout(r, 240));

    const res = await fetch(`/api/sessions/${sessionId}/swipes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId: current.id, action }),
    });
    const data = await res.json();

    if (data.matched) {
      setToast(`Match! Everyone liked ${current.title}`);
      setTimeout(() => setToast(null), 2800);
    }

    setMovies((prev) => prev.slice(1));
    setAnim("");
    setBusy(false);
  }

  if (loading) {
    return <p className="py-16 text-center text-cream-dim">Loading feed…</p>;
  }

  if (!current) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-panel/40 px-6 py-16 text-center animate-rise">
        <p className="font-display text-xl text-cream">You&apos;re caught up</p>
        <p className="mt-2 text-sm text-cream-dim">
          Add more movies or wait for friends to add some.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {toast ? (
        <div className="rounded-2xl border border-sage/40 bg-sage/15 px-4 py-3 text-center text-sm text-sage animate-rise">
          {toast}
        </div>
      ) : null}

      <MovieCard movie={current} animClass={anim} />

      <div className="flex gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void swipe("skip")}
          className="flex-1 rounded-2xl border border-line bg-ink-soft py-3.5 font-medium text-cream-dim transition hover:border-danger/50 hover:text-danger disabled:opacity-50"
        >
          Skip
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void swipe("like")}
          className="flex-1 rounded-2xl bg-amber py-3.5 font-semibold text-ink transition hover:bg-amber-deep disabled:opacity-50"
        >
          Like
        </button>
      </div>

      <p className="text-center text-xs text-cream-dim">
        {movies.length} left in your feed
      </p>
    </div>
  );
}
