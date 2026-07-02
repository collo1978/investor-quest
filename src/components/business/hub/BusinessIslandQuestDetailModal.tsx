"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";
import type { Company } from "@/data/companies";
import { trackUserEvent } from "@/lib/analytics/trackUserEvent";
import { preloadQuestDetailChunks } from "@/lib/quests/preloadQuestDetailChunks";
import { resolveSchoolsHubQuestHref } from "@/lib/schools/schoolsDemoHref";

type Props = {
  open: boolean;
  card: BusinessHubQuestCard | null;
  company: Company;
  partnerId?: string;
  userId?: string;
  onClose: () => void;
  onBeforeQuestNavigate?: (href: string) => void;
};

function resolveCtaLabel(card: BusinessHubQuestCard): string {
  if (card.completed) return "Review Quest";
  if (card.progressPct > 0) return "Continue Quest";
  return "Enter Quest";
}

export function BusinessIslandQuestDetailModal({
  open,
  card,
  company,
  partnerId,
  userId,
  onClose,
  onBeforeQuestNavigate
}: Props) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!mounted || !card) return null;

  const questHref =
    resolveSchoolsHubQuestHref(card.route, pathname) ?? card.route;
  const ctaLabel = resolveCtaLabel(card);

  const cardStyle = {
    ["--mission-accent" as string]: "#fbbf24",
    ["--mission-edge" as string]: "#ca8a04",
    ["--mission-glow" as string]: "rgba(251, 191, 36, 0.45)"
  };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="iq-business-island-quest-modal__backdrop pointer-events-auto"
            aria-label="Close quest details"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            onClick={onClose}
          />
          <motion.div
            className="iq-business-island-quest-modal pointer-events-auto"
            role="dialog"
            aria-modal="true"
            aria-label={`Quest ${card.orderNumber}: ${card.title}`}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="iq-business-island-quest-modal__close"
              onClick={onClose}
              aria-label="Close quest"
            >
              ×
            </button>

            <article
              className={[
                "iq-schools-hub-mission-card iq-business-island-quest-modal__card",
                card.completed
                  ? "iq-schools-hub-mission-card--completed"
                  : "iq-schools-hub-mission-card--primary"
              ].join(" ")}
              style={cardStyle}
            >
              <header className="iq-schools-hub-mission-card__header">
                <span className="iq-schools-hub-mission-card__num">
                  {card.orderNumber}
                </span>
                {card.completed ? (
                  <span className="iq-schools-hub-mission-card__done-chip">
                    Complete
                  </span>
                ) : null}
              </header>

              <h2 className="iq-schools-hub-mission-card__title">{card.title}</h2>
              {card.subtitle ? (
                <p className="iq-schools-hub-mission-card__desc">{card.subtitle}</p>
              ) : null}

              <div className="iq-schools-hub-mission-card__progress">
                <div
                  className="iq-schools-hub-mission-card__progress-track"
                  role="progressbar"
                  aria-valuenow={card.progressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Quest progress ${card.progressPct} percent`}
                >
                  <div
                    className="iq-schools-hub-mission-card__progress-fill"
                    style={{ width: `${card.progressPct}%` }}
                  />
                </div>
                <span className="iq-schools-hub-mission-card__progress-pct">
                  {card.progressPct}%
                </span>
              </div>

              <Link
                href={questHref}
                prefetch
                scroll
                className="iq-business-island-quest-modal__enter iq-schools-hub-mission-card__cta"
                onPointerEnter={() => preloadQuestDetailChunks()}
                onClick={(event) => {
                  if (onBeforeQuestNavigate) {
                    event.preventDefault();
                    onBeforeQuestNavigate(questHref);
                  }
                  trackUserEvent({
                    eventType: "user_started_quest",
                    pillar: "Business",
                    questId: card.questId,
                    companyTicker: company.ticker,
                    companyName: company.name,
                    partnerId,
                    userId,
                    metadata: {
                      questTitle: card.title,
                      orderNumber: card.orderNumber,
                      route: card.route,
                      visualState: card.visualState,
                      entry: "island-quest-marker"
                    }
                  });
                }}
              >
                {ctaLabel}
              </Link>
            </article>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
