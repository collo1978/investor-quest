"use client";

import {
  Brain,
  Castle,
  Cog,
  Globe2,
  Heart,
  Rocket,
  ShieldCheck,
  type LucideIcon
} from "lucide-react";

import type { InvestorQualityChecklistItemId } from "@/lib/business/investorQualityChecklist";

const CHECKLIST_ICONS: Record<InvestorQualityChecklistItemId, LucideIcon> = {
  "business-understanding": Brain,
  "value-proposition": Heart,
  "competitive-advantage": Castle,
  "growth-runway": Rocket,
  "industry-attractiveness": Globe2,
  "business-model": Cog,
  "operational-resilience": ShieldCheck
};

type Props = {
  itemId: InvestorQualityChecklistItemId;
  className?: string;
  lit?: boolean;
};

/** Consistent stroke icons for the Investor Checklist rail. */
export function InvestorQualityChecklistIcon({
  itemId,
  className = "",
  lit = false
}: Props) {
  const Icon = CHECKLIST_ICONS[itemId];

  return (
    <span
      className={[
        "iq-investor-quality-quest-panel__icon",
        lit ? "iq-investor-quality-quest-panel__icon--lit" : "",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      <Icon strokeWidth={1.75} size={15} />
    </span>
  );
}
