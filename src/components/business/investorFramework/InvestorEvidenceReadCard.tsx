"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import { PillarQuestTemplateFrame } from "@/components/BusinessQuestTemplateFrame";
import { InvestorEvidenceAnswerBody } from "@/components/business/investorFramework/InvestorEvidenceAnswerBody";
import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import type { PillarId } from "@/data/pillars";
import type { BusinessInvestorEvidenceCardDef } from "@/lib/business/businessInvestorEvidenceCards";
import { resolveInvestorEvidenceAnswerContent } from "@/lib/business/resolveInvestorEvidenceAnswerContent";

export type InvestorEvidenceReadCardProps = {
  /** Investor Principle label — e.g. Business Purpose */
  principleLabel: string;
  /** 0-based index within the principle's evidence set */
  evidenceIndex: number;
  evidenceTotal: number;
  card: BusinessInvestorEvidenceCardDef;
  pillarId: PillarId;
  theme: PillarQuestTheme;
  footerSlot: ReactNode;
  /** Review replay — answer visible immediately (no SHOW ME). */
  startRevealed?: boolean;
};

/**
 * Canonical investor evidence read card — question → SHOW ME → answer → mark as read.
 * Same staged reveal as quest card 1; layout fixed across all principles.
 */
export function InvestorEvidenceReadCard({
  principleLabel,
  evidenceIndex,
  evidenceTotal,
  card,
  pillarId,
  theme,
  footerSlot,
  startRevealed = false
}: InvestorEvidenceReadCardProps) {
  const [answerRevealed, setAnswerRevealed] = useState(startRevealed);

  useEffect(() => {
    setAnswerRevealed(startRevealed);
  }, [card.id, startRevealed]);

  const answerContent = useMemo(
    () => resolveInvestorEvidenceAnswerContent(card),
    [card]
  );

  return (
    <PillarQuestTemplateFrame
      pillarId={pillarId}
      theme={theme}
      headerMode="principle-evidence"
      principleLabel={principleLabel}
      questionText={card.question}
      answerSlot={<InvestorEvidenceAnswerBody content={answerContent} theme={theme} />}
      companyName=""
      cardIndex={evidenceIndex + 1}
      cardTotal={evidenceTotal}
      answerReveal={{
        revealed: answerRevealed,
        onRevealComplete: () => setAnswerRevealed(true)
      }}
      footerSlot={footerSlot}
    />
  );
}
