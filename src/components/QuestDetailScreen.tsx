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

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useGame } from "@/components/GameProvider";
import { useIsQuestRead } from "@/components/gameHooks";
import { QuestQuizPanel } from "@/components/QuestQuizPanel";
import { companyById, type CompanyId } from "@/data/companies";
import { pillarById, type PillarId } from "@/data/pillars";
import {
  findQuestDefinition,
  getCompanyPillarQuests
} from "@/data/quests/library";
import type { QuestSubCard } from "@/data/quests/types";

export type QuestDetailScreenProps = {
  pillarId: PillarId;
  slug: string;
};

const GOLD_HI = "#F5C547";
const GOLD_LO = "#E6A92F";
const GOLD_BORDER = "rgba(245, 197, 71, 0.40)";
const GOLD_BORDER_SOFT = "rgba(245, 197, 71, 0.22)";
const GOLD_GLOW = "rgba(245, 197, 71, 0.45)";
const GOLD_WASH = "rgba(245, 197, 71, 0.10)";
const GREEN_HI = "#22C58B";
const GREEN_BORDER = "rgba(34, 197, 139, 0.55)";

/** Composite slug used to track a sub-card's read state. */
function cardSlug(parentSlug: string, cardId: string): string {
  return `${parentSlug}#${cardId}`;
}

export function QuestDetailScreen({ pillarId, slug }: QuestDetailScreenProps) {
  const { state, actions } = useGame();
  const companyId = state.activeCompanyId as CompanyId;
  const company = companyById(companyId);
  const pillar = pillarById(pillarId);

  const quests = useMemo(
    () => getCompanyPillarQuests(companyId, pillarId),
    [companyId, pillarId]
  );
  const quest = useMemo(
    () => findQuestDefinition(companyId, pillarId, slug),
    [companyId, pillarId, slug]
  );

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
    () => cards.map((c) => readSlugs.includes(cardSlug(slug, c.id))),
    [cards, readSlugs, slug]
  );
  const allCardsRead = cards.length > 0 && cardReadFlags.every(Boolean);
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

  const source = quest.secSection
    ? `${quest.secSection.form}, ${quest.secSection.section}`
    : null;

  const isMultiCard = cards.length > 0;

  return (
    <main className="pointer-events-auto relative mx-auto w-full max-w-4xl px-4 pb-28 pt-6 md:px-6 md:pt-8">
      {/* Top bar: back link + quest progress */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={pillar.route}
          aria-label={`Back to ${pillar.title} Island`}
          className="group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.16em] transition"
          style={{
            borderColor: GOLD_BORDER_SOFT,
            background: "rgba(7,7,18,0.55)",
            color: GOLD_HI
          }}
        >
          <span aria-hidden className="text-[14px] leading-none">
            ←
          </span>
          Back to {pillar.title} Island
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-[10.5px] uppercase tracking-[0.20em] text-ink-2">
            Quest Progress
          </span>
          <span
            className="font-[var(--font-grotesk)] text-[14px] font-semibold tabular-nums"
            style={{ color: GOLD_HI }}
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
        style={{ background: GOLD_WASH }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${GOLD_HI} 0%, ${GOLD_LO} 100%)`,
            boxShadow: `0 0 20px ${GOLD_GLOW}`
          }}
        />
      </div>

      {/* Premium gold card */}
      <motion.article
        initial={false}
        animate={{
          boxShadow: parentRead
            ? `0 36px 100px -32px ${GOLD_GLOW}, inset 0 0 0 1px rgba(245,197,71,0.30)`
            : `0 30px 90px -34px ${GOLD_GLOW}, inset 0 0 0 1px rgba(245,197,71,0.14)`
        }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative mt-5 overflow-hidden rounded-3xl border bg-[rgba(13,11,7,0.86)] backdrop-blur-xl"
        style={{ borderColor: GOLD_BORDER }}
        aria-label={`${quest.title} — quest detail`}
      >
        {/* Ambient gold corner wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 88% -10%, rgba(245,197,71,0.18) 0%, transparent 55%), radial-gradient(120% 80% at -10% 110%, rgba(245,197,71,0.08) 0%, transparent 55%)"
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

        {/* Hero banner */}
        <header className="relative grid gap-5 px-6 pt-7 md:grid-cols-[1fr_auto] md:items-center md:gap-7 md:px-9 md:pt-9">
          <div className="flex min-w-0 items-start gap-4">
            {/* Quest number badge */}
            <div
              aria-hidden
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
            </div>

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
        </header>

        {/* Reading body — branches on single-card vs multi-card */}
        {isMultiCard ? (
          <div className="relative px-6 pb-2 pt-5 md:px-9 md:pt-7">
            <div className="space-y-4">
              {cards.map((card, idx) => (
                <SubCardPanel
                  key={card.id}
                  card={card}
                  index={idx}
                  total={cards.length}
                  isRead={cardReadFlags[idx]}
                  onMarkRead={() =>
                    actions.markQuestRead(pillarId, cardSlug(slug, card.id))
                  }
                />
              ))}
            </div>

            {quest.quizConfig ? (
              <div className="mt-5">
                <QuestQuizPanel
                  pillarId={pillarId}
                  slug={slug}
                  quiz={quest.quizConfig}
                  unlocked={parentRead}
                  title={quizTitleFor(quest.type)}
                  rewardXp={quest.rewardXp}
                  cardsRead={cardReadFlags.filter(Boolean).length}
                  cardsTotal={cards.length}
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
          <div className="relative px-6 pb-2 pt-4 md:px-9 md:pt-6">
            <Section label="Question">
              <p className="mt-2 text-[15.5px] leading-relaxed text-ink-0 md:text-base">
                {quest.investorQuestion}
              </p>
            </Section>

            <Section label="Answer">
              {quest.plainEnglishAnswer ? (
                <AnswerBody
                  text={quest.plainEnglishAnswer}
                  textClass="text-[14.5px] leading-relaxed text-ink-1"
                />
              ) : (
                <AnswerPlaceholder />
              )}
            </Section>

            <Section label="Why this matters">
              <p className="mt-2 text-[14px] leading-relaxed text-ink-1">
                {quest.whyItMatters}
              </p>
            </Section>

            {quest.quizConfig ? (
              <div className="mt-6">
                <QuestQuizPanel
                  pillarId={pillarId}
                  slug={slug}
                  quiz={quest.quizConfig}
                  unlocked={parentRead}
                  title={quizTitleFor(quest.type)}
                  rewardXp={quest.rewardXp}
                />
              </div>
            ) : null}

            {source ? (
              <p
                className="mt-6 text-[10.5px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: "rgba(245,197,71,0.75)" }}
              >
                Source: {source}
              </p>
            ) : null}
          </div>
        )}

        {/* Footer row — single-card mode shows the parent Mark-as-Read.
            Multi-card mode shows a passive status because the per-card
            buttons live inside each SubCardPanel. */}
        <div
          className="relative mt-3 flex flex-wrap items-center justify-between gap-3 border-t px-6 py-5 md:px-9"
          style={{ borderColor: GOLD_BORDER_SOFT }}
        >
          {isMultiCard ? (
            <ParentReadStatus
              read={cardReadFlags.filter(Boolean).length}
              total={cards.length}
            />
          ) : (
            <MarkAsReadCheckbox
              isRead={parentSelfRead}
              onClick={() => actions.markQuestRead(pillarId, slug)}
            />
          )}
          <p className="text-[12px] text-ink-2">
            Reading never awards XP. Earn XP by passing quizzes, finishing island
            conviction, quiz streak milestones, badges, and special achievements.
          </p>
        </div>
      </motion.article>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function Section({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <div
        className="inline-flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: GOLD_HI }}
      >
        <span
          aria-hidden
          className="inline-block h-1 w-1 rounded-full"
          style={{
            background: GOLD_HI,
            boxShadow: `0 0 8px ${GOLD_GLOW}`
          }}
        />
        {label}
      </div>
      {children}
    </section>
  );
}

/**
 * Build the human-readable "X Quiz" label from a quest type. Falls
 * back to plain "Quiz" for unconventional types like "quiz" itself.
 */
function quizTitleFor(type: string): string {
  if (!type || type.toLowerCase() === "quiz") return "Quiz";
  const head = type.charAt(0).toUpperCase() + type.slice(1);
  return `${head} Quiz`;
}

/**
 * Render multi-paragraph answer text. The data layer joins paragraphs
 * with `\n\n` (single `\n` is a soft break inside a paragraph). We
 * keep both correct by splitting on the double newline and rendering
 * each chunk as its own `<p>` with a tiny gap between them.
 */
function AnswerBody({
  text,
  textClass
}: {
  text: string;
  textClass: string;
}) {
  const paragraphs = text
    .split(/\n{2,}/g)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  return (
    <div className="mt-2 space-y-2.5">
      {paragraphs.map((p, i) => (
        <p key={i} className={`${textClass} whitespace-pre-line`}>
          {p}
        </p>
      ))}
    </div>
  );
}

function AnswerPlaceholder() {
  return (
    <div
      className="mt-2 rounded-xl border border-dashed px-4 py-3 text-[13.5px] leading-relaxed text-ink-2"
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

/**
 * One inner card inside a multi-card quest. Each panel has its own
 * Mark-as-Read button bound to the composite slug — never awards XP.
 */
function SubCardPanel({
  card,
  index,
  total,
  isRead,
  onMarkRead
}: {
  card: QuestSubCard;
  index: number;
  total: number;
  isRead: boolean;
  onMarkRead: () => void;
}) {
  return (
    <motion.div
      initial={false}
      animate={{
        borderColor: isRead ? "rgba(34,197,139,0.40)" : GOLD_BORDER_SOFT,
        boxShadow: isRead
          ? `0 16px 36px -22px rgba(34,197,139,0.55), inset 0 0 0 1px rgba(34,197,139,0.20)`
          : `0 16px 36px -26px ${GOLD_GLOW}, inset 0 0 0 1px rgba(245,197,71,0.10)`
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border bg-[rgba(8,7,4,0.65)] backdrop-blur-md"
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

      <div className="relative px-5 py-5 md:px-6 md:py-6">
        {/* Card number + read pill */}
        <header className="flex items-center justify-between gap-3">
          <span
            className="text-[10.5px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: isRead ? GREEN_HI : GOLD_HI }}
          >
            Card {index + 1} of {total}
          </span>
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
        </header>

        <Section label="Question">
          <p className="mt-2 text-[15px] leading-relaxed text-ink-0 md:text-[15.5px]">
            {card.investorQuestion}
          </p>
        </Section>

        <Section label="Answer">
          {card.plainEnglishAnswer ? (
            <AnswerBody
              text={card.plainEnglishAnswer}
              textClass="text-[14px] leading-relaxed text-ink-1"
            />
          ) : (
            <AnswerPlaceholder />
          )}
        </Section>

        <Section label="Why this matters">
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-1">
            {card.whyItMatters}
          </p>
        </Section>

        <div
          className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4"
          style={{ borderColor: GOLD_BORDER_SOFT }}
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
      whileHover={isRead ? undefined : { y: -1 }}
      whileTap={isRead ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="group inline-flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-[13.5px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/75"
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
            Marked as read
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
