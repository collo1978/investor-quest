"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useGame } from "@/components/GameProvider";
import {
  INVESTOR_RUNGS,
  investorRankFromXp,
  type InvestorRung
} from "@/data/progression/investorLadder";
import { formatAnalyticsNumber } from "@/lib/analytics/formatDisplay";
import {
  isSchoolsDemoPath,
  resolveSchoolsDemoProfileHref
} from "@/lib/schools/schoolsDemoHref";

const GOLD = "#F5C547";
const GOLD_SOFT = "rgba(245, 197, 71, 0.55)";

type RungVisual = "locked" | "current" | "completed";

function rungVisual(playerXp: number, r: InvestorRung, peak: InvestorRung): RungVisual {
  if (r.xp === peak.xp) return "current";
  if (playerXp >= r.xp) return "completed";
  return "locked";
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M7 11V8a5 5 0 0 1 10 0v3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <rect
        x="5"
        y="11"
        width="14"
        height="11"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function HowXpWorksPanel() {
  const [open, setOpen] = useState(false);
  const [hoverCapable, setHoverCapable] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = "how-xp-works-panel";

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover)");
    const sync = () => setHoverCapable(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (hoverCapable || !open) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el || el.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open, hoverCapable]);

  useEffect(() => {
    if (hoverCapable || !open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, hoverCapable]);

  return (
    <div
      ref={rootRef}
      className="relative z-30 w-full min-w-0 sm:w-auto"
      onMouseEnter={hoverCapable ? () => setOpen(true) : undefined}
      onMouseLeave={hoverCapable ? () => setOpen(false) : undefined}
    >
      <button
        type="button"
        className="relative rounded-xl border px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-amber-100 shadow-[0_0_24px_rgba(245,197,71,0.35)] transition hover:shadow-[0_0_36px_rgba(245,197,71,0.5)]"
        style={{
          borderColor: "rgba(245,197,71,0.55)",
          background: "linear-gradient(135deg, rgba(245,197,71,0.18), rgba(139,92,246,0.12))"
        }}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="true"
        onClick={
          hoverCapable
            ? undefined
            : () => {
                setOpen((v) => !v);
              }
        }
      >
        How XP Works
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            role="tooltip"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="pointer-events-auto absolute left-0 right-0 top-[calc(100%-2px)] z-50 w-full max-w-none rounded-2xl border border-violet-500/35 bg-[rgba(8,6,18,0.96)] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.65),0_0_40px_rgba(168,85,247,0.2)] backdrop-blur-xl sm:left-auto sm:right-0 sm:w-[min(22rem,calc(100vw-2rem))] sm:max-w-[22rem]"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-200/90">
              How you earn XP
            </p>
            <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-ink-1">
              <li>Complete a quest card: +50 XP</li>
              <li>Finish a pillar: +250 XP</li>
              <li>Complete a quiz: +500 XP</li>
              <li>Finish a full company 10-K quest: +2,000 XP</li>
              <li>Complete quarterly update quests: +750 XP</li>
              <li>Complete earnings call quests: +750 XP</li>
              <li>Maintain a weekly streak: bonus XP</li>
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function XpLadderFullPageClient() {
  const pathname = usePathname();
  const { state } = useGame();
  const xp = state.xp;
  /** Pathname-only — avoids sessionStorage mismatch during SSR hydration. */
  const schoolsTour = isSchoolsDemoPath(pathname);
  const profileHref = resolveSchoolsDemoProfileHref(pathname);

  const ordered = useMemo(
    () => [...INVESTOR_RUNGS].sort((a, b) => b.xp - a.xp),
    []
  );

  const peak = useMemo(() => {
    const rank = investorRankFromXp(xp);
    return INVESTOR_RUNGS[Math.max(0, rank - 1)] ?? INVESTOR_RUNGS[0];
  }, [xp]);

  const n = ordered.length;

  return (
    <div
      className={[
        "relative min-w-0 max-w-[100vw] overflow-x-hidden bg-[#050508] text-ink-0",
        schoolsTour
          ? "iq-schools-xp-ladder-deck min-h-0 w-full"
          : "min-h-[calc(100vh-72px)] md:min-h-screen"
      ].join(" ")}
    >
      {/* backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(168,85,247,0.28),transparent_58%),radial-gradient(ellipse_50%_40%_at_100%_20%,rgba(245,197,71,0.1),transparent_50%),radial-gradient(ellipse_45%_50%_at_0%_80%,rgba(59,130,246,0.06),transparent_48%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.35] [mask-image:radial-gradient(900px_520px_at_50%_12%,black,transparent_72%)]"
        style={{
          backgroundImage:
            "linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.028)_1px,transparent_1px)",
          backgroundSize: "52px 52px"
        }}
      />

      {/* elite particles — deterministic positions, decorative only */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[120px] h-[320px] w-[min(96vw,720px)] -translate-x-1/2 md:top-[100px]"
      >
        <span
          className="premium-particle absolute left-[12%] top-[8%] h-1.5 w-1.5"
          style={
            {
              ["--pp-dx" as string]: "8px",
              ["--pp-dy" as string]: "-32px",
              ["--pp-dur" as string]: "11s",
              ["--pp-delay" as string]: "0s"
            } as React.CSSProperties
          }
        />
        <span
          className="premium-particle absolute left-[44%] top-[22%] h-1 w-1"
          style={
            {
              ["--pp-dx" as string]: "-6px",
              ["--pp-dy" as string]: "-28px",
              ["--pp-dur" as string]: "13s",
              ["--pp-delay" as string]: "-4s"
            } as React.CSSProperties
          }
        />
        <span
          className="premium-particle absolute right-[18%] top-[12%] h-1.5 w-1.5"
          style={
            {
              ["--pp-dx" as string]: "-10px",
              ["--pp-dy" as string]: "-36px",
              ["--pp-dur" as string]: "12s",
              ["--pp-delay" as string]: "-7s"
            } as React.CSSProperties
          }
        />
        <span
          className="premium-particle absolute left-[30%] top-[38%] h-1 w-1 opacity-80"
          style={
            {
              ["--pp-dx" as string]: "12px",
              ["--pp-dy" as string]: "-24px",
              ["--pp-dur" as string]: "14s",
              ["--pp-delay" as string]: "-2s"
            } as React.CSSProperties
          }
        />
      </div>

      <div className="iq-schools-xp-ladder-inner relative z-[1] mx-auto w-full min-w-0 max-w-3xl px-5 pb-28 pt-5 md:px-8 md:pb-16 md:pt-8">
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <a
            href={profileHref}
            className="group order-2 inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-ink-1 no-underline transition hover:text-ink-0 sm:order-1"
          >
            <span
              className="text-violet-300 transition group-hover:text-violet-200"
              aria-hidden
            >
              ←
            </span>
            Back to Profile
          </a>
          <div className="order-1 w-full min-w-0 sm:order-2 sm:w-auto sm:max-w-[min(100%,20rem)]">
            <HowXpWorksPanel />
          </div>
        </header>

        <div className="iq-schools-xp-ladder-title-block mb-12 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.42em] text-violet-400/50">
            ━━━━━━━━━━━━━━━━━━
          </p>
          <h1
            className="mt-3 font-[var(--font-grotesk)] text-3xl tracking-tight text-ink-0 md:text-4xl"
            style={{ textShadow: "0 0 48px rgba(168,85,247,0.4)" }}
          >
            XP LADDER PAGE
          </h1>
          <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.42em] text-violet-400/50">
            ━━━━━━━━━━━━━━━━━━
          </p>
          <p className="mx-auto mt-5 max-w-md text-sm text-ink-2">
            Progression climbs toward the elite — every rank is a milestone on the vertical path to
            mastery.
          </p>
        </div>

        {/* ladder column + central spine */}
        <div className="relative mx-auto max-w-xl">
          <div
            aria-hidden
            className="pointer-events-none absolute left-[22px] top-10 z-0 w-[4px] rounded-full md:left-[26px]"
            style={{
              bottom: "2.25rem",
              background:
                "linear-gradient(180deg, rgba(245,197,71,0.95) 0%, rgba(168,85,247,0.72) 38%, rgba(91,33,182,0.35) 72%, rgba(30,27,45,0.25) 100%)",
              boxShadow:
                "0 0 42px rgba(245,197,71,0.45), 0 0 28px rgba(168,85,247,0.5), 0 0 8px rgba(168,85,247,0.35)"
            }}
          />

          <ol className="relative z-[1] m-0 flex list-none flex-col gap-5 p-0 pl-1 md:gap-6">
            {ordered.map((r, i) => {
              const prev = ordered[i - 1];
              const showTier = i === 0 || prev.tier !== r.tier;
              const vis = rungVisual(xp, r, peak);
              const isLocked = vis === "locked";
              const isCurrent = vis === "current";
              const isDone = vis === "completed";
              const apex = n > 1 ? (n - 1 - i) / (n - 1) : 1;
              const tierGlow =
                0.22 + apex * 0.78 * (r.tier === "ELITE" || r.tier === "EXPERT" ? 1 : 0.55);

              return (
                <li key={`${r.tier}-${r.xp}-${r.title}`} className="relative">
                  {showTier ? (
                    <div className="mb-1 flex items-center gap-3 pl-[3.25rem] md:pl-[3.75rem]">
                      <span
                        className="text-[11px] font-bold uppercase tracking-[0.28em]"
                        style={{
                          color: GOLD,
                          textShadow: `0 0 ${12 + apex * 16}px ${GOLD_SOFT}`
                        }}
                      >
                        {r.tier}
                      </span>
                      <div
                        className="h-px min-w-[2rem] flex-1 bg-gradient-to-r from-violet-500/50 to-transparent"
                        aria-hidden
                      />
                    </div>
                  ) : null}

                  <div className="flex items-stretch gap-3 md:gap-4">
                    {/* spine node */}
                    <div className="relative flex w-11 shrink-0 flex-col items-center pt-4 md:w-12">
                      <div className="relative flex h-4 w-4 items-center justify-center md:h-[18px] md:w-[18px]">
                        <div
                          className="relative z-[1] h-4 w-4 rounded-full border-2 md:h-[18px] md:w-[18px]"
                          style={{
                            borderColor: isLocked
                              ? "rgba(255,255,255,0.14)"
                              : isCurrent
                                ? GOLD
                                : "rgba(52,211,153,0.75)",
                            background: isLocked
                              ? "rgba(0,0,0,0.55)"
                              : isCurrent
                                ? "rgba(245,197,71,0.35)"
                                : "rgba(52,211,153,0.22)",
                            boxShadow: isLocked
                              ? "none"
                              : isCurrent
                                ? `0 0 ${14 + apex * 18}px rgba(245,197,71,${0.35 + apex * 0.35})`
                                : `0 0 ${8 + apex * 10}px rgba(52,211,153,0.35)`
                          }}
                          aria-hidden
                        />
                        {isCurrent ? (
                          <motion.span
                            className="pointer-events-none absolute inset-[-6px] rounded-full md:inset-[-8px]"
                            style={{
                              border: `1px solid ${GOLD_SOFT}`,
                              boxShadow: `0 0 24px ${GOLD_SOFT}`
                            }}
                            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.15, 1] }}
                            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                            aria-hidden
                          />
                        ) : null}
                      </div>
                    </div>

                    <motion.div
                      className={[
                        "relative min-w-0 flex-1 overflow-hidden rounded-2xl border px-4 py-4 backdrop-blur-xl transition-shadow md:px-5 md:py-4",
                        isLocked
                          ? "border-white/[0.09] bg-black/35 opacity-[0.5] saturate-[0.6]"
                          : "border-white/10 bg-[rgba(12,10,24,0.62)]"
                      ].join(" ")}
                      style={
                        !isLocked
                          ? {
                              boxShadow: `0 0 ${20 + apex * 36}px rgba(168,85,247,${0.08 + tierGlow * 0.12}), inset 0 0 0 1px rgba(255,255,255,0.04)`
                            }
                          : undefined
                      }
                      whileHover={
                        isLocked ? { scale: 1.01 } : { scale: 1.025, y: -2 }
                      }
                      transition={{ type: "spring", stiffness: 380, damping: 24 }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {isLocked ? (
                              <LockIcon className="shrink-0 text-violet-500/50" />
                            ) : null}
                            <p
                              className={[
                                "font-[var(--font-grotesk)] text-lg font-semibold leading-snug break-words md:text-xl",
                                isLocked ? "text-ink-2" : "text-ink-0"
                              ].join(" ")}
                            >
                              {r.title}
                            </p>
                          </div>
                          <p className="mt-2 text-sm tabular-nums tracking-wide text-ink-2">
                            <span className="xp-gold-shimmer font-semibold" style={{ color: GOLD }}>
                              {formatAnalyticsNumber(r.xp)} XP
                            </span>
                          </p>
                        </div>
                        {isCurrent ? (
                          <span
                            className="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
                            style={{
                              borderColor: "rgba(245,197,71,0.55)",
                              color: GOLD,
                              background: "rgba(245,197,71,0.12)",
                              boxShadow: "0 0 20px rgba(245,197,71,0.25)"
                            }}
                          >
                            You are here
                          </span>
                        ) : isDone ? (
                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300/90">
                            Cleared
                          </span>
                        ) : null}
                      </div>
                    </motion.div>
                  </div>
                </li>
              );
            })}
          </ol>

          <p className="mt-10 text-center text-xs text-ink-2">
            Your XP:{" "}
            <span className="xp-gold-shimmer font-semibold tabular-nums" style={{ color: GOLD }}>
              {formatAnalyticsNumber(xp)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
