import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { matches, sessionMembers, swipes } from "@/db/schema";

export async function maybeCreateMatch(sessionId: string, movieId: string) {
  const [memberCountRow] = await db
    .select({ value: count() })
    .from(sessionMembers)
    .where(eq(sessionMembers.sessionId, sessionId));

  const memberCount = memberCountRow?.value ?? 0;
  if (memberCount === 0) return false;

  const [likeCountRow] = await db
    .select({ value: count() })
    .from(swipes)
    .where(
      and(
        eq(swipes.sessionId, sessionId),
        eq(swipes.movieId, movieId),
        eq(swipes.action, "like"),
      ),
    );

  const likeCount = likeCountRow?.value ?? 0;
  if (likeCount < memberCount) return false;

  await db
    .insert(matches)
    .values({ sessionId, movieId })
    .onConflictDoNothing();

  return true;
}
