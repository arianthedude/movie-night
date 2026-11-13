import { and, desc, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { movies, sessionMovies, swipes } from "@/db/schema";
import { jsonError, requireUser } from "@/lib/api";
import { getMembership } from "@/lib/session-access";
import { tmdbImageUrl } from "@/lib/tmdb";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { error, user } = await requireUser();
  if (error) return error;

  const { id: sessionId } = await params;
  const membership = await getMembership(sessionId, user.id);
  if (!membership) return jsonError("Not a member of this session", 403);

  const rows = await db
    .select({
      id: movies.id,
      title: movies.title,
      overview: movies.overview,
      director: movies.director,
      castJson: movies.castJson,
      posterPath: movies.posterPath,
      backdropPath: movies.backdropPath,
      stillsJson: movies.stillsJson,
      releaseYear: movies.releaseYear,
      addedAt: sessionMovies.createdAt,
    })
    .from(sessionMovies)
    .innerJoin(movies, eq(sessionMovies.movieId, movies.id))
    .leftJoin(
      swipes,
      and(
        eq(swipes.sessionId, sessionId),
        eq(swipes.movieId, movies.id),
        eq(swipes.userId, user.id),
      ),
    )
    .where(and(eq(sessionMovies.sessionId, sessionId), isNull(swipes.id)))
    .orderBy(desc(sessionMovies.createdAt));

  return NextResponse.json(
    rows.map((m) => ({
      id: m.id,
      title: m.title,
      overview: m.overview,
      director: m.director,
      cast: m.castJson ?? [],
      releaseYear: m.releaseYear,
      posterUrl: tmdbImageUrl(m.posterPath, "w500"),
      backdropUrl: tmdbImageUrl(m.backdropPath, "w780"),
      stills: (m.stillsJson ?? []).map((p) => tmdbImageUrl(p, "w780")).filter(Boolean),
    })),
  );
}
