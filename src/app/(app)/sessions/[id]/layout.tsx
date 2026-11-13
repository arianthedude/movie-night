import Link from "next/link";
import { SessionNav } from "@/components/SessionNav";
import { auth } from "@/lib/auth";
import { getMembership } from "@/lib/session-access";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};


export default async function SessionLayout({ children, params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const membership = await getMembership(id, session.user.id);
  if (!membership) redirect("/");

  const [row] = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
  if (!row) notFound();

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-4 pt-6">
      <header className="mb-4 animate-rise">
        <Link href="/" className="text-sm text-cream-dim hover:text-amber">
          ← Sessions
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-cream">{row.name}</h1>
      </header>
      <div className="flex-1">{children}</div>
      <SessionNav sessionId={id} />
    </main>
  );
}
