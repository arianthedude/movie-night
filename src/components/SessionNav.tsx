"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "feed", label: "Feed" },
  { href: "add", label: "Add" },
  { href: "matched", label: "Matched" },
  { href: "ranked", label: "Liked" },
  { href: "members", label: "Members" },
] as const;

export function SessionNav({ sessionId }: { sessionId: string }) {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 -mx-4 mt-auto border-t border-line bg-ink/90 px-2 py-2 backdrop-blur-md safe-bottom">
      <ul className="grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const href = `/sessions/${sessionId}/${tab.href}`;
          const active = pathname.endsWith(`/${tab.href}`);
          return (
            <li key={tab.href}>
              <Link
                href={href}
                className={`block rounded-xl px-1 py-2 text-center text-xs font-medium transition ${
                  active
                    ? "bg-amber/15 text-amber"
                    : "text-cream-dim hover:bg-panel hover:text-cream"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
