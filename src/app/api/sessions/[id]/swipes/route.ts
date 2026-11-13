import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { sessionMovies, swipes } from "@/db/schema";
import { jsonError, requireUser } from "@/lib/api";
import { maybeCreateMatch } from "@/lib/matches";
import { getMembership } from "@/lib/session-access";

type Params = { params: Promise<{ id: string }> };

const swipeSchema = z.object({
  movieId: z.string().uuid(),
  action: z.enum(["like", "skip"]),
});

export async function POST(request: Request, { params }: Params) {
  const { error, user } = await requireUser();
  if (error) return error;

  const { id: sessionId } = await params;
  const membership = await getMembership(sessionId, user.id);
  if (!membership) return jsonError("Not a member of this session", 403);

  const body = await request.json().catch(() => null);
  const parsed = swipeSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid swipe");

  const [inSession] = await db
    .select({ id: sessionMovies.id })
    .from(sessionMovies)
    .where(
      and(
        eq(sessionMovies.sessionId, sessionId),
        eq(sessionMovies.movieId, parsed.data.movieId),
      ),
    )
    .limit(1);

  if (!inSession) return jsonError("Movie not in this session", 404);

  try {
    await db.insert(swipes).values({
      sessionId,
      movieId: parsed.data.movieId,
      userId: user.id,
      action: parsed.data.action,
    });
  } catch {
    return jsonError("Already swiped this movie", 409);
  }

  let matched = false;
  if (parsed.data.action === "like") {
    matched = await maybeCreateMatch(sessionId, parsed.data.movieId);
  }

  return NextResponse.json({ ok: true, matched });
}
