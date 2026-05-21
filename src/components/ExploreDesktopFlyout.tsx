"use client";

import Link from "next/link";

import { ExploreSearchNavItem } from "@/components/explore/ExploreSearchNavItem";
import { EXPLORE_SUB_LINKS, linkClass } from "@/lib/navConfig";

/**
 * Desktop sidebar: inline explore sub-links (scroll-safe).
 * Horizontal hover flyouts were clipped once the sidebar gained overflow-y scroll.
 */
export function ExploreDesktopFlyout({ pathname }: { pathname: string }) {
  const parentActive = pathname.startsWith("/explore");
  return (
    <div className="grid gap-2">
      <Link href="/explore" prefetch className={linkClass(parentActive)}>
        Explore a New Company
      </Link>
      <ul
        className="m-0 grid list-none gap-1.5 border-l border-panel-border/80 pl-3"
        role="list"
        aria-label="Explore companies"
      >
        {EXPLORE_SUB_LINKS.map((item) => {
          const subActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch
                className={[
                  "block rounded-xl px-3 py-2 text-sm font-medium transition",
                  subActive
                    ? "bg-[rgba(139,92,246,0.18)] text-neon-200"
                    : "text-ink-1 hover:bg-[rgba(255,255,255,0.04)] hover:text-ink-0"
                ].join(" ")}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
        <ExploreSearchNavItem variant="desktop" />
      </ul>
    </div>
  );
}
