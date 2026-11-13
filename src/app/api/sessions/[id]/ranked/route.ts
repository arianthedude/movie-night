import { and, asc, count, desc, eq, sql } from "drizzle-orm";
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

  const likeCount = sql<number>`coalesce(${count(swipes.id)}, 0)`.mapWith(Number);

  const rows = await db
    .select({
      id: movies.id,
      title: movies.title,
      director: movies.director,
      releaseYear: movies.releaseYear,
      posterPath: movies.posterPath,
      likeCount,
    })
    .from(sessionMovies)
    .innerJoin(movies, eq(sessionMovies.movieId, movies.id))
    .leftJoin(
      swipes,
      and(
        eq(swipes.sessionId, sessionId),
        eq(swipes.movieId, movies.id),
        eq(swipes.action, "like"),
      ),
    )
    .where(eq(sessionMovies.sessionId, sessionId))
    .groupBy(movies.id)
    .orderBy(desc(likeCount), asc(movies.title));

  return NextResponse.json(
    rows.map((m) => ({
      id: m.id,
      title: m.title,
      director: m.director,
      releaseYear: m.releaseYear,
      posterUrl: tmdbImageUrl(m.posterPath, "w342"),
      likeCount: m.likeCount,
    })),
  );
}
