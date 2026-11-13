import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { sessionMembers } from "@/db/schema";

export async function getMembership(sessionId: string, userId: string) {
  const [membership] = await db
    .select()
    .from(sessionMembers)
    .where(
      and(eq(sessionMembers.sessionId, sessionId), eq(sessionMembers.userId, userId)),
    )
    .limit(1);

  return membership ?? null;
}

export async function requireMembership(sessionId: string, userId: string) {
  const membership = await getMembership(sessionId, userId);
  if (!membership) {
    throw new Error("NOT_A_MEMBER");
  }
  return membership;
}
