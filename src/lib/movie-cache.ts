import { eq } from "drizzle-orm";
import { db } from "@/db";
import { movies } from "@/db/schema";
import { fetchMovieBundle } from "@/lib/tmdb";

export function needsMovieRefresh(movie: typeof movies.$inferSelect) {
  const cast = movie.castJson ?? [];
  const first = cast[0];
  const hasRichCast =
    typeof first === "object" && first !== null && "profilePath" in first;
  return !movie.trailerKey || !hasRichCast;
}

export async function refreshMovieFromTmdb(movieId: string, tmdbId: number) {
  const bundle = await fetchMovieBundle(tmdbId);
  const [updated] = await db
    .update(movies)
    .set({
      title: bundle.title,
      overview: bundle.overview,
      director: bundle.director,
      castJson: bundle.cast,
      posterPath: bundle.posterPath,
      backdropPath: bundle.backdropPath,
      stillsJson: bundle.stills,
      trailerKey: bundle.trailerKey,
      releaseYear: bundle.releaseYear,
    })
    .where(eq(movies.id, movieId))
    .returning();
  return updated;
}
