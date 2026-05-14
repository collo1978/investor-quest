"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";

const GOLD = "#F5C547";
const GOLD_DIM = "rgba(245, 197, 71, 0.45)";

const INTEREST_TAGS = [
  "AI",
  "Technology",
  "Growth Stocks",
  "EV",
  "Consumer Brands"
] as const;

type CampaignCard = {
  name: string;
  ticker: string;
  initials: string;
  logoBg: string;
  theme: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  xp: string;
  quests: number;
};

const CAMPAIGNS: CampaignCard[] = [
  {
    name: "NVIDIA",
    ticker: "NVDA",
    initials: "NV",
    logoBg: "linear-gradient(145deg, rgba(34,197,94,0.3), rgba(20,40,30,0.55))",
    theme: "AI Infrastructure",
    difficulty: "Intermediate",
    xp: "4,500",
    quests: 12
  },
  {
    name: "Microsoft",
    ticker: "MSFT",
    initials: "MS",
    logoBg: "linear-gradient(145deg, rgba(59,130,246,0.28), rgba(25,40,70,0.55))",
    theme: "Cloud + AI",
    difficulty: "Beginner",
    xp: "4,000",
    quests: 10
  },
  {
    name: "AMD",
    ticker: "AMD",
    initials: "AM",
    logoBg: "linear-gradient(145deg, rgba(239,68,68,0.22), rgba(50,25,25,0.5))",
    theme: "AI Chips",
    difficulty: "Intermediate",
    xp: "4,200",
    quests: 11
  },
  {
    name: "Tesla",
    ticker: "TSLA",
    initials: "TS",
    logoBg: "linear-gradient(145deg, rgba(248,113,113,0.25), rgba(60,20,20,0.5))",
    theme: "EV + Energy",
    difficulty: "Advanced",
    xp: "4,800",
    quests: 13
  },
  {
    name: "Amazon",
    ticker: "AMZN",
    initials: "AM",
    logoBg: "linear-gradient(145deg, rgba(251,191,36,0.22), rgba(55,40,15,0.5))",
    theme: "E-commerce + Cloud",
    difficulty: "Beginner",
    xp: "4,300",
    quests: 11
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
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(139,92,246,0.12)] via-transparent to-[rgba(59,130,246,0.06)]"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

function difficultyStyles(d: CampaignCard["difficulty"]) {
  if (d === "Beginner")
    return "border-emerald-400/35 bg-emerald-500/10 text-emerald-200/95";
  if (d === "Intermediate")
    return "border-amber-400/35 bg-amber-500/10 text-amber-200/95";
  return "border-rose-400/35 bg-rose-500/10 text-rose-200/95";
}

export function MyInterestsPageClient() {
  return (
    <div className="relative min-h-[calc(100vh-72px)] min-w-0 max-w-[100vw] overflow-x-hidden bg-[#050508] text-ink-0 md:min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(168,85,247,0.22),transparent_55%),radial-gradient(ellipse_55%_40%_at_100%_0%,rgba(245,197,71,0.08),transparent_48%),radial-gradient(ellipse_45%_45%_at_0%_100%,rgba(59,130,246,0.06),transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.35] [mask-image:radial-gradient(900px_520px_at_50%_20%,black,transparent_75%)]"
        style={{
          backgroundImage:
            "linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.028)_1px,transparent_1px)",
          backgroundSize: "52px 52px"
        }}
      />

      <div className="relative z-[1] mx-auto max-w-6xl min-w-0 px-5 pb-28 pt-5 md:px-8 md:pb-16 md:pt-8">
        <header className="mb-10">
          <Link
            href="/explore"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-ink-1 transition hover:text-ink-0"
          >
            <span className="text-violet-300 transition group-hover:text-violet-200" aria-hidden>
              ←
            </span>
            Back to Explore
          </Link>
        </header>

        <div className="max-w-3xl">
          <h1
            className="font-[var(--font-grotesk)] text-4xl tracking-tight text-ink-0 md:text-5xl"
            style={{ textShadow: "0 0 48px rgba(168,85,247,0.4)" }}
          >
            My Interests
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-1 md:text-lg">
            Companies matched to your investor interests and learning journey.
          </p>
          <p className="mt-3 text-xs text-ink-2">Based on your onboarding choices</p>

          <ul className="mt-8 flex flex-wrap gap-2.5 md:gap-3">
            {INTEREST_TAGS.map((tag, i) => (
              <li key={tag}>
                <motion.span
                  initial={false}
                  whileHover={{ scale: 1.04, y: -1 }}
                  className="inline-flex rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-violet-100/95 shadow-[0_0_20px_rgba(168,85,247,0.25)]"
                  style={{
                    borderColor: "rgba(168,85,247,0.45)",
                    background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(12,10,24,0.85))",
                    animationDelay: `${i * 0.12}s`
                  }}
                >
                  {tag}
                </motion.span>
              </li>
            ))}
          </ul>
        </div>

        <section className="mt-14 md:mt-20">
          <h2 className="font-[var(--font-grotesk)] text-2xl font-semibold text-ink-0 md:text-3xl">
            Recommended Campaigns
          </h2>
          <p className="mt-2 max-w-xl text-sm text-ink-2">
            Pick a lane — each campaign is a curated quest arc tuned to how you like to learn.
          </p>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {CAMPAIGNS.map((c) => (
              <li key={c.ticker}>
                <motion.div
                  initial={false}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 380, damping: 26 }}
                >
                  <GlassPanel className="group/card h-full border-violet-500/25 bg-[rgba(10,8,20,0.58)] transition-[border-color,box-shadow] duration-300 hover:border-violet-400/45 hover:shadow-[0_0_40px_rgba(168,85,247,0.18)]">
                    <div className="flex flex-col gap-5 p-5 md:p-6">
                      <div className="flex gap-4">
                        <div
                          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 text-sm font-bold text-white/95 shadow-inner"
                          style={{ background: c.logoBg }}
                        >
                          {c.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-[var(--font-grotesk)] text-xl font-semibold text-ink-0">
                            {c.name}
                          </p>
                          <p className="mt-0.5 text-sm font-medium text-violet-200/90">{c.ticker}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-2">
                          Theme
                        </p>
                        <p className="mt-1 text-sm text-ink-0">{c.theme}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={[
                            "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
                            difficultyStyles(c.difficulty)
                          ].join(" ")}
                        >
                          {c.difficulty}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-2">
                            XP available
                          </p>
                          <p
                            className="mt-1 font-[var(--font-grotesk)] text-lg font-bold tabular-nums"
                            style={{ color: GOLD, textShadow: `0 0 18px ${GOLD_DIM}` }}
                          >
                            {c.xp} XP
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-2">
                            Campaign size
                          </p>
                          <p className="mt-1 font-semibold tabular-nums text-ink-0">
                            {c.quests} quests
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/campaign/${c.ticker.toLowerCase()}`}
                        className="mt-auto inline-flex w-full items-center justify-center rounded-xl border border-violet-400/40 bg-[rgba(139,92,246,0.14)] px-4 py-3 text-center text-sm font-bold uppercase tracking-[0.14em] text-neon-300 shadow-[0_0_24px_rgba(168,85,247,0.15)] transition hover:border-amber-300/45 hover:bg-[rgba(245,197,71,0.08)] hover:text-ink-0 active:translate-y-[0.5px]"
                      >
                        Start Campaign
                      </Link>
                    </div>
                  </GlassPanel>
                </motion.div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
