"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";

const NEON = "#39FF88";
const NEON_DIM = "rgba(57, 255, 136, 0.45)";
const NEON_BORDER = "rgba(57, 255, 136, 0.42)";

type ExampleCompany = {
  id: string;
  name: string;
  ticker: string;
  initials: string;
  logoBg: string;
  overall: number;
  tenK: number;
  quarterly: number;
  earnings: number;
  badgeTitle: string;
  badgeTier: "bronze" | "silver" | "gold";
  unlockedLabel: string;
};

const EXAMPLE_COMPANIES: ExampleCompany[] = [
  {
    id: "aapl",
    name: "Apple Inc.",
    ticker: "AAPL",
    initials: "AP",
    logoBg: "linear-gradient(145deg, rgba(255,255,255,0.14), rgba(80,80,120,0.35))",
    overall: 85,
    tenK: 100,
    quarterly: 75,
    earnings: 80,
    badgeTitle: "Gold Earnings Expert",
    badgeTier: "gold",
    unlockedLabel: "Unlocked May 6, 2024"
  },
  {
    id: "nvda",
    name: "NVIDIA Corp.",
    ticker: "NVDA",
    initials: "NV",
    logoBg: "linear-gradient(145deg, rgba(34,197,94,0.25), rgba(15,80,50,0.5))",
    overall: 70,
    tenK: 100,
    quarterly: 60,
    earnings: 80,
    badgeTitle: "Silver Quarterly Analyst",
    badgeTier: "silver",
    unlockedLabel: "Unlocked Apr 18, 2024"
  },
  {
    id: "tsla",
    name: "Tesla, Inc.",
    ticker: "TSLA",
    initials: "TS",
    logoBg: "linear-gradient(145deg, rgba(239,68,68,0.2), rgba(60,20,20,0.45))",
    overall: 55,
    tenK: 75,
    quarterly: 25,
    earnings: 60,
    badgeTitle: "Bronze 10-K Rookie",
    badgeTier: "bronze",
    unlockedLabel: "Unlocked Mar 2, 2024"
  }
];

const BADGE_ABOUT = [
  {
    tier: "bronze" as const,
    title: "Bronze 10-K Rookie",
    detail: "Completed first 10-K analysis"
  },
  {
    tier: "silver" as const,
    title: "Silver Quarterly Analyst",
    detail: "Completed 3+ 10-Q analysis"
  },
  {
    tier: "gold" as const,
    title: "Gold Earnings Expert",
    detail: "Analyzed 3+ earnings calls"
  },
  {
    tier: "platinum" as const,
    title: "Platinum Master",
    detail: "Completed all pillars with top-tier mastery"
  }
];

function GlassPanel({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl border border-panel-border bg-panel shadow-glow backdrop-blur-xl",
        className
      ].join(" ")}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(139,92,246,0.10)] via-transparent to-[rgba(59,130,246,0.06)]"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

function PillarBar({ label, pct, icon }: { label: string; pct: number; icon: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/35 text-emerald-200/90">
        {icon}
      </div>
      <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-2">{label}</span>
      <span className="text-xs font-semibold tabular-nums" style={{ color: NEON }}>
        {pct}%
      </span>
      <div className="h-1.5 w-full max-w-[88px] overflow-hidden rounded-full border border-white/10 bg-black/50">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${NEON_DIM}, ${NEON})`,
            boxShadow: `0 0 12px ${NEON_DIM}`
          }}
        />
      </div>
    </div>
  );
}

function HexBadge({
  tier,
  title
}: {
  tier: "bronze" | "silver" | "gold" | "platinum";
  title: string;
}) {
  const fills: Record<typeof tier, string> = {
    bronze:
      "linear-gradient(165deg, #d4a574 0%, #7a4a28 45%, #3d2414 100%)",
    silver:
      "linear-gradient(165deg, #e8eef5 0%, #8b96a8 42%, #3d4450 100%)",
    gold: "linear-gradient(165deg, #ffe9a8 0%, #d4a017 40%, #6a4a0a 100%)",
    platinum:
      "linear-gradient(165deg, #e0e8ff 0%, #8890b8 38%, #2a3048 100%)"
  };
  const stroke: Record<typeof tier, string> = {
    bronze: "rgba(212,165,116,0.55)",
    silver: "rgba(200,210,225,0.5)",
    gold: "rgba(255,215,120,0.55)",
    platinum: "rgba(180,190,255,0.45)"
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative flex h-[92px] w-[80px] items-center justify-center"
        style={{
          filter: `drop-shadow(0 0 14px ${tier === "gold" ? "rgba(255,200,80,0.35)" : "rgba(57,255,136,0.12)"})`
        }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center px-1.5 text-center text-[7px] font-bold uppercase leading-[1.15] tracking-wide text-white/95 md:px-2 md:text-[8px]"
          style={{
            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            background: fills[tier],
            border: `1px solid ${stroke[tier]}`
          }}
        >
          <span className="max-w-[4.75rem] text-balance drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]">
            {title}
          </span>
        </div>
      </div>
    </div>
  );
}

function HeaderPlatformArt() {
  return (
    <svg
      className="pointer-events-none h-28 w-28 shrink-0 opacity-90 md:h-32 md:w-32"
      viewBox="0 0 120 120"
      aria-hidden
    >
      <defs>
        <radialGradient id="cp-beam" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#39FF88" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#39FF88" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cp-disc" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(57,255,136,0.35)" />
          <stop offset="100%" stopColor="rgba(139,92,246,0.25)" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="88" rx="44" ry="12" fill="rgba(57,255,136,0.12)" />
      <ellipse cx="60" cy="86" rx="36" ry="9" fill="url(#cp-disc)" opacity="0.9" />
      <rect x="58" y="28" width="4" height="58" fill="url(#cp-beam)" rx="2" opacity="0.75" />
      <circle cx="60" cy="26" r="10" fill="rgba(57,255,136,0.5)" />
      <circle cx="60" cy="26" r="5" fill="rgba(255,255,255,0.85)" />
    </svg>
  );
}

export function CompanyProgressPageClient() {
  const total = EXAMPLE_COMPANIES.length;

  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[#050508] text-ink-0 md:min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_75%_50%_at_50%_-8%,rgba(57,255,136,0.12),transparent_55%),radial-gradient(ellipse_55%_40%_at_100%_0%,rgba(168,85,247,0.14),transparent_50%),radial-gradient(ellipse_45%_45%_at_0%_100%,rgba(59,130,246,0.06),transparent_48%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.32] [mask-image:radial-gradient(900px_520px_at_50%_18%,black,transparent_75%)]"
        style={{
          backgroundImage:
            "linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px)",
          backgroundSize: "52px 52px"
        }}
      />

      <div className="relative z-[1] mx-auto max-w-6xl min-w-0 px-5 pb-28 pt-5 md:px-8 md:pb-16 md:pt-8">
        <header className="mb-10">
          <Link
            href="/profile"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-ink-1 transition hover:text-ink-0"
          >
            <span className="text-violet-300 transition group-hover:text-violet-200" aria-hidden>
              ←
            </span>
            Back to Profile
          </Link>
        </header>

        <div className="mb-10 flex min-w-0 flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-1 flex-wrap items-end gap-6">
            <div className="flex items-end gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-emerald-300"
                style={{
                  borderColor: NEON_BORDER,
                  background: "rgba(57,255,136,0.08)",
                  boxShadow: `0 0 24px ${NEON_DIM}`
                }}
                aria-hidden
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 20V9l8-5 8 5v11"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 20v-6h6v6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p
                  className="font-[var(--font-grotesk)] text-5xl font-bold tabular-nums leading-none md:text-6xl"
                  style={{ color: NEON, textShadow: `0 0 40px ${NEON_DIM}` }}
                >
                  {total}
                </p>
                <p className="mt-2 text-sm font-medium text-ink-2">Companies Explored</p>
              </div>
            </div>
            <Link
              href="/home"
              className="relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-[14px] border px-4 py-[10px] text-sm font-semibold tracking-[-0.01em] text-emerald-100 shadow-[0_0_22px_rgba(57,255,136,0.28)] transition-[transform,box-shadow] duration-200 hover:shadow-[0_0_32px_rgba(57,255,136,0.42)] active:translate-y-[0.5px]"
              style={{
                borderColor: NEON_BORDER,
                background: "linear-gradient(135deg, rgba(57,255,136,0.14), rgba(139,92,246,0.1))"
              }}
            >
              + Add Company
            </Link>
          </div>
          <HeaderPlatformArt />
        </div>

        <div className="mb-4 text-center lg:text-left">
          <p className="text-[10px] font-medium uppercase tracking-[0.36em] text-emerald-400/50">
            ━━━━━━━━━━━━━━━━━━
          </p>
          <h1
            className="mt-3 font-[var(--font-grotesk)] text-3xl tracking-tight md:text-4xl"
            style={{ textShadow: "0 0 36px rgba(168,85,247,0.35)" }}
          >
            Your Company Progress
          </h1>
          <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.36em] text-emerald-400/50">
            ━━━━━━━━━━━━━━━━━━
          </p>
        </div>

        <ul className="mt-10 flex flex-col gap-4 md:gap-5">
          {EXAMPLE_COMPANIES.map((c) => (
            <li key={c.id}>
              <Link href="/map" className="group block outline-none">
                <motion.div
                  initial={false}
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 420, damping: 28 }}
                >
                  <GlassPanel className="border border-violet-500/25 bg-[rgba(10,8,20,0.58)] transition-[border-color,box-shadow] duration-300 group-hover:border-emerald-400/35 group-hover:shadow-[0_0_36px_rgba(57,255,136,0.12)]">
                      <div className="grid gap-6 p-5 md:grid-cols-12 md:items-center md:gap-4 md:p-6">
                        <div className="flex gap-4 md:col-span-4">
                          <div
                            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-white/10 text-sm font-bold text-white/95 shadow-inner md:h-[72px] md:w-[72px] md:text-base"
                            style={{ background: c.logoBg }}
                          >
                            {c.initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-[var(--font-grotesk)] text-lg font-semibold text-ink-0 md:text-xl">
                              {c.name}
                            </p>
                            <p className="mt-0.5 text-sm text-ink-2">{c.ticker}</p>
                            <div className="mt-3">
                              <p
                                className="font-[var(--font-grotesk)] text-3xl font-bold tabular-nums leading-none md:text-4xl"
                                style={{ color: NEON, textShadow: `0 0 28px ${NEON_DIM}` }}
                              >
                                {c.overall}%
                              </p>
                              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-2">
                                Overall Confidence
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-4">
                          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-2">
                            Pillar progress
                          </p>
                          <div className="flex justify-between gap-3 md:gap-4">
                            <PillarBar
                              label="10-K"
                              pct={c.tenK}
                              icon={
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M8 4h12v16H8V4z M6 6H4v14h14v-2"
                                    stroke="currentColor"
                                    strokeWidth="1.4"
                                    strokeLinejoin="round"
                                  />
                                  <path d="M10 8h6M10 11h6M10 14h4" stroke="currentColor" strokeWidth="1.2" />
                                </svg>
                              }
                            />
                            <PillarBar
                              label="Quarterly"
                              pct={c.quarterly}
                              icon={
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M4 18V6l4 3 4-3 4 3 4-3v12"
                                    stroke="currentColor"
                                    strokeWidth="1.4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              }
                            />
                            <PillarBar
                              label="Earnings"
                              pct={c.earnings}
                              icon={
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M5 10c3-4 11-4 14 0v7H5v-7z"
                                    stroke="currentColor"
                                    strokeWidth="1.4"
                                    strokeLinejoin="round"
                                  />
                                  <path d="M9 14h6" stroke="currentColor" strokeWidth="1.2" />
                                </svg>
                              }
                            />
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-1 border-t border-white/[0.06] pt-4 md:col-span-3 md:border-t-0 md:pt-0">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-2">
                            Mastery badge
                          </p>
                          <HexBadge tier={c.badgeTier} title={c.badgeTitle} />
                          <p className="mt-1 text-center text-[11px] text-ink-2">{c.unlockedLabel}</p>
                        </div>

                        <div className="flex items-center justify-end md:col-span-1">
                          <span
                            className="text-xl text-ink-1 transition group-hover:translate-x-0.5 group-hover:text-emerald-200"
                            aria-hidden
                          >
                            ›
                          </span>
                          <span className="sr-only">Open {c.name}</span>
                        </div>
                      </div>
                  </GlassPanel>
                </motion.div>
              </Link>
            </li>
          ))}
        </ul>

        <section className="mt-14 md:mt-20">
          <GlassPanel className="border border-violet-500/30 bg-[rgba(8,6,18,0.65)] p-5 md:p-6">
            <h2
              className="text-center text-[11px] font-bold uppercase tracking-[0.28em] md:text-left"
              style={{ color: NEON, textShadow: `0 0 18px ${NEON_DIM}` }}
            >
              About Company Badges
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-ink-1 md:mx-0 md:text-left">
              Badges reflect how deeply you have worked each company across filings, quarters, and
              live calls — a visible signal of mastery, not vanity stats.
            </p>

            <div className="mt-8 overflow-x-auto pb-2">
              <div className="flex min-w-[min(100%,920px)] items-start justify-center gap-3 md:min-w-0 md:justify-between md:gap-4">
                {BADGE_ABOUT.map((b, idx) => (
                  <div key={b.title} className="flex items-start gap-2 md:gap-3">
                    {idx > 0 ? (
                      <span
                        className="mt-10 hidden shrink-0 text-lg text-white/25 md:inline"
                        aria-hidden
                      >
                        ›
                      </span>
                    ) : null}
                    <div className="flex w-[140px] shrink-0 flex-col items-center text-center md:w-auto md:min-w-[140px] md:max-w-[180px]">
                      <HexBadge tier={b.tier} title={b.title} />
                      <p className="mt-3 text-xs leading-snug text-ink-2">{b.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassPanel>
        </section>
      </div>
    </div>
  );
}
