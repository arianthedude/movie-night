import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { matches, movies } from "@/db/schema";
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
      director: movies.director,
      releaseYear: movies.releaseYear,
      posterPath: movies.posterPath,
      matchedAt: matches.matchedAt,
    })
    .from(matches)
    .innerJoin(movies, eq(matches.movieId, movies.id))
    .where(eq(matches.sessionId, sessionId))
    .orderBy(desc(matches.matchedAt));

  return NextResponse.json(
    rows.map((m) => ({
      id: m.id,
      title: m.title,
      director: m.director,
      releaseYear: m.releaseYear,
      posterUrl: tmdbImageUrl(m.posterPath, "w342"),
      matchedAt: m.matchedAt,
    })),
  );
}
