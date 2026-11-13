import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { sessionMembers, sessions } from "@/db/schema";
import { jsonError, requireUser } from "@/lib/api";
import { generateInviteCode } from "@/lib/invite";

const createSchema = z.object({
  name: z.string().trim().min(1).max(128),
});

export async function GET() {
  const { error, user } = await requireUser();
  if (error) return error;

  const rows = await db
    .select({
      id: sessions.id,
      name: sessions.name,
      inviteCode: sessions.inviteCode,
      createdAt: sessions.createdAt,
      role: sessionMembers.role,
    })
    .from(sessionMembers)
    .innerJoin(sessions, eq(sessionMembers.sessionId, sessions.id))
    .where(eq(sessionMembers.userId, user.id))
    .orderBy(desc(sessions.createdAt));

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const { error, user } = await requireUser();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  let inviteCode = generateInviteCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const [session] = await db
        .insert(sessions)
        .values({
          name: parsed.data.name,
          inviteCode,
          createdBy: user.id,
        })
        .returning();

      await db.insert(sessionMembers).values({
        sessionId: session.id,
        userId: user.id,
        role: "owner",
      });

      return NextResponse.json(session, { status: 201 });
    } catch {
      inviteCode = generateInviteCode();
    }
  }

  return jsonError("Could not create session", 500);
}
