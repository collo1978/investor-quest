"use client";

/**
 * QuestDetailScreen — full-screen premium "gold" quest reading card.
 *
 * Reusable layout for every pillar (business / forces / financials /
 * management) and every quest type. Composition (top → bottom):
 *
 *   1. Back link to the active pillar's island route
 *   2. Quest Progress label (top-right): "Quest Progress N / TOTAL"
 *   3. Gold progress bar (this quest's index across the pillar)
 *   4. Hero banner — quest number badge, title, subtitle (objective),
 *      pillar/island crest on the right
 *   5. Reading body
 *        - Single-card quest: QUESTION / ANSWER / WHY THIS MATTERS
 *        - ANSWER parses bullets + optional "Simple version" into
 *          scannable mini-cards (mobile-first line length + spacing)
 *        - Multi-card quest (`quest.cards`): N stacked sub-card panels,
 *          each with its own QUESTION / ANSWER / WHY THIS MATTERS and
 *          its own Mark-as-Read button
 *   6. Source line (SEC form + section)
 *   7. Footer note: reading does not award XP; mastery actions do.
 *
 * Engine wiring is intentionally narrow:
 *   - `actions.setActiveQuest(pillarId, slug)` on mount
 *   - `useIsQuestRead(pillarId, slug-or-composite)` for state
 *   - `actions.markQuestRead(pillarId, slug-or-composite)` on click
 *     — never awards XP.
 *   - When every sub-card of a multi-card quest is read, the parent
 *     quest slug is auto-marked read so pillar/global progress
 *     selectors advance cleanly.
 *
 * No Working Space / Research Notes / Artifact / AI Task / tags surfaces
 * are rendered here. Those auxiliary panels can live behind a future
 * "open workspace" affordance if/when needed; the MVP only shows the
 * reading content above.
 */

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { AnimatePresence, motion } from "framer-motion";

import { BusinessQuestReadingSkeleton } from "@/components/business/BusinessQuestReadingSkeleton";

const BusinessIslandQuestReading = dynamic(
  () =>
    import("@/components/BusinessIslandQuestReading").then(
      (mod) => mod.BusinessIslandQuestReading
    ),
  { loading: () => <BusinessQuestReadingSkeleton /> }
);
import {
  getPillarQuestTheme,
  usesPillarQuestCardTemplate
} from "@/components/quest/pillarQuestTheme";
import { useGame } from "@/components/GameProvider";
import { trackCardOpened } from "@/lib/analytics/telemetryFromEngine";
import { useIsQuestRead } from "@/components/gameHooks";
import { QuestQuizPanel } from "@/components/QuestQuizPanel";
import { companyById, type Company, type CompanyId } from "@/data/companies";
import { pillarById, type PillarId } from "@/data/pillars";
import {
  findQuestDefinition,
  getCompanyPillarQuests
} from "@/data/quests/library";
import type { QuestDefinition, QuestSubCard } from "@/data/quests/types";
import { hasPlayableQuizConfig } from "@/data/quests/types";
import {
  QuestQuizUnlockStatus,
  useQuestProgressDebug
} from "@/components/quest/QuestQuizUnlockStatus";
import {
  islandQuizPassMessage,
  questCompleteHeadline
} from "@/components/quest/islandQuizPassMessages";
import { RelatableQuestAnswer } from "@/components/quest/RelatableQuestAnswer";
import { parseRelatableQuestAnswer } from "@/lib/quests/questAnswerFormat";
import { pillarHasQuestPipeline } from "@/lib/quests/pillarQuestPipelineConfig";
import type { QuestPipelinePhase } from "@/hooks/usePillarQuestGeneratedContent";
import type { QuestContentStatus } from "@/lib/supabase/questCardAnswers/types";

import type { QuestPipelineProgress } from "@/lib/quests/questPayloadProgress";

export type PillarQuestPipelineState = {
  status: QuestContentStatus | null;
  sourceLabel: string | null;
  generating: boolean;
  pipelinePhase?: QuestPipelinePhase;
  progress?: QuestPipelineProgress | null;
  loadingCardIds?: string[];
  canReadQuest?: boolean;
  /** Slim banner once the first card is readable. */
  compact?: boolean;
  error: string | null;
  onRetry?: () => void | Promise<void>;
};

/** @deprecated Use PillarQuestPipelineState */
export type FinancialQuestPipelineState = PillarQuestPipelineState;

export type QuestDetailScreenProps = {
  pillarId: PillarId;
  slug: string;
  /** When set (SEC AI pipeline), replaces `findQuestDefinition` output. */
  questOverride?: QuestDefinition | null;
  /** @deprecated Use questPipeline */
  financialPipeline?: PillarQuestPipelineState;
  questPipeline?: PillarQuestPipelineState;
};

const GOLD_HI = "#F5C547";
const GOLD_LO = "#E6A92F";
const GOLD_BORDER = "rgba(245, 197, 71, 0.40)";
const GOLD_BORDER_SOFT = "rgba(245, 197, 71, 0.22)";
const GOLD_GLOW = "rgba(245, 197, 71, 0.45)";
const GOLD_WASH = "rgba(245, 197, 71, 0.10)";
const GREEN_HI = "#22C58B";
const GREEN_BORDER = "rgba(34, 197, 139, 0.55)";
const VIOLET_HI = "#C4B5FD";
const VIOLET_GLOW = "rgba(168, 85, 247, 0.42)";

type SingleReadingStageId =
  | "question"
  | "orientation"
  | "ecosystem"
  | "simple"
  | "detail"
  | "reflection"
  | "done";

function buildSingleReadingStages(
  hasSimpleVersion: boolean
): readonly SingleReadingStageId[] {
  const core: SingleReadingStageId[] = [
    "question",
    "orientation",
    "ecosystem",
    "detail",
    "reflection",
    "done"
  ];
  if (!hasSimpleVersion) return core;
  const withSimple: SingleReadingStageId[] = [];
  for (const id of core) {
    if (id === "detail") withSimple.push("simple");
    withSimple.push(id);
  }
  return withSimple;
}

function keyInsightHookFromBlocks(
  blocks: AnswerBlock[],
  objective: string
): string {
  for (const b of blocks) {
    if (b.kind === "prose" && b.text.trim()) {
      const t = b.text.trim().replace(/\s+/g, " ");
      return t.length > 168 ? `${t.slice(0, 165)}…` : t;
    }
    if (b.kind === "titledBullets") {
      const head = b.title.replace(/\s*:\s*$/, "").trim();
      const first = b.bullets[0]?.trim();
      if (first) {
        const line = `${head} — ${first}`;
        return line.length > 180 ? `${line.slice(0, 177)}…` : line;
      }
      return head.length > 180 ? `${head.slice(0, 177)}…` : head;
    }
    if (b.kind === "bulletsOnly" && b.bullets[0]?.trim()) {
      const t = b.bullets[0].trim();
      return t.length > 180 ? `${t.slice(0, 177)}…` : t;
    }
  }
  const o = objective.trim();
  return o.length > 0 ? o : "What you read next turns this filing into a usable mental model.";
}

function ReadingStageProgressRail({
  step,
  total
}: {
  step: number;
  total: number;
}) {
  return (
    <div
      className="mb-6 flex items-center gap-1.5"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={Math.max(0, total - 1)}
      aria-valuenow={step}
      aria-label={`Reading step ${step + 1} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="h-1 flex-1 rounded-full transition-colors duration-300"
          style={{
            background:
              i <= step
                ? `linear-gradient(90deg, ${GOLD_HI}, ${VIOLET_HI})`
                : "rgba(255,255,255,0.08)"
          }}
        />
      ))}
    </div>
  );
}

function RevealContinueButton({
  onContinue,
  label = "Continue"
}: {
  onContinue: () => void;
  label?: string;
}) {
  return (
    <div className="flex justify-center pt-7">
      <motion.button
        type="button"
        onClick={onContinue}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 26 }}
        className="rounded-full border px-6 py-2.5 text-[12.5px] font-semibold uppercase tracking-[0.18em] text-ink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
        style={{
          borderColor: GOLD_BORDER,
          background: "rgba(245,197,71,0.09)",
          color: GOLD_HI,
          boxShadow: `0 0 28px -12px ${GOLD_GLOW}`
        }}
      >
        {label}
      </motion.button>
    </div>
  );
}

/** Composite slug used to track a sub-card's read state. */
function cardSlug(parentSlug: string, cardId: string): string {
  return `${parentSlug}#${cardId}`;
}

export function QuestDetailScreen({
  pillarId,
  slug,
  questOverride,
  financialPipeline,
  questPipeline: questPipelineProp
}: QuestDetailScreenProps) {
  const questPipeline = questPipelineProp ?? financialPipeline;
  const { state, actions, raw } = useGame();
  const companyId = state.activeCompanyId as CompanyId;
  const company = companyById(companyId);
  const pillar = pillarById(pillarId);

  const quests = useMemo(
    () => getCompanyPillarQuests(companyId, pillarId),
    [companyId, pillarId]
  );
  const quest = useMemo(() => {
    if (questOverride) return questOverride;
    return findQuestDefinition(companyId, pillarId, slug);
  }, [questOverride, companyId, pillarId, slug]);

  useEffect(() => {
    actions.setActiveQuest(pillarId, slug);
  }, [actions, pillarId, slug]);

  // Slug list for this pillar's reading state — used both for the
  // parent's read-status (multi-card mode) and the parent-auto-mark effect.
  const readSlugs = useMemo(
    () => state.pillars[pillarId]?.readQuestSlugs ?? [],
    [state.pillars, pillarId]
  );

  const parentSelfRead = useIsQuestRead(pillarId, slug);

  // In multi-card mode, the parent is "read" iff every sub-card is read.
  const cards: readonly QuestSubCard[] = quest?.cards ?? [];
  const cardReadFlags = useMemo(
    () =>
      cards.length > 0
        ? cards.map((c) => readSlugs.includes(cardSlug(slug, c.id)))
        : [parentSelfRead],
    [cards, readSlugs, slug, parentSelfRead]
  );
  const allCardsRead =
    cards.length > 0 ? cardReadFlags.every(Boolean) : parentSelfRead;
  const parentRead =
    cards.length > 0 ? allCardsRead || parentSelfRead : parentSelfRead;

  // Auto-mark parent when every sub-card is read. Idempotent — the
  // reducer ignores duplicate slugs.
  useEffect(() => {
    if (!quest || cards.length === 0) return;
    if (allCardsRead && !readSlugs.includes(slug)) {
      actions.markQuestRead(pillarId, slug);
    }
  }, [allCardsRead, readSlugs, slug, pillarId, actions, quest, cards.length]);

  // Detect false -> true transition on the parent to play the gold sweep.
  const wasRead = useRef(parentRead);
  const [celebrate, setCelebrate] = useState(false);
  useEffect(() => {
    if (!wasRead.current && parentRead) {
      setCelebrate(true);
      const t = window.setTimeout(() => setCelebrate(false), 950);
      return () => window.clearTimeout(t);
    }
    wasRead.current = parentRead;
  }, [parentRead]);

  const isMultiCard = (quest?.cards?.length ?? 0) > 0;
  const showQuestDebug = useQuestProgressDebug();
  const usePillarQuestCardTemplate = usesPillarQuestCardTemplate(pillarId);
  const pillarQuestTheme =
    usePillarQuestCardTemplate && quest
      ? getPillarQuestTheme(pillarId)
      : null;
  const [pillarOnQuizScreen, setPillarOnQuizScreen] = useState(false);

  useEffect(() => {
    setPillarOnQuizScreen(false);
  }, [slug]);

  const parsedSingleCard = useMemo(
    () =>
      quest?.plainEnglishAnswer
        ? parseAnswerToBlocks(quest.plainEnglishAnswer)
        : { blocks: [] as AnswerBlock[], simple: undefined as string | undefined },
    [quest?.plainEnglishAnswer]
  );

  const singleReadingStages = useMemo(
    () => buildSingleReadingStages(Boolean(parsedSingleCard.simple?.trim())),
    [parsedSingleCard.simple]
  );

  const [singleReadingStep, setSingleReadingStep] = useState(0);

  useEffect(() => {
    setSingleReadingStep(0);
  }, [slug]);

  useEffect(() => {
    if (isMultiCard || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mq.matches) return;
    setSingleReadingStep(Math.max(0, singleReadingStages.length - 1));
  }, [slug, isMultiCard, singleReadingStages.length]);

  const singleDoneIdx = useMemo(() => {
    const di = singleReadingStages.indexOf("done");
    return di >= 0 ? di : Math.max(0, singleReadingStages.length - 1);
  }, [singleReadingStages]);

  const singleAtDone =
    !isMultiCard && singleReadingStep >= singleDoneIdx;

  const keyHookLine = useMemo(
    () =>
      quest
        ? keyInsightHookFromBlocks(parsedSingleCard.blocks, quest.objective)
        : "",
    [parsedSingleCard.blocks, quest?.objective, quest]
  );

  if (!quest) {
    return (
      <main className="pointer-events-auto relative mx-auto max-w-2xl px-5 py-16 md:px-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink-2">
          {pillar.title} island · Quest
        </p>
        <h1 className="mt-2 font-[var(--font-grotesk)] text-2xl text-ink-0 md:text-3xl">
          Quest not found
        </h1>
        <p className="mt-2 text-sm text-ink-1">
          This quest doesn&apos;t exist for {company.name} yet.
        </p>
        <div className="mt-6">
          <Link
            href={pillar.route}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition"
            style={{
              borderColor: GOLD_BORDER,
              background: "rgba(245,197,71,0.08)",
              color: GOLD_HI
            }}
          >
            ← Back to {pillar.title} Island
          </Link>
        </div>
      </main>
    );
  }

  const questIdx = quests.findIndex((q) => q.slug === slug);
  const questNumber = questIdx >= 0 ? questIdx + 1 : 1;
  const totalQuests = quests.length || 1;
  const progressPct = Math.min(100, (questNumber / totalQuests) * 100);
  const nextQuestInPillar =
    questIdx >= 0 && questIdx < quests.length - 1 ? quests[questIdx + 1] : null;
  const islandBackHref =
    pillarId === "forces" && quest.forcesCategory
      ? `/forces/category/${quest.forcesCategory}`
      : pillar.route;

  const nextQuestCta = nextQuestInPillar
    ? {
        href: `${pillar.route}/${nextQuestInPillar.slug}`,
        label: `Next quest → ${nextQuestInPillar.title}`
      }
    : undefined;
  const islandFinaleCta =
    questIdx >= 0 && questIdx === quests.length - 1
      ? {
          href: pillar.route,
          label: `Island cleared — chart conviction`
        }
      : undefined;

  const source =
    pillarHasQuestPipeline(pillarId) && questPipeline?.sourceLabel
      ? questPipeline.sourceLabel
      : quest.secSection
        ? `${quest.secSection.form}, ${quest.secSection.section}`
        : null;

  return (
    <main className="pointer-events-auto relative mx-auto w-full max-w-4xl px-4 pb-28 pt-6 md:px-6 md:pt-8">
      {/* Top bar: back link + quest progress */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={islandBackHref}
          aria-label={
            pillarId === "forces" && quest.forcesCategory
              ? `Back to ${quest.objective}`
              : `Back to ${pillar.title} Island`
          }
          className="group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.16em] transition hover:brightness-110"
          style={{
            borderColor: pillarQuestTheme?.border ?? GOLD_BORDER_SOFT,
            background: "rgba(7,7,18,0.55)",
            color: pillarQuestTheme?.hi ?? GOLD_HI,
            boxShadow: pillarQuestTheme
              ? `0 0 18px -6px ${pillarQuestTheme.glow}`
              : undefined
          }}
        >
          <span aria-hidden className="text-[14px] leading-none">
            ←
          </span>
          {pillarId === "forces" && quest.forcesCategory
            ? "Back to category"
            : `Back to ${pillar.title} Island`}
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-[10.5px] uppercase tracking-[0.20em] text-ink-2">
            Quest Progress
          </span>
          <span
            className="font-[var(--font-grotesk)] text-[14px] font-semibold tabular-nums"
            style={{ color: pillarQuestTheme?.hi ?? GOLD_HI }}
          >
            {questNumber} / {totalQuests}
          </span>
        </div>
      </div>

      {/* Gold progress bar */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={totalQuests}
        aria-valuenow={questNumber}
        aria-label={`Quest ${questNumber} of ${totalQuests} in ${pillar.title}`}
        className="relative mt-3 h-1.5 w-full overflow-hidden rounded-full"
        style={{
          background: pillarQuestTheme?.glowSoft ?? GOLD_WASH
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background: pillarQuestTheme
              ? `linear-gradient(90deg, ${pillarQuestTheme.hi} 0%, ${pillarQuestTheme.lo} 100%)`
              : `linear-gradient(90deg, ${GOLD_HI} 0%, ${GOLD_LO} 100%)`,
            boxShadow: `0 0 20px ${pillarQuestTheme?.glow ?? GOLD_GLOW}`
          }}
        />
      </div>

      {/* Reading shell — Mercury-like slate + restrained gold accent */}
      <motion.article
        initial={false}
        animate={{
          boxShadow: parentRead
            ? pillarQuestTheme
              ? `0 24px 80px -36px rgba(0,0,0,0.75), 0 0 0 1px ${pillarQuestTheme.border}, 0 0 48px -28px ${pillarQuestTheme.glowSoft}`
              : `0 24px 80px -36px rgba(0,0,0,0.75), 0 0 0 1px rgba(245,197,71,0.22), 0 0 48px -28px rgba(245,197,71,0.12)`
            : `0 20px 70px -40px rgba(0,0,0,0.72), 0 0 0 1px rgba(255,255,255,0.08)`,
          scale: celebrate ? [1, 1.015, 1] : 1
        }}
        transition={{
          boxShadow: { duration: 0.45, ease: "easeOut" },
          scale: { duration: 0.55, ease: "easeOut" }
        }}
        className="relative mt-5 overflow-hidden rounded-2xl border border-white/[0.08] bg-[rgba(10,10,14,0.94)] backdrop-blur-xl"
        style={{
          borderTopColor: pillarQuestTheme?.border ?? "rgba(245,197,71,0.28)"
        }}
        aria-label={`${quest.title} — quest detail`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(100% 70% at 100% 0%, rgba(245,197,71,0.06), transparent 45%), radial-gradient(90% 60% at 0% 100%, rgba(139,92,246,0.05), transparent 50%)"
          }}
        />

        {/* Completion sweep — only when parent just flipped to fully read */}
        <AnimatePresence>
          {celebrate ? (
            <motion.div
              key="sweep"
              aria-hidden
              initial={{ x: "-110%", opacity: 0 }}
              animate={{ x: "110%", opacity: [0, 0.85, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: "easeInOut" }}
              className="pointer-events-none absolute inset-y-0 w-1/2"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(245,197,71,0.25), rgba(245,197,71,0.55), rgba(245,197,71,0.25), transparent)",
                mixBlendMode: "screen"
              }}
            />
          ) : null}
        </AnimatePresence>

        {/* Hero banner — hidden for BUSINESS CSS quest card (title/crest on card + outer context). */}
        {usePillarQuestCardTemplate ? (
          <h1 className="sr-only">
            {quest.title}. {quest.objective}
          </h1>
        ) : (
          <motion.header
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="relative grid gap-5 px-6 pt-7 md:grid-cols-[1fr_auto] md:items-center md:gap-7 md:px-9 md:pt-9"
          >
            <div className="flex min-w-0 items-start gap-4">
              {/* Quest number badge */}
              <motion.div
                aria-hidden
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 22,
                  delay: 0.05
                }}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-[var(--font-grotesk)] text-[15px] font-semibold tabular-nums"
                style={{
                  border: `1px solid ${GOLD_BORDER}`,
                  background:
                    "linear-gradient(160deg, rgba(245,197,71,0.22), rgba(245,197,71,0.04))",
                  color: GOLD_HI,
                  boxShadow: `inset 0 0 16px ${GOLD_GLOW}`
                }}
              >
                {String(questNumber).padStart(2, "0")}
              </motion.div>

              <div className="min-w-0">
                <div
                  className="text-[10.5px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: "rgba(245,197,71,0.85)" }}
                >
                  {pillar.title} Island · {quest.type}
                  {isMultiCard ? (
                    <span className="ml-2 text-ink-2">
                      · {cards.length} cards
                    </span>
                  ) : null}
                </div>
                <h1 className="mt-1 font-[var(--font-grotesk)] text-[26px] leading-tight text-ink-0 md:text-[32px]">
                  {quest.title}
                </h1>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-1 md:text-[14.5px]">
                  {quest.objective}
                </p>
              </div>
            </div>

            {/* Island/company crest */}
            <PillarCrest pillarId={pillarId} ticker={company.ticker} />
          </motion.header>
        )}

        {usePillarQuestCardTemplate ? (
          <BusinessIslandQuestReading
            quest={quest}
            company={company}
            pillarId={pillarId}
            slug={slug}
            cards={cards}
            cardReadFlags={cardReadFlags}
            readQuestSlugs={readSlugs}
            allCardsRead={allCardsRead}
            source={source}
            questPipeline={
              pillarHasQuestPipeline(pillarId) ? questPipeline : undefined
            }
            onMarkRead={(markSlug) => actions.markQuestRead(pillarId, markSlug)}
            onCardView={(cardId) => {
              if (cardId) {
                trackCardOpened(raw, pillarId, slug, cardId);
              } else {
                trackCardOpened(raw, pillarId, slug, "main");
              }
            }}
            onQuizScreenChange={setPillarOnQuizScreen}
            nextQuest={nextQuestCta}
            islandFinaleCta={islandFinaleCta}
          />
        ) : isMultiCard ? (
          <div className="relative px-5 pb-2 pt-5 sm:px-6 md:px-9 md:pt-7">
            <div className="space-y-5 md:space-y-6">
              {cards.map((card, idx) => (
                <SubCardPanel
                  key={card.id}
                  card={card}
                  index={idx}
                  total={cards.length}
                  rewardXp={quest.rewardXp}
                  deckTicker={company.ticker}
                  company={company}
                  pillarTitle={pillar.title}
                  questType={quest.type}
                  isRead={cardReadFlags[idx]}
                  onMarkRead={() =>
                    actions.markQuestRead(pillarId, cardSlug(slug, card.id))
                  }
                />
              ))}
            </div>

            {hasPlayableQuizConfig(quest.quizConfig) ? (
              <div className="mt-5">
                {!parentRead ? (
                  <QuestQuizUnlockStatus
                    parentSlug={slug}
                    cards={cards}
                    readQuestSlugs={readSlugs}
                    quizConfig={quest.quizConfig}
                    theme={
                      pillarQuestTheme ?? getPillarQuestTheme(pillarId)
                    }
                    showDevDetails={showQuestDebug}
                    className="mb-4"
                  />
                ) : null}
                <QuestQuizPanel
                  pillarId={pillarId}
                  slug={slug}
                  quiz={quest.quizConfig}
                  unlocked={parentRead}
                  title={quizTitleFor(quest.type)}
                  rewardXp={quest.rewardXp}
                  cardsRead={cardReadFlags.filter(Boolean).length}
                  cardsTotal={cards.length}
                  nextQuest={nextQuestCta}
                  islandFinaleCta={islandFinaleCta}
                  passCelebration={{
                    headline: questCompleteHeadline(
                      slug,
                      quest.title,
                      quest.type
                    ),
                    message: islandQuizPassMessage(pillarId, slug, quest.type)
                  }}
                  panelTheme={pillarQuestTheme ?? undefined}
                />
              </div>
            ) : null}

            {source ? (
              <p
                className="mt-7 text-[10.5px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: "rgba(245,197,71,0.75)" }}
              >
                Source: {source}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="relative px-5 pb-3 pt-5 sm:px-6 md:px-9 md:pl-8 md:pr-10 md:pt-7">
            <>
              <IntelMissionHeader
                cardIndex={1}
                cardTotal={1}
                rewardXp={quest.rewardXp}
              />
              <SingleCardQuestReading
                pillar={pillar}
                company={company}
                quest={quest}
                slug={slug}
                parsed={parsedSingleCard}
                keyHookLine={keyHookLine}
                step={singleReadingStep}
                stages={singleReadingStages}
                onAdvance={() =>
                  setSingleReadingStep((s) =>
                    Math.min(s + 1, singleReadingStages.length - 1)
                  )
                }
                quests={quests}
                questIdx={questIdx}
              />
            </>

            {singleAtDone && hasPlayableQuizConfig(quest.quizConfig) ? (
              <motion.div className="mt-6">
                <QuestQuizPanel
                  pillarId={pillarId}
                  slug={slug}
                  quiz={quest.quizConfig}
                  unlocked={parentRead}
                  title={quizTitleFor(quest.type)}
                  rewardXp={quest.rewardXp}
                  nextQuest={nextQuestCta}
                  islandFinaleCta={islandFinaleCta}
                  passCelebration={{
                    headline: questCompleteHeadline(
                      slug,
                      quest.title,
                      quest.type
                    ),
                    message: islandQuizPassMessage(pillarId, slug, quest.type)
                  }}
                  panelTheme={pillarQuestTheme ?? undefined}
                />
              </motion.div>
            ) : null}

            {singleAtDone && source ? (
              <p
                className="mt-6 text-[10.5px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: "rgba(245,197,71,0.75)" }}
              >
                Source: {source}
              </p>
            ) : null}
          </div>
        )}
        {/* Footer row — hidden on BUSINESS quiz screen */}
        {!(usePillarQuestCardTemplate && pillarOnQuizScreen) ? (
        <div
          className="relative mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] px-6 py-5 md:px-9"
        >
          {usePillarQuestCardTemplate ? (
            <span className="max-w-[44ch] text-[11.5px] leading-snug text-ink-2">
              {cards.length > 1
                ? "Use Previous / Next for each card. When every card is marked read, the quiz opens on its own screen."
                : "Mark the card as read — the quiz opens on its own screen when you're done."}
            </span>
          ) : isMultiCard ? (
            <ParentReadStatus
              read={cardReadFlags.filter(Boolean).length}
              total={cards.length}
            />
          ) : singleAtDone ? (
            <motion.div
              className="relative rounded-2xl p-[1px]"
              animate={
                parentSelfRead
                  ? { boxShadow: "0 0 0 0 rgba(245,197,71,0)" }
                  : {
                      boxShadow: [
                        "0 0 0 0 rgba(245,197,71,0)",
                        "0 0 0 5px rgba(245,197,71,0.14)",
                        "0 0 0 0 rgba(245,197,71,0)"
                      ]
                    }
              }
              transition={
                parentSelfRead
                  ? { duration: 0.3 }
                  : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <MarkAsReadCheckbox
                isRead={parentSelfRead}
                onClick={() => actions.markQuestRead(pillarId, slug)}
              />
            </motion.div>
          ) : (
            <span className="max-w-[36ch] text-[11.5px] leading-snug text-ink-2">
              Reveal each step to unlock mark as read and the quiz.
            </span>
          )}
          <p className="text-[12px] text-ink-2">
            Reading never awards XP. Earn XP by passing quizzes, finishing island
            conviction, quiz streak milestones, badges, and special achievements.
          </p>
        </div>
        ) : null}
      </motion.article>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

/**
 * Build the human-readable "X Quiz" label from a quest type. Falls
 * back to plain "Quiz" for unconventional types like "quiz" itself.
 */
function quizTitleFor(type: string): string {
  if (!type || type.toLowerCase() === "quiz") return "Quiz";
  const head = type.charAt(0).toUpperCase() + type.slice(1);
  return `${head} Quiz`;
}

// ---------------------------------------------------------------------------
// Structured answer — bullets, titled blocks, optional "Simple version"
// ---------------------------------------------------------------------------

type AnswerBlock =
  | { kind: "prose"; text: string }
  | { kind: "titledBullets"; title: string; bullets: string[] }
  | { kind: "bulletsOnly"; bullets: string[] };

function isBulletLine(line: string): boolean {
  return /^\s*[•\-\*\u2022]\s*\S/.test(line);
}

function stripBullet(line: string): string {
  return line.replace(/^\s*[•\-\*\u2022]\s*/, "").trim();
}

function extractSimpleVersion(text: string): { main: string; simple?: string } {
  const re = /\n\s*(?:Simple version|Simple Version)\s*:?\s*\n([\s\S]+)$/;
  const m = text.match(re);
  if (!m) return { main: text.trim() };
  const main = text.slice(0, m.index).trim();
  return { main, simple: m[1].trim() };
}

function linesFromChunk(chunk: string): string[] {
  return chunk
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

function groupLinesIntoBlocks(lines: string[]): AnswerBlock[] {
  const blocks: AnswerBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    if (isBulletLine(lines[i])) {
      const bullets: string[] = [];
      while (i < lines.length && isBulletLine(lines[i])) {
        const t = stripBullet(lines[i]);
        if (t) bullets.push(t);
        i++;
      }
      if (bullets.length) blocks.push({ kind: "bulletsOnly", bullets });
      continue;
    }
    const preamble: string[] = [];
    while (i < lines.length && !isBulletLine(lines[i])) {
      preamble.push(lines[i]);
      i++;
    }
    const titleText = preamble.join(" ").trim();
    if (i < lines.length && isBulletLine(lines[i])) {
      const bullets: string[] = [];
      while (i < lines.length && isBulletLine(lines[i])) {
        const t = stripBullet(lines[i]);
        if (t) bullets.push(t);
        i++;
      }
      if (titleText && bullets.length) {
        blocks.push({ kind: "titledBullets", title: titleText, bullets });
      } else if (bullets.length) {
        blocks.push({ kind: "bulletsOnly", bullets });
      }
    } else if (titleText) {
      blocks.push({ kind: "prose", text: titleText });
    }
  }
  return blocks;
}

function parseAnswerToBlocks(fullText: string): {
  blocks: AnswerBlock[];
  simple?: string;
} {
  const { main, simple } = extractSimpleVersion(fullText);
  const stripped = main
    .replace(/\n\s*Why investors care:\s*[\s\S]*$/i, "")
    .replace(/\n\s*Why it matters:\s*[\s\S]*$/i, "")
    .replace(/\n\s*Investor insight:\s*.+$/i, "")
    .replace(
      /^(?:What we know|What changed|What the filing says|What they actually do|Real-world analogy|Main [Ee]xplanation|Bottom [Ll]ine)\s*:?\s*/gim,
      ""
    )
    .trim();
  const major = stripped
    .split(/\n{2,}/g)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  const blocks: AnswerBlock[] = [];
  for (const chunk of major) {
    const lines = linesFromChunk(chunk);
    if (lines.length === 0) continue;
    if (!lines.some(isBulletLine)) {
      blocks.push({
        kind: "prose",
        text: chunk.replace(/\n+/g, " ").trim()
      });
      continue;
    }
    blocks.push(...groupLinesIntoBlocks(lines));
  }
  return { blocks, simple };
}

function flattenAnswerBlocksToPlain(blocks: AnswerBlock[]): string {
  const parts: string[] = [];
  for (const b of blocks) {
    if (b.kind === "prose") parts.push(b.text);
    else if (b.kind === "bulletsOnly") parts.push(b.bullets.join(" "));
    else {
      const head = b.title.replace(/\s*:\s*$/, "").trim();
      parts.push(`${head}: ${b.bullets.join(" ")}`);
    }
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function splitIntoSentences(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  const parts = normalized
    .split(/(?<=[.!?])\s+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  return parts.length > 0 ? parts : [normalized];
}

/** Up to four sentences; keeps a single sentence when that is all there is. */
function trimAnswerToShortSentences(text: string, maxSentences: number): string {
  const s = splitIntoSentences(text);
  if (s.length === 0) return "";
  const n = s.length === 1 ? 1 : Math.min(maxSentences, s.length);
  return s.slice(0, n).join(" ");
}

/** Short prose lines for the BUSINESS pixel card when blocks are not available. */
function businessPixelAnswerSentences(parsed: {
  blocks: AnswerBlock[];
  simple?: string;
}): string[] {
  const fromBlocks = flattenAnswerBlocksToPlain(parsed.blocks);
  if (fromBlocks) return splitIntoSentences(trimAnswerToShortSentences(fromBlocks, 4));
  const sim = parsed.simple?.trim();
  if (sim) return splitIntoSentences(trimAnswerToShortSentences(sim, 4));
  return [];
}

function firstSentenceForInvestorLine(text: string, maxLen: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return "";
  const m = t.match(/^.{1,320}?[.!?](?:\s|$)/);
  if (m) return m[0].trim();
  return t.length > maxLen ? `${t.slice(0, maxLen - 1).trim()}…` : t;
}

function businessPixelWhyOneLine(
  whyItMatters: string,
  investorInsight?: string | null
): string {
  const insight = investorInsight?.trim();
  if (insight) return firstSentenceForInvestorLine(insight, 200);
  return firstSentenceForInvestorLine(whyItMatters.trim(), 200);
}

function displaySectionTitle(raw: string): string {
  return raw.replace(/\s*:\s*$/, "").trim();
}

function RailsHeading({
  label,
  accent = "gold",
  rightSlot
}: {
  label: string;
  accent?: "gold" | "violet";
  rightSlot?: ReactNode;
}) {
  const bar =
    accent === "gold"
      ? `linear-gradient(180deg, ${GOLD_HI} 0%, ${GOLD_LO} 55%, rgba(196,181,253,0.55) 100%)`
      : `linear-gradient(180deg, ${VIOLET_HI} 0%, rgba(245,197,71,0.72) 100%)`;
  const color = accent === "gold" ? GOLD_HI : VIOLET_HI;
  return (
    <div className="flex min-w-0 items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          aria-hidden
          className="h-7 w-0.5 shrink-0 rounded-full sm:h-8"
          style={{
            background: bar,
            boxShadow:
              accent === "gold"
                ? `0 0 10px ${GOLD_GLOW}`
                : `0 0 10px ${VIOLET_GLOW}`
          }}
        />
        <h2
          className="truncate font-[var(--font-grotesk)] text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color }}
        >
          {label}
        </h2>
      </div>
      {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
    </div>
  );
}

function TickerMonospaceChip({ ticker }: { ticker: string }) {
  const t = ticker.trim().toUpperCase();
  if (!t) return null;
  return (
    <span
      className="rounded-lg border border-white/[0.1] bg-gradient-to-b from-white/[0.08] to-black/30 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-0/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]"
      title="Ticker"
    >
      {t}
    </span>
  );
}

/** Koyfin-style grounding row — real company fields, no fluff. */
function CompanyContextStrip({
  company,
  pillarTitle,
  questType
}: {
  company: Company;
  pillarTitle: string;
  questType: string;
}) {
  const lens = `${pillarTitle} · ${questType}`;
  return (
    <div
      className="grid gap-3 rounded-xl border border-white/[0.07] bg-black/35 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm sm:grid-cols-2 sm:gap-x-6 sm:gap-y-2 sm:px-5 md:grid-cols-4 md:py-3"
      aria-label="Company context"
    >
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-2/75">
          Ticker
        </p>
        <p className="mt-0.5 font-mono text-[13px] font-semibold tabular-nums text-ink-0">
          {company.ticker}
        </p>
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-2/75">
          Company
        </p>
        <p className="mt-0.5 truncate text-[13px] font-medium text-ink-0/95">
          {company.name}
        </p>
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-2/75">
          Sector
        </p>
        <p className="mt-0.5 truncate text-[13px] text-ink-1">{company.sector}</p>
      </div>
      <div className="min-w-0 sm:col-span-2 md:col-span-1">
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-2/75">
          Lens
        </p>
        <p className="mt-0.5 truncate text-[13px] text-ink-1" title={lens}>
          {lens}
        </p>
      </div>
    </div>
  );
}

function GlyphDevice() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="7"
        y="3"
        width="10"
        height="18"
        rx="2.2"
        stroke="currentColor"
        strokeWidth="1.35"
        opacity="0.9"
      />
      <path
        d="M10 6.5h4M10 17h4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}

function GlyphCloud() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 17h9.5a3.5 3.5 0 0 0 .2-7 4 4 0 0 0-7.6-1.1A3.3 3.3 0 0 0 7 17Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
        opacity="0.88"
      />
    </svg>
  );
}

function GlyphLoop() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M17 8a6 6 0 1 0 1.94 4.4M17 8V5M17 8h-2.8M7 16a6 6 0 0 0-1.94-4.4M7 16v3M7 16h2.8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.88"
      />
    </svg>
  );
}

function GlyphBox() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 8.5 12 4l7 4.5v7L12 20l-7-4.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
        opacity="0.88"
      />
      <path
        d="M12 4v16"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.35"
      />
    </svg>
  );
}

function GlyphUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="8" r="2.6" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M5 17.2c.6-2.1 2.3-3.4 4-3.4s3.4 1.3 4 3.4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle cx="16" cy="9" r="2" stroke="currentColor" strokeWidth="1.1" />
      <path
        d="M14.2 17.5h4.3c.3-1.1 1-1.8 2-1.8"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

function GlyphTrend() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 16l4-4 3 3 5-6 2 2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.88"
      />
      <path
        d="M16 7h3v3"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
    </svg>
  );
}

function SectionGlyph({ title }: { title: string }) {
  const t = title.toLowerCase();
  if (/device|iphone|ipad|mac|watch|airpod|hardware|product|money from/.test(t))
    return <GlyphDevice />;
  if (/service|icloud|music|app store|tv\+|pay|subscription|recurring/.test(t))
    return <GlyphCloud />;
  if (/region|geograph|americas|china|europe|japan|market/.test(t))
    return <GlyphTrend />;
  if (/customer|consumer|client|business|developer|user|sell to/.test(t))
    return <GlyphUsers />;
  if (/ecosystem|switch|loyal|connected|lock/.test(t)) return <GlyphLoop />;
  if (/revenue|money|earn|sales|driver/.test(t)) return <GlyphTrend />;
  return <GlyphBox />;
}

/** Glass value-chain strip — clearer than flat SVG boxes, still pointer-safe. */
function ValueChainStrip({ ticker }: { ticker: string }) {
  const apple = ticker.trim().toUpperCase() === "AAPL";
  const steps = apple
    ? [
        {
          k: "hw",
          title: "Hardware",
          sub: "Devices people pay up for.",
          glyph: <GlyphDevice />
        },
        {
          k: "sv",
          title: "Services",
          sub: "Software & subscriptions on those devices.",
          glyph: <GlyphCloud />
        },
        {
          k: "eco",
          title: "Ecosystem",
          sub: "Same customers, tighter retention.",
          glyph: <GlyphLoop />
        }
      ]
    : [
        {
          k: "of",
          title: "Offer",
          sub: "What the company sells.",
          glyph: <GlyphBox />
        },
        {
          k: "by",
          title: "Buyers",
          sub: "Who pays and what triggers purchase.",
          glyph: <GlyphUsers />
        },
        {
          k: "rp",
          title: "Repeats",
          sub: "Renewals, usage, and add-on revenue.",
          glyph: <GlyphTrend />
        }
      ];

  const caption = apple
    ? "Hardware plus services — one customer relationship."
    : "Sell once, get paid, then watch what comes back.";

  return (
    <figure className="relative mb-7 md:mb-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.4]"
        style={{
          background:
            "radial-gradient(ellipse 90% 100% at 50% -30%, rgba(168,85,247,0.14), transparent 52%), radial-gradient(ellipse 70% 90% at 100% 40%, rgba(245,197,71,0.08), transparent 48%)"
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.22]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)",
          backgroundSize: "22px 22px"
        }}
      />
      <div className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-2.5 sm:px-5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-2/85">
            {apple ? "Revenue map" : "Flow"}
          </span>
        </div>
        <div className="flex flex-col gap-2.5 p-4 sm:flex-row sm:items-stretch sm:gap-1.5 sm:p-5">
          {steps.map((r, i) => (
            <Fragment key={r.k}>
              {i > 0 ? (
                <div
                  aria-hidden
                  className="hidden shrink-0 items-center justify-center sm:flex sm:w-5"
                >
                  <svg
                    width="10"
                    height="20"
                    viewBox="0 0 10 20"
                    className="text-amber-300/40"
                    aria-hidden
                  >
                    <path
                      d="M2.5 5.5 6.5 10l-4 4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ) : null}
              <div className="min-w-0 flex-1 rounded-xl border border-white/[0.07] bg-black/25 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-4 sm:py-3.5">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-400/18 bg-gradient-to-br from-amber-400/14 via-transparent to-violet-500/12 text-amber-200/95"
                    aria-hidden
                  >
                    {r.glyph}
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="font-[var(--font-grotesk)] text-[13px] font-semibold leading-tight tracking-tight text-ink-0">
                      {r.title}
                    </p>
                    <p className="mt-1 text-[12px] leading-snug text-ink-2">
                      {r.sub}
                    </p>
                  </div>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
      <figcaption className="mt-2.5 px-1 text-[11px] leading-snug text-ink-2/78">
        {caption}
      </figcaption>
    </figure>
  );
}

function AnswerPanelInnerBlock({
  block,
  index: i,
  compact
}: {
  block: AnswerBlock;
  index: number;
  compact?: boolean;
}) {
  const py = compact ? "py-2.5" : "relative py-5 md:py-6";
  const proseSize = compact
    ? "max-w-[56ch] text-[13px] leading-[1.65] text-ink-0/93 sm:text-[13.5px]"
    : "max-w-[56ch] text-[14.5px] leading-[1.72] text-ink-0/94 sm:text-[15px] md:text-[15.5px]";
  const bulletSize = compact
    ? "text-[12.5px] leading-relaxed text-ink-0/91 sm:text-[13px]"
    : "text-[14px] leading-relaxed text-ink-0/92 sm:text-[14.5px] md:text-[15px]";
  if (block.kind === "prose") {
    return (
      <div className={py}>
        <p className={proseSize}>{block.text}</p>
      </div>
    );
  }

  if (block.kind === "bulletsOnly") {
    return (
      <div className={py}>
        <ul className="space-y-2 sm:space-y-2.5">
          {block.bullets.map((item, idx) => (
            <li key={idx} className={`flex gap-2.5 ${bulletSize}`}>
              <span
                aria-hidden
                className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-gradient-to-br from-amber-200/80 to-violet-300/60 opacity-80"
              />
              <span className="min-w-0 flex-1">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const title = block.title.replace(/\s*:\s*$/, "");
  const label = displaySectionTitle(title);

  if (compact) {
    return (
      <div className="rounded-lg border border-white/[0.05] bg-black/12 py-2.5 pl-3 pr-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:py-3 sm:pl-3.5">
        <div className="flex gap-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-400/14 bg-gradient-to-br from-amber-400/10 via-transparent to-violet-500/8 text-amber-200/95"
            aria-hidden
          >
            <SectionGlyph title={title} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-pretty font-[var(--font-grotesk)] text-[11.5px] font-semibold leading-relaxed tracking-tight break-words whitespace-normal text-ink-0 sm:text-[12px]">
              {label}
            </p>
            <ul className="mt-2 space-y-2">
              {block.bullets.map((item, idx) => (
                <li key={idx} className={`flex gap-2 ${bulletSize}`}>
                  <span
                    aria-hidden
                    className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-violet-300/45"
                    style={{ boxShadow: `0 0 8px ${VIOLET_GLOW}` }}
                  />
                  <span className="min-w-0 flex-1">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl border border-white/[0.05] bg-black/15 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:py-6">
      <div className="flex gap-3.5 px-1 sm:gap-4 sm:px-2">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/16 bg-gradient-to-br from-amber-400/12 via-transparent to-violet-500/10 text-amber-200/95"
          aria-hidden
        >
          <SectionGlyph title={title} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-pretty font-[var(--font-grotesk)] text-[13px] font-semibold leading-relaxed tracking-tight break-words whitespace-normal text-ink-0 sm:text-[13.5px]">
            {label}
          </p>
          <ul className="mt-3.5 space-y-3">
            {block.bullets.map((item, idx) => (
              <li
                key={idx}
                className="flex gap-3.5 text-[14px] leading-relaxed text-ink-0/93 sm:text-[14.5px] md:text-[15px]"
              >
                <span
                  aria-hidden
                  className="mt-[0.5em] h-1 w-1 shrink-0 rounded-full bg-violet-300/45"
                  style={{ boxShadow: `0 0 10px ${VIOLET_GLOW}` }}
                />
                <span className="min-w-0 flex-1">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function AnswerIntelPanel({
  blocks,
  deckTicker
}: {
  blocks: AnswerBlock[];
  deckTicker: string;
}) {
  return (
    <div
      className="relative mt-2 overflow-hidden rounded-xl border border-white/[0.07] bg-[rgba(12,12,16,0.65)] sm:rounded-[1.05rem]"
      style={{
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 56px -44px rgba(0,0,0,0.65)"
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-80"
        style={{
          background:
            "radial-gradient(100% 80% at 50% 0%, rgba(168,85,247,0.05), transparent 52%)"
        }}
      />

      <div className="relative z-[1] border-b border-white/[0.06] px-4 py-3 sm:px-6 md:px-8">
        <RailsHeading
          label="Answer"
          accent="gold"
          rightSlot={<TickerMonospaceChip ticker={deckTicker} />}
        />
      </div>

      <div className="relative z-[1] px-4 py-6 sm:px-6 sm:py-7 md:px-8 md:py-8">
        <ValueChainStrip ticker={deckTicker} />

        <div className="space-y-3 md:space-y-4">
          {blocks.map((b, i) => (
            <Fragment key={i}>
              <AnswerPanelInnerBlock block={b} index={i} />
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function IntelMissionHeader({
  cardIndex,
  cardTotal,
  rewardXp,
  trail
}: {
  cardIndex: number;
  cardTotal: number;
  rewardXp: number;
  trail?: ReactNode;
}) {
  const pct = Math.min(100, (cardIndex / Math.max(1, cardTotal)) * 100);
  return (
    <div
      className="mb-7 border-b border-white/[0.08] pb-5 md:mb-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="text-[10px] font-bold uppercase tracking-[0.28em]"
          style={{ color: GOLD_HI }}
        >
          Card {cardIndex} of {cardTotal}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{ color: VIOLET_HI }}
          >
            +{rewardXp} XP
          </div>
          {trail}
        </div>
      </div>
      <div
        className="relative mt-3 h-1 overflow-hidden rounded-full bg-black/50 ring-1 ring-white/[0.06]"
        role="presentation"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${GOLD_HI}, ${VIOLET_HI}, ${GOLD_LO})`,
            boxShadow: `0 0 14px ${GOLD_GLOW}`
          }}
        />
      </div>
    </div>
  );
}

function splitSimpleHeroLines(text: string): string[] {
  const m = text.match(/^(.+?),\s+(.+)$/);
  if (m) return [m[1].trim(), m[2].trim()];
  return [text.trim()];
}

/** Compact “simple version” for the BUSINESS pixel-card answer slot (no duplicate headings). */
function TemplateSimplePull({ text }: { text: string }) {
  const lines = useMemo(() => splitSimpleHeroLines(text), [text]);
  return (
    <div
      className="space-y-1.5 rounded-lg border border-white/[0.06] bg-black/22 px-3 py-2.5 sm:px-3.5 sm:py-3"
      aria-label="Simple version"
    >
      {lines.map((line, i) => (
        <p
          key={i}
          className={
            i === 0
              ? "font-[var(--font-grotesk)] text-[13px] font-semibold leading-snug text-ink-0 sm:text-[13.5px]"
              : "text-[12.5px] leading-relaxed text-ink-0/86 sm:text-[13px]"
          }
        >
          {line}
        </p>
      ))}
    </div>
  );
}

function BusinessPixelAnswerBody({ blocks }: { blocks: AnswerBlock[] }) {
  return (
    <div className="space-y-3">
      {blocks.map((block, i) => (
        <BusinessPixelAnswerBlock key={i} block={block} />
      ))}
    </div>
  );
}

function BusinessPixelAnswerBlock({ block }: { block: AnswerBlock }) {
  if (block.kind === "prose") {
    const sentences = splitIntoSentences(block.text);
    return (
      <div className="space-y-2.5">
        {sentences.map((s, i) => (
          <p key={i} className="text-[13px] leading-[1.72] text-ink-0/93 sm:text-[14px]">
            {s}
          </p>
        ))}
      </div>
    );
  }

  const bullets = block.kind === "bulletsOnly" ? block.bullets : block.bullets;
  const title =
    block.kind === "titledBullets"
      ? displaySectionTitle(block.title.replace(/\s*:\s*$/, ""))
      : null;

  return (
    <div className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2.5 sm:px-3.5 sm:py-3">
      {title ? (
        <p className="text-pretty font-[var(--font-grotesk)] text-[11px] font-semibold uppercase leading-relaxed tracking-[0.12em] break-words whitespace-normal text-amber-200/90 sm:text-[11.5px]">
          {title}
        </p>
      ) : null}
      <ul className={title ? "mt-2 space-y-2" : "space-y-2"}>
        {bullets.map((item, idx) => (
          <li
            key={idx}
            className="flex gap-2.5 text-[12.5px] leading-[1.65] text-ink-0/92 sm:text-[13px]"
          >
            <span
              aria-hidden
              className="mt-[0.5em] h-1 w-1 shrink-0 rounded-full bg-gradient-to-br from-amber-200/80 to-violet-300/60"
            />
            <span className="min-w-0 flex-1">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BusinessTemplateAnswerSlot({
  parsed,
  deckTicker,
  pixelCard
}: {
  parsed: { blocks: AnswerBlock[]; simple?: string };
  deckTicker: string;
  /** Filing art card: scannable chunks (no ticker chip). */
  pixelCard?: boolean;
}) {
  const pixelSentences = useMemo(
    () => (pixelCard ? businessPixelAnswerSentences(parsed) : []),
    [pixelCard, parsed]
  );

  if (pixelCard) {
    const simple = parsed.simple?.trim();
    const hasBlocks = parsed.blocks.length > 0;

    if (!hasBlocks && !simple && pixelSentences.length === 0) {
      return (
        <p className="text-[13px] leading-[1.72] text-ink-2/88">
          A short filing-based summary will appear here soon.
        </p>
      );
    }

    return (
      <div className="space-y-3.5">
        {simple ? <TemplateSimplePull text={simple} /> : null}
        {hasBlocks ? <BusinessPixelAnswerBody blocks={parsed.blocks} /> : null}
        {!hasBlocks && pixelSentences.length > 0 ? (
          <div className="space-y-2.5">
            {pixelSentences.map((s, i) => (
              <p
                key={i}
                className="text-[13px] leading-[1.72] text-ink-0/93 sm:text-[14px]"
              >
                {s}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  const simple = parsed.simple?.trim();
  return (
    <div className="space-y-3">
      {simple ? <TemplateSimplePull text={simple} /> : null}
      <div className="space-y-2">
        <div className="flex justify-end">
          <TickerMonospaceChip ticker={deckTicker} />
        </div>
        <AnswerBlocksStack blocks={parsed.blocks} compact />
      </div>
    </div>
  );
}

function BusinessTemplateWhySlot({
  whyItMatters,
  investorInsight,
  pixelCard
}: {
  whyItMatters: string;
  investorInsight?: string | null;
  /** Filing art card: one short sentence in the bottom angled panel. */
  pixelCard?: boolean;
}) {
  const displayText = useMemo(() => {
    const generated = investorInsight?.trim();
    if (generated) return generated;
    return whyItMatters.trim();
  }, [whyItMatters, investorInsight]);

  const oneLine = useMemo(
    () => businessPixelWhyOneLine(displayText, null),
    [displayText]
  );
  const parts = useMemo(
    () =>
      displayText
        .split(/\n{2,}/g)
        .map((p) => p.trim())
        .filter((p) => p.length > 0),
    [displayText]
  );

  if (pixelCard) {
    if (!oneLine) {
      return (
        <p className="text-[inherit] leading-[inherit] text-ink-2/85">
          Why investors care will appear here.
        </p>
      );
    }
    return (
      <p className="text-[inherit] leading-[inherit] text-ink-0/90">
        {oneLine}
      </p>
    );
  }

  if (parts.length === 0) {
    return (
      <p className="text-[13px] leading-relaxed text-ink-2/88">
        Why investors care copy will appear here.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {parts.map((p, i) => (
        <p
          key={i}
          className="text-[13px] leading-relaxed text-ink-0/89 sm:text-[13.5px]"
        >
          {p}
        </p>
      ))}
    </div>
  );
}

function SimpleVersionPullQuote({ text }: { text: string }) {
  const lines = useMemo(() => splitSimpleHeroLines(text), [text]);
  return (
    <section className="scroll-mt-4" aria-label="Simple version">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-2/80">
        Simple version
      </p>
      <div
        className="relative mt-3 border-l-[3px] pl-5 sm:pl-6 md:mt-4 md:pl-7"
        style={{ borderLeftColor: "rgba(196,181,253,0.55)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -left-px bottom-0 top-8 w-px bg-gradient-to-b from-violet-300/40 via-amber-300/25 to-transparent"
        />
        <blockquote className="space-y-3">
          {lines.map((line, i) => (
            <p
              key={i}
              className={[
                "max-w-[min(100%,40rem)] font-[var(--font-grotesk)] leading-[1.22] tracking-[-0.03em] text-ink-0",
                i === 0
                  ? "text-[clamp(1.5rem,4.8vw,2.35rem)] font-semibold"
                  : "text-[clamp(1.15rem,3.2vw,1.55rem)] font-normal text-ink-0/88"
              ].join(" ")}
            >
              {line}
            </p>
          ))}
        </blockquote>
      </div>
    </section>
  );
}

function InvestorInsightModule({ text }: { text: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-black/40 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md sm:px-6 sm:py-5"
      style={{ borderLeft: `3px solid ${GOLD_HI}` }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(90% 80% at 0% 0%, rgba(245,197,71,0.1), transparent 55%)"
        }}
      />
      <p className="relative text-[14px] font-medium leading-relaxed text-ink-0/94 sm:text-[14.5px]">
        {text}
      </p>
    </div>
  );
}

function QuestionIntelDeck({ children }: { children: ReactNode }) {
  return (
    <section className="scroll-mt-4">
      <RailsHeading label="Question" accent="violet" />
      <div className="relative mt-4 rounded-xl border border-white/[0.07] bg-black/25 px-5 py-6 sm:px-6 sm:py-7 md:mt-5">
        <p className="font-[var(--font-grotesk)] text-[clamp(1.35rem,4vw,1.85rem)] font-semibold leading-[1.25] tracking-[-0.025em] text-ink-0 md:text-[clamp(1.45rem,3.2vw,2rem)]">
          {children}
        </p>
      </div>
    </section>
  );
}

function WhyMattersHolo({ text }: { text: string }) {
  const parts = useMemo(() => {
    const raw = text
      .split(/\n{2,}/g)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    return raw.slice(0, 2);
  }, [text]);
  return (
    <section className="scroll-mt-4">
      <RailsHeading label="Why investors care" accent="violet" />
      <div className="relative mt-3 rounded-lg border border-white/[0.06] bg-black/20 px-4 py-3.5 sm:px-5 sm:py-4 md:mt-4">
        <div className="space-y-2.5">
          {parts.map((p, i) => (
            <p
              key={i}
              className="text-[13px] leading-[1.65] text-ink-0/88 sm:text-[13.5px]"
            >
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuestAnswerSections({
  plainEnglishAnswer,
  investorInsight,
  deckTicker = ""
}: {
  plainEnglishAnswer: string | null;
  investorInsight?: string | null;
  deckTicker?: string;
}) {
  const relatable = useMemo(
    () => parseRelatableQuestAnswer(plainEnglishAnswer, investorInsight),
    [plainEnglishAnswer, investorInsight]
  );

  const { blocks, simple } = useMemo(
    () =>
      plainEnglishAnswer
        ? parseAnswerToBlocks(plainEnglishAnswer)
        : {
            blocks: [] as AnswerBlock[],
            simple: undefined as string | undefined
          },
    [plainEnglishAnswer]
  );

  if (!plainEnglishAnswer) {
    return (
      <section className="scroll-mt-4">
        <div className="mb-3">
          <RailsHeading label="Answer" accent="gold" />
        </div>
        <AnswerPlaceholder />
      </section>
    );
  }

  if (relatable?.paragraphs.length) {
    return (
      <section className="scroll-mt-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <RailsHeading label="Answer" accent="gold" />
          <TickerMonospaceChip ticker={deckTicker} />
        </div>
        <RelatableQuestAnswer sections={relatable} />
      </section>
    );
  }

  return (
    <>
      {simple ? <SimpleVersionPullQuote text={simple} /> : null}
      <section className="scroll-mt-4">
        <AnswerIntelPanel blocks={blocks} deckTicker={deckTicker} />
      </section>
    </>
  );
}

function AnswerPlaceholder() {
  return (
    <div
      className="mt-3 rounded-xl border border-dashed px-4 py-3.5 text-[13.5px] leading-relaxed text-ink-2 sm:px-5"
      style={{
        borderColor: GOLD_BORDER_SOFT,
        background: "rgba(245,197,71,0.04)"
      }}
    >
      <span style={{ color: GOLD_HI }}>Coming soon.</span> A short,
      beginner-friendly summary will appear here once the SEC filing is parsed.
    </div>
  );
}

function AnswerBlocksStack({
  blocks,
  compact
}: {
  blocks: AnswerBlock[];
  compact?: boolean;
}) {
  if (blocks.length === 0) {
    return <AnswerPlaceholder />;
  }
  return (
    <div className={compact ? "space-y-2 md:space-y-2.5" : "space-y-3 md:space-y-4"}>
      {blocks.map((b, i) => (
        <AnswerPanelInnerBlock key={i} block={b} index={i} compact={compact} />
      ))}
    </div>
  );
}

function SingleCardQuestReading({
  pillar,
  company,
  quest,
  slug,
  parsed,
  keyHookLine,
  step,
  stages,
  onAdvance,
  quests,
  questIdx
}: {
  pillar: ReturnType<typeof pillarById>;
  company: Company;
  quest: QuestDefinition;
  slug: string;
  parsed: { blocks: AnswerBlock[]; simple?: string };
  keyHookLine: string;
  step: number;
  stages: readonly SingleReadingStageId[];
  onAdvance: () => void;
  quests: ReturnType<typeof getCompanyPillarQuests>;
  questIdx: number;
}) {
  const maxStep = Math.max(0, stages.length - 1);
  const simpleText = parsed.simple?.trim() ?? "";
  const nextQuest =
    questIdx >= 0 && questIdx < quests.length - 1 ? quests[questIdx + 1] : null;

  return (
    <div className="md:mr-auto md:max-w-[min(100%,48rem)]">
      <ReadingStageProgressRail step={step} total={stages.length} />

      <div className="mt-2 space-y-10">
        {stages.map((stageId, idx) => {
          if (idx > step) return null;
          return (
            <motion.div
              key={`${slug}-${stageId}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {stageId === "question" ? (
                <QuestionIntelDeck>{quest.investorQuestion}</QuestionIntelDeck>
              ) : null}

              {stageId === "orientation" ? (
                <div className="space-y-4">
                  <RailsHeading label="Takeaway" accent="gold" />
                  <CompanyContextStrip
                    company={company}
                    pillarTitle={pillar.title}
                    questType={quest.type}
                  />
                  <p className="text-[15px] leading-relaxed text-ink-0/92">
                    {keyHookLine}
                  </p>
                </div>
              ) : null}

              {stageId === "ecosystem" ? (
                <ValueChainStrip ticker={company.ticker} />
              ) : null}

              {stageId === "simple" && simpleText ? (
                <SimpleVersionPullQuote text={simpleText} />
              ) : null}

              {stageId === "detail" ? (
                <div className="space-y-4">
                  <RailsHeading
                    label="Answer"
                    accent="gold"
                    rightSlot={<TickerMonospaceChip ticker={company.ticker} />}
                  />
                  <AnswerBlocksStack blocks={parsed.blocks} />
                </div>
              ) : null}

              {stageId === "reflection" ? (
                <div className="space-y-8">
                  {quest.investorInsight?.trim() ? (
                    <div className="space-y-3">
                      <RailsHeading label="Investor insight" accent="gold" />
                      <InvestorInsightModule
                        text={quest.investorInsight.trim()}
                      />
                    </div>
                  ) : null}
                  <WhyMattersHolo text={quest.whyItMatters} />
                </div>
              ) : null}

              {stageId === "done" ? (
                <div className="space-y-3 rounded-xl border border-white/[0.07] bg-black/25 px-4 py-4 sm:px-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-2/85">
                    What&apos;s next
                  </p>
                  {nextQuest ? (
                    <Link
                      href={`${pillar.route}/${nextQuest.slug}`}
                      className="group inline-flex items-center gap-2 font-[var(--font-grotesk)] text-[15px] font-semibold text-ink-0 transition hover:text-ink-0/90"
                    >
                      <span style={{ color: GOLD_HI }}>Next quest</span>
                      <span className="min-w-0 truncate">{nextQuest.title}</span>
                      <span
                        aria-hidden
                        className="text-ink-2 transition group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </Link>
                  ) : (
                    <p className="text-[13px] text-ink-2">
                      You&apos;re at the end of this island trail. Explore another
                      pillar when you&apos;re ready.
                    </p>
                  )}
                  <p className="text-[12px] leading-relaxed text-ink-2/90">
                    Mark this quest read when the idea feels settled — then take
                    the quiz if there is one.
                  </p>
                </div>
              ) : null}
            </motion.div>
          );
        })}
      </div>

      {step < maxStep ? (
        <RevealContinueButton onContinue={onAdvance} label="Continue" />
      ) : null}
    </div>
  );
}

/**
 * One inner card inside a multi-card quest. Each panel has its own
 * Mark-as-Read button bound to the composite slug — never awards XP.
 */
function SubCardPanel({
  card,
  index,
  total,
  rewardXp,
  deckTicker,
  isRead,
  onMarkRead,
  company,
  pillarTitle,
  questType
}: {
  card: QuestSubCard;
  index: number;
  total: number;
  rewardXp: number;
  deckTicker: string;
  isRead: boolean;
  onMarkRead: () => void;
  company: Company;
  pillarTitle: string;
  questType: string;
}) {
  const readTrail = (
    <span
      aria-label={isRead ? "Read" : "Not yet read"}
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em]"
      style={{
        borderColor: isRead ? GREEN_BORDER : GOLD_BORDER_SOFT,
        background: isRead
          ? "rgba(34,197,139,0.12)"
          : "rgba(255,255,255,0.03)",
        color: isRead ? GREEN_HI : "rgb(160 160 180)"
      }}
    >
      {isRead ? (
        <>
          <CheckGlyph className="h-2.5 w-2.5" /> Read
        </>
      ) : (
        "New"
      )}
    </span>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{
        opacity: 1,
        y: 0,
        borderColor: isRead ? "rgba(34,197,139,0.40)" : "rgba(255,255,255,0.12)",
        boxShadow: isRead
          ? `0 16px 36px -22px rgba(34,197,139,0.55), inset 0 0 0 1px rgba(34,197,139,0.20)`
          : `0 16px 36px -26px ${GOLD_GLOW}, inset 0 0 0 1px rgba(245,197,71,0.10)`
      }}
      transition={{
        opacity: { duration: 0.4, delay: index * 0.07, ease: "easeOut" },
        y: { type: "spring", stiffness: 300, damping: 28, delay: index * 0.07 },
        borderColor: { duration: 0.35 },
        boxShadow: { duration: 0.35 }
      }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[rgba(12,12,14,0.72)] backdrop-blur-md"
      aria-label={`Card ${index + 1} of ${total}`}
    >
      {/* Subtle gold corner wash, dimmed when read */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: isRead
            ? "radial-gradient(110% 80% at 90% -10%, rgba(34,197,139,0.06) 0%, transparent 60%)"
            : "radial-gradient(110% 80% at 90% -10%, rgba(245,197,71,0.10) 0%, transparent 60%)"
        }}
      />

      <div className="relative px-5 py-6 sm:px-6 sm:py-7 md:px-7 md:py-7">
        <IntelMissionHeader
          cardIndex={index + 1}
          cardTotal={total}
          rewardXp={rewardXp}
          trail={readTrail}
        />

        <div className="space-y-8 md:mr-auto md:max-w-[min(100%,48rem)] md:space-y-9">
          {index === 0 ? (
            <CompanyContextStrip
              company={company}
              pillarTitle={pillarTitle}
              questType={questType}
            />
          ) : null}

          <QuestionIntelDeck>{card.investorQuestion}</QuestionIntelDeck>

          <QuestAnswerSections
            plainEnglishAnswer={card.plainEnglishAnswer}
            investorInsight={card.investorInsight}
            deckTicker={deckTicker}
          />

          <WhyMattersHolo
            text={
              card.investorInsight?.trim() || card.whyItMatters
            }
          />
        </div>

        <div
          className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-4"
        >
          <MarkAsReadCheckbox isRead={isRead} onClick={onMarkRead} />
          <p className="text-[11.5px] text-ink-2">
            Mark as read updates reading progress only.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ParentReadStatus({ read, total }: { read: number; total: number }) {
  const allRead = read === total && total > 0;
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.16em]"
      style={{
        borderColor: allRead ? GREEN_BORDER : GOLD_BORDER_SOFT,
        background: allRead ? "rgba(34,197,139,0.10)" : "rgba(245,197,71,0.06)",
        color: allRead ? GREEN_HI : GOLD_HI
      }}
    >
      {allRead ? (
        <>
          <CheckGlyph className="h-3 w-3" /> All cards read
        </>
      ) : (
        <>
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: GOLD_HI, boxShadow: `0 0 8px ${GOLD_GLOW}` }}
          />
          {read} / {total} cards read
        </>
      )}
    </span>
  );
}

function MarkAsReadCheckbox({
  isRead,
  onClick
}: {
  isRead: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={isRead ? undefined : onClick}
      disabled={isRead}
      aria-pressed={isRead}
      aria-label={
        isRead ? "Card already marked as read" : "Mark this card as read"
      }
      animate={
        isRead
          ? { scale: [1, 1.06, 1] }
          : { scale: 1 }
      }
      transition={{
        scale: isRead
          ? { duration: 0.5, times: [0, 0.35, 1], ease: "easeOut" as const }
          : { type: "spring" as const, stiffness: 320, damping: 22 }
      }}
      whileHover={isRead ? undefined : { y: -1 }}
      whileTap={isRead ? undefined : { scale: 0.98 }}
      className="group relative inline-flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-[13.5px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/75"
      style={{
        borderColor: isRead ? GREEN_BORDER : GOLD_BORDER,
        background: isRead ? "rgba(34,197,139,0.10)" : "rgba(245,197,71,0.06)",
        color: isRead ? GREEN_HI : GOLD_HI,
        cursor: isRead ? "default" : "pointer",
        boxShadow: isRead
          ? "0 0 24px -10px rgba(34,197,139,0.55)"
          : "0 0 24px -10px rgba(245,197,71,0.55)"
      }}
    >
      <span
        aria-hidden
        className="inline-flex h-5 w-5 items-center justify-center rounded-md transition"
        style={{
          border: `1.5px solid ${isRead ? GREEN_HI : "rgba(245,197,71,0.55)"}`,
          background: isRead ? GREEN_HI : "rgba(0,0,0,0.22)"
        }}
      >
        <AnimatePresence initial={false} mode="wait">
          {isRead ? (
            <motion.svg
              key="check"
              viewBox="0 0 16 16"
              fill="none"
              stroke="#0a1a10"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.18 }}
            >
              <path d="M3 8.5l3 3 7-7.5" />
            </motion.svg>
          ) : null}
        </AnimatePresence>
      </span>
      <AnimatePresence initial={false} mode="wait">
        {isRead ? (
          <motion.span
            key="done"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            Mark as read
          </motion.span>
        ) : (
          <motion.span
            key="mark"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            Mark as read
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function CheckGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M3 8.5l3 3 7-7.5" />
    </svg>
  );
}

function PillarCrest({
  pillarId,
  ticker
}: {
  pillarId: PillarId;
  ticker: string;
}) {
  const meta = pillarById(pillarId);
  return (
    <div
      className="relative hidden h-24 w-40 shrink-0 overflow-hidden rounded-2xl md:block"
      style={{
        border: `1px solid ${GOLD_BORDER}`,
        background:
          "radial-gradient(85% 90% at 50% 35%, rgba(245,197,71,0.18) 0%, rgba(7,7,18,0.92) 65%)",
        boxShadow: `inset 0 0 26px rgba(245,197,71,0.20)`
      }}
    >
      <img
        src={meta.screenImage}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-35"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(7,7,18,0.20) 0%, rgba(7,7,18,0.85) 100%)"
        }}
      />
      <div className="relative flex h-full flex-col items-center justify-center px-3 text-center">
        <span
          aria-hidden
          className="text-2xl leading-none"
          style={{
            color: GOLD_HI,
            textShadow: `0 0 16px ${GOLD_GLOW}`
          }}
        >
          {meta.glyph}
        </span>
        <span
          className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: "rgba(245,197,71,0.85)" }}
        >
          {ticker}
        </span>
        <span className="mt-0.5 font-[var(--font-grotesk)] text-[13px] leading-tight text-ink-0">
          {meta.title}
        </span>
      </div>
    </div>
  );
}
