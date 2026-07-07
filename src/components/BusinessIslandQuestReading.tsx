"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { PillarQuestTemplateFrame } from "@/components/BusinessQuestTemplateFrame";
import {
  islandQuizPassMessage,
  questCompleteHeadline
} from "@/components/quest/islandQuizPassMessages";
import {
  getPillarQuestTheme,
  resolveBusinessQuestTheme,
  type PillarQuestTheme
} from "@/components/quest/pillarQuestTheme";
import { QuestQuizPanel } from "@/components/QuestQuizPanel";
import { useGame } from "@/components/GameProvider";
import type { Company } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import type { QuestDefinition, QuestSubCard } from "@/data/quests/types";
import {
  hasPlayableQuizConfig,
  normalizeQuizConfig
} from "@/data/quests/types";
import { GeographicRevenueAnswer } from "@/components/geographic/GeographicRevenueAnswer";
import { ProductServiceAnswer } from "@/components/products/ProductServiceAnswer";
import { filterGeographicSupportBlocks } from "@/lib/geographicRevenue/filterSupportBlocks";
import { isGeographicRevenueCard } from "@/lib/geographicRevenue/isGeographicRevenueCard";
import { filterProductSupportBlocks } from "@/lib/productService/filterSupportBlocks";
import { isProductServiceCard } from "@/lib/productService/isProductServiceCard";
import { QuestQuizUnlockStatus } from "@/components/quest/QuestQuizUnlockStatus";
import { QuestSourceFooter } from "@/components/quest/QuestSourceFooter";
import { QuizUnlockedCtaButton } from "@/components/quest/QuizUnlockedCtaButton";
import { computeQuestCardReadProgress } from "@/lib/quests/questCardReadProgress";
import { useQuestProgressDebug } from "@/hooks/useQuestProgressDebug";
import {
  QUIZ_PAGER_READY_LABEL,
  QUIZ_PAGER_READY_TOOLTIP,
  quizPagerLockTooltip
} from "@/lib/quests/quizFlowCopy";
import { QuestCardAnswerShimmer } from "@/components/quest/QuestCardAnswerShimmer";
import { PillarQuestPipelineBanner } from "@/components/quest/PillarQuestPipelineBanner";
import type { PillarQuestPipelineState } from "@/components/QuestDetailScreen";
import { CompactFlashcardAnswer } from "@/components/quest/CompactFlashcardAnswer";
import { MARK_AS_READ_LABEL } from "@/lib/quests/gameActionCopy";
import {
  CONTROLLED_DEMO_MODE,
  useControlledDemoFastQuizHandoff
} from "@/lib/demo/controlledDemo";
import { parseRelatableQuestAnswer } from "@/lib/quests/questAnswerFormat";
import { islandQuizSectionTitle } from "@/lib/quests/islandQuizStyle";
import {
  isSchoolsBusinessQuestPath,
  isSchoolsDemoPath,
  resolveSchoolsLearnerHref
} from "@/lib/schools/schoolsDemoHref";
import { navigateSchoolsDemoMenuHref } from "@/lib/schools/navigateSchoolsDemoStep";
import {
  isSchoolsDemoPlaythroughActive,
} from "@/lib/schools/schoolsDemoPlaythrough";
import {
  markSchoolsHubCelebrateReturn,
  markSchoolsQuestSummaryExited,
  clearSchoolsQuestSummaryExited,
  resolveSchoolsCompletionPrideLine,
  resolveSchoolsQuestTakeaways,
  SCHOOLS_CARD_COMPLETE_XP,
  SCHOOLS_MICRO_XP_PER_CORRECT
} from "@/lib/schools/schoolsQuestRewardFlow";
import { BusinessInvestorPrincipleEvidenceFlow } from "@/components/business/investorFramework/BusinessInvestorPrincipleEvidenceFlow";
import { BusinessChecklistSectionQuizFlow } from "@/components/business/investorFramework/BusinessChecklistSectionQuizFlow";
import { InvestorEvidenceMarkAsReadButton } from "@/components/business/investorFramework/InvestorEvidenceMarkAsReadButton";
import { InvestorEvidenceReadCard } from "@/components/business/investorFramework/InvestorEvidenceReadCard";
import { InvestorQualityRatingScreen } from "@/components/business/investorQuality/InvestorQualityRatingScreen";
import { BusinessQuestChecklistLayout, useEvidenceFly } from "@/components/business/investorQuality/BusinessQuestChecklistLayout";
import { EvidenceFlyProvider } from "@/components/business/investorQuality/InvestorQualityEvidenceFlyover";
import {
  resolveCardChecklistItems,
  resolvePendingQuestRatingItems,
  resolveQuestEndRatingItems,
  resolveQuestEvidenceFromReadSlugs,
  type InvestorQualityChecklistItemId,
  type InvestorQualityRatingValue
} from "@/lib/business/investorQualityChecklist";
import {
  addChecklistEvidence,
  saveChecklistRatings,
  syncChecklistEvidenceFromReadSlugs
} from "@/lib/business/investorQualityChecklistStorage";
import {
  appendQuestSessionEvidence,
  markQuestRatingSubmitted,
  readQuestChecklistSession,
  writeQuestChecklistSession
} from "@/lib/business/investorQualityQuestSession";
import { useInvestorQualityChecklist } from "@/hooks/useInvestorQualityChecklist";
import { useBusinessChecklistProgress } from "@/hooks/useBusinessChecklistProgress";
import { isPrincipleEvidenceComplete } from "@/lib/business/businessInvestorEvidenceHelpers";
import {
  BUSINESS_SECTION_QUIZ_GLOW_EVENT,
  BUSINESS_SECTION_QUIZ_START_EVENT,
  isSectionPrinciplesEvidenceComplete
} from "@/lib/business/businessChecklistSectionQuizHelpers";
import { consumePendingChecklistSectionQuiz } from "@/lib/business/businessChecklistSectionQuizNavigation";
import { resolveInvestorEvidenceCards } from "@/lib/business/businessInvestorEvidenceCards";
import {
  canStartPrincipleEvidenceFlow,
  principleHasEvidenceCards,
  questSlugHasSectionEvidence,
  resolvePrincipleEvidenceTrigger,
  resolvePrincipleForQuestEvidenceTrigger,
  resolveSectionEvidencePrinciples
} from "@/lib/business/businessInvestorEvidenceFlowHelpers";
import {
  formatChecklistSectionHeading,
  resolveInvestorPrinciple,
  resolveSectionForQuest,
  type BusinessChecklistSectionId,
  type InvestorPrincipleId,
  type InvestorRollupRating
} from "@/lib/business/businessInvestorFramework";
import { BUSINESS_INVESTOR_FRAMEWORK_CHANGED_EVENT } from "@/lib/business/businessInvestorFrameworkStorage";
import { SCHOOLS_DEMO_RESET_EVENT } from "@/lib/schools/resetSchoolsDemoProgress";
import { hasSchoolsBusinessIslandHubEntered } from "@/lib/schools/schoolsBusinessIslandZoomEnter";

type AnswerBlock =
  | { kind: "prose"; text: string }
  | { kind: "titledBullets"; title: string; bullets: string[] }
  | { kind: "bulletsOnly"; bullets: string[] };

function cardSlug(parentSlug: string, cardId: string): string {
  return `${parentSlug}#${cardId}`;
}

function isBulletLine(line: string): boolean {
  return /^\s*[•\-\*\u2022]\s*\S/.test(line);
}

function stripBullet(line: string): string {
  return line.replace(/^\s*[•\-\*\u2022]\s*/, "").trim();
}

function extractSimpleVersion(text: string): { main: string; simple?: string } {
  const re = /\n\s*(?:Simple version|Simple Version)\s*:?\s*\n([\s\S]+)$/i;
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

export function parseAnswerToBlocks(fullText: string): {
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

function splitIntoSentences(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  const parts = normalized
    .split(/(?<=[.!?])\s+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  return parts.length > 0 ? parts : [normalized];
}

function trimAnswerToShortSentences(text: string, maxSentences: number): string {
  const s = splitIntoSentences(text);
  if (s.length === 0) return "";
  const n = s.length === 1 ? 1 : Math.min(maxSentences, s.length);
  return s.slice(0, n).join(" ");
}

function compactParagraphsFromBlocks(blocks: AnswerBlock[]): string[] {
  const parts: string[] = [];
  for (const b of blocks) {
    if (b.kind === "prose") parts.push(b.text);
    else if (b.kind === "bulletsOnly") parts.push(b.bullets.join(". "));
    else parts.push(`${b.title.replace(/\s*:\s*$/, "")}: ${b.bullets.join(". ")}`);
  }
  const combined = parts.join(" ").replace(/\s+/g, " ").trim();
  if (!combined) return [];
  return splitIntoSentences(combined).slice(0, 2);
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

function businessPixelAnswerSentences(
  plainEnglishAnswer: string | null | undefined,
  investorInsight?: string | null,
  parsed?: { blocks: AnswerBlock[]; simple?: string }
): string[] {
  const relatable = parseRelatableQuestAnswer(
    plainEnglishAnswer,
    investorInsight
  );
  if (relatable?.paragraphs.length) {
    const combined = relatable.paragraphs.join(" ");
    return splitIntoSentences(trimAnswerToShortSentences(combined, 2));
  }
  if (parsed) {
    const fromBlocks = flattenAnswerBlocksToPlain(parsed.blocks);
    if (fromBlocks) return splitIntoSentences(trimAnswerToShortSentences(fromBlocks, 2));
    const sim = parsed.simple?.trim();
    if (sim) return splitIntoSentences(trimAnswerToShortSentences(sim, 2));
  }
  return [];
}

function displaySectionTitle(raw: string): string {
  return raw.replace(/\s*:\s*$/, "").trim();
}

function whyParagraphs(whyItMatters: string): string[] {
  const byBreak = whyItMatters
    .split(/\n{2,}/g)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  if (byBreak.length > 1) return byBreak;
  const one = whyItMatters.trim();
  if (!one) return [];
  return splitIntoSentences(one);
}

function BusinessTemplateAnswerSlot({
  plainEnglishAnswer,
  investorInsight,
  parsed,
  theme,
  companyTicker,
  showGeographicMap,
  showProductVisual,
  isLoading,
  answerEmphasized = false
}: {
  plainEnglishAnswer?: string | null;
  investorInsight?: string | null;
  parsed: { blocks: AnswerBlock[]; simple?: string };
  theme: PillarQuestTheme;
  companyTicker?: string;
  showGeographicMap?: boolean;
  showProductVisual?: boolean;
  isLoading?: boolean;
  answerEmphasized?: boolean;
}) {
  const relatable = useMemo(
    () =>
      parseRelatableQuestAnswer(
        plainEnglishAnswer,
        CONTROLLED_DEMO_MODE ? null : investorInsight
      ),
    [plainEnglishAnswer, investorInsight]
  );

  const supportParsed = useMemo(() => {
    let blocks = parsed.blocks;
    if (showGeographicMap) {
      blocks = filterGeographicSupportBlocks(blocks);
    }
    if (showProductVisual) {
      blocks = filterProductSupportBlocks(blocks);
    }
    return { ...parsed, blocks };
  }, [parsed, showGeographicMap, showProductVisual]);

  const pixelSentences = useMemo(
    () =>
      businessPixelAnswerSentences(
        plainEnglishAnswer,
        CONTROLLED_DEMO_MODE ? null : investorInsight,
        supportParsed
      ),
    [plainEnglishAnswer, investorInsight, supportParsed]
  );

  const simple = supportParsed.simple?.trim();
  const hasBlocks = supportParsed.blocks.length > 0;

  const compactParagraphs = useMemo(() => {
    if (relatable?.paragraphs.length) return relatable.paragraphs;
    if (simple) return [simple];
    if (hasBlocks) return compactParagraphsFromBlocks(supportParsed.blocks);
    if (pixelSentences.length > 0) return pixelSentences;
    return [];
  }, [relatable, simple, hasBlocks, supportParsed.blocks, pixelSentences]);

  if (isLoading) {
    return <QuestCardAnswerShimmer label="Drafting your plain-English answer…" />;
  }

  const textFallback =
    compactParagraphs.length > 0 ? (
      <CompactFlashcardAnswer
        paragraphs={compactParagraphs}
        takeaway={relatable?.takeaway}
        supporting={relatable?.supporting}
        supportChunks={relatable?.supportChunks}
        lesson={relatable?.lesson}
        theme={theme}
        emphasized={answerEmphasized}
      />
    ) : null;

  if (showGeographicMap && companyTicker) {
    return (
      <GeographicRevenueAnswer
        ticker={companyTicker}
        theme={theme}
        supportBody={textFallback}
      />
    );
  }

  if (showProductVisual && companyTicker) {
    return (
      <ProductServiceAnswer
        ticker={companyTicker}
        theme={theme}
        supportBody={textFallback}
      />
    );
  }

  return textFallback;
}

function MarkAsReadGlowWrap({
  isRead,
  theme,
  children
}: {
  isRead: boolean;
  theme: PillarQuestTheme;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="relative rounded-2xl p-[1px]"
      animate={
        isRead
          ? { boxShadow: `0 0 0 0 ${theme.markReadPulse}` }
          : {
              boxShadow: [
                `0 0 0 0 ${theme.markReadPulse}`,
                `0 0 0 5px ${theme.markReadPulse}`,
                `0 0 0 0 ${theme.markReadPulse}`
              ]
            }
      }
      transition={
        isRead
          ? { duration: 0.3 }
          : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
      }
    >
      {children}
    </motion.div>
  );
}

function MarkAsReadCheckbox({
  isRead,
  onClick,
  allowToggle,
  theme
}: {
  isRead: boolean;
  onClick: () => void;
  allowToggle?: boolean;
  theme: PillarQuestTheme;
}) {
  const isMission = theme.cardChrome === "mission";
  const GREEN_HI = "#22C58B";
  const GREEN_BORDER = "rgba(34, 197, 139, 0.55)";
  const showReadLabel = !(isMission && isRead);

  return (
    <motion.button
      type="button"
      onClick={isRead && !allowToggle ? undefined : onClick}
      disabled={isRead && !allowToggle}
      aria-pressed={isRead}
      aria-label={
        isRead
          ? allowToggle
            ? "Unmark this card as read"
            : "Card already marked as read"
          : "Mark this card as read"
      }
      whileHover={isRead && !allowToggle ? undefined : { y: -1 }}
      whileTap={isRead && !allowToggle ? undefined : { scale: 0.98 }}
      animate={
        isMission && isRead
          ? {
              scale: [1, 1.04, 1],
              borderColor: GREEN_BORDER,
              background: "rgba(34,197,139,0.14)"
            }
          : { scale: 1 }
      }
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={
        isMission && !isRead
          ? "iq-schools-mission-cta group relative inline-flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-black uppercase tracking-[0.08em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/75"
          : isMission && isRead
            ? "group relative inline-flex items-center justify-center rounded-full border-2 p-2.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/75"
            : "group relative inline-flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-[13.5px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/75"
      }
      style={
        isMission && !isRead
          ? { cursor: "pointer" }
          : isMission && isRead
            ? {
                borderColor: GREEN_BORDER,
                color: GREEN_HI,
                cursor: allowToggle ? "pointer" : "default",
                boxShadow: "0 0 18px -6px rgba(34,197,139,0.45)"
              }
            : {
                borderColor: isRead ? GREEN_BORDER : theme.border,
                background: isRead ? "rgba(34,197,139,0.10)" : `${theme.glowSoft}`,
                color: isRead ? GREEN_HI : theme.hi,
                cursor: isRead && !allowToggle ? "default" : "pointer",
                boxShadow: isRead
                  ? "0 0 24px -10px rgba(34,197,139,0.55)"
                  : `0 0 24px -10px ${theme.glow}`
              }
      }
    >
      {!isMission || isRead ? (
        <motion.span
          aria-hidden
          key={isRead ? "read" : "unread"}
          initial={isMission && isRead ? { scale: 0.6, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          className="flex h-5 w-5 items-center justify-center rounded-md border text-[11px]"
          style={{
            borderColor: isRead ? GREEN_BORDER : theme.border,
            background: isRead ? "rgba(34,197,139,0.15)" : theme.glowSoft
          }}
        >
          {isRead ? "✓" : ""}
        </motion.span>
      ) : null}
      {showReadLabel ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isRead ? "read-label" : "mark-label"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
          >
            {MARK_AS_READ_LABEL}
          </motion.span>
        </AnimatePresence>
      ) : null}
    </motion.button>
  );
}

function ChecklistSectionHeader({
  title,
  theme
}: {
  title: string;
  theme: PillarQuestTheme;
}) {
  const isMission = theme.cardChrome === "mission";
  return (
    <div
      className="mx-auto mb-5 max-w-2xl text-center sm:mb-6"
      data-checklist-section-title
    >
      <h1
        className="iq-business-checklist-section-title font-[var(--font-grotesk)] text-[clamp(1.12rem,2.6vw,1.45rem)] font-bold leading-snug tracking-[0.01em] sm:text-[1.5rem]"
        style={
          isMission
            ? undefined
            : {
                color: theme.hi
              }
        }
      >
        {title}
      </h1>
    </div>
  );
}

function MissionNavButton({
  enabled,
  onClick,
  theme,
  highlighted = false,
  children
}: {
  enabled: boolean;
  onClick: () => void;
  theme: PillarQuestTheme;
  highlighted?: boolean;
  children: ReactNode;
}) {
  const isMission = theme.cardChrome === "mission";

  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={onClick}
      className={
        isMission
          ? [
              "iq-schools-mission-nav-btn px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] transition disabled:cursor-not-allowed sm:px-4 sm:py-2 sm:text-[11px]",
              highlighted && enabled ? "iq-schools-mission-nav-btn--ready" : ""
            ].join(" ")
          : "rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition disabled:cursor-not-allowed disabled:opacity-35"
      }
      style={
        isMission
          ? undefined
          : {
              borderColor: theme.border,
              color: theme.hi,
              background: enabled ? theme.glowSoft : "transparent"
            }
      }
    >
      {children}
    </button>
  );
}

function BusinessCardPager({
  index,
  total,
  onPrev,
  onNext,
  onStartQuiz,
  quizReady,
  hasQuiz,
  missingCardCount,
  theme,
  nextHighlighted = false
}: {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onStartQuiz?: () => void;
  quizReady: boolean;
  hasQuiz: boolean;
  missingCardCount: number;
  theme: PillarQuestTheme;
  nextHighlighted?: boolean;
}) {
  const isMission = theme.cardChrome === "mission";
  const canPrev = index > 0;
  const onLastCard = index >= total - 1;
  const showQuizHandoff = onLastCard && hasQuiz;

  if (showQuizHandoff) {
    return (
      <nav
        className="mx-auto mt-5 flex max-w-2xl flex-col items-center gap-2"
        aria-label="Quest card navigation"
      >
        <div
          className={
            isMission
              ? "iq-schools-mission-nav-group flex w-full max-w-md items-center justify-between"
              : "flex w-full items-center justify-between gap-3"
          }
        >
          <MissionNavButton enabled={canPrev} onClick={onPrev} theme={theme}>
            ← Previous
          </MissionNavButton>
          <span
            className={
              isMission
                ? "iq-schools-mission-nav-group__count"
                : "text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-2"
            }
          >
            {index + 1} / {total}
          </span>
          <QuizUnlockedCtaButton
            unlocked={quizReady}
            onClick={onStartQuiz}
            theme={theme}
            label="QUIZ UNLOCKED"
            lockedLabel="COMPLETE ALL CARDS TO UNLOCK"
            lockedTitle={quizPagerLockTooltip(missingCardCount)}
          />
        </div>
        {!quizReady && missingCardCount > 0 ? (
          <p
            className={
              isMission
                ? "iq-schools-ocean-muted-text text-center text-[11.5px] font-medium leading-snug"
                : "text-center text-[11.5px] leading-snug text-ink-2"
            }
          >
            You still need to complete {missingCardCount} card
            {missingCardCount === 1 ? "" : "s"} — mark each card as read above.
          </p>
        ) : null}
      </nav>
    );
  }

  const canNext = index < total - 1;

  return (
    <nav
      className="mx-auto mt-5 flex max-w-2xl justify-center"
      aria-label="Quest card navigation"
    >
      <div
        className={
          isMission
            ? "iq-schools-mission-nav-group inline-flex items-center"
            : "flex items-center gap-3"
        }
      >
        <MissionNavButton enabled={canPrev} onClick={onPrev} theme={theme}>
          ← Previous
        </MissionNavButton>
        <span
          className={
            isMission
              ? "iq-schools-mission-nav-group__count"
              : "text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-2"
          }
        >
          {index + 1} / {total}
        </span>
        <MissionNavButton
          enabled={canNext}
          onClick={onNext}
          theme={theme}
          highlighted={nextHighlighted}
        >
          Next →
        </MissionNavButton>
      </div>
    </nav>
  );
}

export type BusinessIslandQuestReadingProps = {
  quest: QuestDefinition;
  /** Hub slot order — used for “Quest N: Title” reveal inside the quest. */
  questOrderNumber: number;
  company: Company;
  pillarId: PillarId;
  slug: string;
  cards: readonly QuestSubCard[];
  cardReadFlags: boolean[];
  /** Engine read slugs for this pillar (includes `slug#card-id` composites). */
  readQuestSlugs: readonly string[];
  /** True only when every sub-card is marked read (not parent slug alone). */
  allCardsRead: boolean;
  source: string | null;
  onMarkRead: (markSlug: string) => void;
  onMarkUnread: (markSlug: string) => void;
  /** Fires when the visible card changes (reading analytics). */
  onCardView?: (cardId: string | null, cardIndex: number) => void;
  onQuizScreenChange?: (
    onQuizScreen: boolean,
    progress?: { current: number; total: number }
  ) => void;
  nextQuest?: { href: string; label: string };
  islandFinaleCta?: { href: string; label: string };
  questPipeline?: PillarQuestPipelineState;
  /** @deprecated Use questPipeline */
  financialPipeline?: PillarQuestPipelineState;
};

export function BusinessIslandQuestReading(
  props: BusinessIslandQuestReadingProps
) {
  return (
    <EvidenceFlyProvider>
      <BusinessIslandQuestReadingInner {...props} />
    </EvidenceFlyProvider>
  );
}

function BusinessIslandQuestReadingInner(
  props: BusinessIslandQuestReadingProps
) {
  const {
    quest,
    company,
    pillarId,
    slug,
    cards,
    cardReadFlags,
    readQuestSlugs,
    allCardsRead,
    source,
    onMarkRead,
    onMarkUnread,
    onCardView,
    onQuizScreenChange,
    nextQuest,
    islandFinaleCta,
    questPipeline: questPipelineProp,
    financialPipeline
  } = props;
  const questPipeline = questPipelineProp ?? financialPipeline;
  const questProgressDebug = useQuestProgressDebug();
  const pathname = usePathname();
  const router = useRouter();
  const { actions, raw } = useGame();
  const schoolsRewardFlow = isSchoolsBusinessQuestPath(pathname);
  const questCompleted =
    raw.companies[raw.activeCompanyId]?.pillars[pillarId]?.completedQuestSlugs.includes(
      slug
    ) ?? false;

  const theme = resolveBusinessQuestTheme(pillarId, pathname);
  // Host / demo / testing needs reversible progress to reset flows quickly.
  // Enable in non-production by default, and also when explicitly requested via query params.
  const allowReadToggle =
    process.env.NODE_ENV !== "production" ||
    questProgressDebug ||
    (schoolsRewardFlow && isSchoolsDemoPlaythroughActive());
  const [cardIndex, setCardIndex] = useState(0);
  const [screen, setScreen] = useState<
    "cards" | "quality-check" | "quiz" | "section-quiz"
  >("cards");
  const [evidenceFrameworkTick, setEvidenceFrameworkTick] = useState(0);
  /** Active principle evidence gate — set on mark-read or auto-chained unlock. */
  const [activeEvidencePrincipleId, setActiveEvidencePrincipleId] =
    useState<InvestorPrincipleId | null>(null);
  /** Keep evidence flow mounted through principle-complete / unlock panels. */
  const [evidenceFlowSessionActive, setEvidenceFlowSessionActive] = useState(false);
  const [highlightPrincipleId, setHighlightPrincipleId] = useState<string | null>(
    null
  );
  const [highlightSectionQuizId, setHighlightSectionQuizId] = useState<
    BusinessChecklistSectionId | null
  >(null);
  const [quizSessionKey, setQuizSessionKey] = useState(0);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [continueHint, setContinueHint] = useState(false);
  const [pulseChecklistItems, setPulseChecklistItems] = useState<
    InvestorQualityChecklistItemId[]
  >([]);
  const [sessionEvidenceItems, setSessionEvidenceItems] = useState<
    InvestorQualityChecklistItemId[]
  >([]);
  const [questRatingSubmitted, setQuestRatingSubmitted] = useState(false);
  const prevQuestCompletedRef = useRef(questCompleted);
  const markReadAnchorRef = useRef<HTMLDivElement>(null);
  const evidenceFly = useEvidenceFly();
  /** Q → SHOW ME → A reveal for every Business quest card (same flow as Quest 1). */
  const useAnswerReveal = pillarId === "business";
  const quiz = useMemo(
    () => normalizeQuizConfig(quest.quizConfig),
    [quest.quizConfig]
  );
  const hasQuiz = hasPlayableQuizConfig(quiz);
  const readProgress = useMemo(
    () =>
      computeQuestCardReadProgress({
        parentSlug: slug,
        cards,
        readQuestSlugs,
        quizConfig: quest.quizConfig
      }),
    [slug, cards, readQuestSlugs, quest.quizConfig]
  );
  const checklistQuestProgressPct = useMemo(() => {
    if (questCompleted) return 100;
    if (readProgress.cardsRequired <= 0) return 0;
    return Math.round(
      (readProgress.cardsRead / readProgress.cardsRequired) * 100
    );
  }, [questCompleted, readProgress.cardsRead, readProgress.cardsRequired]);
  const missingCardCount = readProgress.missingCardIds.length;
  const quizReady = readProgress.quizUnlocked;
  const isMissionCard = theme.cardChrome === "mission";
  const cardsReadCount = cardReadFlags.filter(Boolean).length;
  const companyId = raw.activeCompanyId;
  const checklistEnabled = pillarId === "business";
  const checklistSectionDef = useMemo(() => resolveSectionForQuest(slug), [slug]);
  const usesChecklistSectionQuiz = checklistEnabled && checklistSectionDef != null;
  const showLegacyQuestQuiz = hasQuiz && !usesChecklistSectionQuiz;
  const { snapshot: checklistSnapshot, refresh: refreshChecklistSnapshot } =
    useInvestorQualityChecklist(companyId);
  const { refresh: refreshFrameworkChecklist } = useBusinessChecklistProgress({
    companyId,
    currentQuestSlug: slug,
    currentQuestProgressPct: checklistQuestProgressPct
  });

  const highlightSectionQuizRow = useCallback((sectionId: BusinessChecklistSectionId) => {
    setHighlightSectionQuizId(sectionId);
    window.dispatchEvent(
      new CustomEvent(BUSINESS_SECTION_QUIZ_GLOW_EVENT, {
        detail: { sectionId }
      })
    );
    window.setTimeout(() => setHighlightSectionQuizId(null), 3200);
  }, []);

  const startSectionQuizFlow = useCallback(
    (sectionId: BusinessChecklistSectionId) => {
      setScreen("section-quiz");
      highlightSectionQuizRow(sectionId);
    },
    [highlightSectionQuizRow]
  );

  const questEvidenceItems = useMemo(() => {
    if (!checklistEnabled) return [] as InvestorQualityChecklistItemId[];
    if (sessionEvidenceItems.length > 0) return sessionEvidenceItems;
    return resolveQuestEvidenceFromReadSlugs(slug, readQuestSlugs);
  }, [checklistEnabled, sessionEvidenceItems, slug, readQuestSlugs]);

  const pendingRatingItems = useMemo(() => {
    if (!checklistEnabled || questRatingSubmitted) return [];
    let pending = resolvePendingQuestRatingItems(slug, questEvidenceItems);
    if (pending.length === 0 && schoolsRewardFlow) {
      const endItems = resolveQuestEndRatingItems(slug);
      const hasQuestReads = readQuestSlugs.some(
        (markSlug) => markSlug === slug || markSlug.startsWith(`${slug}#`)
      );
      if (endItems.length > 0 && hasQuestReads) {
        pending = endItems.filter((id) => questEvidenceItems.includes(id));
        if (pending.length === 0) pending = [...endItems];
      }
    }
    return pending;
  }, [
    checklistEnabled,
    questRatingSubmitted,
    slug,
    questEvidenceItems,
    schoolsRewardFlow,
    readQuestSlugs
  ]);

  const sectionEvidencePrinciples = useMemo(
    () =>
      checklistSectionDef
        ? resolveSectionEvidencePrinciples(checklistSectionDef.id)
        : [],
    [checklistSectionDef]
  );

  const questHasSectionEvidence = useMemo(
    () => questSlugHasSectionEvidence(company.id, slug),
    [company.id, slug]
  );

  const resolvedActiveEvidencePrinciple = useMemo((): InvestorPrincipleId | null => {
    void evidenceFrameworkTick;
    if (!checklistEnabled || !questHasSectionEvidence) return null;
    for (const principleId of sectionEvidencePrinciples) {
      if (!canStartPrincipleEvidenceFlow(company.id, principleId)) continue;
      const trigger = resolvePrincipleEvidenceTrigger(principleId);
      if (!trigger) continue;
      const cardIdx = cards.findIndex((card) => card.id === trigger.cardId);
      if (cardIdx >= 0 && cardReadFlags[cardIdx] === true) {
        return principleId;
      }
    }
    return null;
  }, [
    checklistEnabled,
    questHasSectionEvidence,
    sectionEvidencePrinciples,
    company.id,
    cards,
    cardReadFlags,
    evidenceFrameworkTick
  ]);

  const effectiveEvidencePrincipleId =
    activeEvidencePrincipleId ?? resolvedActiveEvidencePrinciple;

  const evidenceGateActive = useMemo(() => {
    void evidenceFrameworkTick;
    if (!checklistEnabled || !questHasSectionEvidence) return false;
    if (!effectiveEvidencePrincipleId) return false;
    const principleComplete = isPrincipleEvidenceComplete(
      company.id,
      effectiveEvidencePrincipleId
    );
    if (!principleComplete) return true;
    return (
      evidenceFlowSessionActive &&
      activeEvidencePrincipleId === effectiveEvidencePrincipleId
    );
  }, [
    checklistEnabled,
    questHasSectionEvidence,
    company.id,
    effectiveEvidencePrincipleId,
    activeEvidencePrincipleId,
    evidenceFlowSessionActive,
    evidenceFrameworkTick
  ]);

  const skipReadForActivePrincipleFirstCard = useMemo(() => {
    if (!effectiveEvidencePrincipleId) return false;
    const trigger = resolvePrincipleEvidenceTrigger(effectiveEvidencePrincipleId);
    if (!trigger || trigger.questSlug !== slug) return false;
    const cardIdx = cards.findIndex((card) => card.id === trigger.cardId);
    return cardIdx >= 0 && cardReadFlags[cardIdx] === true;
  }, [effectiveEvidencePrincipleId, slug, cards, cardReadFlags]);

  useEffect(() => {
    const bumpFramework = () => setEvidenceFrameworkTick((tick) => tick + 1);
    window.addEventListener(BUSINESS_INVESTOR_FRAMEWORK_CHANGED_EVENT, bumpFramework);
    window.addEventListener("storage", bumpFramework);
    return () => {
      window.removeEventListener(
        BUSINESS_INVESTOR_FRAMEWORK_CHANGED_EVENT,
        bumpFramework
      );
      window.removeEventListener("storage", bumpFramework);
    };
  }, []);

  useEffect(() => {
    const onStartSectionQuiz = (event: Event) => {
      const detail = (
        event as CustomEvent<{ sectionId?: BusinessChecklistSectionId; questSlug?: string }>
      ).detail;
      if (detail?.questSlug !== slug || !detail.sectionId) return;
      startSectionQuizFlow(detail.sectionId);
    };
    window.addEventListener(BUSINESS_SECTION_QUIZ_START_EVENT, onStartSectionQuiz);
    return () =>
      window.removeEventListener(BUSINESS_SECTION_QUIZ_START_EVENT, onStartSectionQuiz);
  }, [slug, startSectionQuizFlow]);

  useEffect(() => {
    if (!usesChecklistSectionQuiz || !checklistSectionDef) return;
    const pendingSectionId = consumePendingChecklistSectionQuiz();
    if (pendingSectionId && pendingSectionId === checklistSectionDef.id) {
      startSectionQuizFlow(pendingSectionId);
    }
  }, [usesChecklistSectionQuiz, checklistSectionDef, startSectionQuizFlow]);

  const handleEvidenceFlowSaved = useCallback(() => {
    refreshFrameworkChecklist();
    setEvidenceFrameworkTick((tick) => tick + 1);
  }, [refreshFrameworkChecklist]);

  const handleEvidenceFlowComplete = useCallback(
    ({
      unlockedPrincipleId
    }: {
      overallRating: InvestorRollupRating;
      unlockedPrincipleId: InvestorPrincipleId | null;
    }) => {
      handleEvidenceFlowSaved();
      if (unlockedPrincipleId) {
        setHighlightPrincipleId(unlockedPrincipleId);
        setActiveEvidencePrincipleId(unlockedPrincipleId);
        setEvidenceFlowSessionActive(true);
        window.setTimeout(() => setHighlightPrincipleId(null), 3200);
      } else {
        setActiveEvidencePrincipleId(null);
        setEvidenceFlowSessionActive(false);
        if (
          checklistSectionDef &&
          isSectionPrinciplesEvidenceComplete(company.id, checklistSectionDef.id)
        ) {
          highlightSectionQuizRow(checklistSectionDef.id);
        }
      }
      setEvidenceFrameworkTick((tick) => tick + 1);
    },
    [handleEvidenceFlowSaved, checklistSectionDef, company.id, highlightSectionQuizRow]
  );

  const handleMarkRead = useCallback(
    (markSlug: string) => {
      const wasRead = readQuestSlugs.includes(markSlug);
      const cardId = markSlug.includes("#")
        ? markSlug.split("#")[1]!
        : cards[cardIndex]?.id ?? "card-1";
      onMarkRead(markSlug);

      if (checklistEnabled && !wasRead) {
        const items = resolveCardChecklistItems(slug, cardId);
        if (items.length > 0) {
          const { addedItems } = addChecklistEvidence(companyId, slug, cardId, items);
          if (addedItems.length > 0) {
            const merged = appendQuestSessionEvidence(companyId, slug, addedItems);
            setSessionEvidenceItems(merged);
            refreshChecklistSnapshot();

            const celebrateEvidence = () => {
              setPulseChecklistItems(addedItems);
              window.setTimeout(() => {
                setPulseChecklistItems((current) =>
                  current.length > 0 ? [] : current
                );
              }, 2600);
            };

            const fromEl = markReadAnchorRef.current;
            if (evidenceFly && fromEl) {
              evidenceFly.triggerFly(fromEl, addedItems, celebrateEvidence);
            } else {
              celebrateEvidence();
            }
          }
        }

        const triggeredPrinciple = resolvePrincipleForQuestEvidenceTrigger(
          slug,
          cardId
        );
        if (
          triggeredPrinciple &&
          canStartPrincipleEvidenceFlow(company.id, triggeredPrinciple)
        ) {
          setActiveEvidencePrincipleId(triggeredPrinciple);
          setEvidenceFlowSessionActive(true);
          setEvidenceFrameworkTick((tick) => tick + 1);
        }
      }

      const triggeredPrinciple = resolvePrincipleForQuestEvidenceTrigger(slug, cardId);
      const launchesEvidenceGate =
        checklistEnabled &&
        questHasSectionEvidence &&
        !wasRead &&
        triggeredPrinciple != null &&
        canStartPrincipleEvidenceFlow(company.id, triggeredPrinciple);

      if (schoolsRewardFlow && isMissionCard && !launchesEvidenceGate) {
        setContinueHint(true);
        window.setTimeout(() => setContinueHint(false), 3200);
      }
    },
    [
      onMarkRead,
      schoolsRewardFlow,
      isMissionCard,
      checklistEnabled,
      readQuestSlugs,
      slug,
      companyId,
      cards,
      cardIndex,
      refreshChecklistSnapshot,
      evidenceFly,
      company.id,
      questHasSectionEvidence
    ]
  );

  /** Quest slug change — reset card flow only (not on hydration-driven companyId ticks). */
  useEffect(() => {
    setCardIndex(0);
    setScreen("cards");
    setAnswerRevealed(false);
    setPulseChecklistItems([]);
    setActiveEvidencePrincipleId(null);
    setEvidenceFlowSessionActive(false);
    setHighlightSectionQuizId(null);
    if (schoolsRewardFlow) {
      clearSchoolsQuestSummaryExited(slug);
    }
  }, [slug, schoolsRewardFlow]);

  /** Session + checklist evidence — sync without clobbering evidence rating screen. */
  useEffect(() => {
    if (!checklistEnabled) {
      setSessionEvidenceItems([]);
      setQuestRatingSubmitted(false);
      return;
    }
    const session = readQuestChecklistSession(companyId, slug);
    const rebuilt = resolveQuestEvidenceFromReadSlugs(slug, readQuestSlugs);
    const evidenceItems =
      session.evidenceItems.length > 0 ? session.evidenceItems : rebuilt;
    if (session.evidenceItems.length === 0 && rebuilt.length > 0) {
      writeQuestChecklistSession(companyId, slug, {
        evidenceItems: rebuilt,
        ratingSubmitted: session.ratingSubmitted
      });
    }
    setSessionEvidenceItems(evidenceItems);
    setQuestRatingSubmitted(session.ratingSubmitted);
  }, [slug, checklistEnabled, companyId, readQuestSlugs]);

  /** Keep checklist evidence aligned with engine read slugs (fixes stale bars after reset). */
  useEffect(() => {
    if (!checklistEnabled) return;
    syncChecklistEvidenceFromReadSlugs(companyId, readQuestSlugs);
    refreshChecklistSnapshot();
  }, [checklistEnabled, companyId, readQuestSlugs, refreshChecklistSnapshot]);

  useEffect(() => {
    const onDemoReset = () => {
      setPulseChecklistItems([]);
      setSessionEvidenceItems([]);
      setQuestRatingSubmitted(false);
      setHighlightPrincipleId(null);
      setActiveEvidencePrincipleId(null);
      setEvidenceFlowSessionActive(false);
      setHighlightSectionQuizId(null);
      setEvidenceFrameworkTick((tick) => tick + 1);
      refreshChecklistSnapshot();
      refreshFrameworkChecklist();
    };
    window.addEventListener(SCHOOLS_DEMO_RESET_EVENT, onDemoReset);
    return () => window.removeEventListener(SCHOOLS_DEMO_RESET_EVENT, onDemoReset);
  }, [refreshChecklistSnapshot, refreshFrameworkChecklist]);

  useEffect(() => {
    setContinueHint(false);
  }, [cardIndex, slug]);

  useEffect(() => {
    const wasComplete = prevQuestCompletedRef.current;
    prevQuestCompletedRef.current = questCompleted;
    // Only leave the quiz screen when completion is cleared mid-retest — not when opening the quiz.
    if (wasComplete && !questCompleted && screen === "quiz") {
      setScreen("cards");
    }
  }, [questCompleted, screen]);

  useEffect(() => {
    if (!useAnswerReveal) return;
    const idx = Math.min(cardIndex, Math.max(cards.length - 1, 0));
    setAnswerRevealed(cardReadFlags[idx] ?? false);
  }, [useAnswerReveal, cardIndex, cardReadFlags, cards.length]);

  useEffect(() => {
    if (!onCardView) return;
    if (cards.length > 0) {
      const idx = Math.min(cardIndex, cards.length - 1);
      onCardView(cards[idx]?.id ?? null, idx);
    } else {
      onCardView(null, 0);
    }
  }, [slug, cardIndex, cards, onCardView]);

  const fastQuizHandoff = useControlledDemoFastQuizHandoff();

  const handleStartQuiz = useCallback(() => {
    if (!showLegacyQuestQuiz) return;
    setQuizSessionKey((key) => key + 1);
    setScreen("quiz");
  }, [showLegacyQuestQuiz]);

  const handleSectionQuizPassed = useCallback(() => {
    refreshFrameworkChecklist();
    refreshChecklistSnapshot();
    setEvidenceFrameworkTick((tick) => tick + 1);
  }, [refreshFrameworkChecklist, refreshChecklistSnapshot]);

  const handleQualityCheckSubmit = useCallback(
    (ratings: Partial<
      Record<InvestorQualityChecklistItemId, InvestorQualityRatingValue>
    >) => {
      saveChecklistRatings(companyId, slug, ratings);
      markQuestRatingSubmitted(companyId, slug);
      setQuestRatingSubmitted(true);
      refreshChecklistSnapshot();
    },
    [companyId, slug, refreshChecklistSnapshot]
  );

  // Removed mastery interstitial — keep momentum (cards → quiz).

  useEffect(() => {
    if (screen !== "quiz" && screen !== "quality-check") {
      onQuizScreenChange?.(false);
    }
  }, [screen, onQuizScreenChange]);

  const handleQuizPlayingProgress = useCallback(
    (progress: { current: number; total: number } | null) => {
      if (screen !== "quiz") return;
      onQuizScreenChange?.(progress !== null, progress ?? undefined);
    },
    [screen, onQuizScreenChange]
  );

  const handleSchoolsBackToIsland = useCallback(() => {
    markSchoolsHubCelebrateReturn();
    markSchoolsQuestSummaryExited(slug);

    const hubPath = hasSchoolsBusinessIslandHubEntered()
      ? "/schools/map"
      : "/schools/business";

    if (isSchoolsDemoPath(pathname)) {
      navigateSchoolsDemoMenuHref(hubPath, pathname, router);
    } else {
      router.push(resolveSchoolsLearnerHref(hubPath, pathname));
    }
  }, [pathname, router, slug]);

  const handleSectionQuizFinished = useCallback(() => {
    if (schoolsRewardFlow) {
      handleSchoolsBackToIsland();
      return;
    }
    setScreen("cards");
  }, [schoolsRewardFlow, handleSchoolsBackToIsland]);

  /** After quiz pass — quality check (if needed), then return to hub. */
  const handleSchoolsQuizPassed = useCallback(
    (_result: { correct: number; total: number }) => {
      if (
        checklistEnabled &&
        pendingRatingItems.length > 0 &&
        !questRatingSubmitted
      ) {
        setScreen("quality-check");
        return;
      }
      if (!questCompleted) {
        actions.completeQuest(pillarId, slug);
      }
      handleSchoolsBackToIsland();
    },
    [
      checklistEnabled,
      pendingRatingItems.length,
      questRatingSubmitted,
      handleSchoolsBackToIsland,
      questCompleted,
      actions,
      pillarId,
      slug
    ]
  );

  const handleQualityCheckComplete = useCallback(
    (ratings: Partial<
      Record<InvestorQualityChecklistItemId, InvestorQualityRatingValue>
    >) => {
      handleQualityCheckSubmit(ratings);
      if (!questCompleted) {
        actions.completeQuest(pillarId, slug);
      }
      handleSchoolsBackToIsland();
    },
    [
      handleQualityCheckSubmit,
      handleSchoolsBackToIsland,
      questCompleted,
      actions,
      pillarId,
      slug
    ]
  );

  /** Quality check with nothing to rate — return to hub. */
  useEffect(() => {
    if (screen !== "quality-check" || !checklistEnabled) return;
    if (pendingRatingItems.length > 0) return;
    handleSchoolsBackToIsland();
  }, [
    screen,
    checklistEnabled,
    pendingRatingItems.length,
    handleSchoolsBackToIsland
  ]);

  const cardView = useMemo(() => {
    if (cards.length > 0) {
      const idx = Math.min(cardIndex, cards.length - 1);
      const card = cards[idx];
      return {
        cardId: card.id,
        question: card.investorQuestion,
        plainEnglishAnswer: card.plainEnglishAnswer,
        parsed: card.plainEnglishAnswer
          ? parseAnswerToBlocks(card.plainEnglishAnswer)
          : { blocks: [] as AnswerBlock[], simple: undefined as string | undefined },
        whyItMatters: card.whyItMatters,
        investorInsight: card.investorInsight,
        cardIndex: idx + 1,
        cardTotal: cards.length,
        markReadSlug: cardSlug(slug, card.id),
        isRead: cardReadFlags[idx] ?? false,
        isLoading: Boolean(
          questPipeline?.generating &&
            questPipeline.loadingCardIds?.includes(card.id)
        )
      };
    }
    const parsed = quest.plainEnglishAnswer
      ? parseAnswerToBlocks(quest.plainEnglishAnswer)
      : { blocks: [] as AnswerBlock[], simple: undefined as string | undefined };
    return {
      cardId: undefined as string | undefined,
      question: quest.investorQuestion,
      plainEnglishAnswer: quest.plainEnglishAnswer,
      parsed,
      whyItMatters: quest.whyItMatters,
      investorInsight: quest.investorInsight,
      cardIndex: 1,
      cardTotal: 1,
      markReadSlug: slug,
      isRead: cardReadFlags[0] ?? false,
      isLoading: false
    };
  }, [cards, cardIndex, cardReadFlags, quest, slug, questPipeline]);

  const showGeographicMap = useMemo(
    () =>
      isGeographicRevenueCard(
        pillarId,
        slug,
        cardView.cardId,
        cardView.question
      ),
    [pillarId, slug, cardView.cardId, cardView.question]
  );

  const showProductVisual = useMemo(
    () =>
      isProductServiceCard(
        pillarId,
        slug,
        cardView.cardId,
        cardView.question
      ),
    [pillarId, slug, cardView.cardId, cardView.question]
  );

  /** Quest card N = Company Overview evidence card 1 — same read template as evidence flow. */
  const questCardEvidencePrinciple =
    cardView.cardId != null
      ? resolvePrincipleForQuestEvidenceTrigger(slug, cardView.cardId)
      : null;

  const questCardEvidenceCards = useMemo(() => {
    if (!checklistEnabled || !questHasSectionEvidence || !questCardEvidencePrinciple) {
      return [];
    }
    return resolveInvestorEvidenceCards(company.id, questCardEvidencePrinciple);
  }, [checklistEnabled, questHasSectionEvidence, company.id, questCardEvidencePrinciple]);

  const questUsesInvestorEvidenceReadCard =
    questCardEvidenceCards.length > 0 &&
    questCardEvidencePrinciple != null &&
    canStartPrincipleEvidenceFlow(company.id, questCardEvidencePrinciple) &&
    !evidenceGateActive;

  const questCardEvidencePrincipleLabel =
    questCardEvidencePrinciple != null
      ? resolveInvestorPrinciple(questCardEvidencePrinciple).label
      : "";

  const checklistSectionHeading = useMemo(() => {
    if (!checklistEnabled) return null;
    const section = resolveSectionForQuest(slug);
    return section ? formatChecklistSectionHeading(section) : null;
  }, [checklistEnabled, slug]);

  const shellClass =
    "relative px-5 pb-2 pt-5 sm:px-6 md:px-9 md:pt-7";

  const passCelebration = useMemo(
    () => ({
      headline: questCompleteHeadline(slug, quest.title, quest.type),
      message: islandQuizPassMessage(pillarId, slug, quest.type)
    }),
    [pillarId, slug, quest.title, quest.type]
  );

  const sourceLine = <QuestSourceFooter source={source} theme={theme} />;

  if (screen === "quality-check" && checklistEnabled && pendingRatingItems.length > 0) {
    return (
      <BusinessQuestChecklistLayout
        enabled={checklistEnabled}
        snapshot={checklistSnapshot}
        ratingFocusMode
        companyId={company.id}
        questSlug={slug}
        questProgressPct={checklistQuestProgressPct}
      >
        <motion.div className="relative px-3 pb-2 pt-2 sm:px-4 md:px-5 md:pt-3">
          <InvestorQualityRatingScreen
            companyName={company.name}
            itemIds={pendingRatingItems}
            evidenceCountByItem={checklistSnapshot.evidenceCount}
            onSubmit={handleQualityCheckComplete}
            submitLabel="Continue"
          />
          {sourceLine}
        </motion.div>
      </BusinessQuestChecklistLayout>
    );
  }

  if (
    screen === "section-quiz" &&
    usesChecklistSectionQuiz &&
    checklistSectionDef
  ) {
    return (
      <BusinessQuestChecklistLayout
        enabled={checklistEnabled}
        snapshot={checklistSnapshot}
        companyId={company.id}
        questSlug={slug}
        questProgressPct={checklistQuestProgressPct}
        highlightPrincipleId={highlightPrincipleId}
        highlightSectionQuizId={highlightSectionQuizId}
      >
        <motion.div className={shellClass}>
          {checklistSectionHeading ? (
            <ChecklistSectionHeader title={checklistSectionHeading} theme={theme} />
          ) : null}
          <div className="mx-auto w-full max-w-2xl px-1">
            <BusinessChecklistSectionQuizFlow
              company={company}
              sectionId={checklistSectionDef.id}
              pillarId={pillarId}
              questSlug={slug}
              theme={theme}
              onPassed={handleSectionQuizPassed}
              onFinished={handleSectionQuizFinished}
            />
          </div>
          {sourceLine}
        </motion.div>
      </BusinessQuestChecklistLayout>
    );
  }

  if (screen === "quiz" && showLegacyQuestQuiz) {
    return (
      <motion.div className="relative px-3 pb-2 pt-2 sm:px-4 md:px-5 md:pt-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${slug}-quiz-screen`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="mx-auto w-full max-w-3xl"
          >
            <QuestQuizPanel
              key={`${slug}-quiz-${quizSessionKey}`}
              pillarId={pillarId}
              slug={slug}
              quiz={quiz}
              unlocked
              autoStart
              freshAttemptOnMount={schoolsRewardFlow}
              title={islandQuizSectionTitle(pillarId, quest.type)}
              rewardXp={quest.rewardXp}
              cardsRead={cardReadFlags.filter(Boolean).length}
              cardsTotal={cards.length || 1}
              nextQuest={schoolsRewardFlow ? undefined : nextQuest}
              islandFinaleCta={schoolsRewardFlow ? undefined : islandFinaleCta}
              passCelebration={passCelebration}
              panelTheme={theme}
              onReviewQuestCards={() => setScreen("cards")}
              rewardFlow={schoolsRewardFlow ? "schools" : "default"}
              schoolsPrideLine={resolveSchoolsCompletionPrideLine(company.name)}
              companyName={company.name}
              whatYouNowKnow={resolveSchoolsQuestTakeaways(slug)}
              microXpPerCorrect={SCHOOLS_MICRO_XP_PER_CORRECT}
              cardCompleteXp={SCHOOLS_CARD_COMPLETE_XP}
              externalQuestionProgress={Boolean(onQuizScreenChange)}
              onPlayingProgress={
                onQuizScreenChange ? handleQuizPlayingProgress : undefined
              }
              onSchoolsQuizPassed={
                schoolsRewardFlow ? handleSchoolsQuizPassed : undefined
              }
            />
          </motion.div>
        </AnimatePresence>

        {sourceLine}
      </motion.div>
    );
  }

  return (
    <BusinessQuestChecklistLayout
      enabled={checklistEnabled}
      snapshot={checklistSnapshot}
      companyId={company.id}
      questSlug={slug}
      questProgressPct={checklistQuestProgressPct}
      highlightPrincipleId={highlightPrincipleId}
      highlightSectionQuizId={highlightSectionQuizId}
    >
      <motion.div className={shellClass}>
      {checklistSectionHeading ? (
        <ChecklistSectionHeader title={checklistSectionHeading} theme={theme} />
      ) : null}
      {evidenceGateActive && effectiveEvidencePrincipleId ? (
        <div
          className={[
            "mx-auto w-full max-w-2xl px-1",
            schoolsRewardFlow ? "iq-schools-evidence-gate pt-1" : "pt-0"
          ].join(" ")}
        >
          <BusinessInvestorPrincipleEvidenceFlow
            key={effectiveEvidencePrincipleId}
            companyId={company.id}
            principleId={effectiveEvidencePrincipleId}
            pillarId={pillarId}
            theme={theme}
            skipReadForFirstCard={skipReadForActivePrincipleFirstCard}
            onEvidenceSaved={handleEvidenceFlowSaved}
            onComplete={handleEvidenceFlowComplete}
          />
        </div>
      ) : (
        <>
      {questPipeline ? (
        <PillarQuestPipelineBanner
          pillarId={pillarId}
          questSlug={slug}
          status={questPipeline.status}
          generating={questPipeline.generating}
          pipelinePhase={questPipeline.pipelinePhase}
          progress={questPipeline.progress}
          compact={questPipeline.compact}
          error={questPipeline.error}
          theme={theme}
          onRetry={questPipeline.onRetry}
        />
      ) : null}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${slug}-card-${cardView.cardIndex}`}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -14 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="mx-auto w-full max-w-2xl"
        >
          {questUsesInvestorEvidenceReadCard ? (
            <InvestorEvidenceReadCard
              principleLabel={questCardEvidencePrincipleLabel}
              evidenceIndex={0}
              evidenceTotal={questCardEvidenceCards.length}
              card={questCardEvidenceCards[0]!}
              pillarId={pillarId}
              theme={theme}
              footerSlot={
                <MarkAsReadGlowWrap isRead={cardView.isRead} theme={theme}>
                  <div ref={markReadAnchorRef} className="inline-flex">
                    <InvestorEvidenceMarkAsReadButton
                      theme={theme}
                      onClick={() => {
                        if (allowReadToggle && cardView.isRead) {
                          onMarkUnread(cardView.markReadSlug);
                        } else {
                          handleMarkRead(cardView.markReadSlug);
                        }
                      }}
                    />
                  </div>
                </MarkAsReadGlowWrap>
              }
            />
          ) : (
          <PillarQuestTemplateFrame
            pillarId={pillarId}
            theme={theme}
            questionText={cardView.question}
            answerSlot={
              <BusinessTemplateAnswerSlot
                plainEnglishAnswer={cardView.plainEnglishAnswer}
                investorInsight={cardView.investorInsight}
                parsed={cardView.parsed}
                theme={theme}
                companyTicker={company.ticker}
                showGeographicMap={showGeographicMap}
                showProductVisual={showProductVisual}
                isLoading={cardView.isLoading}
                answerEmphasized={useAnswerReveal && answerRevealed}
              />
            }
            companyName={company.name}
            cardIndex={cardView.cardIndex}
            cardTotal={cardView.cardTotal}
            readProgressCount={isMissionCard ? cardsReadCount : undefined}
            answerReveal={
              useAnswerReveal
                ? {
                    revealed: answerRevealed,
                    onRevealComplete: () => setAnswerRevealed(true)
                  }
                : undefined
            }
            footerSlot={
              !useAnswerReveal || answerRevealed ? (
                <MarkAsReadGlowWrap isRead={cardView.isRead} theme={theme}>
                  <div ref={markReadAnchorRef} className="inline-flex">
                    <MarkAsReadCheckbox
                      isRead={cardView.isRead}
                      theme={theme}
                      allowToggle={allowReadToggle}
                      onClick={() => {
                        if (allowReadToggle && cardView.isRead) {
                          onMarkUnread(cardView.markReadSlug);
                        } else {
                          handleMarkRead(cardView.markReadSlug);
                        }
                      }}
                    />
                  </div>
                </MarkAsReadGlowWrap>
              ) : null
            }
          />
          )}
        </motion.div>
      </AnimatePresence>

      {cardView.cardTotal > 1 ? (
        <>
          <BusinessCardPager
            index={cardIndex}
            total={cardView.cardTotal}
            theme={theme}
            hasQuiz={showLegacyQuestQuiz}
            quizReady={quizReady}
            missingCardCount={missingCardCount}
            onStartQuiz={handleStartQuiz}
            onPrev={() => setCardIndex((i) => Math.max(0, i - 1))}
            onNext={() =>
              setCardIndex((i) => Math.min(cards.length - 1, i + 1))
            }
            nextHighlighted={
              isMissionCard &&
              cardView.isRead &&
              cardIndex < cardView.cardTotal - 1
            }
          />
          <AnimatePresence initial={false}>
            {continueHint &&
            isMissionCard &&
            cardView.isRead &&
            cardIndex < cardView.cardTotal - 1 ? (
              <motion.p
                key="continue-hint"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="iq-schools-mission-read-hint mx-auto block w-fit max-w-md"
                aria-live="polite"
              >
                Great! Continue to the next card.
              </motion.p>
            ) : null}
          </AnimatePresence>
        </>
      ) : showLegacyQuestQuiz ? (
        <nav
          className="mx-auto mt-5 flex max-w-2xl flex-col items-center gap-2"
          aria-label="Quest card navigation"
        >
          <QuizUnlockedCtaButton
            unlocked={quizReady}
            onClick={handleStartQuiz}
            theme={theme}
            label="QUIZ UNLOCKED"
            lockedLabel="MARK AS READ TO UNLOCK"
            lockedTitle={quizPagerLockTooltip(missingCardCount)}
          />
          {!quizReady && missingCardCount > 0 ? (
            <p
              className={
                isMissionCard
                  ? "iq-schools-ocean-muted-text text-center text-[11.5px] font-medium leading-snug"
                  : "text-center text-[11.5px] leading-snug text-ink-2"
              }
            >
              Mark this card as read to unlock the quiz.
            </p>
          ) : null}
        </nav>
      ) : null}

      {showLegacyQuestQuiz && screen === "cards" && !quizReady ? (
        <QuestQuizUnlockStatus
          parentSlug={slug}
          cards={cards}
          readQuestSlugs={readQuestSlugs}
          quizConfig={quest.quizConfig}
          theme={theme}
        />
      ) : null}

      {/* Removed duplicate Continue/Start CTA — pager button becomes the single quiz handoff. */}

        </>
      )}

      {sourceLine}
      </motion.div>
    </BusinessQuestChecklistLayout>
  );
}
