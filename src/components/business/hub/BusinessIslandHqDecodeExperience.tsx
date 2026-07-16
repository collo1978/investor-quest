"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { InvestorDecodeTakeaways } from "@/components/business/investorFramework/InvestorDecodeTakeaways";
import { Official10KEvidenceFile } from "@/components/business/investorFramework/Official10KEvidenceFile";
import { InvestorKeyTermsPanel } from "@/components/business/investorFramework/InvestorKeyTermsPanel";
import {
  buildHqDecodeParagraphSegments,
  HQ_DECODE_EVIDENCE,
  HQ_DECODE_KEY_TERMS_HEADING,
  HQ_DECODE_MESSAGE_HEADING,
  HQ_FIRST_QUEST_ROUTE
} from "@/lib/business/businessIslandHqDecodeContent";
import type { BusinessIslandStoryLocationDef } from "@/lib/business/businessIslandStoryLocations";
import { resolveSchoolsHubQuestHref } from "@/lib/schools/schoolsDemoHref";

const HQ_MISSION_BRIEF_SRC = "/images/business-island/hq-mission-brief.png";

type HqPhase = "brief" | "mission";

type Props = {
  location: BusinessIslandStoryLocationDef;
  companyId: string;
  companyName: string;
  onBeforeQuestNavigate?: (href: string) => void;
  onLeave: () => void;
};

/**
 * Headquarters — Brief → (Evidence file → Decode → Translator) × N → Challenge.
 */
export function BusinessIslandHqDecodeExperience({
  location,
  onBeforeQuestNavigate,
  onLeave
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const evidenceTotal = HQ_DECODE_EVIDENCE.length;
  const [evidenceIndex, setEvidenceIndex] = useState(0);
  const [phase, setPhase] = useState<HqPhase>("brief");
  const [decoded, setDecoded] = useState(false);
  const [expandedTermIds, setExpandedTermIds] = useState<Set<string>>(() => new Set());
  const [decodedTermIds, setDecodedTermIds] = useState<Set<string>>(() => new Set());
  const [navigating, setNavigating] = useState(false);

  const evidence = HQ_DECODE_EVIDENCE[evidenceIndex] ?? HQ_DECODE_EVIDENCE[0];
  const isFinalEvidence = evidenceIndex >= evidenceTotal - 1;

  const segments = useMemo(
    () => buildHqDecodeParagraphSegments(evidence),
    [evidence]
  );
  const keyTerms = useMemo(
    () =>
      evidence.terms.map((term) => ({
        id: term.id,
        title: term.title,
        explanation: term.explanation
      })),
    [evidence]
  );

  const questHref =
    resolveSchoolsHubQuestHref(HQ_FIRST_QUEST_ROUTE, pathname) ?? HQ_FIRST_QUEST_ROUTE;

  const resetTermState = useCallback(() => {
    setExpandedTermIds(new Set());
    setDecodedTermIds(new Set());
  }, []);

  const toggleTerm = useCallback((termId: string, isExpanded: boolean) => {
    if (isExpanded) {
      setExpandedTermIds((prev) => {
        const next = new Set(prev);
        next.delete(termId);
        return next;
      });
      setDecodedTermIds((prev) => {
        if (prev.has(termId)) return prev;
        const next = new Set(prev);
        next.add(termId);
        return next;
      });
      return;
    }

    setExpandedTermIds((prev) => {
      const next = new Set(prev);
      next.add(termId);
      return next;
    });
  }, []);

  const goToNextEvidence = useCallback(() => {
    if (isFinalEvidence) return;
    resetTermState();
    setDecoded(false);
    setEvidenceIndex((prev) => prev + 1);
  }, [isFinalEvidence, resetTermState]);

  const enterAnalystChallenge = useCallback(() => {
    if (navigating) return;
    setNavigating(true);
    if (onBeforeQuestNavigate) {
      onBeforeQuestNavigate(questHref);
    } else {
      router.push(questHref);
    }
  }, [navigating, onBeforeQuestNavigate, questHref, router]);

  return (
    <motion.div
      className="iq-hq-mission"
      role="dialog"
      aria-modal="true"
      aria-label={`${location.placeName} mission`}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        className="iq-hq-mission__exit"
        aria-label="Return to Business Island"
        onClick={onLeave}
      >
        ←
      </button>

      <AnimatePresence mode="wait">
        {phase === "brief" ? (
          <motion.section
            key="brief"
            className="iq-hq-mission__screen iq-hq-mission__screen--brief"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="iq-hq-mission-brief">
              <Image
                src={HQ_MISSION_BRIEF_SRC}
                alt="Your mission case file — access NVIDIA's official 10-K Business section evidence"
                width={1536}
                height={1024}
                className="iq-hq-mission-brief__image"
                priority
                unoptimized
              />
            </div>

            <button
              type="button"
              className="iq-hq-mission__primary iq-hq-mission-brief__cta"
              onClick={() => {
                resetTermState();
                setEvidenceIndex(0);
                setDecoded(false);
                setPhase("mission");
              }}
            >
              ▶ Access Evidence File
            </button>
          </motion.section>
        ) : (
          <motion.section
            key={`mission-${evidence.id}`}
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
                      <span key={`text-${sentenceIndex}-${index}`}>
                        {segment.text}
                      </span>
                    ) : (
                      <mark
                        key={segment.termId}
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
                  key={`translator-${evidence.id}`}
                  className="iq-investor-translator iq-investor-translator--under-file"
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
                  transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                >
                  <header className="iq-investor-translator__hero">
                    <h2 className="iq-investor-translator__headline">
                      {HQ_DECODE_MESSAGE_HEADING}
                    </h2>
                  </header>

                  <InvestorDecodeTakeaways takeaways={evidence.takeaways} />

                  <InvestorKeyTermsPanel
                    heading={HQ_DECODE_KEY_TERMS_HEADING}
                    terms={keyTerms}
                    expandedIds={expandedTermIds}
                    decodedIds={decodedTermIds}
                    onToggleTerm={toggleTerm}
                    layout="grid"
                  />

                  {isFinalEvidence ? (
                    <button
                      type="button"
                      className="iq-hq-mission__primary iq-investor-translator__cta"
                      onClick={enterAnalystChallenge}
                      disabled={navigating}
                    >
                      {navigating ? "Launching…" : "Enter Analyst Challenge →"}
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
        )}
      </AnimatePresence>
    </motion.div>
  );
}
