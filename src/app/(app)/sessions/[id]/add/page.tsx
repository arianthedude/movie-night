"use client";

import Image from "next/image";
import { FormEvent, use, useState } from "react";
import { fetchMovieBundle, searchMovies, type TmdbSearchHit } from "@/lib/tmdb";

export default function AddMoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<TmdbSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function search(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const data = await searchMovies(q);
      setResults(data);
    } catch {
      setError("TMDB search failed. Check NEXT_PUBLIC_TMDB_API_KEY.");
    } finally {
      setLoading(false);
    }
  }

  async function addMovie(tmdbId: number, title: string) {
    setAdding(tmdbId);
    setError(null);
    setMessage(null);
    try {
      const bundle = await fetchMovieBundle(tmdbId);
      const res = await fetch(`/api/sessions/${id}/movies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bundle),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not add movie");
        return;
      }
      setMessage(`Added “${title}” to the feed`);
    } catch {
      setError("Failed to fetch movie details from TMDB");
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className="space-y-4 animate-rise">
      <form onSubmit={search} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search TMDB…"
          required
          className="min-w-0 flex-1 rounded-xl border border-line bg-ink-soft px-3 py-2.5 outline-none ring-amber/40 focus:ring-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-amber px-4 font-semibold text-ink hover:bg-amber-deep disabled:opacity-60"
        >
          {loading ? "…" : "Search"}
        </button>
      </form>

      {message ? (
        <p className="rounded-xl border border-sage/30 bg-sage/10 px-3 py-2 text-sm text-sage">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <ul className="space-y-2">
        {results.map((r) => (
          <li
            key={r.tmdbId}
            className="flex gap-3 rounded-2xl border border-line bg-panel/60 p-3"
          >
            <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-soft">
              {r.posterUrl ? (
                <Image src={r.posterUrl} alt="" fill className="object-cover" sizes="56px" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-cream">
                {r.title}
                {r.year ? <span className="text-cream-dim"> ({r.year})</span> : null}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-cream-dim">{r.overview}</p>
            </div>
            <button
              type="button"
              disabled={adding === r.tmdbId}
              onClick={() => void addMovie(r.tmdbId, r.title)}
              className="self-center rounded-xl border border-line px-3 py-2 text-sm text-amber hover:bg-amber/10 disabled:opacity-50"
            >
              {adding === r.tmdbId ? "…" : "Add"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
