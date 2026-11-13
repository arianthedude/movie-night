"use client";

import Image from "next/image";
import { use, useEffect, useState } from "react";

type RankedRow = {
  id: string;
  title: string;
  director: string;
  releaseYear: number | null;
  posterUrl: string | null;
  likeCount: number;
};

export default function RankedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [rows, setRows] = useState<RankedRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const res = await fetch(`/api/sessions/${id}/ranked`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <p className="text-cream-dim">Loading rankings…</p>;

  if (rows.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line px-6 py-14 text-center animate-rise">
        <p className="font-display text-xl text-cream">Nothing ranked yet</p>
        <p className="mt-2 text-sm text-cream-dim">Add movies and start liking.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2 animate-rise">
      {rows.map((m, index) => (
        <li
          key={m.id}
          className="flex items-center gap-3 rounded-2xl border border-line bg-panel/60 p-3"
        >
          <span className="w-7 text-center font-display text-xl text-amber">{index + 1}</span>
          <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md bg-ink-soft">
            {m.posterUrl ? (
              <Image src={m.posterUrl} alt="" fill className="object-cover" sizes="44px" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-cream">{m.title}</p>
            <p className="truncate text-xs text-cream-dim">
              {m.director}
              {m.releaseYear ? ` · ${m.releaseYear}` : ""}
            </p>
          </div>
          <span className="rounded-full bg-amber/15 px-2.5 py-1 text-xs font-semibold text-amber">
            {m.likeCount} {m.likeCount === 1 ? "like" : "likes"}
          </span>
        </li>
      ))}
    </ul>
  );
}
