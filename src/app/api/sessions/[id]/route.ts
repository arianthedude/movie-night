import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { jsonError, requireUser } from "@/lib/api";
import { getMembership } from "@/lib/session-access";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { error, user } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const membership = await getMembership(id, user.id);
  if (!membership) return jsonError("Not a member of this session", 403);

  const [session] = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
  if (!session) return jsonError("Session not found", 404);

  return NextResponse.json({ ...session, role: membership.role });
}
