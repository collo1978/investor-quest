"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";

import { GlassCard } from "@/components/GlassCard";
import { InvestorQuestBrandLogo } from "@/components/InvestorQuestBrandLogo";
import { NeonButton } from "@/components/NeonButton";
import { useGame } from "@/components/GameProvider";
import { companyById, type CompanyId } from "@/data/companies";
import { formatAnalyticsNumber } from "@/lib/analytics/formatDisplay";
import { isPillarComplete } from "@/engine/progression/unlocks";
import { levelProgress } from "@/engine";

const GOLD = "#F5C547";
const VIOLET = "#C4B5FD";

type ArmorPart = {
  id: "helmet" | "chest" | "weapon" | "shoulder";
  label: string;
  skill: string;
  pillarId: "business" | "financials" | "forces" | "management";
  accent: "violet" | "gold" | "cyan" | "lime";
};

const ARMOR_PARTS: readonly ArmorPart[] = [
  { id: "helmet", label: "Helmet", pillarId: "business", skill: "Understand the business", accent: "violet" },
  { id: "chest", label: "Chestplate", pillarId: "financials", skill: "Read financial signals", accent: "gold" },
  { id: "weapon", label: "Weapon", pillarId: "forces", skill: "Analyze competition", accent: "cyan" },
  { id: "shoulder", label: "Shoulder", pillarId: "management", skill: "Evaluate management", accent: "lime" }
] as const;

function accentRing(accent: ArmorPart["accent"]): string {
  switch (accent) {
    case "gold":
      return "ring-amber-400/40";
    case "cyan":
      return "ring-cyan-300/40";
    case "lime":
      return "ring-lime-300/40";
    case "violet":
    default:
      return "ring-violet-300/40";
  }
}

function schoolsTitleFromXp(xp: number): string {
  if (xp >= 9000) return "Market Strategist";
  if (xp >= 5000) return "Rising Analyst";
  if (xp >= 2000) return "Business Explorer";
  return "New Explorer";
}

type ArmorPieceStatus = "locked" | "partial" | "earned";

export default function SchoolsProfileHub() {
  const { state, raw } = useGame();
  const company = companyById(state.activeCompanyId as CompanyId);
  const lp = levelProgress(state.xp);
  const reduceMotion = !!useReducedMotion();
  const [hoveredPiece, setHoveredPiece] = useState<ArmorPart["id"] | null>(null);

  const title = useMemo(() => schoolsTitleFromXp(state.xp), [state.xp]);
  const companiesExplored = raw.unlockedCompanyIds.length;

  const armorStatusById = useMemo(() => {
    const status = Object.fromEntries(
      ARMOR_PARTS.map((p) => {
        const completed = isPillarComplete(state.pillars, p.pillarId);
        const any = state.pillars[p.pillarId].completedQuestSlugs.length > 0;
        const s: ArmorPieceStatus = completed ? "earned" : any ? "partial" : "locked";
        return [p.id, s];
      })
    ) as Record<ArmorPart["id"], ArmorPieceStatus>;
    return status;
  }, [state.pillars]);

  const armorEarnedById = useMemo(() => {
    return Object.fromEntries(
      (Object.entries(armorStatusById) as [ArmorPart["id"], ArmorPieceStatus][]).map(
        ([k, v]) => [k, v === "earned"]
      )
    ) as Record<ArmorPart["id"], boolean>;
  }, [armorStatusById]);

  const earnedCount = useMemo(
    () => ARMOR_PARTS.reduce((acc, p) => acc + (armorEarnedById[p.id] ? 1 : 0), 0),
    [armorEarnedById]
  );
  const armorPct = Math.round((earnedCount / ARMOR_PARTS.length) * 100);

  return (
    <div className="relative min-h-screen min-w-0 max-w-[100vw] overflow-x-hidden overflow-y-auto bg-[#050508] text-ink-0">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(168,85,247,0.26),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_0%,rgba(245,197,71,0.10),transparent_50%),radial-gradient(ellipse_50%_50%_at_0%_100%,rgba(59,130,246,0.08),transparent_45%)]"
      />

      <main className="relative z-[1] mx-auto max-w-6xl px-5 pb-16 pt-8 md:px-8 md:pt-10">
        <header className="mb-8 flex flex-col gap-6 border-b border-white/[0.08] pb-7 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
            <Link href="/schools/map" className="relative z-10 shrink-0">
              <InvestorQuestBrandLogo className="h-10 w-auto sm:h-11" sizes="(max-width: 640px) 240px, 280px" />
              <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-2">
                School Edition
              </p>
            </Link>
            <div>
              <h1 className="font-[var(--font-grotesk)] text-3xl leading-tight tracking-tight md:text-4xl">
                <span className="text-ink-0">Student </span>
                <span
                  className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-violet-400 bg-clip-text text-transparent"
                  style={{ textShadow: "0 0 40px rgba(168,85,247,0.45)" }}
                >
                  Mastery
                </span>
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-1 md:text-base">
                Earn armor parts by mastering real companies, building streaks, and passing challenges.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <NeonButton variant="ghost" href="/schools/map">
              Quest map
            </NeonButton>
            <NeonButton href="/schools/business">Continue</NeonButton>
          </div>
        </header>

        <GlassCard className="mb-6 border-white/10 bg-[rgba(12,10,24,0.55)] backdrop-blur-xl">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
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
                <span className="text-[11px] text-ink-2">
                  Current company: <span className="text-ink-1">{company.name}</span>
                </span>
              </div>

              <h2 className="mt-2 font-[var(--font-grotesk)] text-2xl font-semibold text-ink-0 md:text-3xl">
                {title}
              </h2>
              <p className="mt-1 text-sm text-ink-1">
                <span className="font-semibold text-ink-0 tabular-nums">
                  {formatAnalyticsNumber(state.xp)}
                </span>{" "}
                XP · progress{" "}
                <span className="tabular-nums text-ink-0">
                  {formatAnalyticsNumber(lp.inLevel)} / {formatAnalyticsNumber(lp.needed)}
                </span>
                <span className="text-ink-2"> · {companiesExplored} companies explored</span>
              </p>

              <div className="mt-4">
                <div className="flex justify-between text-[11px] uppercase tracking-[0.14em] text-ink-2">
                  <span>Mastery charge</span>
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
                        "linear-gradient(90deg, rgba(168,85,247,0.95), rgba(245,197,71,0.9))"
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[rgba(0,0,0,0.25)] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-2">
                    Analyst Armor
                  </p>
                  <p className="mt-1 text-xs text-ink-1">
                    Earned through mastery · not time spent
                  </p>
                </div>
                <span
                  className="rounded-full border px-2 py-0.5 text-[10px] font-bold tabular-nums"
                  style={{
                    borderColor: "rgba(245,197,71,0.22)",
                    background: "rgba(245,197,71,0.08)",
                    color: "rgba(255,229,141,0.92)"
                  }}
                >
                  {armorPct}% complete
                </span>
              </div>

              {/* Hero armor avatar panel (Schools only) */}
              <div className="mt-4 relative overflow-hidden rounded-2xl border border-white/10 bg-[rgba(8,6,18,0.55)] p-4">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-14 h-72 w-72 rounded-full opacity-70 blur-3xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(168,85,247,0.35), transparent 65%)"
                  }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -left-16 bottom-[-80px] h-72 w-72 rounded-full opacity-50 blur-3xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(245,197,71,0.18), transparent 68%)"
                  }}
                />

                <div className="relative grid gap-4 md:grid-cols-[0.95fr_1.05fr] md:items-center">
                  <LeaderLinesOverlay
                    statusById={armorStatusById}
                    hoveredPiece={hoveredPiece}
                    reduceMotion={reduceMotion}
                  />
                  <div className="relative flex items-center justify-center">
                    <div
                      className="relative h-[320px] w-[220px] sm:h-[360px] sm:w-[250px]"
                      aria-label="Analyst armor avatar"
                    >
                      <ArmorFigureSvg
                        statusById={armorStatusById}
                        hoveredPiece={hoveredPiece}
                        onHover={setHoveredPiece}
                        reduceMotion={reduceMotion}
                      />
                    </div>
                  </div>

                  {/* Callouts */}
                  <div className="relative min-h-[320px] sm:min-h-[360px]">
                    <div className="absolute left-0 top-3">
                      <Callout
                        title="Helmet"
                        subtitle="Business"
                        status={armorStatusById.helmet === "earned" ? "Earned" : "Locked"}
                        accent="violet"
                        pieceId="helmet"
                        hoveredPiece={hoveredPiece}
                        onHover={setHoveredPiece}
                      />
                    </div>
                    <div className="absolute left-0 top-[42%]">
                      <Callout
                        title="Weapon"
                        subtitle="Market Forces"
                        status={armorStatusById.weapon === "earned" ? "Earned" : "Locked"}
                        accent="cyan"
                        pieceId="weapon"
                        hoveredPiece={hoveredPiece}
                        onHover={setHoveredPiece}
                      />
                    </div>
                    <div className="absolute left-0 bottom-3">
                      <Callout
                        title="Chestplate"
                        subtitle="Financials"
                        status={armorStatusById.chest === "earned" ? "Earned" : "Locked"}
                        accent="gold"
                        pieceId="chest"
                        hoveredPiece={hoveredPiece}
                        onHover={setHoveredPiece}
                      />
                    </div>
                    <div className="absolute right-0 top-[34%]">
                      <Callout
                        align="right"
                        title="Shoulder"
                        subtitle="Management"
                        status={armorStatusById.shoulder === "earned" ? "Earned" : "Locked"}
                        accent="lime"
                        pieceId="shoulder"
                        hoveredPiece={hoveredPiece}
                        onHover={setHoveredPiece}
                      />
                    </div>

                    <div className="absolute right-0 bottom-3">
                      <div className="rounded-xl border border-white/10 bg-[rgba(0,0,0,0.25)] px-4 py-3 text-right">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-2">
                          Armor completion
                        </div>
                        <div className="mt-1 font-[var(--font-grotesk)] text-2xl font-bold tabular-nums text-ink-0">
                          {armorPct}%
                        </div>
                        <div className="mt-1 text-[10px] text-ink-2">
                          Next:{" "}
                          <span style={{ color: GOLD, fontWeight: 800 }}>
                            Master Challenge
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {ARMOR_PARTS.map((part) => {
                  const earned = armorEarnedById[part.id];
                  return (
                    <div
                      key={part.id}
                      className={[
                        "rounded-xl border border-white/10 bg-[rgba(8,6,18,0.55)] p-3 ring-1",
                        accentRing(part.accent)
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-ink-0">
                            {part.label}
                          </div>
                          <div className="mt-0.5 text-[10px] leading-snug text-ink-2">
                            {part.skill}
                          </div>
                        </div>
                        <span
                          className="shrink-0 rounded-lg border px-2 py-1 text-[10px] font-semibold"
                          style={{
                            borderColor: earned
                              ? "rgba(52,211,153,0.28)"
                              : "rgba(255,255,255,0.10)",
                            background: earned
                              ? "rgba(52,211,153,0.10)"
                              : "rgba(255,255,255,0.03)",
                            color: earned
                              ? "rgba(167,243,208,0.95)"
                              : "rgba(226,232,240,0.70)"
                          }}
                        >
                          {earned ? "Earned" : "Locked"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-4 text-[11px] leading-relaxed text-ink-2">
                Unlock parts by completing company quests, passing quizzes, and keeping your streak alive.
                Your next milestone unlocks a{" "}
                <span style={{ color: GOLD, fontWeight: 700 }}>Master Challenge</span>.
              </p>
            </div>
          </div>
        </GlassCard>

        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard className="border-white/10 bg-[rgba(12,10,24,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-2">
                  Sector mastery
                </p>
                <h3 className="mt-2 font-[var(--font-grotesk)] text-xl font-semibold text-ink-0">
                  Strength map
                </h3>
                <p className="mt-1 text-sm text-ink-1">
                  Build mastery across sectors as you explore companies and pass challenges.
                </p>
              </div>
              <span
                className="rounded-xl border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{
                  borderColor: "rgba(168,85,247,0.35)",
                  background: "rgba(139,92,246,0.10)",
                  color: VIOLET
                }}
              >
                Coming alive
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              {[
                { name: "Technology", pct: 62, accent: "violet" },
                { name: "Healthcare", pct: 45, accent: "cyan" },
                { name: "Finance", pct: 28, accent: "gold" },
                { name: "Energy", pct: 35, accent: "lime" }
              ].map((row) => (
                <div key={row.name} className="rounded-xl border border-white/10 bg-[rgba(0,0,0,0.20)] p-3">
                  <div className="flex items-center justify-between text-[11px] text-ink-2">
                    <span className="font-semibold text-ink-1">{row.name}</span>
                    <span className="tabular-nums text-ink-0">{row.pct}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full border border-white/10 bg-black/40">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${row.pct}%`,
                        background:
                          "linear-gradient(90deg, rgba(139,92,246,0.75), rgba(245,197,71,0.55))",
                        boxShadow: "0 0 18px rgba(168,85,247,0.22)"
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="border-white/10 bg-[rgba(12,10,24,0.45)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-2">
              Unlock path
            </p>
            <h3 className="mt-2 font-[var(--font-grotesk)] text-xl font-semibold text-ink-0">
              What you earn
            </h3>
            <p className="mt-1 text-sm text-ink-1">
              Every quest completion feeds your mastery journey—parts, streaks, and badges.
            </p>

            <div className="mt-5 grid gap-3">
              {[
                { title: "Parts earned", value: `${earnedCount}/${ARMOR_PARTS.length}`, detail: "Analyst Armor progress" },
                { title: "Challenges cleared", value: "2", detail: "Quizzes passed" },
                { title: "Streak power", value: "3d", detail: "Consistency streak" },
                { title: "Master Challenges", value: "0", detail: "Boss Quest → Master Challenge" }
              ].map((row) => (
                <div key={row.title} className="flex items-center justify-between rounded-xl border border-white/10 bg-[rgba(0,0,0,0.20)] px-4 py-3">
                  <div>
                    <div className="text-xs font-semibold text-ink-0">{row.title}</div>
                    <div className="text-[10px] text-ink-2">{row.detail}</div>
                  </div>
                  <div className="text-sm font-semibold tabular-nums text-ink-0">{row.value}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}

function Callout({
  title,
  subtitle,
  status,
  accent,
  align = "left",
  pieceId,
  hoveredPiece,
  onHover
}: {
  title: string;
  subtitle: string;
  status: "Earned" | "Locked";
  accent: ArmorPart["accent"];
  align?: "left" | "right";
  pieceId: ArmorPart["id"];
  hoveredPiece: ArmorPart["id"] | null;
  onHover: (piece: ArmorPart["id"] | null) => void;
}) {
  const isEarned = status === "Earned";
  const isHovered = hoveredPiece === pieceId;
  const accentColor =
    accent === "gold"
      ? "rgba(245,197,71,0.9)"
      : accent === "cyan"
        ? "rgba(34,211,238,0.9)"
        : accent === "lime"
          ? "rgba(163,230,53,0.9)"
          : "rgba(167,139,250,0.95)";

  return (
    <div
      className={[
        "max-w-[14rem] rounded-xl border border-white/10 bg-[rgba(0,0,0,0.24)] px-4 py-3",
        align === "right" ? "text-right" : "text-left"
      ].join(" ")}
      style={{
        boxShadow: isHovered
          ? `0 0 34px rgba(168,85,247,0.18), 0 0 18px rgba(245,197,71,0.10), inset 0 0 0 1px rgba(255,255,255,0.06)`
          : isEarned
            ? `0 0 26px rgba(168,85,247,0.12), inset 0 0 0 1px rgba(255,255,255,0.04)`
            : "inset 0 0 0 1px rgba(255,255,255,0.03)"
      }}
      onMouseEnter={() => onHover(pieceId)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-2">
            {title}
          </div>
          <div className="mt-1 text-sm font-semibold text-ink-0">{subtitle}</div>
        </div>
        <span
          className="shrink-0 rounded-lg border px-2 py-1 text-[10px] font-semibold"
          style={{
            borderColor: isEarned ? "rgba(52,211,153,0.28)" : "rgba(255,255,255,0.10)",
            background: isEarned ? "rgba(52,211,153,0.10)" : "rgba(255,255,255,0.03)",
            color: isEarned ? "rgba(167,243,208,0.95)" : "rgba(226,232,240,0.70)"
          }}
        >
          {status}
        </span>
      </div>
      <div className="mt-2 h-[2px] w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full"
          style={{
            width: isEarned ? "100%" : "38%",
            background: `linear-gradient(90deg, ${accentColor}, rgba(245,197,71,0.22))`,
            boxShadow: isHovered || isEarned ? `0 0 16px ${accentColor}` : "none",
            opacity: isHovered ? 0.92 : isEarned ? 0.85 : 0.55
          }}
        />
      </div>
    </div>
  );
}

function piecePaint(status: ArmorPieceStatus) {
  if (status === "earned") {
    return {
      fill: "rgba(20, 16, 36, 0.88)",
      stroke: "rgba(245,197,71,0.68)",
      edge: "rgba(167,139,250,0.95)",
      glow: "drop-shadow(0 0 18px rgba(168,85,247,0.35)) drop-shadow(0 0 10px rgba(245,197,71,0.18))"
    };
  }
  if (status === "partial") {
    return {
      fill: "rgba(12, 10, 24, 0.72)",
      stroke: "rgba(167,139,250,0.38)",
      edge: "rgba(167,139,250,0.58)",
      glow: "drop-shadow(0 0 12px rgba(168,85,247,0.22))"
    };
  }
  return {
    fill: "rgba(148, 163, 184, 0.08)",
    stroke: "rgba(148, 163, 184, 0.16)",
    edge: "rgba(148, 163, 184, 0.16)",
    glow: "none"
  };
}

function ArmorFigureSvg({
  statusById,
  hoveredPiece,
  onHover,
  reduceMotion
}: {
  statusById: Record<ArmorPart["id"], ArmorPieceStatus>;
  hoveredPiece: ArmorPart["id"] | null;
  onHover: (piece: ArmorPart["id"] | null) => void;
  reduceMotion: boolean;
}) {
  const hoverBoost = (id: ArmorPart["id"]) => (hoveredPiece === id ? 1 : 0);

  const helmet = piecePaint(statusById.helmet);
  const chest = piecePaint(statusById.chest);
  const shoulder = piecePaint(statusById.shoulder);
  const weapon = piecePaint(statusById.weapon);

  const pulse = (status: ArmorPieceStatus) =>
    reduceMotion || status === "locked"
      ? undefined
      : {
          opacity: status === "earned" ? [0.92, 1, 0.92] : [0.82, 0.94, 0.82]
        };

  const pulseTransition = (status: ArmorPieceStatus) =>
    reduceMotion || status === "locked"
      ? undefined
      : {
          duration: status === "earned" ? 2.8 : 3.4,
          repeat: Infinity,
          ease: [0.42, 0, 0.58, 1] as [number, number, number, number]
        };

  return (
    <div className="absolute inset-0">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[44px] border border-white/10 bg-[radial-gradient(ellipse_70%_60%_at_50%_35%,rgba(139,92,246,0.20),transparent_62%),radial-gradient(ellipse_80%_65%_at_50%_75%,rgba(245,197,71,0.10),transparent_60%)] shadow-[0_0_32px_rgba(168,85,247,0.22)]"
      />

      <motion.svg
        viewBox="0 0 220 360"
        className="absolute inset-[10px] h-[calc(100%-20px)] w-[calc(100%-20px)]"
        role="img"
        aria-label="Analyst armor figure"
      >
        <defs>
          <linearGradient id="iqArmorMetal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.0)" />
          </linearGradient>
        </defs>

        {/* Base body silhouette */}
        <path
          d="M110 40c22 0 40 18 40 40 0 14-6 26-16 33v18c0 6 4 12 10 14 8 3 14 11 14 20v44c0 34-18 64-48 80-30-16-48-46-48-80v-44c0-9 6-17 14-20 6-2 10-8 10-14v-18c-10-7-16-19-16-33 0-22 18-40 40-40Z"
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.06)"
        />

        {/* Helmet */}
        <motion.g
          onMouseEnter={() => onHover("helmet")}
          onMouseLeave={() => onHover(null)}
          style={{
            cursor: "default",
            filter:
              hoveredPiece === "helmet" ? `drop-shadow(0 0 20px rgba(168,85,247,0.35))` : helmet.glow
          }}
          animate={pulse(statusById.helmet)}
          transition={pulseTransition(statusById.helmet)}
        >
          <path
            d="M82 78c0-16 13-30 28-30s28 14 28 30v16c0 6-4 10-10 10H92c-6 0-10-4-10-10V78Z"
            fill={helmet.fill}
            stroke={helmet.stroke}
            strokeWidth="1.2"
          />
          <path
            d="M92 86h36"
            stroke={helmet.edge}
            strokeWidth="1.2"
            opacity={0.75 + 0.12 * hoverBoost("helmet")}
          />
          <path d="M98 96h24" stroke="rgba(245,197,71,0.25)" strokeWidth="1" opacity={0.45} />
        </motion.g>

        {/* Chestplate */}
        <motion.g
          onMouseEnter={() => onHover("chest")}
          onMouseLeave={() => onHover(null)}
          style={{
            cursor: "default",
            filter:
              hoveredPiece === "chest" ? `drop-shadow(0 0 20px rgba(245,197,71,0.22))` : chest.glow
          }}
          animate={pulse(statusById.chest)}
          transition={pulseTransition(statusById.chest)}
        >
          <path
            d="M78 128c10-8 22-12 32-12s22 4 32 12l-6 66c-1 12-10 22-26 22H110c-16 0-25-10-26-22l-6-66Z"
            fill={chest.fill}
            stroke={chest.stroke}
            strokeWidth="1.2"
          />
          <path
            d="M110 116v104"
            stroke={chest.edge}
            strokeWidth="1"
            opacity={0.55 + 0.18 * hoverBoost("chest")}
          />
          <path
            d="M90 150h40"
            stroke="rgba(167,139,250,0.25)"
            strokeWidth="1"
            opacity={0.35}
          />
        </motion.g>

        {/* Shoulder (right) */}
        <motion.g
          onMouseEnter={() => onHover("shoulder")}
          onMouseLeave={() => onHover(null)}
          style={{
            cursor: "default",
            filter:
              hoveredPiece === "shoulder" ? `drop-shadow(0 0 18px rgba(163,230,53,0.18))` : shoulder.glow
          }}
          animate={pulse(statusById.shoulder)}
          transition={pulseTransition(statusById.shoulder)}
        >
          <path
            d="M142 130c12 0 22 10 22 22 0 8-4 14-10 18l-16-10c-2-12-1-22 4-30Z"
            fill={shoulder.fill}
            stroke={shoulder.stroke}
            strokeWidth="1.1"
          />
          <path
            d="M150 150l-10 6"
            stroke={shoulder.edge}
            strokeWidth="1.1"
            opacity={0.6 + 0.18 * hoverBoost("shoulder")}
          />
        </motion.g>

        {/* Weapon (left) */}
        <motion.g
          onMouseEnter={() => onHover("weapon")}
          onMouseLeave={() => onHover(null)}
          style={{
            cursor: "default",
            filter:
              hoveredPiece === "weapon" ? `drop-shadow(0 0 20px rgba(34,211,238,0.22))` : weapon.glow
          }}
          animate={pulse(statusById.weapon)}
          transition={pulseTransition(statusById.weapon)}
        >
          <path
            d="M62 162l-18 18 6 6 18-18 6 6 8-8-6-6 18-18-6-6-18 18-6-6Z"
            fill={weapon.fill}
            stroke={weapon.stroke}
            strokeWidth="1.1"
          />
          <path
            d="M52 178l28-28"
            stroke={weapon.edge}
            strokeWidth="1.2"
            opacity={0.55 + 0.22 * hoverBoost("weapon")}
          />
        </motion.g>

        {/* Ambient holographic edge */}
        <path
          d="M110 54c17 0 30 13 30 30v14c0 8-6 14-14 14H94c-8 0-14-6-14-14V84c0-17 13-30 30-30Z"
          fill="url(#iqArmorMetal)"
          opacity="0.55"
        />
      </motion.svg>
    </div>
  );
}

function leaderPaint(status: ArmorPieceStatus, active: boolean) {
  if (status === "earned") {
    return {
      stroke: active ? "rgba(255,229,141,0.95)" : "rgba(216,180,254,0.82)",
      glow: active
        ? "drop-shadow(0 0 12px rgba(245,197,71,0.28)) drop-shadow(0 0 14px rgba(168,85,247,0.28))"
        : "drop-shadow(0 0 10px rgba(168,85,247,0.22))"
    };
  }
  if (status === "partial") {
    return {
      stroke: active ? "rgba(216,180,254,0.75)" : "rgba(167,139,250,0.48)",
      glow: active ? "drop-shadow(0 0 10px rgba(168,85,247,0.22))" : "none"
    };
  }
  return {
    stroke: active ? "rgba(148,163,184,0.45)" : "rgba(148,163,184,0.22)",
    glow: "none"
  };
}

function LeaderLinesOverlay({
  statusById,
  hoveredPiece,
  reduceMotion
}: {
  statusById: Record<ArmorPart["id"], ArmorPieceStatus>;
  hoveredPiece: ArmorPart["id"] | null;
  reduceMotion: boolean;
}) {
  // Fixed anchors in a responsive viewBox coordinate system.
  // Left callouts start at x=90, right callout starts at x=910.
  // Armor figure anchors sit near the center-left.
  const W = 1000;
  const H = 520;

  const defs = (
    <defs>
      <linearGradient id="iqLineViolet" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="rgba(167,139,250,0.15)" />
        <stop offset="55%" stopColor="rgba(167,139,250,0.55)" />
        <stop offset="100%" stopColor="rgba(245,197,71,0.22)" />
      </linearGradient>
    </defs>
  );

  const line = (id: ArmorPart["id"], d: string) => {
    const active = hoveredPiece === id;
    const paint = leaderPaint(statusById[id], active);
    return (
      <motion.path
        key={id}
        d={d}
        fill="none"
        stroke={paint.stroke}
        strokeWidth={active ? 2.2 : 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          vectorEffect: "non-scaling-stroke",
          filter: paint.glow
        }}
        initial={reduceMotion ? undefined : { pathLength: 0, opacity: 0 }}
        animate={
          reduceMotion
            ? { opacity: active ? 1 : 0.9 }
            : { pathLength: 1, opacity: active ? 1 : 0.9 }
        }
        transition={
          reduceMotion
            ? undefined
            : {
                duration: 0.9,
                delay: 0.15,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
              }
        }
      />
    );
  };

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[2]"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
    >
      {defs}

      {/* Helmet: left-top callout → helmet */}
      {line("helmet", "M 120 92 C 260 92, 310 112, 392 138")}
      {/* Weapon: left-mid callout → weapon */}
      {line("weapon", "M 120 270 C 260 270, 300 276, 360 292")}
      {/* Chest: left-bottom callout → chestplate */}
      {line("chest", "M 120 434 C 270 420, 310 386, 408 340")}
      {/* Shoulder: right-mid callout → shoulder */}
      {line("shoulder", "M 880 232 C 720 232, 620 220, 520 210")}
    </svg>
  );
}

