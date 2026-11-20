"use client";

import { use, useEffect, useState } from "react";
import { TmdbImage } from "@/components/TmdbImage";

type MatchRow = {
  id: string;
  title: string;
  director: string;
  releaseYear: number | null;
  posterUrl: string | null;
  matchedAt: string;
};

export default function MatchedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [rows, setRows] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const res = await fetch(`/api/sessions/${id}/matches`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <p className="text-cream-dim">Loading matches…</p>;

  if (rows.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line px-6 py-14 text-center animate-rise">
        <p className="font-display text-xl text-cream">No matches yet</p>
        <p className="mt-2 text-sm text-cream-dim">
          When everyone likes the same movie, it shows up here.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3 animate-rise">
      {rows.map((m) => (
        <li
          key={m.id}
          className="flex gap-3 rounded-2xl border border-sage/30 bg-panel/70 p-3"
        >
          <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-soft">
            <TmdbImage src={m.posterUrl} className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="font-display text-lg text-cream">{m.title}</p>
            <p className="text-sm text-cream-dim">
              {m.director}
              {m.releaseYear ? ` · ${m.releaseYear}` : ""}
            </p>
            <p className="mt-1 text-xs text-sage">Everyone liked this</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
