import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { sessionMembers, sessions } from "@/db/schema";
import { jsonError, requireUser } from "@/lib/api";
import { getMembership } from "@/lib/session-access";

const joinSchema = z.object({
  inviteCode: z.string().trim().min(4).max(12),
});

export async function POST(request: Request) {
  const { error, user } = await requireUser();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = joinSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid invite code");
  }

  const code = parsed.data.inviteCode.toUpperCase();
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.inviteCode, code))
    .limit(1);

  if (!session) {
    return jsonError("Session not found", 404);
  }

  const existing = await getMembership(session.id, user.id);
  if (existing) {
    return NextResponse.json(session);
  }

  await db.insert(sessionMembers).values({
    sessionId: session.id,
    userId: user.id,
    role: "member",
  });

  return NextResponse.json(session, { status: 201 });
}
