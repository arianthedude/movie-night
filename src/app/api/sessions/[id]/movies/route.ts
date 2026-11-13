import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { movies, sessionMovies } from "@/db/schema";
import { jsonError, requireUser } from "@/lib/api";
import { movieBundleSchema } from "@/lib/movie-payload";
import { getMembership } from "@/lib/session-access";
import { tmdbImageUrl } from "@/lib/tmdb";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { error, user } = await requireUser();
  if (error) return error;

  const { id: sessionId } = await params;
  const membership = await getMembership(sessionId, user.id);
  if (!membership) return jsonError("Not a member of this session", 403);

  const body = await request.json().catch(() => null);
  const parsed = movieBundleSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid movie payload");
  }

  const bundle = parsed.data;

  let [movie] = await db
    .select()
    .from(movies)
    .where(eq(movies.tmdbId, bundle.tmdbId))
    .limit(1);

  if (!movie) {
    [movie] = await db
      .insert(movies)
      .values({
        tmdbId: bundle.tmdbId,
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
      .returning();
  } else {
    [movie] = await db
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
      .where(eq(movies.id, movie.id))
      .returning();
  }

  try {
    await db.insert(sessionMovies).values({
      sessionId,
      movieId: movie.id,
      addedBy: user.id,
    });
  } catch {
    return jsonError("Movie already in this session", 409);
  }

  return NextResponse.json(
    {
      id: movie.id,
      title: movie.title,
      posterUrl: tmdbImageUrl(movie.posterPath, "w342"),
    },
    { status: 201 },
  );
}
