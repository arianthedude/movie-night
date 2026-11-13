import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { movies } from "@/db/schema";
import { jsonError, requireUser } from "@/lib/api";
import { movieBundleSchema } from "@/lib/movie-payload";
import { tmdbImageUrl } from "@/lib/tmdb";

type Params = { params: Promise<{ id: string }> };

/** Update cached movie metadata from a client-fetched TMDB bundle. */
export async function PATCH(request: Request, { params }: Params) {
  const { error } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = movieBundleSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid movie payload");
  }

  const bundle = parsed.data;
  const [existing] = await db.select().from(movies).where(eq(movies.id, id)).limit(1);
  if (!existing) return jsonError("Movie not found", 404);
  if (existing.tmdbId !== bundle.tmdbId) {
    return jsonError("tmdbId does not match this movie", 400);
  }

  const [movie] = await db
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
    .where(eq(movies.id, id))
    .returning();

  return NextResponse.json({
    id: movie.id,
    title: movie.title,
    posterUrl: tmdbImageUrl(movie.posterPath, "w342"),
  });
}
