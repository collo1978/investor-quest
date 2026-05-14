"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo } from "react";

import { GlassCard } from "@/components/GlassCard";
import { InvestorQuestBrandLogo } from "@/components/InvestorQuestBrandLogo";
import { NeonButton } from "@/components/NeonButton";
import { useGame } from "@/components/GameProvider";
import { COMPANIES, companyById, type CompanyId } from "@/data/companies";
import {
  INVESTOR_RUNGS,
  investorLadderProgress,
  investorTitleFromXp
} from "@/data/progression/investorLadder";
import { BADGES, type BadgeId } from "@/engine/progression/badges";
import { levelProgress } from "@/engine";
import { useConviction } from "@/hooks/useConviction";

const GOLD = "#F5C547";
const VIOLET = "#C4B5FD";

const SECTOR_ROWS = [
  { name: "Technology", convictionPct: 82, companies: 4, locked: false },
  { name: "Consumer Discretionary", convictionPct: 68, companies: 2, locked: false },
  { name: "Healthcare", convictionPct: 0, companies: 0, locked: true }
] as const;

const INDUSTRY_ROWS = [
  { name: "Consumer Electronics", pct: 80 },
  { name: "Software & Services", pct: 70 },
  { name: "Semiconductors", pct: 55 },
  { name: "Electric Vehicles", pct: 45 },
  { name: "Cloud Computing", pct: 40 }
] as const;

type HubAchievement = {
  id: string;
  title: string;
  badgeId?: BadgeId;
  /** When no badgeId, use locked + progressLabel */
  locked?: boolean;
  progressLabel?: string;
};

const HUB_ACHIEVEMENTS: HubAchievement[] = [
  { id: "10k", title: "First 10-K", badgeId: "ten-k-rookie" },
  { id: "q3", title: "3-Day Quiz Streak", badgeId: "quiz-streak-3" },
  { id: "sec", title: "Sector Explorer", badgeId: "first-pillar" },
  { id: "earn", title: "Earnings Insider", badgeId: "quiz-pass" },
  { id: "deep", title: "Deep Diver", locked: true, progressLabel: "0 / 20" }
];

export default function InvestorProfileHub() {
  const { state, raw } = useGame();
  const { leaderboard } = useConviction();
  const company = companyById(state.activeCompanyId as CompanyId);
  const lp = levelProgress(state.xp);
  const ladder = useMemo(() => investorLadderProgress(state.xp), [state.xp]);
  const title = investorTitleFromXp(state.xp);
  const nextRung =
    ladder.rank < INVESTOR_RUNGS.length ? INVESTOR_RUNGS[ladder.rank] : null;
  const nextTitle = nextRung?.title ?? "Apex rank";
  const xpToNext = nextRung ? Math.max(0, nextRung.xp - state.xp) : 0;

  const topStrength = useMemo(() => leaderboard.slice(0, 5), [leaderboard]);

  const companiesExplored = raw.unlockedCompanyIds.length;

  const recentBadges = useMemo(() => {
    const entries = Object.entries(state.badges) as [BadgeId, { awardedAt: number }][];
    return entries
      .filter(([id]) => id in BADGES)
      .sort((a, b) => b[1].awardedAt - a[1].awardedAt)
      .slice(0, 3)
      .map(([badgeId, meta]) => ({ badgeId, ...BADGES[badgeId], at: meta.awardedAt }));
  }, [state.badges]);

  const initials =
    (state.playerName?.trim()?.slice(0, 2).toUpperCase() || "IQ") as string;

  return (
    <div className="relative min-h-screen min-w-0 max-w-[100vw] overflow-x-hidden overflow-y-auto bg-[#050508] text-ink-0">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(168,85,247,0.22),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_0%,rgba(245,197,71,0.08),transparent_50%),radial-gradient(ellipse_50%_50%_at_0%_100%,rgba(59,130,246,0.06),transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.4] [mask-image:radial-gradient(900px_520px_at_50%_20%,black,transparent_75%)]"
        style={{
          backgroundImage:
            "linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px)",
          backgroundSize: "56px 56px"
        }}
      />

        <main className="relative z-[1] mx-auto max-w-6xl px-5 pb-16 pt-8 md:px-8 md:pt-10">
          {/* Top bar */}
          <header className="mb-10 flex flex-col gap-6 border-b border-white/[0.08] pb-8 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
              <Link href="/home" className="relative z-10 shrink-0">
                <InvestorQuestBrandLogo
                  className="h-10 w-auto sm:h-11"
                  sizes="(max-width: 640px) 240px, 280px"
                />
                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-2">
                  Stock research, rebuilt
                </p>
              </Link>
              <div>
                <h1 className="font-[var(--font-grotesk)] text-3xl leading-tight tracking-tight md:text-4xl">
                  <span className="text-ink-0">Your Investor </span>
                  <span
                    className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-violet-400 bg-clip-text text-transparent"
                    style={{ textShadow: "0 0 40px rgba(168,85,247,0.45)" }}
                  >
                    Profile
                  </span>
                </h1>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-1 md:text-base">
                  Your journey. Your progress. Your edge.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <NeonButton variant="ghost" href="/map">
                Quest map
              </NeonButton>
              <NeonButton href="/home">Home</NeonButton>
            </div>
          </header>

          {/* 1. Main profile card */}
          <GlassCard className="relative mb-6 overflow-hidden border-white/10 bg-[rgba(12,10,24,0.55)] backdrop-blur-xl md:mb-8">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full opacity-60"
              style={{
                background:
                  "radial-gradient(circle, rgba(168,85,247,0.35), transparent 68%)"
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 rounded-full opacity-40"
              style={{
                background:
                  "radial-gradient(circle, rgba(245,197,71,0.15), transparent 70%)"
              }}
            />
            <div className="relative grid gap-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
              <div className="flex justify-center lg:justify-start">
                <div
                  className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-2 md:h-32 md:w-32"
                  style={{
                    borderColor: "rgba(168,85,247,0.5)",
                    background:
                      "linear-gradient(145deg, rgba(139,92,246,0.35), rgba(7,7,18,0.92))",
                    boxShadow:
                      "0 0 40px rgba(168,85,247,0.45), inset 0 0 0 1px rgba(255,255,255,0.06)"
                  }}
                >
                  <span className="font-[var(--font-grotesk)] text-xl font-bold tracking-[0.2em] text-ink-0 md:text-2xl">
                    {initials}
                  </span>
                  <span className="sr-only">Avatar placeholder</span>
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{
                      borderColor: "rgba(168,85,247,0.45)",
                      color: VIOLET,
                      background: "rgba(139,92,246,0.12)"
                    }}
                  >
                    Level {state.level}
                  </span>
                  <span className="text-[11px] text-ink-2">{company.ticker} campaign</span>
                </div>
                <h2 className="mt-2 font-[var(--font-grotesk)] text-2xl font-semibold text-ink-0 md:text-3xl">
                  {title}
                </h2>
                <p className="mt-1 text-sm text-ink-1">
                  <span className="font-semibold text-ink-0 tabular-nums">
                    {state.xp.toLocaleString()}
                  </span>{" "}
                  XP · this rank band{" "}
                  <span className="tabular-nums text-ink-0">
                    {lp.inLevel.toLocaleString()} / {lp.needed.toLocaleString()}
                  </span>
                  {nextRung ? (
                    <span className="text-ink-2">
                      {" "}
                      · {xpToNext.toLocaleString()} XP until{" "}
                      <span className="font-medium text-violet-200/95">{nextTitle}</span>
                    </span>
                  ) : null}
                </p>
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] uppercase tracking-[0.14em] text-ink-2">
                    <span>Rank charge</span>
                    <span className="tabular-nums text-ink-0">{Math.round(lp.pct)}%</span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full border border-white/10 bg-black/50">
                    <motion.div
                      className="h-full rounded-full"
                      initial={false}
                      animate={{ width: `${lp.pct}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 22 }}
                      style={{
                        background:
                          "linear-gradient(90deg, rgba(168,85,247,0.95), rgba(245,197,71,0.9))",
                        boxShadow: "0 0 18px rgba(245,197,71,0.35)"
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-3 lg:max-w-[220px]">
                <div
                  className="rounded-2xl border px-4 py-3"
                  style={{
                    borderColor: "rgba(245,197,71,0.35)",
                    background: "rgba(245,197,71,0.08)"
                  }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200/90">
                    Rewards unlocked
                  </p>
                  {recentBadges.length > 0 ? (
                    <ul className="mt-2 space-y-1.5 text-xs text-ink-0">
                      {recentBadges.map((b) => (
                        <li key={b.badgeId} className="flex items-center gap-2">
                          <span style={{ color: GOLD }} aria-hidden>
                            ◆
                          </span>
                          <span>{b.title}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs leading-relaxed text-ink-2">
                      Clear quizzes and streak milestones — your badges appear here.
                    </p>
                  )}
                </div>
                <div
                  aria-hidden
                  className="pointer-events-none hidden h-32 rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-500/10 to-transparent lg:block"
                />
              </div>
            </div>
          </GlassCard>

          {/* Middle row: strength × 3 */}
          <div className="mb-6 grid gap-4 md:grid-cols-3 md:mb-8">
            <GlassCard className="border-white/10 bg-[rgba(10,8,20,0.55)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-2">
                  Your strength
                </h3>
                <Link
                  href="/conviction/leaderboard"
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300 transition hover:text-violet-200"
                >
                  View all →
                </Link>
              </div>
              <p className="mt-1 text-xs text-ink-2">Top conviction names</p>
              <ol className="mt-4 space-y-3">
                {topStrength.length === 0 ? (
                  <li className="text-sm text-ink-2">
                    Log conviction picks to rank tickers here.
                  </li>
                ) : (
                  topStrength.map((row) => (
                    <li key={row.ticker}>
                      <Link
                        href="/conviction/leaderboard"
                        className="group flex items-center gap-3 rounded-xl border border-transparent px-1 py-0.5 transition hover:border-violet-500/25 hover:bg-white/[0.03]"
                      >
                        <span className="w-5 text-center text-[11px] font-bold text-ink-2">
                          {row.rank}
                        </span>
                        <TickerOrb ticker={row.ticker} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-semibold text-ink-0 group-hover:text-violet-100">
                              {row.ticker}
                            </span>
                            <span className="shrink-0 text-xs tabular-nums text-emerald-300/90">
                              {row.confidentPct}%
                            </span>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/40">
                            <div
                              className="h-full rounded-full transition-all group-hover:shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                              style={{
                                width: `${Math.max(6, row.confidentPct)}%`,
                                background:
                                  "linear-gradient(90deg, rgba(139,92,246,0.9), rgba(52,211,153,0.85))"
                              }}
                            />
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))
                )}
              </ol>
            </GlassCard>

            <GlassCard className="border-white/10 bg-[rgba(10,8,20,0.55)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-2">
                  Sector strength
                </h3>
                <Link
                  href="/profile/sector-strength"
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300 transition hover:text-violet-200"
                >
                  Details →
                </Link>
              </div>
              <p className="mt-1 text-xs text-ink-2">Preview radar</p>
              <ul className="mt-4 space-y-3">
                {SECTOR_ROWS.map((s) => (
                  <li key={s.name}>
                    <Link
                      href="/profile/sector-strength"
                      className={`block rounded-xl border border-transparent px-1 py-0.5 transition hover:border-violet-500/25 hover:bg-white/[0.03] ${s.locked ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="font-medium text-ink-0">{s.name}</span>
                        {s.locked ? (
                          <span className="text-[10px] uppercase tracking-[0.14em] text-ink-2">
                            Locked
                          </span>
                        ) : (
                          <span className="tabular-nums text-violet-200/90">{s.convictionPct}%</span>
                        )}
                      </div>
                      {!s.locked ? (
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/40">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${s.convictionPct}%`,
                              background:
                                "linear-gradient(90deg, rgba(139,92,246,0.95), rgba(167,139,250,0.75))"
                            }}
                          />
                        </div>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard className="border-white/10 bg-[rgba(10,8,20,0.55)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-2">
                  Industry strength
                </h3>
                <Link
                  href="/profile/industry-strength"
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300 transition hover:text-violet-200"
                >
                  Details →
                </Link>
              </div>
              <p className="mt-1 text-xs text-ink-2">Surface signals</p>
              <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {INDUSTRY_ROWS.map((row) => (
                  <li key={row.name}>
                    <Link
                      href="/profile/industry-strength"
                      className="block rounded-xl border border-white/[0.06] bg-black/25 px-3 py-2 transition hover:border-violet-500/30 hover:bg-white/[0.04]"
                    >
                      <div className="text-[11px] font-medium text-ink-0">{row.name}</div>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-black/50">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500/90 to-fuchsia-400/70"
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                      <div className="mt-1 text-[10px] tabular-nums text-ink-2">{row.pct}%</div>
                    </Link>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>

          {/* Bottom row: companies + achievements */}
          <div className="mb-6 grid gap-4 md:grid-cols-2 md:mb-8">
            <GlassCard className="border-white/10 bg-[rgba(10,8,20,0.55)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-2">
                  Your companies
                </h3>
                <Link
                  href="/company-progress"
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300 transition hover:text-violet-200"
                >
                  History →
                </Link>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-[var(--font-grotesk)] text-4xl font-bold text-violet-200 tabular-nums md:text-5xl">
                    {companiesExplored}
                  </p>
                  <p className="mt-1 text-sm text-ink-2">Campaigns unlocked</p>
                </div>
                <Link
                  href="/company-progress"
                  className="pointer-events-auto flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/15 to-transparent text-violet-300/80 transition hover:border-amber-300/30 hover:text-amber-200/90"
                  aria-label="Open company progress"
                >
                  <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden>
                    <path
                      d="M12 44 L22 28 L32 36 L42 22 L52 38 L52 48 L12 48 Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      opacity="0.85"
                    />
                    <path
                      d="M18 48 L18 34 M26 48 L26 30 M34 48 L34 32 M42 48 L42 28"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      opacity="0.5"
                    />
                  </svg>
                </Link>
              </div>
              <p className="mt-3 text-xs text-ink-2">
                {COMPANIES.map((c) => c.ticker).join(" · ")}
              </p>
            </GlassCard>

            <GlassCard className="border-white/10 bg-[rgba(10,8,20,0.55)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-2">
                  Recent achievements
                </h3>
                <Link
                  href="/profile/achievements"
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300 transition hover:text-violet-200"
                >
                  View all →
                </Link>
              </div>
              <ul className="mt-4 flex flex-wrap gap-2 md:gap-3">
                {HUB_ACHIEVEMENTS.map((a) => (
                  <AchievementChip key={a.id} def={a} earned={badgeEarned(state, a)} />
                ))}
              </ul>
            </GlassCard>
          </div>

          {/* XP ladder CTA */}
          <Link href="/xp-ladder" className="group block">
            <GlassCard className="border border-violet-500/30 bg-[linear-gradient(125deg,rgba(139,92,246,0.14),rgba(10,8,20,0.65))] backdrop-blur-xl transition group-hover:border-amber-300/35 group-hover:shadow-[0_0_32px_rgba(168,85,247,0.25)]">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-violet-200/90">
                    Progression
                  </p>
                  <h3 className="mt-1 font-[var(--font-grotesk)] text-xl text-ink-0 md:text-2xl">
                    View XP ladder
                  </h3>
                  <p className="mt-1 max-w-xl text-sm text-ink-2">
                    Opens the full-screen investor title ladder — climb from Rookie to Wall St Warrior.
                  </p>
                </div>
                <span
                  className="inline-flex shrink-0 items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition group-hover:border-amber-300/50"
                  style={{
                    borderColor: "rgba(245,197,71,0.4)",
                    color: GOLD,
                    background: "rgba(245,197,71,0.08)"
                  }}
                >
                  Open →
                </span>
              </div>
            </GlassCard>
          </Link>
        </main>
    </div>
  );
}

function badgeEarned(
  state: { badges: Record<string, { awardedAt: number }> },
  a: HubAchievement
): boolean {
  if (a.locked) return false;
  if (!a.badgeId) return false;
  return Boolean(state.badges[a.badgeId]);
}

function AchievementChip({
  def,
  earned
}: {
  def: HubAchievement;
  earned: boolean;
}) {
  const hardLocked = Boolean(def.locked);
  const earnedShow = !hardLocked && earned;
  const inProgress = !hardLocked && def.badgeId && !earned;

  return (
    <li className="list-none">
      <Link
        href="/profile/achievements"
        className={[
          "flex min-w-[104px] flex-col rounded-2xl border px-3 py-3 transition",
          earnedShow
            ? "border-amber-300/40 bg-[linear-gradient(145deg,rgba(245,197,71,0.12),rgba(139,92,246,0.08))] shadow-[0_0_20px_rgba(245,197,71,0.2)]"
            : hardLocked
              ? "border-white/10 bg-black/30 opacity-55"
              : "border-violet-400/25 bg-violet-500/[0.06] hover:border-violet-400/40"
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-1">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-[10px] font-bold uppercase tracking-wide text-violet-200"
            aria-hidden
          >
            {def.id === "10k"
              ? "10K"
              : def.id === "q3"
                ? "3Q"
                : def.id === "sec"
                  ? "Sx"
                  : def.id === "earn"
                    ? "Ec"
                    : "DD"}
          </span>
          {earnedShow ? (
            <span className="text-amber-200" aria-label="Earned">
              ✓
            </span>
          ) : hardLocked ? (
            <span className="text-ink-2" aria-hidden>
              🔒
            </span>
          ) : inProgress ? (
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400/80" aria-hidden />
          ) : null}
        </div>
        <p className="mt-2 text-[11px] font-semibold leading-tight text-ink-0">{def.title}</p>
        {def.progressLabel ? (
          <p className="mt-1 text-[10px] text-ink-2">{def.progressLabel}</p>
        ) : earnedShow ? (
          <p className="mt-1 text-[10px] text-ink-2">Unlocked</p>
        ) : (
          <p className="mt-1 text-[10px] text-ink-2">In progress</p>
        )}
      </Link>
    </li>
  );
}

function TickerOrb({ ticker }: { ticker: string }) {
  const t = ticker.slice(0, 2).toUpperCase();
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-[10px] font-bold text-violet-200"
      aria-hidden
    >
      {t}
    </div>
  );
}
