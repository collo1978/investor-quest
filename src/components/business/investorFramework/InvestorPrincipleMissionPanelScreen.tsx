"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

import { useGame } from "@/components/GameProvider";
import { InvestorPrincipleMissionPanelContent } from "@/components/business/investorFramework/InvestorPrincipleMissionPanelContent";
import { companyById, type CompanyId } from "@/data/companies";
import {
  BUSINESS_INVESTOR_CHECKLIST_SECTIONS,
  resolveInvestorSection,
  type BusinessChecklistSectionId
} from "@/lib/business/businessInvestorFramework";
import {
  resolveCompanyInvestorMissionTheme,
  usesInvestorMissionFlow
} from "@/lib/business/businessInvestorMissionFlow";
import type { InvestorPrincipleView } from "@/lib/business/businessInvestorFramework";
import { useBusinessChecklistProgress } from "@/hooks/useBusinessChecklistProgress";

type Props = {
  open: boolean;
  companyId: CompanyId;
  principle: InvestorPrincipleView | null;
  onDismiss: () => void;
  onStartMission: () => void;
};

const SECTION_ICONS: Partial<Record<BusinessChecklistSectionId, string>> = {
  "company-overview": "🏢",
  "products-services": "📦",
  "customers-markets": "👥",
  "business-model": "💰",
  "competitive-position": "🏆",
  operations: "⚙️"
};

/**
 * Full-screen Investor Mission HQ — matches the NVIDIA glassmorphism mission mock.
 */
export function InvestorPrincipleMissionPanelScreen({
  open,
  companyId,
  principle,
  onDismiss,
  onStartMission
}: Props) {
  const [portalReady, setPortalReady] = useState(false);
  const { raw } = useGame();
  const company = companyById(companyId);
  const missionTheme = useMemo(
    () => resolveCompanyInvestorMissionTheme(companyId),
    [companyId]
  );
  const { snapshot } = useBusinessChecklistProgress({ companyId });
  const xp = raw.companies[companyId]?.xp ?? 0;

  const sectionId = principle?.sectionId ?? "company-overview";
  const section = resolveInvestorSection(sectionId);
  const activeSectionState = snapshot.sections.find((s) => s.id === sectionId);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    return () => {
      html.style.overflow = "";
      body.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onDismiss]);

  const isMission = principle != null && usesInvestorMissionFlow(principle.id);
  if (!open || !portalReady || !principle || !isMission) return null;

  const missionIndex =
    activeSectionState?.principles.findIndex((p) => p.id === principle.id) ?? 0;
  const missionTotal = Math.max(activeSectionState?.principles.length ?? 3, 1);
  const missionOrdinal = Math.min(missionIndex + 1, missionTotal);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="iq-investor-mission-panel-title"
      className="iq-mission-hq-screen pointer-events-auto fixed inset-0 z-[280]"
      style={
        {
          "--iq-mission-accent": missionTheme.accent,
          "--iq-mission-accent-rgb": missionTheme.accentRgb,
          "--iq-mission-accent-soft": missionTheme.accentSoft,
          "--iq-mission-accent-glow": missionTheme.accentGlow
        } as CSSProperties
      }
    >
      <span className="iq-mission-hq-screen__bg" aria-hidden />
      <span className="iq-mission-hq-screen__hero-art" aria-hidden />

      <aside className="iq-mission-hq-screen__rail" aria-label="Business sections">
        {BUSINESS_INVESTOR_CHECKLIST_SECTIONS.map((entry) => {
          const view = snapshot.sections.find((s) => s.id === entry.id);
          const isCurrent = entry.id === sectionId;
          const isLocked = view?.state === "locked";
          const isComplete = view?.state === "completed";
          return (
            <div
              key={entry.id}
              className={[
                "iq-mission-hq-screen__rail-item",
                isCurrent ? "iq-mission-hq-screen__rail-item--active" : "",
                isLocked ? "iq-mission-hq-screen__rail-item--locked" : "",
                isComplete ? "iq-mission-hq-screen__rail-item--complete" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              title={entry.label}
            >
              <span className="iq-mission-hq-screen__rail-icon" aria-hidden>
                {isLocked ? "🔒" : SECTION_ICONS[entry.id] ?? entry.emoji}
              </span>
              <span className="iq-mission-hq-screen__rail-label">{entry.label}</span>
            </div>
          );
        })}
      </aside>

      <div className="iq-mission-hq-screen__stage">
        <header className="iq-mission-hq-screen__topbar">
          <button
            type="button"
            className="iq-mission-hq-screen__back"
            onClick={onDismiss}
            aria-label="Back to Business Island"
          >
            <span aria-hidden>←</span>
          </button>

          <div className="iq-mission-hq-screen__brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={company.companyLogoUrl ?? company.logoSrc}
              alt=""
              width={28}
              height={28}
              className="iq-mission-hq-screen__logo"
            />
            <span className="iq-mission-hq-screen__section-pill">{section.label}</span>
          </div>

          <div className="iq-mission-hq-screen__xp" aria-label={`${xp} experience points`}>
            <span className="iq-mission-hq-screen__xp-hex" aria-hidden>
              XP
            </span>
            <span className="iq-mission-hq-screen__xp-value">
              {xp.toLocaleString()}
            </span>
          </div>
        </header>

        <main className="iq-mission-hq-screen__main">
          <InvestorPrincipleMissionPanelContent
            companyId={companyId}
            principle={principle}
            showStartCta={principle.status === "active"}
            onStartMission={onStartMission}
          />
        </main>

        <nav className="iq-mission-hq-screen__stepper" aria-label="Mission progress">
          <div className="iq-mission-hq-screen__step iq-mission-hq-screen__step--active">
            <span className="iq-mission-hq-screen__step-dot" aria-hidden>
              ⚑
            </span>
            <span className="iq-mission-hq-screen__step-label">
              Mission {missionOrdinal} of {missionTotal}
            </span>
          </div>
          <span className="iq-mission-hq-screen__step-line" aria-hidden />
          <div className="iq-mission-hq-screen__step">
            <span className="iq-mission-hq-screen__step-dot" aria-hidden>
              📄
            </span>
            <span className="iq-mission-hq-screen__step-label">Challenge</span>
          </div>
          <span className="iq-mission-hq-screen__step-line" aria-hidden />
          <div className="iq-mission-hq-screen__step">
            <span className="iq-mission-hq-screen__step-dot" aria-hidden>
              🎁
            </span>
            <span className="iq-mission-hq-screen__step-label">Reward</span>
          </div>
        </nav>
      </div>
    </div>,
    document.body
  );
}
