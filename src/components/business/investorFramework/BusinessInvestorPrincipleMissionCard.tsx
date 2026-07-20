"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

import {
  INVESTOR_MISSION_XP_REWARD,
  resolveCompanyInvestorMissionTheme,
  usesInvestorMissionFlow
} from "@/lib/business/businessInvestorMissionFlow";
import type { InvestorPrincipleView } from "@/lib/business/businessInvestorFramework";
import type { CompanyId } from "@/data/companies";

type Props = {
  companyId: CompanyId;
  principle: InvestorPrincipleView;
};

/** Compact mission completion chip — used in legacy checklist rows only. */
export function BusinessInvestorPrincipleMissionCard({ companyId, principle }: Props) {
  const [celebrate, setCelebrate] = useState(false);
  const missionTheme = useMemo(
    () => resolveCompanyInvestorMissionTheme(companyId),
    [companyId]
  );

  useEffect(() => {
    if (!usesInvestorMissionFlow(principle.id) || principle.status !== "rated") return;
    setCelebrate(true);
    const timer = window.setTimeout(() => setCelebrate(false), 2800);
    return () => window.clearTimeout(timer);
  }, [principle.id, principle.status]);

  if (!usesInvestorMissionFlow(principle.id) || principle.status !== "rated") {
    return null;
  }

  const cardStyle = {
    "--iq-mission-accent": missionTheme.accent,
    "--iq-mission-accent-rgb": missionTheme.accentRgb,
    "--iq-mission-accent-soft": missionTheme.accentSoft,
    "--iq-mission-accent-glow": missionTheme.accentGlow
  } as CSSProperties;

  return (
    <div
      className={[
        "iq-investor-mission iq-investor-mission--compact",
        "iq-investor-mission--complete",
        celebrate ? "iq-investor-mission--celebrate" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      style={cardStyle}
    >
      <div className="iq-investor-mission__compact-head">
        <span className="iq-investor-mission__compact-marker" aria-hidden>
          ✅
        </span>
        <span className="iq-investor-mission__compact-label">{principle.label}</span>
      </div>
      {celebrate ? (
        <p className="iq-investor-mission__celebration" role="status">
          ✅ Mission complete · +{INVESTOR_MISSION_XP_REWARD} XP
        </p>
      ) : null}
    </div>
  );
}
