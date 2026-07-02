"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { useGame } from "@/components/GameProvider";
import { PILLAR_META, type PillarId } from "@/data/pillars";
import {
  getPillarViews,
  isTenKFinalChallengeUnlocked,
  type PillarView
} from "@/engine";
import { getActiveCompanyProgress } from "@/engine/progression/selectors";
import {
  DUOLINGO_MAP_NODES,
  DUOLINGO_MAP_TITLE,
  type DuolingoMapNode
} from "@/lib/schools/schoolsDuolingoMapConfig";
import { resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

function pillarHref(pillarId: PillarId, pathname: string): string {
  const route = PILLAR_META.find((p) => p.id === pillarId)?.route ?? `/${pillarId}`;
  const schoolsRoute = route.startsWith("/schools") ? route : `/schools${route}`;
  return resolveSchoolsLearnerHref(schoolsRoute, pathname);
}

function finalChallengeHref(pathname: string): string {
  return resolveSchoolsLearnerHref("/schools/final-challenge", pathname);
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 11V8a5 5 0 0110 0v3" />
      <rect x="5" y="11" width="14" height="10" rx="2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12.5l5 5L19 7.5" />
    </svg>
  );
}

function PathConnector() {
  return (
    <div className="iq-duolingo-map__connector" aria-hidden>
      <span className="iq-duolingo-map__connector-line" />
      <span className="iq-duolingo-map__connector-arrow">↓</span>
    </div>
  );
}

type NodeVisualState = "locked" | "available" | "in-progress" | "completed";

function resolveNodeState(
  node: DuolingoMapNode,
  pillarById: Record<PillarId, PillarView>,
  finalUnlocked: boolean,
  finalCompleted: boolean
): NodeVisualState {
  if (node.kind === "final") {
    if (finalCompleted) return "completed";
    if (!finalUnlocked) return "locked";
    return "available";
  }

  const pillar = pillarById[node.id];
  if (!pillar) return "locked";
  if (pillar.completed) return "completed";
  if (!pillar.unlocked) return "locked";
  if (pillar.progressPct > 0) return "in-progress";
  return "available";
}

function QuestNodeCard({
  node,
  state,
  href,
  pillarView
}: {
  node: DuolingoMapNode;
  state: NodeVisualState;
  href?: string;
  pillarView?: PillarView;
}) {
  const [hovered, setHovered] = useState(false);
  const locked = state === "locked";
  const completed = state === "completed";
  const inProgress = state === "in-progress";
  const interactive = !locked && Boolean(href);

  const statusLabel = completed
    ? "Completed"
    : locked
      ? "Locked"
      : inProgress
        ? `${pillarView?.completedCount ?? 0}/${pillarView?.totalCount ?? 0} quests`
        : "Start";

  const cardClass = [
    "iq-duolingo-map__node",
    locked ? "iq-duolingo-map__node--locked" : "",
    completed ? "iq-duolingo-map__node--completed" : "",
    inProgress ? "iq-duolingo-map__node--progress" : "",
    interactive && hovered ? "iq-duolingo-map__node--hover" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const cardStyle = {
    ["--duo-accent" as string]: node.accent,
    ["--duo-accent-soft" as string]: node.accentSoft
  };

  const inner = (
  <>
    <div className="iq-duolingo-map__node-emoji" aria-hidden>
      {node.emoji}
    </div>
    <div className="iq-duolingo-map__node-copy">
      <p className="iq-duolingo-map__node-label">{node.label}</p>
      <p className="iq-duolingo-map__node-subtitle">{node.subtitle}</p>
    </div>
    <div className="iq-duolingo-map__node-meta">
      <span className="iq-duolingo-map__xp-pill">+{node.xpReward} XP</span>
      <span
        className={[
          "iq-duolingo-map__status",
          completed ? "iq-duolingo-map__status--done" : "",
          locked ? "iq-duolingo-map__status--locked" : ""
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {completed ? (
          <>
            <CheckIcon />
            Done
          </>
        ) : locked ? (
          <>
            <LockIcon />
            Locked
          </>
        ) : (
          statusLabel
        )}
      </span>
    </div>
    {completed ? (
      <span className="iq-duolingo-map__node-check" aria-hidden>
        <CheckIcon />
      </span>
    ) : null}
  </>
  );

  if (interactive && href) {
    return (
      <motion.div
        initial={false}
        animate={{ scale: hovered ? 1.02 : 1, y: hovered ? -2 : 0 }}
        transition={{ duration: 0.18, ease: EASE_OUT }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
      >
        <Link
          href={href}
          prefetch
          className={cardClass}
          style={cardStyle}
          aria-label={`${node.label} — ${node.subtitle}`}
        >
          {inner}
        </Link>
      </motion.div>
    );
  }

  return (
    <div
      className={cardClass}
      style={cardStyle}
      aria-label={`${node.label} — ${node.subtitle} (locked)`}
      aria-disabled={locked}
    >
      {inner}
    </div>
  );
}

/**
 * Duolingo-style vertical quest path — preview experiment for Schools NVIDIA 10-K.
 * Does not replace the cinematic island map at `/schools/map`.
 */
export function SchoolsDuolingoMapScreen() {
  const pathname = usePathname();
  const { raw } = useGame();
  const pillarViews = useMemo(() => getPillarViews(raw), [raw]);
  const pillarById = useMemo(
    () =>
      Object.fromEntries(pillarViews.map((p) => [p.id, p])) as Record<
        PillarId,
        PillarView
      >,
    [pillarViews]
  );

  const companyProgress = getActiveCompanyProgress(raw);
  const finalUnlocked = isTenKFinalChallengeUnlocked(raw);
  const finalCompleted = companyProgress.tenKRookieChallenge != null;

  const overallProgressPct = useMemo(() => {
    if (pillarViews.length === 0) return 0;
    const pillarAvg =
      pillarViews.reduce((sum, p) => sum + p.progressPct, 0) /
      pillarViews.length;
    const finalBonus = finalCompleted ? 100 : finalUnlocked ? 50 : 0;
    return Math.min(100, (pillarAvg * 0.85 + finalBonus * 0.15));
  }, [pillarViews, finalCompleted, finalUnlocked]);

  const progressRounded = Math.round(overallProgressPct);

  return (
    <main className="iq-duolingo-map">
      <div className="iq-duolingo-map__scroll">
        <header className="iq-duolingo-map__header">
          <div className="iq-duolingo-map__brand-row">
            <Image
              src="/logos/investor-quest-logo.png"
              alt="Investor Quest"
              width={200}
              height={48}
              className="iq-duolingo-map__logo"
              priority
            />
            <span className="iq-duolingo-map__preview-tag">Preview</span>
          </div>

          <div className="iq-duolingo-map__title-row">
            <Image
              src="/logos/companies/nvda.svg"
              alt=""
              width={36}
              height={36}
              className="iq-duolingo-map__company-mark"
              aria-hidden
            />
            <h1 className="iq-duolingo-map__title">{DUOLINGO_MAP_TITLE}</h1>
          </div>

          <div
            className="iq-duolingo-map__progress-block"
            role="status"
            aria-label={`Overall quest progress ${progressRounded} percent`}
          >
            <div className="iq-duolingo-map__progress-labels">
              <span>Your progress</span>
              <span className="iq-duolingo-map__progress-pct">{progressRounded}%</span>
            </div>
            <div className="iq-duolingo-map__progress-track">
              <motion.div
                className="iq-duolingo-map__progress-fill"
                initial={false}
                animate={{ width: `${progressRounded}%` }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
              />
            </div>
          </div>
        </header>

        <ol className="iq-duolingo-map__path" aria-label="10-K quest path">
          {DUOLINGO_MAP_NODES.map((node, index) => {
            const visualState = resolveNodeState(
              node,
              pillarById,
              finalUnlocked,
              finalCompleted
            );
            const href =
              node.kind === "pillar"
                ? visualState !== "locked"
                  ? pillarHref(node.id, pathname)
                  : undefined
                : visualState !== "locked"
                  ? finalChallengeHref(pathname)
                  : undefined;
            const pillarView =
              node.kind === "pillar" ? pillarById[node.id] : undefined;

            return (
              <li key={node.id} className="iq-duolingo-map__path-item">
                <QuestNodeCard
                  node={node}
                  state={visualState}
                  href={href}
                  pillarView={pillarView}
                />
                {index < DUOLINGO_MAP_NODES.length - 1 ? <PathConnector /> : null}
              </li>
            );
          })}
        </ol>

        <footer className="iq-duolingo-map__compare">
          <p className="iq-duolingo-map__compare-label">Compare map styles</p>
          <div className="iq-duolingo-map__compare-links">
            <Link href="/schools/map" className="iq-duolingo-map__compare-link">
              Island Adventure
            </Link>
            <span aria-hidden className="iq-duolingo-map__compare-dot">
              ·
            </span>
            <span className="iq-duolingo-map__compare-current">Quest Path</span>
            <span aria-hidden className="iq-duolingo-map__compare-dot">
              ·
            </span>
            <Link
              href="/schools/preview/map-duolingo-map"
              className="iq-duolingo-map__compare-link"
            >
              Flat Map
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
