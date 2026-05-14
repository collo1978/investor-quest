"use client";

/**
 * WorldMap — primary navigation surface for Investor Quest.
 *
 * The map is the heart of the experience. It now reads progression from
 * the engine and renders islands (pillars) with:
 *
 *   - locked / unlocked state
 *   - pillar completion %
 *   - active quest highlight (subtle pulse on the player's current island)
 *   - hover states & completion glow
 *   - animated route paths between islands
 *   - smooth parallax pan based on pointer position
 *   - company switching (companyTicker badge + tagline)
 *   - "current player position" pip on the active island
 *
 * It is purely presentational: state mutations come from the engine via
 * `useGame()`. Visual style is unchanged (no redesign).
 */

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { useGame } from "@/components/GameProvider";
import { IslandPillarCard } from "@/components/FloatingIslands";
import { companyById } from "@/data/companies";
import { PILLAR_META, PILLAR_ORDER, type PillarId } from "@/data/pillars";
import { pillarQuestCount } from "@/data/quests/library";
import { getPillarReadingProgress, getPillarViews } from "@/engine";

/** Fixed "world" positions per pillar, tuned for desktop. */
const ISLAND_NODES: ReadonlyArray<{
  id: PillarId;
  x: string;
  y: string;
  w: string;
}> = [
  { id: "business", x: "8%", y: "58%", w: "520px" },
  { id: "forces", x: "10%", y: "10%", w: "460px" },
  { id: "financials", x: "56%", y: "14%", w: "460px" },
  { id: "management", x: "52%", y: "60%", w: "520px" }
] as const;

/** Pre-defined SVG routes between consecutive pillars in PILLAR_ORDER. */
const ROUTES: ReadonlyArray<{ from: PillarId; to: PillarId; d: string }> = [
  {
    from: "business",
    to: "forces",
    d: "M 230 560 C 200 380, 220 260, 260 170"
  },
  {
    from: "forces",
    to: "financials",
    d: "M 320 160 C 470 90, 560 90, 690 170"
  },
  {
    from: "financials",
    to: "management",
    d: "M 720 220 C 760 380, 740 520, 700 650"
  }
] as const;

function pillarHref(pillarId: PillarId): string {
  // Each pillar has its own dedicated island route.
  return `/${pillarId}`;
}

export function WorldMap() {
  const { state, raw } = useGame();
  const ref = useRef<HTMLDivElement | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 120, damping: 18, mass: 0.4 });

  const layer1x = useTransform(sx, (v) => v * 10);
  const layer1y = useTransform(sy, (v) => v * 10);
  const layer2x = useTransform(sx, (v) => v * 18);
  const layer2y = useTransform(sy, (v) => v * 18);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width; // 0..1
      const py = (e.clientY - r.top) / r.height;
      mx.set((px - 0.5) * 2);
      my.set((py - 0.5) * 2);
    };
    const onLeave = () => {
      mx.set(0);
      my.set(0);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [mx, my]);

  const views = useMemo(() => getPillarViews(raw), [raw]);
  const byId = useMemo(
    () => Object.fromEntries(views.map((v) => [v.id, v])),
    [views]
  );
  const readingByPillar = useMemo(
    () =>
      Object.fromEntries(
        PILLAR_ORDER.map((pid) => [pid, getPillarReadingProgress(raw, pid)])
      ) as Record<PillarId, ReturnType<typeof getPillarReadingProgress>>,
    [raw]
  );

  const company = companyById(state.activeCompanyId);
  const activePillarId = state.activePillarId;

  return (
    <div
      ref={ref}
      className="relative hidden h-[860px] overflow-hidden rounded-[36px] border border-panel-border bg-[rgba(0,0,0,0.18)] shadow-glow backdrop-blur-xl md:block"
    >
      {/* Background parallax layer */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ x: layer1x, y: layer1y }}
      >
        <div className="absolute inset-0 opacity-70 [mask-image:radial-gradient(900px_520px_at_50%_30%,black,transparent_72%)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>
        <div className="absolute -left-28 top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(139,92,246,0.55),transparent_60%)] blur-3xl opacity-40" />
        <div className="absolute -right-36 bottom-0 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(168,85,247,0.40),transparent_62%)] blur-3xl opacity-35" />
      </motion.div>

      {/* Campaign badge — current company */}
      <div className="pointer-events-none absolute left-6 top-6 z-10 rounded-2xl border border-panel-border bg-[rgba(7,7,18,0.65)] px-4 py-2 shadow-glow backdrop-blur-xl">
        <div className="text-[11px] uppercase tracking-[0.18em] text-ink-2">
          Campaign
        </div>
        <div className="mt-1 font-[var(--font-grotesk)] text-sm text-ink-0">
          {company.name}{" "}
          <span className="text-ink-2">· {company.ticker}</span>
        </div>
        <div className="mt-0.5 max-w-[280px] text-[11px] text-ink-2">
          {company.tagline}
        </div>
      </div>

      {/* Animated route connections */}
      <motion.svg
        aria-hidden
        className="pointer-events-none absolute inset-0"
        viewBox="0 0 1000 860"
        preserveAspectRatio="none"
        style={{ x: layer2x, y: layer2y }}
      >
        <defs>
          <linearGradient id="route" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="rgba(139,92,246,0.15)" />
            <stop offset="0.45" stopColor="rgba(139,92,246,0.55)" />
            <stop offset="1" stopColor="rgba(168,85,247,0.35)" />
          </linearGradient>
          <linearGradient id="route-live" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="rgba(168,85,247,0.20)" />
            <stop offset="0.5" stopColor="rgba(216,180,254,0.95)" />
            <stop offset="1" stopColor="rgba(139,92,246,0.45)" />
          </linearGradient>
        </defs>

        {ROUTES.map((r) => {
          const to = byId[r.to];
          const from = byId[r.from];
          const active = !!to && to.unlocked;
          const completed = !!from && from.completed;
          return (
            <g key={`${r.from}->${r.to}`}>
              <path
                d={r.d}
                stroke="url(#route)"
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                opacity={active ? 0.7 : 0.22}
              />
              {completed ? (
                <motion.path
                  d={r.d}
                  stroke="url(#route-live)"
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="8 14"
                  initial={{ strokeDashoffset: 0, opacity: 0.0 }}
                  animate={{ strokeDashoffset: -120, opacity: [0.4, 0.85, 0.4] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              ) : null}
            </g>
          );
        })}
      </motion.svg>

      {/* Island nodes */}
      {ISLAND_NODES.map((n, i) => {
        const v = byId[n.id];
        const meta = PILLAR_META.find((p) => p.id === n.id);
        if (!v || !meta) return null;
        const total = pillarQuestCount(n.id);
        const isActive = activePillarId === n.id && v.unlocked;
        return (
          <motion.div
            key={n.id}
            className="absolute"
            style={{
              left: n.x,
              top: n.y,
              width: n.w,
              x: layer2x,
              y: layer2y
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: i * 0.05,
              ease: [0.16, 1, 0.3, 1]
            }}
          >
            <div className="relative">
              <IslandPillarCard
                title={meta.title}
                subtitle={meta.subtitle}
                href={pillarHref(n.id)}
                locked={!v.unlocked}
                progressPct={v.progressPct}
                questsLabel={`${v.completedCount}/${total} quests`}
                readPct={readingByPillar[n.id]?.pct ?? 0}
                readLabel={`${readingByPillar[n.id]?.read ?? 0}/${total}`}
                accent={meta.accent}
              />

              {/* Active player position pip */}
              {isActive ? (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute -top-3 left-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-[rgba(216,180,254,0.55)] bg-[rgba(7,7,18,0.78)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(216,180,254,0.95)] shadow-glow"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <motion.span
                    className="inline-block h-1.5 w-1.5 rounded-full bg-[rgba(216,180,254,0.95)]"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  You are here
                </motion.div>
              ) : null}

              {/* Completion glow */}
              {v.completed ? (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute -inset-2 rounded-[40px]"
                  animate={{ opacity: [0.2, 0.45, 0.2] }}
                  transition={{
                    duration: 3.4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    background:
                      "radial-gradient(60% 60% at 50% 50%, rgba(139,92,246,0.45), transparent 70%)",
                    filter: "blur(20px)"
                  }}
                />
              ) : null}
            </div>
          </motion.div>
        );
      })}

      {/* Discreet help line, bottom of canvas */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center">
        <Link
          href="/business"
          className="pointer-events-auto rounded-full border border-panel-border bg-[rgba(7,7,18,0.55)] px-4 py-1.5 text-[11px] text-ink-2 shadow-glow backdrop-blur-xl transition hover:text-ink-0"
        >
          Open Business island ↗
        </Link>
      </div>
    </div>
  );
}
