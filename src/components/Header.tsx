"use client";

import Link from "next/link";

import { InvestorQuestBrandLogo } from "@/components/InvestorQuestBrandLogo";

export type HeaderProps = {
  /** Opens the slide-in navigation (mobile / tablet). */
  onOpenMenu?: () => void;
  /** Reflects drawer open state for `aria-expanded` on the menu control. */
  menuOpen?: boolean;
};

/**
 * Mobile sticky header (md:hidden — desktop uses the left sidebar).
 * Hamburger opens the full navigation drawer when `onOpenMenu` is provided.
 */
export function Header({ onOpenMenu, menuOpen = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 md:hidden">
      <div className="border-b border-[rgba(139,92,246,0.18)] bg-[rgba(7,7,18,0.62)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center gap-3 px-4 sm:px-6">
          {onOpenMenu ? (
            <button
              type="button"
              onClick={onOpenMenu}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-ink-0 transition hover:border-violet-400/40 hover:bg-white/[0.05] active:scale-[0.98]"
              aria-label="Open menu"
              aria-controls="mobile-nav-drawer"
              aria-expanded={menuOpen}
            >
              <span className="flex flex-col gap-1.5" aria-hidden>
                <span className="block h-0.5 w-5 rounded-full bg-ink-0 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                <span className="block h-0.5 w-5 rounded-full bg-ink-0 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                <span className="block h-0.5 w-5 rounded-full bg-ink-0 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
              </span>
            </button>
          ) : null}
          <Link
            href="/home"
            className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center py-1 sm:justify-start"
          >
            <InvestorQuestBrandLogo
              priority
              className="h-12 w-auto max-w-[min(58vw,280px)] sm:h-14 sm:max-w-[min(70vw,300px)]"
              sizes="(max-width: 640px) 240px, 300px"
            />
          </Link>
        </div>
        <div
          aria-hidden
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(139,92,246,0.55), rgba(168,85,247,0.30), transparent)"
          }}
        />
      </div>
    </header>
  );
}
