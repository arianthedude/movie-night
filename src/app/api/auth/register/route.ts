import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { jsonError } from "@/lib/api";

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string().min(4).max(128),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const username = parsed.data.username.toLowerCase();
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existing) {
    return jsonError("Username already taken", 409);
  }

  const passwordHash = await hash(parsed.data.password, 12);
  const [user] = await db
    .insert(users)
    .values({ username, passwordHash })
    .returning({ id: users.id, username: users.username });

  return NextResponse.json({ id: user.id, username: user.username }, { status: 201 });
}
