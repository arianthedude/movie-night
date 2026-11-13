import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { movies, sessionMovies } from "@/db/schema";
import { jsonError, requireUser } from "@/lib/api";
import { needsMovieRefresh, refreshMovieFromTmdb } from "@/lib/movie-cache";
import { getMembership } from "@/lib/session-access";
import { fetchMovieBundle, tmdbImageUrl } from "@/lib/tmdb";

type Params = { params: Promise<{ id: string }> };

const addSchema = z.object({
  tmdbId: z.number().int().positive(),
});

export async function POST(request: Request, { params }: Params) {
  const { error, user } = await requireUser();
  if (error) return error;

  const { id: sessionId } = await params;
  const membership = await getMembership(sessionId, user.id);
  if (!membership) return jsonError("Not a member of this session", 403);

  const body = await request.json().catch(() => null);
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid tmdbId");

  let [movie] = await db
    .select()
    .from(movies)
    .where(eq(movies.tmdbId, parsed.data.tmdbId))
    .limit(1);

  try {
    if (!movie) {
      const bundle = await fetchMovieBundle(parsed.data.tmdbId);
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
    } else if (needsMovieRefresh(movie)) {
      movie = await refreshMovieFromTmdb(movie.id, movie.tmdbId);
    }
  } catch (e) {
    console.error(e);
    return jsonError("Failed to fetch movie from TMDB", 502);
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
