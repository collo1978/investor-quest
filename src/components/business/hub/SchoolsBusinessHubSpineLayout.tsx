"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { BusinessQuestMapCard } from "@/components/business/BusinessQuestMapCard";
import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";
import type { Company } from "@/data/companies";
import {
  MASTER_INVESTING_PRINCIPLES,
  resolveLatestMasteredQuestSlug,
  resolveMasterInvestingPrinciples,
  type MasterInvestingPrincipleState
} from "@/lib/business/masterInvestingPrinciples";

type Props = {
  cards: readonly BusinessHubQuestCard[];
  company: Company;
  partnerId?: string;
  userId?: string;
  hubProgressPct: number;
  celebrateQuestSlug?: string | null;
};

const TOTAL = MASTER_INVESTING_PRINCIPLES.length;
const CELEBRATE_MS = 2400;
const MAIN_ROW_COUNT = 6;

function PrincipleSpineNode({
  principle,
  orderNumber,
  isSpotlight,
  isCelebrating,
  reduceMotion,
  isLast = false
}: {
  principle: MasterInvestingPrincipleState;
  orderNumber: number;
  isSpotlight: boolean;
  isCelebrating: boolean;
  reduceMotion: boolean | null;
  isLast?: boolean;
}) {
  return (
    <div
      className={[
        "iq-principles-spine-node",
        principle.mastered ? "iq-principles-spine-node--mastered" : "iq-principles-spine-node--pending",
        isSpotlight ? "iq-principles-spine-node--spotlight" : "",
        isCelebrating ? "iq-principles-spine-node--celebrate" : "",
        isLast ? "iq-principles-spine-node--last" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="iq-principles-spine-node__marker" aria-hidden>
        {principle.mastered ? (
          <motion.span
            className="iq-principles-spine-node__tick"
            initial={
              isCelebrating && !reduceMotion
                ? { scale: 0.2, opacity: 0, rotate: -48 }
                : false
            }
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={
              reduceMotion
                ? { duration: 0.15 }
                : { type: "spring", stiffness: 460, damping: 16, mass: 0.72 }
            }
          >
            ✓
          </motion.span>
        ) : (
          <span className="iq-principles-spine-node__circle" />
        )}
      </span>
      <div className="iq-principles-spine-node__copy">
        <span className="iq-principles-spine-node__step tabular-nums">
          {orderNumber}
        </span>
        <span className="iq-principles-spine-node__label">{principle.label}</span>
      </div>
    </div>
  );
}

/**
 * Direction C — principles spine with quests branching left/right.
 */
export function SchoolsBusinessHubSpineLayout({
  cards,
  company,
  partnerId,
  userId,
  hubProgressPct,
  celebrateQuestSlug = null
}: Props) {
  const reduceMotion = useReducedMotion();
  const principles = useMemo(
    () => resolveMasterInvestingPrinciples(cards),
    [cards]
  );
  const cardsBySlug = useMemo(() => {
    const map = new Map<string, BusinessHubQuestCard>();
    for (const card of cards) map.set(card.slug, card);
    return map;
  }, [cards]);
  const masteredCount = principles.filter((p) => p.mastered).length;
  const spotlightQuestSlug = useMemo(
    () => resolveLatestMasteredQuestSlug(cards),
    [cards]
  );

  const prevMasteredRef = useRef(masteredCount);
  const [displayCount, setDisplayCount] = useState(masteredCount);
  const [celebrateSlug, setCelebrateSlug] = useState<string | null>(null);

  useEffect(() => {
    if (celebrateQuestSlug && !reduceMotion) {
      setCelebrateSlug(celebrateQuestSlug);
      if (masteredCount > prevMasteredRef.current) {
        setDisplayCount(Math.max(0, masteredCount - 1));
        const tick = window.setTimeout(
          () => setDisplayCount(masteredCount),
          180
        );
        const clear = window.setTimeout(() => setCelebrateSlug(null), CELEBRATE_MS);
        prevMasteredRef.current = masteredCount;
        return () => {
          window.clearTimeout(tick);
          window.clearTimeout(clear);
        };
      }
    }

    setDisplayCount(masteredCount);
    prevMasteredRef.current = masteredCount;
    if (!celebrateQuestSlug) setCelebrateSlug(null);
  }, [celebrateQuestSlug, masteredCount, reduceMotion]);

  const finalePrinciple = principles[TOTAL - 1];
  const finaleCard = cardsBySlug.get(finalePrinciple?.questSlug ?? "");

  const renderQuestCard = (card: BusinessHubQuestCard, staggerIndex: number) => (
    <BusinessQuestMapCard
      card={card}
      position={{}}
      company={company}
      partnerId={partnerId}
      userId={userId}
      staggerIndex={staggerIndex}
      hubProgressPct={hubProgressPct}
      cardLayout="grid"
    />
  );

  return (
    <section
      className="iq-schools-business-hub-spine-path pointer-events-auto"
      aria-label="Business island quest path"
    >
      <header className="iq-schools-business-hub-spine-path__header">
        <h2 className="iq-schools-business-hub-spine-path__title">
          Investment Quality Check
        </h2>
        <motion.p
          className="iq-schools-business-hub-spine-path__count tabular-nums"
          aria-live="polite"
          key={displayCount}
          initial={reduceMotion ? false : { scale: 0.94, opacity: 0.88 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
        >
          {displayCount}/{TOTAL}
        </motion.p>
      </header>

      <div className="iq-schools-business-hub-spine-path__track">
        {principles.slice(0, MAIN_ROW_COUNT).map((principle, index) => {
          const card = cardsBySlug.get(principle.questSlug);
          const branchSide = index % 2 === 0 ? "left" : "right";
          const isCelebrating =
            celebrateSlug === principle.questSlug && principle.mastered;
          const isSpotlight =
            principle.mastered && principle.questSlug === spotlightQuestSlug;

          return (
            <div
              key={principle.id}
              className={[
                "iq-schools-business-hub-spine-path__row",
                branchSide === "left"
                  ? "iq-schools-business-hub-spine-path__row--branch-left"
                  : "iq-schools-business-hub-spine-path__row--branch-right"
              ].join(" ")}
            >
              <div className="iq-schools-business-hub-spine-path__branch iq-schools-business-hub-spine-path__branch--left">
                {branchSide === "left" && card ? renderQuestCard(card, index) : null}
              </div>

              <PrincipleSpineNode
                principle={principle}
                orderNumber={index + 1}
                isSpotlight={isSpotlight}
                isCelebrating={isCelebrating}
                reduceMotion={reduceMotion}
              />

              <div className="iq-schools-business-hub-spine-path__branch iq-schools-business-hub-spine-path__branch--right">
                {branchSide === "right" && card ? renderQuestCard(card, index) : null}
              </div>
            </div>
          );
        })}

        {finalePrinciple ? (
          <div className="iq-schools-business-hub-spine-path__row iq-schools-business-hub-spine-path__row--finale">
            <div
              className="iq-schools-business-hub-spine-path__branch iq-schools-business-hub-spine-path__branch--left"
              aria-hidden
            />
            <PrincipleSpineNode
              principle={finalePrinciple}
              orderNumber={TOTAL}
              isSpotlight={
                finalePrinciple.mastered &&
                finalePrinciple.questSlug === spotlightQuestSlug
              }
              isCelebrating={
                celebrateSlug === finalePrinciple.questSlug && finalePrinciple.mastered
              }
              reduceMotion={reduceMotion}
              isLast
            />
            <div
              className="iq-schools-business-hub-spine-path__branch iq-schools-business-hub-spine-path__branch--right"
              aria-hidden
            />
          </div>
        ) : null}

        {finaleCard ? (
          <div className="iq-schools-business-hub-spine-path__row iq-schools-business-hub-spine-path__row--finale-quest">
            <div className="iq-schools-business-hub-spine-path__finale-quest">
              {renderQuestCard(finaleCard, TOTAL - 1)}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
