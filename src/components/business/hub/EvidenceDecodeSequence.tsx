"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useOptionalGame } from "@/components/GameProvider";
import { InvestorDecodeTakeaways } from "@/components/business/investorFramework/InvestorDecodeTakeaways";
import { Official10KEvidenceFile } from "@/components/business/investorFramework/Official10KEvidenceFile";
import { InvestorKeyTermsPanel } from "@/components/business/investorFramework/InvestorKeyTermsPanel";
import type { InvestorKeyTermItem } from "@/components/business/investorFramework/InvestorKeyTermDecodeCard";
import {
  buildHqDecodeParagraphSegments,
  HQ_DECODE_KEY_TERMS_HEADING,
  HQ_DECODE_KEY_TERMS_HELPER,
  HQ_DECODE_MESSAGE_HEADINGS,
  HQ_RECALL_XP_REWARD,
  pickHqDecodeHeading,
  type HqDecodeEvidencePiece
} from "@/lib/business/businessIslandHqDecodeContent";
import { evaluateTermRecall } from "@/lib/business/evaluateTermRecall";

type Props = {
  /** Ordered evidence files for this mission. */
  evidence: readonly HqDecodeEvidencePiece[];
  /** Label for the final CTA shown after the last evidence is decoded. */
  finalCtaLabel: string;
  /** Fired when the learner taps the final CTA. */
  onFinal: () => void;
  /** Disables the final CTA (e.g. while navigating away). */
  finalDisabled?: boolean;
};

/**
 * Reusable evidence-gathering flow:
 * (Evidence File → Decode → Translator → Key Terms) × N → final CTA.
 * Tracks term memory across the mission: Decode → Recall → Mastered.
 */
export function EvidenceDecodeSequence({
  evidence,
  finalCtaLabel,
  onFinal,
  finalDisabled = false
}: Props) {
  const reduceMotion = useReducedMotion();
  const game = useOptionalGame();

  const evidenceTotal = evidence.length;
  const [evidenceIndex, setEvidenceIndex] = useState(0);
  const [decoded, setDecoded] = useState(false);

  // Mission-wide term memory (persists across evidence pieces).
  const decodedHistoryRef = useRef<Set<string>>(new Set());
  const [seenBeforeIds, setSeenBeforeIds] = useState<Set<string>>(() => new Set());
  const [masteredIds, setMasteredIds] = useState<Set<string>>(() => new Set());

  const piece = evidence[evidenceIndex] ?? evidence[0];
  const isFinalEvidence = evidenceIndex >= evidenceTotal - 1;

  // Randomised per evidence load; client-only so first paint stays hydration-safe.
  const [decodeHeading, setDecodeHeading] = useState<string>(
    HQ_DECODE_MESSAGE_HEADINGS[0]
  );
  useEffect(() => {
    setDecodeHeading(pickHqDecodeHeading());
  }, [evidenceIndex]);

  const segments = useMemo(
    () => (piece ? buildHqDecodeParagraphSegments(piece) : []),
    [piece]
  );
  const keyTerms = useMemo<InvestorKeyTermItem[]>(
    () =>
      (piece?.terms ?? []).map((term) => ({
        id: term.id,
        title: term.title,
        explanation: term.explanation,
        recallKeywords: term.recallKeywords
      })),
    [piece]
  );

  const handleTermDecoded = useCallback((termId: string) => {
    decodedHistoryRef.current.add(termId);
  }, []);

  const handleSubmitRecall = useCallback(
    (term: InvestorKeyTermItem, response: string) => {
      const { correct } = evaluateTermRecall(response, term.recallKeywords ?? []);
      if (correct) {
        decodedHistoryRef.current.add(term.id);
        setMasteredIds((prev) => {
          if (prev.has(term.id)) return prev;
          const next = new Set(prev);
          next.add(term.id);
          return next;
        });
        game?.actions.awardBonusXp(
          HQ_RECALL_XP_REWARD,
          `Recalled investor term: ${term.title}`
        );
      }
      return correct;
    },
    [game]
  );

  const goToNextEvidence = useCallback(() => {
    if (isFinalEvidence) return;
    // Snapshot decoded terms — those become "seen before" in the next file.
    setSeenBeforeIds(new Set(decodedHistoryRef.current));
    setDecoded(false);
    setEvidenceIndex((prev) => prev + 1);
  }, [isFinalEvidence]);

  if (!piece) return null;

  return (
    <motion.section
      key={`mission-${piece.id}`}
      className="iq-hq-mission__screen iq-hq-mission__screen--source iq-hq-mission__screen--mission"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <Official10KEvidenceFile
        action={
          decoded ? null : (
            <button
              type="button"
              className="iq-evidence-file__decode"
              onClick={() => setDecoded(true)}
            >
              <span aria-hidden>⚡</span> Decode
            </button>
          )
        }
      >
        {segments.map((sentenceSegments, sentenceIndex) => (
          <p key={sentenceIndex} className="iq-evidence-file__sentence">
            {sentenceSegments.map((segment, index) =>
              segment.kind === "text" ? (
                <span key={`text-${sentenceIndex}-${index}`}>{segment.text}</span>
              ) : (
                <mark
                  key={`${segment.termId}-${index}`}
                  className="iq-evidence-file__highlight"
                >
                  {segment.text}
                </mark>
              )
            )}
          </p>
        ))}
      </Official10KEvidenceFile>

      <AnimatePresence initial={false}>
        {decoded ? (
          <motion.div
            key={`translator-${piece.id}`}
            className="iq-investor-translator iq-investor-translator--under-file"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="iq-investor-translator__hero">
              <h2 className="iq-investor-translator__headline">{decodeHeading}</h2>
            </header>

            <InvestorDecodeTakeaways
              takeaways={piece.takeaways}
              analogy={piece.analogy}
            />

            <InvestorKeyTermsPanel
              heading={HQ_DECODE_KEY_TERMS_HEADING}
              helperText={HQ_DECODE_KEY_TERMS_HELPER}
              terms={keyTerms}
              seenBeforeIds={seenBeforeIds}
              masteredIds={masteredIds}
              onDecoded={handleTermDecoded}
              onSubmitRecall={handleSubmitRecall}
              layout="grid"
            />

            {isFinalEvidence ? (
              <button
                type="button"
                className="iq-hq-mission__primary iq-investor-translator__cta"
                onClick={onFinal}
                disabled={finalDisabled}
              >
                {finalCtaLabel}
              </button>
            ) : (
              <button
                type="button"
                className="iq-hq-mission__primary iq-investor-translator__cta"
                onClick={goToNextEvidence}
              >
                Next Evidence →
              </button>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  );
}
