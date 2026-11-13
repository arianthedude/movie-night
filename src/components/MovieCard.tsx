"use client";

import Image from "next/image";
import { useState } from "react";

export type FeedMovie = {
  id: string;
  title: string;
  overview: string;
  director: string;
  cast: string[];
  releaseYear: number | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  stills: (string | null)[];
};

export function MovieCard({
  movie,
  animClass,
}: {
  movie: FeedMovie;
  animClass?: string;
}) {
  const [stillIndex, setStillIndex] = useState(0);
  const stills = movie.stills.filter(Boolean) as string[];
  const hero = stills[stillIndex] || movie.backdropUrl || movie.posterUrl;

  return (
    <article
      className={`overflow-hidden rounded-3xl border border-line bg-panel shadow-[0_24px_60px_rgba(0,0,0,0.35)] ${animClass ?? ""}`}
    >
      <div className="relative aspect-[16/10] bg-ink-soft">
        {hero ? (
          <Image
            src={hero}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 480px) 100vw, 480px"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-cream-dim">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent" />
      </div>

      <div className="space-y-3 p-5">
        <div>
          <h2 className="font-display text-2xl font-semibold leading-tight text-cream">
            {movie.title}
            {movie.releaseYear ? (
              <span className="ml-2 text-lg font-normal text-cream-dim">
                ({movie.releaseYear})
              </span>
            ) : null}
          </h2>
          {movie.director ? (
            <p className="mt-1 text-sm text-amber">Directed by {movie.director}</p>
          ) : null}
        </div>

        {movie.cast.length > 0 ? (
          <p className="text-sm text-cream-dim">
            <span className="text-cream/80">Cast: </span>
            {movie.cast.join(", ")}
          </p>
        ) : null}

        {movie.overview ? (
          <p className="line-clamp-4 text-sm leading-relaxed text-cream-dim">
            {movie.overview}
          </p>
        ) : null}

        {stills.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {stills.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setStillIndex(i)}
                className={`relative h-14 w-24 shrink-0 overflow-hidden rounded-lg border ${
                  i === stillIndex ? "border-amber" : "border-line"
                }`}
              >
                <Image src={src} alt="" fill className="object-cover" sizes="96px" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
