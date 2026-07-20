"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  COMPANY_EVOLUTION_CHAPTER_XP,
  COMPANY_EVOLUTION_JOURNEY_SUMMARY,
  COMPANY_EVOLUTION_MILESTONES,
  isEvolutionTimelineComplete,
  resolveCompanyEvolutionChapterStatuses,
  resolveNextUnlockedEvolutionMilestone,
  type CompanyEvolutionChapterId,
  type CompanyEvolutionMilestoneDef
} from "@/lib/business/businessCompanyEvolutionTimeline";

type Props = {
  readCardIds: ReadonlySet<string>;
  onCompleteMilestone: (cardId: string) => void;
  onTimelineFullyComplete: () => void;
};

type RevealBeat =
  | "focus"
  | "year"
  | "title"
  | "what"
  | "why"
  | "insight"
  | "ready";

type ContentMode =
  | { kind: "gate" }
  | {
      kind: "teaser";
      message: string;
      nextId: CompanyEvolutionChapterId;
    }
  | {
      kind: "chapter";
      milestoneId: CompanyEvolutionChapterId;
      beat: RevealBeat;
    };

const TEASER_MS = 1700;
const UNLOCK_FLIP_MS = 1100;

function playJourneyChime(reduceMotion: boolean | null) {
  if (reduceMotion || typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const tones = [523.25, 659.25, 783.99];
    tones.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t0 = now + index * 0.07;
      gain.gain.exponentialRampToValueAtTime(0.045, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
      osc.start(t0);
      osc.stop(t0 + 0.3);
    });
    window.setTimeout(() => void ctx.close(), 700);
  } catch {
    /* audio optional */
  }
}

function resolveInitialRailRevealed(
  readCardIds: ReadonlySet<string>
): Set<CompanyEvolutionChapterId> {
  const revealed = new Set<CompanyEvolutionChapterId>();
  for (const milestone of COMPANY_EVOLUTION_MILESTONES) {
    if (readCardIds.has(milestone.cardId)) {
      revealed.add(milestone.id);
      continue;
    }
    // First incomplete stop is known so the learner can begin — later stops stay mystery
    revealed.add(milestone.id);
    break;
  }
  if (revealed.size === 0) {
    revealed.add(COMPANY_EVOLUTION_MILESTONES[0]!.id);
  }
  return revealed;
}

/**
 * Interactive NVIDIA Evolution timeline — cinematic discovery chapters.
 */
export function CompanyEvolutionInteractiveTimeline({
  readCardIds,
  onCompleteMilestone,
  onTimelineFullyComplete
}: Props) {
  const reduceMotion = useReducedMotion();
  const statuses = useMemo(
    () => resolveCompanyEvolutionChapterStatuses({ readCardIds }),
    [readCardIds]
  );
  const allDone = useMemo(() => isEvolutionTimelineComplete(readCardIds), [readCardIds]);

  const firstMilestone = COMPANY_EVOLUTION_MILESTONES[0]!;
  const [selectedId, setSelectedId] = useState<CompanyEvolutionChapterId>(() => {
    const open = resolveNextUnlockedEvolutionMilestone(readCardIds);
    return open?.id ?? firstMilestone.id;
  });
  const [xpBurst, setXpBurst] = useState<string | null>(null);
  const [showFinale, setShowFinale] = useState(false);
  const [railRevealedIds, setRailRevealedIds] = useState(() =>
    resolveInitialRailRevealed(readCardIds)
  );
  const [justUnlockedId, setJustUnlockedId] = useState<CompanyEvolutionChapterId | null>(null);
  const [contentMode, setContentMode] = useState<ContentMode>(() => {
    // Mid-journey resume: skip gate if they already completed a stop
    const anyComplete = COMPANY_EVOLUTION_MILESTONES.some((m) => readCardIds.has(m.cardId));
    if (anyComplete) {
      const open = resolveNextUnlockedEvolutionMilestone(readCardIds);
      return {
        kind: "chapter",
        milestoneId: open?.id ?? firstMilestone.id,
        beat: "ready"
      };
    }
    return { kind: "gate" };
  });

  const timersRef = useRef<number[]>([]);
  const clearTimers = () => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  };
  const later = (ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  useEffect(() => () => clearTimers(), []);

  const startChapterReveal = (milestoneId: CompanyEvolutionChapterId) => {
    clearTimers();
    setSelectedId(milestoneId);
    setRailRevealedIds((prev) => {
      if (prev.has(milestoneId)) return prev;
      const next = new Set(prev);
      next.add(milestoneId);
      return next;
    });

    if (reduceMotion) {
      setContentMode({ kind: "chapter", milestoneId, beat: "ready" });
      return;
    }

    setContentMode({ kind: "chapter", milestoneId, beat: "focus" });
    later(280, () => setContentMode({ kind: "chapter", milestoneId, beat: "year" }));
    later(280 + 420, () => setContentMode({ kind: "chapter", milestoneId, beat: "title" }));
    later(280 + 420 + 480, () =>
      setContentMode({ kind: "chapter", milestoneId, beat: "what" })
    );
    later(280 + 420 + 480 + 420, () =>
      setContentMode({ kind: "chapter", milestoneId, beat: "why" })
    );
    later(280 + 420 + 480 + 420 + 420, () =>
      setContentMode({ kind: "chapter", milestoneId, beat: "insight" })
    );
    later(280 + 420 + 480 + 420 + 420 + 380, () =>
      setContentMode({ kind: "chapter", milestoneId, beat: "ready" })
    );
  };

  const beginJourney = () => {
    startChapterReveal(firstMilestone.id);
  };

  const selectMilestone = (milestone: CompanyEvolutionMilestoneDef) => {
    const status = statuses[milestone.id];
    if (status === "locked") return;
    if (!railRevealedIds.has(milestone.id) && status !== "active") return;
    if (contentMode.kind === "teaser") return;
    startChapterReveal(milestone.id);
  };

  const completeSelected = () => {
    if (contentMode.kind !== "chapter" || contentMode.beat !== "ready") return;
    const selected =
      COMPANY_EVOLUTION_MILESTONES.find((m) => m.id === contentMode.milestoneId) ??
      firstMilestone;
    if (statuses[selected.id] !== "active" || readCardIds.has(selected.cardId)) return;

    playJourneyChime(reduceMotion);
    setXpBurst(`+${COMPANY_EVOLUTION_CHAPTER_XP} XP`);
    later(1600, () => setXpBurst(null));

    const next = COMPANY_EVOLUTION_MILESTONES.find((m) => m.order === selected.order + 1);
    onCompleteMilestone(selected.cardId);
    if (!next) return;

    setContentMode({
      kind: "teaser",
      message: selected.unlockTeaser ?? "A new discovery has been unlocked...",
      nextId: next.id
    });

    const afterTeaser = reduceMotion ? 200 : TEASER_MS;
    later(afterTeaser, () => {
      // Pulse the still-hidden mystery node first to build anticipation
      setJustUnlockedId(next.id);
      later(reduceMotion ? 40 : 480, () => {
        setRailRevealedIds((prev) => {
          const copy = new Set(prev);
          copy.add(next.id);
          return copy;
        });
        later(reduceMotion ? 80 : UNLOCK_FLIP_MS, () => {
          setJustUnlockedId(null);
          startChapterReveal(next.id);
        });
      });
    });
  };

  useEffect(() => {
    if (!allDone) {
      setShowFinale(false);
      return;
    }
    if (contentMode.kind === "teaser") return;
    const timer = window.setTimeout(() => setShowFinale(true), reduceMotion ? 80 : 900);
    return () => window.clearTimeout(timer);
  }, [allDone, contentMode.kind, reduceMotion]);

  const isFocusing =
    contentMode.kind === "chapter" &&
    (contentMode.beat === "focus" ||
      contentMode.beat === "year" ||
      contentMode.beat === "title");

  if (showFinale && allDone) {
    return (
      <motion.section
        className="iq-evolution-timeline-experience iq-evolution-timeline-experience--finale"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <DiscoveryRail
          selectedId={selectedId}
          statuses={statuses}
          railRevealedIds={railRevealedIds}
          forceComplete
          justUnlockedId={null}
          onSelect={selectMilestone}
        />
        <motion.div
          className="iq-evolution-timeline-finale"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="iq-evolution-timeline-finale__eyebrow">
            {COMPANY_EVOLUTION_JOURNEY_SUMMARY.eyebrow}
          </p>
          <h2 className="iq-evolution-timeline-finale__title">
            {COMPANY_EVOLUTION_JOURNEY_SUMMARY.title}
          </h2>
          <p className="iq-evolution-timeline-finale__body">
            {COMPANY_EVOLUTION_JOURNEY_SUMMARY.body}
          </p>
          <ol className="iq-evolution-timeline-finale__arc" aria-label="Full NVIDIA story">
            {COMPANY_EVOLUTION_JOURNEY_SUMMARY.arc.map((step, index) => (
              <li key={step}>
                <span>{step}</span>
                {index < COMPANY_EVOLUTION_JOURNEY_SUMMARY.arc.length - 1 ? (
                  <span aria-hidden className="iq-evolution-timeline-finale__arrow">
                    →
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <button
            type="button"
            className="iq-evolution-timeline-finale__cta"
            onClick={onTimelineFullyComplete}
          >
            Investor Challenge
          </button>
        </motion.div>
      </motion.section>
    );
  }

  return (
    <section
      className={[
        "iq-evolution-timeline-experience",
        isFocusing ? "iq-evolution-timeline-experience--cinematic-focus" : "",
        contentMode.kind === "teaser" ? "iq-evolution-timeline-experience--teaser" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="NVIDIA evolution timeline"
    >
      <div className="iq-evolution-timeline-experience__veil" aria-hidden />

      <header className="iq-evolution-timeline-experience__intro">
        <p className="iq-evolution-timeline-experience__eyebrow">Company Evolution</p>
        <h2 className="iq-evolution-timeline-experience__heading">
          Let&apos;s Take a Trip Through NVIDIA&apos;s History
        </h2>
        <p className="iq-evolution-timeline-experience__lead">
          Uncover each milestone one by one — every stop reveals the next breakthrough.
        </p>
      </header>

      <DiscoveryRail
        selectedId={selectedId}
        statuses={statuses}
        railRevealedIds={railRevealedIds}
        cinematic={isFocusing}
        justUnlockedId={justUnlockedId}
        dimUnselected={isFocusing}
        onSelect={selectMilestone}
      />

      <AnimatePresence mode="wait">
        {contentMode.kind === "gate" ? (
          <JourneyGate
            key="gate"
            milestone={firstMilestone}
            reduceMotion={Boolean(reduceMotion)}
            onBegin={beginJourney}
          />
        ) : null}

        {contentMode.kind === "teaser" ? (
          <UnlockTeaser
            key={`teaser-${contentMode.nextId}`}
            message={contentMode.message}
            reduceMotion={Boolean(reduceMotion)}
          />
        ) : null}

        {contentMode.kind === "chapter" ? (
          <CinematicChapterPanel
            key={`chapter-${contentMode.milestoneId}`}
            milestone={
              COMPANY_EVOLUTION_MILESTONES.find((m) => m.id === contentMode.milestoneId) ??
              firstMilestone
            }
            beat={contentMode.beat}
            status={statuses[contentMode.milestoneId]}
            reduceMotion={Boolean(reduceMotion)}
            onContinue={completeSelected}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {xpBurst ? (
          <motion.div
            className="iq-evolution-timeline-xp"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            aria-live="polite"
          >
            {xpBurst}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function JourneyGate({
  milestone,
  reduceMotion,
  onBegin
}: {
  milestone: CompanyEvolutionMilestoneDef;
  reduceMotion: boolean;
  onBegin: () => void;
}) {
  return (
    <motion.div
      className="iq-evolution-journey-gate"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
    >
      <p className="iq-evolution-journey-gate__year">{milestone.year}</p>
      <h3 className="iq-evolution-journey-gate__title">{milestone.title}</h3>
      <p className="iq-evolution-journey-gate__prompt">Your first discovery is waiting.</p>
      <p className="iq-evolution-journey-gate__hint">
        Click the first milestone to begin your journey through NVIDIA&apos;s history.
      </p>
      <button type="button" className="iq-evolution-journey-gate__cta" onClick={onBegin}>
        Begin Journey →
      </button>
    </motion.div>
  );
}

function UnlockTeaser({
  message,
  reduceMotion
}: {
  message: string;
  reduceMotion: boolean;
}) {
  return (
    <motion.div
      className="iq-evolution-unlock-teaser"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.4 }}
      role="status"
      aria-live="polite"
    >
      <span className="iq-evolution-unlock-teaser__spark" aria-hidden>
        ✦
      </span>
      <p className="iq-evolution-unlock-teaser__message">{message}</p>
    </motion.div>
  );
}

function CinematicChapterPanel({
  milestone,
  beat,
  status,
  reduceMotion,
  onContinue
}: {
  milestone: CompanyEvolutionMilestoneDef;
  beat: RevealBeat;
  status: "locked" | "active" | "complete" | "selected";
  reduceMotion: boolean;
  onContinue: () => void;
}) {
  const showYear = beat !== "focus";
  const showTitle =
    beat === "title" ||
    beat === "what" ||
    beat === "why" ||
    beat === "insight" ||
    beat === "ready";
  const showWhat =
    beat === "what" || beat === "why" || beat === "insight" || beat === "ready";
  const showWhy = beat === "why" || beat === "insight" || beat === "ready";
  const showInsight = beat === "insight" || beat === "ready";
  const showActions = beat === "ready";
  const canComplete = status === "active";
  const displayTitle = milestone.isMajorMoment
    ? milestone.specialTitle ?? milestone.title
    : milestone.title;

  return (
    <motion.div
      className={[
        "iq-evolution-timeline-panel",
        "iq-evolution-timeline-panel--cinematic",
        beat === "focus" || beat === "year" || beat === "title"
          ? "iq-evolution-timeline-panel--spotlight"
          : ""
      ]
        .filter(Boolean)
        .join(" ")}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      <div className="iq-evolution-timeline-panel__cinematic-hero">
        <AnimatePresence>
          {showYear ? (
            <motion.p
              key="year"
              className="iq-evolution-timeline-panel__year"
              initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {milestone.year}
            </motion.p>
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {showTitle ? (
            <motion.h3
              key="title"
              className="iq-evolution-timeline-panel__title"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              {displayTitle}
            </motion.h3>
          ) : null}
        </AnimatePresence>
        {status === "complete" && showActions ? (
          <span className="iq-evolution-timeline-panel__done">✓ Completed</span>
        ) : null}
      </div>

      <div className="iq-evolution-timeline-panel__sections">
        <AnimatePresence>
          {showWhat ? (
            <motion.section
              key="what"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38 }}
            >
              <h4>What happened?</h4>
              <p>{milestone.whatHappened}</p>
            </motion.section>
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {showWhy ? (
            <motion.section
              key="why"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38 }}
            >
              <h4>Why did it matter?</h4>
              <p>{milestone.whyItMattered}</p>
            </motion.section>
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {showInsight ? (
            <motion.section
              key="insight"
              className="iq-evolution-timeline-panel__insight"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38 }}
            >
              <h4>Investor insight</h4>
              <p>{milestone.investorInsight}</p>
            </motion.section>
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {showActions && canComplete && milestone.leadsToNext ? (
            <motion.p
              key="bridge"
              className="iq-evolution-timeline-panel__bridge"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {milestone.leadsToNext}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showActions && canComplete ? (
          <motion.button
            key="continue"
            type="button"
            className="iq-evolution-timeline-panel__cta"
            onClick={onContinue}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Continue the Journey →
          </motion.button>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

type RailProps = {
  selectedId: CompanyEvolutionChapterId;
  statuses: Record<
    CompanyEvolutionChapterId,
    "locked" | "active" | "complete" | "selected"
  >;
  railRevealedIds: ReadonlySet<CompanyEvolutionChapterId>;
  forceComplete?: boolean;
  cinematic?: boolean;
  dimUnselected?: boolean;
  justUnlockedId: CompanyEvolutionChapterId | null;
  onSelect: (milestone: CompanyEvolutionMilestoneDef) => void;
};

function DiscoveryRail({
  selectedId,
  statuses,
  railRevealedIds,
  forceComplete = false,
  cinematic = false,
  dimUnselected = false,
  justUnlockedId,
  onSelect
}: RailProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={[
        "iq-evolution-h-timeline",
        "iq-evolution-h-timeline--discovery",
        forceComplete ? "iq-evolution-h-timeline--complete" : "",
        cinematic ? "iq-evolution-h-timeline--cinematic" : "",
        dimUnselected ? "iq-evolution-h-timeline--spotlight" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <ol className="iq-evolution-h-timeline__nodes">
        {COMPANY_EVOLUTION_MILESTONES.map((milestone, index) => {
          const status = forceComplete ? "complete" : statuses[milestone.id];
          const selected = milestone.id === selectedId;
          const identityRevealed =
            forceComplete || railRevealedIds.has(milestone.id);
          const mystery = !identityRevealed;
          const justUnlocked = justUnlockedId === milestone.id;
          const next = COMPANY_EVOLUTION_MILESTONES[index + 1];
          const showConnector = Boolean(next);
          const connectorRevealed = showConnector && status === "complete";
          const clickable = !mystery && status !== "locked";

          return (
            <li
              key={milestone.id}
              className={[
                "iq-evolution-h-timeline__node-wrap",
                selected ? "iq-evolution-h-timeline__node-wrap--focus" : "",
                dimUnselected && !selected
                  ? "iq-evolution-h-timeline__node-wrap--dimmed"
                  : ""
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {showConnector ? (
                <span className="iq-evolution-h-timeline__connector" aria-hidden>
                  <motion.span
                    className="iq-evolution-h-timeline__connector-fill"
                    initial={false}
                    animate={{ scaleX: connectorRevealed ? 1 : 0 }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            duration: 0.75,
                            ease: [0.22, 1, 0.36, 1],
                            delay: connectorRevealed ? 0.05 : 0
                          }
                    }
                  />
                </span>
              ) : null}
              <button
                type="button"
                className={[
                  "iq-evolution-h-timeline__node",
                  `iq-evolution-h-timeline__node--${status}`,
                  selected ? "iq-evolution-h-timeline__node--selected" : "",
                  mystery ? "iq-evolution-h-timeline__node--mystery" : "",
                  justUnlocked ? "iq-evolution-h-timeline__node--just-unlocked" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={!clickable}
                aria-current={selected ? "step" : undefined}
                aria-label={
                  mystery
                    ? "Mystery milestone — continue the journey to uncover it"
                    : `${milestone.year} ${milestone.title}${
                        status === "complete" ? " (completed)" : ""
                      }`
                }
                onClick={() => onSelect(milestone)}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mystery ? (
                    <motion.span
                      key="mystery"
                      className="iq-evolution-h-timeline__mystery"
                      aria-hidden
                      initial={reduceMotion ? false : { opacity: 0.6, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={
                        reduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, rotateY: 90, scale: 0.8 }
                      }
                      transition={{ duration: 0.28 }}
                    >
                      ?
                    </motion.span>
                  ) : (
                    <motion.span
                      key="revealed"
                      className="iq-evolution-h-timeline__revealed"
                      initial={
                        reduceMotion
                          ? false
                          : { opacity: 0, rotateY: -90, scale: 0.85 }
                      }
                      animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <span className="iq-evolution-h-timeline__marker" aria-hidden>
                        {status === "complete" ? "✓" : "●"}
                      </span>
                      <motion.span
                        className="iq-evolution-h-timeline__year"
                        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.35 }}
                      >
                        {milestone.year}
                      </motion.span>
                      <motion.span
                        className="iq-evolution-h-timeline__label"
                        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.24, duration: 0.35 }}
                      >
                        {milestone.shortLabel}
                      </motion.span>
                      <motion.span
                        className="iq-evolution-h-timeline__glyph"
                        aria-hidden
                        initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 0.9, scale: 1 }}
                        transition={{ delay: 0.32, duration: 0.35 }}
                      >
                        {milestone.icon}
                      </motion.span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
