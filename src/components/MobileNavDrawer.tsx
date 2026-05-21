"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

import { InvestorQuestBrandLogo } from "@/components/InvestorQuestBrandLogo";
import { LevelBar } from "@/components/LevelBar";
import { COMPANIES, companyById } from "@/lib/demoData";
import { ExploreSearchNavItem } from "@/components/explore/ExploreSearchNavItem";
import {
  EXPLORE_SUB_LINKS,
  ISLAND_NAV,
  PRIMARY_NAV,
  islandLinkActive,
  linkActive,
  linkClass
} from "@/lib/navConfig";
import { levelProgress } from "@/lib/gameState";

/** Fields read from `useGame().state` (UI context slice, not full `GameState`). */
type MobileNavDrawerStateSlice = {
  activeCompanyId: string;
  xp: number;
  streaks?: {
    quiz: { streak: number };
    research: { streak: number };
  };
};

type Reading = { read: number; total: number; pct: number };

type Props = {
  open: boolean;
  onClose: () => void;
  pathname: string;
  state: MobileNavDrawerStateSlice;
  onCompanyChange: (id: string) => void;
  reading: Reading;
};

function MobileExploreAccordion({
  pathname,
  onNavigate
}: {
  pathname: string;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(() => pathname.startsWith("/explore"));
  const parentActive = pathname.startsWith("/explore");

  useEffect(() => {
    if (pathname.startsWith("/explore")) setExpanded(true);
  }, [pathname]);

  return (
    <div className="overflow-hidden rounded-2xl border border-panel-border bg-[rgba(255,255,255,0.02)]">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className={[
          linkClass(parentActive),
          "flex w-full items-center justify-between gap-3 text-left"
        ].join(" ")}
        aria-expanded={expanded}
      >
        <span className="min-w-0 flex-1 leading-snug">Explore a New Company</span>
        <svg
          viewBox="0 0 24 24"
          className={[
            "h-5 w-5 shrink-0 text-violet-300 transition-transform duration-200",
            expanded ? "rotate-180" : ""
          ].join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden border-t border-white/[0.08] bg-black/25"
          >
            <ul className="m-0 list-none space-y-1 p-2" role="list">
              {EXPLORE_SUB_LINKS.map((item) => {
                const subActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch
                      onClick={onNavigate}
                      className={[
                        "block min-h-[48px] rounded-xl px-4 py-3 text-sm font-semibold transition",
                        subActive
                          ? "bg-[rgba(139,92,246,0.18)] text-neon-200 shadow-[inset_0_0_0_1px_rgba(168,85,247,0.35)]"
                          : "text-ink-0 active:bg-white/[0.06]"
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              <ExploreSearchNavItem
                variant="mobile"
                onNavigate={onNavigate}
              />
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function MobileNavDrawer({ open, onClose, pathname, state, onCompanyChange, reading }: Props) {
  const lp = levelProgress(state.xp);
  const company = companyById(state.activeCompanyId);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-[190] bg-black/65 backdrop-blur-[2px] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
            className="fixed left-0 top-0 z-[200] flex h-[100dvh] w-[min(100%,20rem)] max-w-[92vw] flex-col border-r border-panel-border bg-[rgba(7,7,18,0.96)] shadow-[16px_0_48px_rgba(0,0,0,0.55)] backdrop-blur-xl md:hidden"
            initial={{ x: "-105%" }}
            animate={{ x: 0 }}
            exit={{ x: "-105%" }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
              <Link href="/home" onClick={onClose} className="min-w-0 flex-1 py-1">
                <InvestorQuestBrandLogo
                  priority
                  className="h-10 w-auto max-w-[140px] object-contain"
                  sizes="160px"
                />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-ink-0 transition hover:border-violet-400/40 hover:bg-white/[0.05]"
                aria-label="Close menu"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              <p className="text-[11px] text-ink-2">{company.ticker} campaign</p>

              <div className="mt-4 rounded-2xl border border-panel-border bg-[rgba(255,255,255,0.03)] p-3">
                <div className="text-[11px] text-ink-2">Company</div>
                <select
                  suppressHydrationWarning
                  value={state.activeCompanyId}
                  onChange={(e) => onCompanyChange(e.target.value)}
                  className="mt-2 min-h-[44px] w-full rounded-xl border border-panel-border bg-[rgba(255,255,255,0.04)] px-3 py-2.5 text-sm text-ink-0 outline-none ring-neon-400/50 focus:ring-2"
                >
                  {COMPANIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.ticker})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4">
                <LevelBar
                  level={lp.level}
                  pct={lp.pct}
                  label={`${lp.inLevel}/${lp.needed} XP`}
                />
                <div className="mt-2 text-[11px] leading-relaxed text-ink-2">
                  <span
                    className="font-semibold"
                    style={{
                      color: "#F5C547",
                      textShadow: "0 0 14px rgba(245,197,71,0.35)"
                    }}
                  >
                    Quiz {state.streaks?.quiz.streak ?? 0}d
                  </span>
                  <span className="text-ink-2"> · </span>
                  <span className="text-ink-2/90">
                    Consistency {state.streaks?.research.streak ?? 0}d
                  </span>
                  <span className="mt-1 block text-ink-2">
                    XP <span className="font-semibold text-ink-0">{state.xp}</span>
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] text-ink-2">
                    <span className="uppercase tracking-[0.16em]">Cards read</span>
                    <span className="font-semibold text-ink-0">
                      {reading.read}/{reading.total}
                      <span className="ml-2 text-ink-2">{reading.pct}%</span>
                    </span>
                  </div>
                  <div className="mt-1.5 relative h-1.5 overflow-hidden rounded-full border border-panel-border bg-[rgba(255,255,255,0.03)]">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
                      style={{
                        width: `${reading.read === 0 ? 0 : Math.max(4, reading.pct)}%`,
                        background:
                          "linear-gradient(90deg, rgba(139,92,246,0.30), rgba(139,92,246,0.85), rgba(168,85,247,0.70))",
                        boxShadow:
                          reading.read > 0 ? "0 0 18px rgba(139,92,246,0.30)" : "none"
                      }}
                    />
                  </div>
                </div>
              </div>

              <nav className="mt-6 grid gap-2 pb-6" aria-label="Primary mobile">
                <MobileExploreAccordion pathname={pathname} onNavigate={onClose} />
                <div className="pt-1">
                  <p className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-2">
                    Islands
                  </p>
                  <div className="grid gap-2">
                    {ISLAND_NAV.map((item) => {
                      const active = islandLinkActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          prefetch
                          onClick={onClose}
                          className={[
                            linkClass(active),
                            "flex min-h-[48px] items-center"
                          ].join(" ")}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
                {PRIMARY_NAV.map((item) => {
                  const active = linkActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={item.href !== "/profile"}
                      onClick={onClose}
                      className={[linkClass(active), "flex min-h-[48px] items-center"].join(" ")}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="rounded-2xl border border-panel-border bg-[rgba(0,0,0,0.20)] p-4">
                <div className="text-[11px] text-ink-2">Tip</div>
                <div className="mt-2 text-xs text-ink-1">
                  Pass quizzes to grow your quiz streak (prestige + milestone XP). Consistency days
                  are a separate habit signal.
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
