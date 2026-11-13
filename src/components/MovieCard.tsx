"use client";

import Image from "next/image";
import { useState } from "react";

export type FeedCastMember = {
  name: string;
  character: string;
  photoUrl: string | null;
};

export type FeedMovie = {
  id: string;
  tmdbId: number;
  title: string;
  overview: string;
  director: string;
  cast: FeedCastMember[];
  releaseYear: number | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  stills: (string | null)[];
  trailerUrl: string | null;
  needsRefresh?: boolean;
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
        {movie.trailerUrl ? (
          <a
            href={movie.trailerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 right-3 rounded-full bg-ink/80 px-3 py-1.5 text-xs font-semibold text-cream backdrop-blur hover:bg-amber hover:text-ink"
          >
            Watch trailer
          </a>
        ) : null}
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
          <div className="flex gap-3 overflow-x-auto pb-1">
            {movie.cast.map((person) => (
              <div key={person.name} className="w-16 shrink-0 text-center">
                <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-full border border-line bg-ink-soft">
                  {person.photoUrl ? (
                    <Image
                      src={person.photoUrl}
                      alt={person.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-cream-dim">
                      {person.name.slice(0, 1)}
                    </div>
                  )}
                </div>
                <p className="mt-1.5 truncate text-[11px] font-medium text-cream">
                  {person.name}
                </p>
                {person.character ? (
                  <p className="truncate text-[10px] text-cream-dim">{person.character}</p>
                ) : null}
              </div>
            ))}
          </div>
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
