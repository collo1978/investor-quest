"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { BusinessIslandMissionFlow } from "@/components/business/hub/BusinessIslandMissionFlow";
import type { InvestorNotebookQuestionId } from "@/lib/business/businessIslandInvestorNotebook";
import type { BusinessIslandStoryLocationDef } from "@/lib/business/businessIslandStoryLocations";

const HQ_MISSION_BRIEF_SRC = "/images/business-island/hq-mission-brief.png";

type HqPhase = "brief" | "mission";

type Props = {
  location: BusinessIslandStoryLocationDef;
  companyName: string;
  onMissionMastered: (questionId: InvestorNotebookQuestionId) => void;
  onLeave: () => void;
};

/**
 * Headquarters — Brief case file → for each HQ question:
 * (Evidence → Decode → Answer → Checklist tick) → return to island.
 */
export function BusinessIslandHqDecodeExperience({
  location,
  companyName,
  onMissionMastered,
  onLeave
}: Props) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<HqPhase>("brief");
  const [sessionKey, setSessionKey] = useState(0);

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
                setSessionKey((n) => n + 1);
                setPhase("mission");
              }}
            >
              ▶ Access Evidence File
            </button>
          </motion.section>
        ) : (
          <motion.section
            key={`mission-${sessionKey}`}
            className="iq-hq-mission__flow"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <BusinessIslandMissionFlow
              questionIds={location.notebookQuestionIds}
              companyName={companyName}
              onQuestionMastered={onMissionMastered}
              onComplete={onLeave}
              completeLabel="Return to the island →"
            />
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
