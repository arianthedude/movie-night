import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: jsonError("Unauthorized", 401), user: null as never };
  }
  return { error: null, user: session.user };
}
