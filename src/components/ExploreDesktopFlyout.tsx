"use client";

import Link from "next/link";

import { EXPLORE_SUB_LINKS, linkClass } from "@/lib/navConfig";

export function ExploreDesktopFlyout({ pathname }: { pathname: string }) {
  const parentActive = pathname.startsWith("/explore");
  return (
    <div className="group/explore relative z-40 hidden w-full md:block">
      <Link href="/explore" prefetch className={linkClass(parentActive)}>
        Explore a New Company
      </Link>

      <div
        className="pointer-events-none absolute left-[calc(100%-6px)] top-0 z-[140] flex min-h-[3.25rem] items-stretch opacity-0 transition-[opacity,transform] duration-300 ease-out translate-x-3 group-hover/explore:pointer-events-auto group-hover/explore:translate-x-0 group-hover/explore:opacity-100 group-focus-within/explore:pointer-events-auto group-focus-within/explore:translate-x-0 group-focus-within/explore:opacity-100"
        role="presentation"
      >
        <div className="w-5 shrink-0 bg-transparent" aria-hidden />
        <div className="pointer-events-auto relative min-w-[232px] max-w-[min(268px,calc(100vw-320px))] overflow-hidden rounded-2xl border border-[rgba(168,85,247,0.42)] bg-[rgba(9,7,20,0.92)] shadow-[0_0_0_1px_rgba(168,85,247,0.12),0_0_56px_rgba(139,92,246,0.32),0_28px_72px_rgba(0,0,0,0.58)] backdrop-blur-xl">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(155deg,rgba(139,92,246,0.14),transparent_42%,rgba(59,130,246,0.07))]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-2xl opacity-70"
            style={{
              background:
                "radial-gradient(120% 80% at 50% 0%, rgba(168,85,247,0.22), transparent 55%)"
            }}
          />
          <ul className="relative m-0 list-none space-y-1.5 p-2.5" role="list">
            {EXPLORE_SUB_LINKS.map((item) => {
              const subActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch
                    className={[
                      "block rounded-xl border px-4 py-3 text-sm font-semibold tracking-tight transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out will-change-transform",
                      subActive
                        ? "scale-[1.01] border-[rgba(168,85,247,0.55)] bg-[rgba(139,92,246,0.2)] text-neon-100 shadow-[0_0_32px_rgba(168,85,247,0.28)]"
                        : "border-transparent text-ink-0 hover:scale-[1.035] hover:border-[rgba(168,85,247,0.4)] hover:bg-[rgba(139,92,246,0.12)] hover:text-neon-100 hover:shadow-[0_0_36px_rgba(168,85,247,0.25)] active:scale-[1.01]"
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
