"use client";

/**
 * QuestCard — the standard Investor Quest reading card.
 *
 * Content-first surface for a single quest. Designed for the
 * SEC -> AI -> beginner-investor pipeline:
 *
 *   1. Quest title
 *   2. Simple investor question
 *   3. Plain-English answer area (filled by SEC/AI per company)
 *   4. Why this matters (one short sentence)
 *   5. Source (e.g. "Source: 10-K, Item 1 — Business")
 *   6. Mark as Read button
 *
 * IMPORTANT: Mark as Read marks the *content card* as read and
 * advances reading progress only. It DOES NOT award XP. XP is
 * reserved for quiz passes (handled separately).
 */

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { QuestDefinition } from "@/data/quests/types";

export type QuestCardProps = {
  quest: QuestDefinition;
  /** Whether this quest's content card has been marked as read. */
  isRead: boolean;
  /**
   * Fires when the user clicks "Mark as Read". The card plays a
   * short completion animation on the next render where `isRead` flips
   * from false to true.
   */
  onMarkRead?: () => void;
  /**
   * Optional override for the plain-English answer (e.g. live SEC/AI
   * content). Falls back to `quest.plainEnglishAnswer`, then to a
   * friendly placeholder.
   */
  answer?: string | null;
  /** Visual density — `compact` removes the answer + why blocks for list rows. */
  density?: "full" | "compact";
};

function formatSource(quest: QuestDefinition): string | null {
  const s = quest.secSection;
  if (!s) return null;
  return `Source: ${s.form}, ${s.section}`;
}

export function QuestCard({
  quest,
  isRead,
  onMarkRead,
  answer,
  density = "full"
}: QuestCardProps) {
  // Detect false -> true transition to fire the completion animation.
  const wasRead = useRef(isRead);
  const [celebrate, setCelebrate] = useState(false);
  useEffect(() => {
    if (!wasRead.current && isRead) {
      setCelebrate(true);
      const t = window.setTimeout(() => setCelebrate(false), 900);
      return () => window.clearTimeout(t);
    }
    wasRead.current = isRead;
  }, [isRead]);

  const source = formatSource(quest);
  const resolvedAnswer = answer ?? quest.plainEnglishAnswer;
  const isCompact = density === "compact";

  return (
    <motion.article
      initial={false}
      animate={{
        boxShadow: isRead
          ? "0 18px 48px -22px rgba(139, 92, 246, 0.55), 0 0 0 1px rgba(139, 92, 246, 0.35) inset"
          : "0 18px 48px -28px rgba(139, 92, 246, 0.30), 0 0 0 1px rgba(255,255,255,0.04) inset"
      }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-panel-border bg-panel backdrop-blur-xl"
      aria-label={`Quest card: ${quest.title}`}
    >
      {/* Ambient violet wash. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(139,92,246,0.10)] via-transparent to-[rgba(59,130,246,0.06)]"
      />

      {/* Completion sweep overlay — only when isRead just flipped true. */}
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
                "linear-gradient(90deg, transparent, rgba(168,85,247,0.30), rgba(139,92,246,0.55), rgba(168,85,247,0.30), transparent)",
              mixBlendMode: "screen"
            }}
          />
        ) : null}
      </AnimatePresence>

      {/* Subtle persistent glow ring once read. */}
      {isRead ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            boxShadow: "inset 0 0 60px rgba(139, 92, 246, 0.18)"
          }}
        />
      ) : null}

      <div className="relative px-6 py-6 md:px-7 md:py-7">
        {/* Top meta row */}
        <header className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="inline-flex items-center gap-2 rounded-full border border-panel-border bg-[rgba(255,255,255,0.03)] px-2.5 py-1 uppercase tracking-[0.14em] text-ink-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-neon-400 shadow-[0_0_10px_rgba(139,92,246,0.85)]" />
            {quest.pillarId} · {quest.type}
          </span>

          <span
            aria-label={isRead ? "Read" : "Not yet read"}
            className={[
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-colors",
              isRead
                ? "border-[rgba(139,92,246,0.45)] bg-[rgba(139,92,246,0.14)] text-neon-300"
                : "border-panel-border bg-[rgba(255,255,255,0.03)] text-ink-2"
            ].join(" ")}
          >
            {isRead ? (
              <>
                <CheckIcon className="h-3 w-3" />
                Read
              </>
            ) : (
              <>New</>
            )}
          </span>
        </header>

        {/* Title */}
        <h2 className="mt-4 font-[var(--font-grotesk)] text-2xl leading-tight text-ink-0 md:text-[1.65rem]">
          {quest.title}
        </h2>

        {/* Question */}
        <section className="mt-5 flex items-start gap-3">
          <span
            aria-hidden
            className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[rgba(139,92,246,0.45)] bg-[rgba(139,92,246,0.12)] text-[11px] font-semibold text-neon-300"
          >
            Q
          </span>
          <p className="text-[15px] leading-relaxed text-ink-0 md:text-base">
            {quest.investorQuestion}
          </p>
        </section>

        {/* Answer (SEC/AI fills in) */}
        {!isCompact ? (
          <section className="mt-5">
            <SectionLabel>In plain English</SectionLabel>
            {resolvedAnswer ? (
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-1">
                {resolvedAnswer}
              </p>
            ) : (
              <div className="mt-2 rounded-xl border border-dashed border-panel-border bg-[rgba(255,255,255,0.02)] px-4 py-3 text-[13.5px] leading-relaxed text-ink-2">
                <span className="text-neon-300">Coming soon.</span>{" "}
                We&apos;ll surface a short, beginner-friendly summary here once
                the SEC filing is parsed.
              </div>
            )}
          </section>
        ) : null}

        {/* Why this matters */}
        {!isCompact ? (
          <section className="mt-5">
            <SectionLabel>
              <SparkleIcon className="h-3 w-3" /> Why this matters
            </SectionLabel>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-1">
              {quest.whyItMatters}
            </p>
          </section>
        ) : null}

        {/* Source */}
        {source ? (
          <p className="mt-6 text-[12px] uppercase tracking-[0.16em] text-ink-2">
            {source}
          </p>
        ) : null}

        {/* Divider + action row */}
        <div className="mt-5 border-t border-panel-border pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[12px] text-ink-2">
              {isRead
                ? "Card marked as read. Reading progress saved."
                : "Reading this card advances your reading progress."}
            </p>
            <MarkAsReadButton isRead={isRead} onClick={onMarkRead} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-ink-2">
      {children}
    </div>
  );
}

function MarkAsReadButton({
  isRead,
  onClick
}: {
  isRead: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      disabled={isRead}
      onClick={isRead ? undefined : onClick}
      whileHover={isRead ? undefined : { y: -1 }}
      whileTap={isRead ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      aria-pressed={isRead}
      aria-label={isRead ? "Card already marked as read" : "Mark this card as read"}
      className={[
        "relative inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/75 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(7,7,18,0.85)]",
        isRead
          ? "cursor-default border-[rgba(139,92,246,0.45)] bg-[rgba(139,92,246,0.18)] text-neon-300"
          : "cursor-pointer border-[rgba(139,92,246,0.50)] bg-[rgba(139,92,246,0.18)] text-neon-300 shadow-[0_0_24px_-8px_rgba(139,92,246,0.55)] hover:border-[rgba(168,85,247,0.70)] hover:bg-[rgba(139,92,246,0.26)] hover:text-white"
      ].join(" ")}
    >
      <AnimatePresence initial={false} mode="wait">
        {isRead ? (
          <motion.span
            key="read"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="inline-flex items-center gap-2"
          >
            <CheckIcon className="h-3.5 w-3.5" />
            Read
          </motion.span>
        ) : (
          <motion.span
            key="mark"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="inline-flex items-center gap-2"
          >
            Mark as Read
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M3 8.5l3 3 7-7.5" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M8 0.5l1.6 4.4 4.4 1.6-4.4 1.6L8 12.5 6.4 8.1 2 6.5l4.4-1.6L8 0.5zM13.5 11l.65 1.85L16 13.5l-1.85.65L13.5 16l-.65-1.85L11 13.5l1.85-.65L13.5 11z" />
    </svg>
  );
}
