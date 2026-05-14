"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function SkyBackdrop() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1400px_700px_at_20%_10%,rgba(124,58,237,0.28),transparent_62%),radial-gradient(900px_540px_at_85%_18%,rgba(168,85,247,0.20),transparent_60%),radial-gradient(780px_520px_at_50%_92%,rgba(59,130,246,0.10),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.55] [mask-image:radial-gradient(900px_520px_at_50%_30%,black,transparent_70%)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>
      <div className="glow-blob left-[-180px] top-[-200px]" />
      <div className="glow-blob right-[-240px] top-[140px] opacity-30" />
    </>
  );
}

export function XPHud({
  companyTicker,
  xp,
  level,
  researchStreak,
  quizStreak
}: {
  companyTicker: string;
  xp: number;
  level: number;
  researchStreak?: number;
  quizStreak?: number;
}) {
  const showStreaks =
    typeof researchStreak === "number" || typeof quizStreak === "number";
  return (
    <div className="rounded-2xl border border-panel-border bg-panel px-4 py-3 shadow-glow backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[11px] text-ink-2">Campaign</div>
          <div className="mt-1 font-[var(--font-grotesk)] text-sm text-ink-0">
            {companyTicker} Research Run
          </div>
          {showStreaks ? (
            <div className="mt-2 space-y-1.5 text-[11px]">
              {typeof quizStreak === "number" ? (
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-amber-200/85">
                    Understanding
                  </div>
                  <div
                    className="mt-0.5 font-semibold"
                    style={{
                      color: "#F5C547",
                      textShadow: "0 0 18px rgba(245,197,71,0.45)"
                    }}
                  >
                    Quiz streak · {quizStreak} day{quizStreak === 1 ? "" : "s"}
                  </div>
                </div>
              ) : null}
              {typeof researchStreak === "number" ? (
                <div className="text-ink-2">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-2/90">
                    Consistency
                  </span>
                  <span className="ml-1.5 text-ink-1">
                    {researchStreak}d · habit only
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="text-right">
          <div className="text-[11px] text-ink-2">XP</div>
          <div className="mt-1 text-sm font-semibold text-ink-0">
            {xp} <span className="text-ink-2">·</span> Lv {level}
          </div>
        </div>
      </div>
    </div>
  );
}

export function IslandPillarCard({
  title,
  subtitle,
  href,
  locked,
  progressPct,
  questsLabel,
  readPct,
  readLabel,
  accent = "rgba(139,92,246,0.85)"
}: {
  title: string;
  subtitle: string;
  href: string;
  locked: boolean;
  progressPct: number;
  questsLabel: string;
  /** Optional secondary reading-progress (0..100). */
  readPct?: number;
  /** Optional "x/y" label for cards read on this pillar. */
  readLabel?: string;
  accent?: string;
}) {
  const showReading = typeof readPct === "number" && !!readLabel;
  return (
    <motion.div
      whileHover={!locked ? { y: -6, scale: 1.01 } : { y: -2 }}
      whileTap={!locked ? { scale: 0.99 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="relative"
    >
      {/* floating island base */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 left-1/2 h-16 w-[86%] -translate-x-1/2 rounded-[999px]"
        style={{
          background: locked
            ? "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.10), transparent 65%)"
            : `radial-gradient(circle at 50% 50%, ${accent}, transparent 68%)`,
          filter: "blur(18px)",
          opacity: locked ? 0.35 : 0.45
        }}
      />

      <div
        className={[
          "relative overflow-hidden rounded-3xl border bg-[rgba(255,255,255,0.05)] p-5 backdrop-blur-xl",
          locked
            ? "border-panel-border opacity-80"
            : "border-[rgba(139,92,246,0.35)] shadow-glow"
        ].join(" ")}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(139,92,246,0.14)] via-transparent to-[rgba(59,130,246,0.06)]" />

        {/* big pillar glow */}
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="font-[var(--font-grotesk)] text-xl text-ink-0">
                  {title}
                </div>
                <span
                  className={[
                    "rounded-full border px-2 py-0.5 text-[11px]",
                    locked
                      ? "border-panel-border bg-panel text-ink-2"
                      : "border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.10)] text-neon-300"
                  ].join(" ")}
                >
                  {locked ? "Locked" : "Ready"}
                </span>
              </div>
              <div className="mt-2 text-sm text-ink-1">{subtitle}</div>
            </div>

            <div className="shrink-0">
              <Link
                href={locked ? "#" : href}
                aria-disabled={locked}
                className={[
                  "inline-flex items-center justify-center rounded-2xl border px-4 py-2 text-sm font-semibold transition",
                  locked
                    ? "cursor-not-allowed border-panel-border bg-[rgba(255,255,255,0.03)] text-ink-2"
                    : "border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.14)] text-neon-300 shadow-glow hover:bg-[rgba(139,92,246,0.20)]"
                ].join(" ")}
              >
                Enter
              </Link>
            </div>
          </div>

          {/* animated progress bar (quest completion %) */}
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-[11px] text-ink-2">
              <div>{questsLabel}</div>
              <div>{Math.round(progressPct)}%</div>
            </div>
            <div className="relative h-2.5 overflow-hidden rounded-full border border-panel-border bg-[rgba(255,255,255,0.03)]">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                initial={false}
                animate={{ width: `${locked ? 0 : Math.max(4, Math.min(100, progressPct))}%` }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background:
                    "linear-gradient(90deg, rgba(139,92,246,0.25), rgba(139,92,246,0.70), rgba(168,85,247,0.65))",
                  boxShadow: locked ? "none" : "0 0 22px rgba(139,92,246,0.35)"
                }}
              />
            </div>
          </div>

          {/* secondary reading-progress (Mark as Read tracking — no XP) */}
          {showReading ? (
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-ink-2">
                <span>Cards read</span>
                <span className="text-ink-1">
                  {readLabel}
                  <span className="ml-1.5 text-ink-2">
                    {Math.round(readPct as number)}%
                  </span>
                </span>
              </div>
              <div className="relative h-1.5 overflow-hidden rounded-full border border-panel-border bg-[rgba(255,255,255,0.03)]">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  initial={false}
                  animate={{
                    width: `${
                      locked
                        ? 0
                        : Math.max(
                            (readPct as number) === 0 ? 0 : 4,
                            Math.min(100, readPct as number)
                          )
                    }%`
                  }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(168,85,247,0.30), rgba(216,180,254,0.65))",
                    boxShadow:
                      !locked && (readPct as number) > 0
                        ? "0 0 14px rgba(168,85,247,0.30)"
                        : "none"
                  }}
                />
              </div>
            </div>
          ) : null}

          {/* terminal-like micro stats */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-2xl border border-panel-border bg-[rgba(255,255,255,0.03)] px-3 py-2">
              <div className="text-ink-2">Status</div>
              <div className="mt-1 font-semibold text-ink-0">
                {locked ? "Encrypted" : "Online"}
              </div>
            </div>
            <div className="rounded-2xl border border-panel-border bg-[rgba(255,255,255,0.03)] px-3 py-2">
              <div className="text-ink-2">Signal</div>
              <div className="mt-1 font-semibold text-ink-0">
                {locked ? "—" : "Stable"}
              </div>
            </div>
          </div>
        </div>

        {/* locked shimmer */}
        {locked ? (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0.22 }}
            animate={{ opacity: [0.18, 0.30, 0.18] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "linear-gradient(120deg, transparent, rgba(255,255,255,0.05), transparent)"
            }}
          />
        ) : null}
      </div>
    </motion.div>
  );
}

