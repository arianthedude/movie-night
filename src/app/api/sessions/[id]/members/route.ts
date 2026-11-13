import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { sessionMembers, users } from "@/db/schema";
import { jsonError, requireUser } from "@/lib/api";
import { getMembership } from "@/lib/session-access";

type Params = { params: Promise<{ id: string }> };

const addSchema = z.object({
  username: z.string().trim().min(2).max(64),
});

export async function GET(_request: Request, { params }: Params) {
  const { error, user } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const membership = await getMembership(id, user.id);
  if (!membership) return jsonError("Not a member of this session", 403);

  const members = await db
    .select({
      userId: users.id,
      username: users.username,
      role: sessionMembers.role,
      joinedAt: sessionMembers.joinedAt,
    })
    .from(sessionMembers)
    .innerJoin(users, eq(sessionMembers.userId, users.id))
    .where(eq(sessionMembers.sessionId, id));

  return NextResponse.json(members);
}

export async function POST(request: Request, { params }: Params) {
  const { error, user } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const membership = await getMembership(id, user.id);
  if (!membership) return jsonError("Not a member of this session", 403);
  if (membership.role !== "owner") {
    return jsonError("Only the session owner can add members", 403);
  }

  const body = await request.json().catch(() => null);
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid username");

  const username = parsed.data.username.toLowerCase();
  const [target] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!target) return jsonError("User not found", 404);

  const existing = await getMembership(id, target.id);
  if (existing) {
    return NextResponse.json({
      userId: target.id,
      username: target.username,
      role: existing.role,
    });
  }

  await db.insert(sessionMembers).values({
    sessionId: id,
    userId: target.id,
    role: "member",
  });

  return NextResponse.json(
    { userId: target.id, username: target.username, role: "member" },
    { status: 201 },
  );
}
