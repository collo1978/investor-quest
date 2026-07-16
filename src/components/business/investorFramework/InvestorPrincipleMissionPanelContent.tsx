"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState, type CSSProperties } from "react";

import { BusinessInvestorPrincipleHint } from "@/components/business/hub/BusinessInvestorPrincipleHint";
import type { CompanyId } from "@/data/companies";
import { companyById } from "@/data/companies";
import type { InvestorChallengePrincipleId } from "@/lib/business/businessInvestorChallengeFlow";
import {
  buildInvestorMissionKnowledgeItems,
  INVESTOR_MISSION_XP_REWARD,
  isInvestorMissionKnowledgeComplete,
  resolveCompanyInvestorMissionTheme,
  resolveInvestorMissionQuestion,
  usesInvestorMissionFlow,
  type InvestorMissionKnowledgeItem
} from "@/lib/business/businessInvestorMissionFlow";
import type { InvestorPrincipleView } from "@/lib/business/businessInvestorFramework";
import {
  BUSINESS_INVESTOR_FRAMEWORK_CHANGED_EVENT,
  readBusinessInvestorFrameworkState
} from "@/lib/business/businessInvestorFrameworkStorage";

function MissionQuestionHighlight({
  question,
  companyId
}: {
  question: string;
  companyId: CompanyId;
}) {
  const companyName = companyById(companyId).name;
  const idx = question.indexOf(companyName);
  if (idx < 0) return question;
  return (
    <>
      {question.slice(0, idx)}
      <span className="iq-mission-hq__brand">{companyName}</span>
      {question.slice(idx + companyName.length)}
    </>
  );
}

function knowledgeIcon(item: InvestorMissionKnowledgeItem, index: number): string {
  if (item.kind === "challenge") return "💬";
  if (index === 0) return "📄";
  return "◎";
}

function MissionKnowledgeCard({
  item,
  index
}: {
  item: InvestorMissionKnowledgeItem;
  index: number;
}) {
  const isComplete = item.status === "complete";
  const isActive = item.status === "active";

  return (
    <li
      className={[
        "iq-mission-hq__task",
        isComplete ? "iq-mission-hq__task--complete" : "",
        isActive ? "iq-mission-hq__task--active" : "",
        item.kind === "challenge" ? "iq-mission-hq__task--challenge" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="iq-mission-hq__task-icon" aria-hidden>
        {knowledgeIcon(item, index)}
      </span>
      <div className="iq-mission-hq__task-copy">
        <p className="iq-mission-hq__task-title">{item.label}</p>
        <p className="iq-mission-hq__task-meta">
          {isComplete ? "Complete" : isActive ? "Your turn!" : "Locked"}
        </p>
      </div>
      <span className="iq-mission-hq__task-status" aria-hidden>
        {isComplete ? (
          <span className="iq-mission-hq__task-tick">✓</span>
        ) : isActive ? (
          <span className="iq-mission-hq__task-ring">0/1</span>
        ) : (
          <span className="iq-mission-hq__task-lock">🔒</span>
        )}
      </span>
    </li>
  );
}

type Props = {
  companyId: CompanyId;
  principle: InvestorPrincipleView;
  showStartCta?: boolean;
  onStartMission?: () => void;
};

/** High-fidelity mission HQ body — question, knowledge cards, rewards + CTA. */
export function InvestorPrincipleMissionPanelContent({
  companyId,
  principle,
  showStartCta = false,
  onStartMission
}: Props) {
  const reduceMotion = useReducedMotion();
  const missionTheme = useMemo(
    () => resolveCompanyInvestorMissionTheme(companyId),
    [companyId]
  );
  const company = companyById(companyId);
  const [stored, setStored] = useState(() =>
    readBusinessInvestorFrameworkState(companyId)
  );

  useEffect(() => {
    const refresh = () => setStored(readBusinessInvestorFrameworkState(companyId));
    window.addEventListener(BUSINESS_INVESTOR_FRAMEWORK_CHANGED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(BUSINESS_INVESTOR_FRAMEWORK_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [companyId]);

  const isMission = usesInvestorMissionFlow(principle.id);
  const principleId = isMission ? (principle.id as InvestorChallengePrincipleId) : null;
  const knowledgeItems = useMemo(() => {
    if (!isMission || !principleId) return [];
    return buildInvestorMissionKnowledgeItems(companyId, principleId, stored);
  }, [companyId, isMission, principleId, stored]);
  const missionComplete =
    principle.status === "rated" ||
    (knowledgeItems.length > 0 && isInvestorMissionKnowledgeComplete(knowledgeItems));
  const isActive = principle.status === "active";
  const missionQuestion =
    isMission && principleId
      ? resolveInvestorMissionQuestion(companyId, principleId)
      : "";
  const ctaLabel = knowledgeItems.some((item) => item.status === "complete")
    ? "Continue Challenge"
    : "Start Mission";

  if (!isMission) return null;

  return (
    <motion.article
      className={[
        "iq-mission-hq",
        isActive ? "iq-mission-hq--active" : "",
        missionComplete ? "iq-mission-hq--complete" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--iq-mission-accent": missionTheme.accent,
          "--iq-mission-accent-rgb": missionTheme.accentRgb,
          "--iq-mission-accent-soft": missionTheme.accentSoft,
          "--iq-mission-accent-glow": missionTheme.accentGlow
        } as CSSProperties
      }
      initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="iq-mission-hq__glow" aria-hidden />
      <span className="iq-mission-hq__grid" aria-hidden />

      <header className="iq-mission-hq__head">
        <p className="iq-mission-hq__eyebrow">
          <span aria-hidden>⌖</span> Investor Mission
        </p>
        <BusinessInvestorPrincipleHint
          principleId={principle.id}
          className="iq-mission-hq__hint"
        />
      </header>

      <h2 id="iq-investor-mission-panel-title" className="iq-mission-hq__question">
        <MissionQuestionHighlight question={missionQuestion} companyId={companyId} />
      </h2>

      <p className="iq-mission-hq__lead">
        To <strong>answer this question</strong>, you&apos;ll need to know:
      </p>

      <ul className="iq-mission-hq__tasks" aria-label="Knowledge checklist">
        {knowledgeItems.map((item, index) => (
          <MissionKnowledgeCard key={item.id} item={item} index={index} />
        ))}
      </ul>

      <footer className="iq-mission-hq__footer">
        <div className="iq-mission-hq__reward-visual" aria-hidden>
          <span className="iq-mission-hq__pedestal" />
          <span className="iq-mission-hq__hologram">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={company.logoSrc} alt="" width={48} height={48} />
          </span>
        </div>

        <div className="iq-mission-hq__rewards">
          <p className="iq-mission-hq__rewards-label">Complete the mission to earn:</p>
          <div className="iq-mission-hq__reward-chips">
            <span className="iq-mission-hq__reward-chip">
              <span className="iq-mission-hq__xp-hex" aria-hidden>
                XP
              </span>
              {INVESTOR_MISSION_XP_REWARD} XP
            </span>
            <span className="iq-mission-hq__reward-chip">
              <span aria-hidden>⭐</span> 1 Badge
            </span>
          </div>
        </div>

        {showStartCta && isActive ? (
          <button
            type="button"
            className="iq-mission-hq__cta"
            onClick={onStartMission}
          >
            {ctaLabel}
            <span aria-hidden>›</span>
          </button>
        ) : null}
      </footer>
    </motion.article>
  );
}
