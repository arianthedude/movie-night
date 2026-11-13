import { and, desc, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import type { CastMemberJson } from "@/db/schema";
import { movies, sessionMovies, swipes } from "@/db/schema";
import { jsonError, requireUser } from "@/lib/api";
import { getMembership } from "@/lib/session-access";
import { tmdbImageUrl } from "@/lib/tmdb";

type Params = { params: Promise<{ id: string }> };

function normalizeCast(raw: unknown) {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (typeof item === "string") {
        return { name: item, character: "", photoUrl: null as string | null };
      }
      const member = item as CastMemberJson;
      return {
        name: member.name,
        character: member.character ?? "",
        photoUrl: tmdbImageUrl(member.profilePath, "w185"),
      };
    })
    .slice(0, 5);
}

export async function GET(_request: Request, { params }: Params) {
  const { error, user } = await requireUser();
  if (error) return error;

  const { id: sessionId } = await params;
  const membership = await getMembership(sessionId, user.id);
  if (!membership) return jsonError("Not a member of this session", 403);

  const rows = await db
    .select({
      id: movies.id,
      tmdbId: movies.tmdbId,
      title: movies.title,
      overview: movies.overview,
      director: movies.director,
      castJson: movies.castJson,
      posterPath: movies.posterPath,
      backdropPath: movies.backdropPath,
      stillsJson: movies.stillsJson,
      trailerKey: movies.trailerKey,
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
      tmdbId: m.tmdbId,
      title: m.title,
      overview: m.overview,
      director: m.director,
      cast: normalizeCast(m.castJson),
      releaseYear: m.releaseYear,
      posterUrl: tmdbImageUrl(m.posterPath, "w500"),
      backdropUrl: tmdbImageUrl(m.backdropPath, "w780"),
      stills: (m.stillsJson ?? []).map((p) => tmdbImageUrl(p, "w780")).filter(Boolean),
      trailerUrl: m.trailerKey
        ? `https://www.youtube.com/watch?v=${m.trailerKey}`
        : null,
      needsRefresh: !m.trailerKey || normalizeCast(m.castJson).every((c) => !c.photoUrl),
    })),
  );
}
