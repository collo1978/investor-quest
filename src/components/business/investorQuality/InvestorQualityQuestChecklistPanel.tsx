"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo } from "react";

import { InvestorQualityChecklistIcon } from "@/components/business/investorQuality/InvestorQualityChecklistIcon";
import {
  ChecklistItemHintIcon,
  InvestorQualityChecklistTooltip
} from "@/components/business/investorQuality/InvestorQualityChecklistTooltip";
import { InvestorQualityChecklistTitleHint } from "@/components/business/investorQuality/InvestorQualityChecklistTitleHint";
import {
  resolveChecklistItem,
  resolveChecklistProgressTone,
  resolveChecklistQuestPanelRows,
  type ChecklistProgressTone,
  type InvestorQualityChecklistItemId,
  type InvestorQualityChecklistSnapshot,
  type InvestorQualityRatingValue
} from "@/lib/business/investorQualityChecklist";
import { resolveInvestorQualityItemTheme } from "@/lib/business/investorQualityChecklistThemes";

type Props = {
  snapshot: InvestorQualityChecklistSnapshot;
  pulseItemIds?: readonly InvestorQualityChecklistItemId[];
  hiddenEvidenceItemIds?: readonly InvestorQualityChecklistItemId[];
  ratingFocusMode?: boolean;
  activeItemId?: InvestorQualityChecklistItemId | null;
  liveRatings?: Partial<
    Record<InvestorQualityChecklistItemId, InvestorQualityRatingValue>
  >;
  introPulseItemIds?: readonly InvestorQualityChecklistItemId[];
  expandedEvidenceItemId?: InvestorQualityChecklistItemId | null;
  reviewHighlightItemId?: InvestorQualityChecklistItemId | null;
  evidenceBulletsByItemId?: Partial<Record<InvestorQualityChecklistItemId, string[]>>;
  onToggleEvidenceExpand?: (itemId: InvestorQualityChecklistItemId) => void;
  onCloseEvidenceExpand?: () => void;
  className?: string;
};

function evidenceBoxClass(
  tone: ChecklistProgressTone,
  isNew: boolean,
  verdictFlash: boolean
): string {
  return [
    "iq-investor-quality-quest-panel__segment",
    "iq-investor-quality-quest-panel__segment--filled",
    `iq-investor-quality-quest-panel__segment--${tone}`,
    isNew ? "iq-investor-quality-quest-panel__segment--new" : "",
    verdictFlash && (tone === "yes" || tone === "no")
      ? `iq-investor-quality-quest-panel__segment--verdict-${tone}`
      : ""
  ]
    .filter(Boolean)
    .join(" ");
}

/** One coloured box per piece of evidence collected — nothing shown until earned. */
function EvidenceBoxes({
  itemId,
  evidenceCount,
  tone,
  pulse,
  illuminated,
  verdictFlash,
  reduceMotion
}: {
  itemId: InvestorQualityChecklistItemId;
  evidenceCount: number;
  tone: ChecklistProgressTone;
  pulse: boolean;
  illuminated?: boolean;
  verdictFlash: boolean;
  reduceMotion: boolean | null;
}) {
  if (evidenceCount <= 0) return null;

  const highlightIndex = pulse ? evidenceCount - 1 : -1;

  return (
    <div
      className={[
        "iq-investor-quality-quest-panel__segments",
        illuminated ? "iq-investor-quality-quest-panel__segments--illuminated" : "",
        verdictFlash ? "iq-investor-quality-quest-panel__segments--verdict-flash" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      role="group"
      aria-label={`${evidenceCount} evidence collected`}
      data-quality={itemId}
    >
      <AnimatePresence initial={false}>
        {Array.from({ length: evidenceCount }, (_, index) => {
          const isNew = index === highlightIndex;
          return (
            <motion.span
              key={`${itemId}-evidence-${index}`}
              layout={!reduceMotion}
              className={evidenceBoxClass(tone, isNew, verdictFlash)}
              style={
                verdictFlash && !reduceMotion
                  ? { animationDelay: `${index * 0.06}s` }
                  : undefined
              }
              initial={
                isNew && !reduceMotion ? { scale: 0.15, opacity: 0 } : false
              }
              animate={
                isNew && pulse && !reduceMotion
                  ? {
                      scale: [0, 1.18, 1],
                      opacity: [0, 1, 1],
                      filter: ["brightness(2)", "brightness(1.35)", "brightness(1)"]
                    }
                  : verdictFlash && !reduceMotion
                    ? { scale: [1, 1.18, 1], opacity: 1 }
                    : { scale: 1, opacity: 1 }
              }
              transition={{
                duration: isNew ? 0.55 : verdictFlash ? 0.72 : 0.32,
                ease: [0.22, 1, 0.36, 1]
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function EvidenceAckBanner({
  itemIds,
  reduceMotion
}: {
  itemIds: readonly InvestorQualityChecklistItemId[];
  reduceMotion: boolean | null;
}) {
  const labels = itemIds.map((id) => resolveChecklistItem(id).label);

  return (
    <motion.div
      className="iq-investor-quality-quest-panel__ack"
      role="status"
      aria-live="polite"
      initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="iq-investor-quality-quest-panel__ack-burst" aria-hidden />
      <span className="iq-investor-quality-quest-panel__ack-icon" aria-hidden>
        ✓
      </span>
      <div className="iq-investor-quality-quest-panel__ack-copy">
        <p className="iq-investor-quality-quest-panel__ack-title">
          Evidence collected
        </p>
        <ul className="iq-investor-quality-quest-panel__ack-items">
          {labels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

/**
 * Living investor profile — evidence boxes appear only as the player earns them.
 */
export function InvestorQualityQuestChecklistPanel({
  snapshot,
  pulseItemIds = [],
  hiddenEvidenceItemIds = [],
  ratingFocusMode = false,
  activeItemId = null,
  liveRatings = {},
  introPulseItemIds = [],
  expandedEvidenceItemId = null,
  reviewHighlightItemId = null,
  evidenceBulletsByItemId = {},
  onToggleEvidenceExpand,
  onCloseEvidenceExpand,
  className = ""
}: Props) {
  const reduceMotion = useReducedMotion();
  const rows = useMemo(
    () => resolveChecklistQuestPanelRows(snapshot),
    [snapshot]
  );
  const pulseSet = useMemo(() => new Set(pulseItemIds), [pulseItemIds]);
  const introPulseSet = useMemo(
    () => new Set(introPulseItemIds),
    [introPulseItemIds]
  );
  const hiddenSet = useMemo(
    () => new Set(hiddenEvidenceItemIds),
    [hiddenEvidenceItemIds]
  );
  const celebrating = pulseItemIds.length > 0 && !ratingFocusMode;
  const introPulsing = introPulseItemIds.length > 0 && ratingFocusMode;

  const totalEvidence = useMemo(
    () =>
      rows.reduce((sum, row) => sum + row.evidenceCount, 0),
    [rows]
  );

  useEffect(() => {
    if (!reviewHighlightItemId) return;
    const row = document.querySelector(
      `[data-checklist-item-id="${reviewHighlightItemId}"]`
    );
    row?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [reviewHighlightItemId, expandedEvidenceItemId]);

  return (
    <aside
      className={[
        "iq-investor-quality-quest-panel pointer-events-auto",
        celebrating ? "iq-investor-quality-quest-panel--celebrate" : "",
        ratingFocusMode ? "iq-investor-quality-quest-panel--rating-focus" : "",
        introPulsing ? "iq-investor-quality-quest-panel--intro-pulse" : "",
        totalEvidence >= 8 ? "iq-investor-quality-quest-panel--profile-rich" : "",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Investor Checklist"
    >
      <div className="iq-investor-quality-quest-panel__shell">
        <span className="iq-investor-quality-quest-panel__rim" aria-hidden />
        <span className="iq-investor-quality-quest-panel__halo" aria-hidden />

        <header className="iq-investor-quality-quest-panel__header">
          <InvestorQualityChecklistTitleHint
            title="Investor Checklist"
            titleClassName="iq-investor-quality-quest-panel__title"
            className="iq-investor-quality-quest-panel__title-hint"
          />
          {!ratingFocusMode ? (
            <p className="iq-investor-quality-quest-panel__subtitle">
              Great investors don&apos;t guess. They collect evidence.
            </p>
          ) : null}
        </header>

        <AnimatePresence initial={false}>
          {celebrating ? (
            <EvidenceAckBanner
              key={pulseItemIds.join(",")}
              itemIds={pulseItemIds}
              reduceMotion={reduceMotion}
            />
          ) : null}
        </AnimatePresence>

        <ol className="iq-investor-quality-quest-panel__list">
          {rows.map((row, rowIndex) => {
            const pulse = pulseSet.has(row.id);
            const introPulse = introPulseSet.has(row.id);
            const hiddenIncoming = hiddenSet.has(row.id);
            const displayEvidence = Math.max(
              0,
              row.filledSegments - (hiddenIncoming ? 1 : 0)
            );
            const liveRating = liveRatings[row.id];
            const storedRating = snapshot.ratings[row.id]?.value;
            const tone = resolveChecklistProgressTone(
              row.evidenceCount,
              liveRating ?? storedRating
            );
            const isActive =
              ratingFocusMode && activeItemId != null && row.id === activeItemId;
            const isRatedInSession = liveRating != null;
            const isDimmed =
              ratingFocusMode &&
              activeItemId != null &&
              introPulseItemIds.length === 0 &&
              !isActive &&
              !isRatedInSession;
            const theme = resolveInvestorQualityItemTheme(row.id);
            const isExpanded =
              ratingFocusMode && expandedEvidenceItemId === row.id;
            const isReviewHighlight =
              ratingFocusMode && reviewHighlightItemId === row.id;
            const evidenceBullets = evidenceBulletsByItemId[row.id] ?? [];
            const canExpandEvidence =
              ratingFocusMode && row.evidenceCount > 0 && onToggleEvidenceExpand;

            const rowInner = (
              <>
                {isActive ? (
                  <>
                    <span
                      className="iq-investor-quality-quest-panel__row-aura"
                      aria-hidden
                    />
                    <span
                      className="iq-investor-quality-quest-panel__row-shimmer"
                      aria-hidden
                    />
                    <span className="iq-investor-quality-quest-panel__active-tag">
                      CURRENT
                    </span>
                  </>
                ) : null}

                {canExpandEvidence ? (
                  <div className="iq-investor-quality-quest-panel__row-head iq-investor-quality-quest-panel__row-head--interactive">
                    <button
                      type="button"
                      className="iq-investor-quality-quest-panel__row-head-toggle"
                      aria-expanded={isExpanded}
                      onClick={() => onToggleEvidenceExpand(row.id)}
                    >
                      <span
                        className="iq-investor-quality-quest-panel__index"
                        aria-hidden
                      >
                        {rowIndex + 1}
                      </span>
                      <InvestorQualityChecklistIcon itemId={row.id} lit={isActive} />
                      <span className="iq-investor-quality-quest-panel__label">
                        {row.label}
                      </span>
                      <span className="iq-investor-quality-quest-panel__evidence-count">
                        {row.evidenceCount} Evidence
                      </span>
                    </button>
                    {ratingFocusMode ? (
                      <InvestorQualityChecklistTooltip itemId={row.id} variant="hint" />
                    ) : null}
                    {pulse ? (
                      <span className="iq-investor-quality-quest-panel__row-badge">
                        +1
                      </span>
                    ) : null}
                    {row.ratingLabel && !isActive ? (
                      <span
                        className={[
                          "iq-investor-quality-quest-panel__verdict-chip",
                          tone === "yes"
                            ? "iq-investor-quality-quest-panel__verdict-chip--yes"
                            : tone === "no"
                              ? "iq-investor-quality-quest-panel__verdict-chip--no"
                              : ""
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {row.ratingLabel}
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <div className="iq-investor-quality-quest-panel__row-head">
                    <span
                      className="iq-investor-quality-quest-panel__index"
                      aria-hidden
                    >
                      {rowIndex + 1}
                    </span>
                    <InvestorQualityChecklistIcon itemId={row.id} lit={isActive} />
                    <span className="iq-investor-quality-quest-panel__label">
                      {row.label}
                    </span>
                    {ratingFocusMode && row.evidenceCount > 0 ? (
                      <span className="iq-investor-quality-quest-panel__evidence-count">
                        {row.evidenceCount} Evidence
                      </span>
                    ) : (
                      <ChecklistItemHintIcon className="iq-investor-quality-row-hint--quest-panel" />
                    )}
                    {pulse ? (
                      <span className="iq-investor-quality-quest-panel__row-badge">
                        +1
                      </span>
                    ) : null}
                    {row.ratingLabel && !isActive ? (
                      <span
                        className={[
                          "iq-investor-quality-quest-panel__verdict-chip",
                          tone === "yes"
                            ? "iq-investor-quality-quest-panel__verdict-chip--yes"
                            : tone === "no"
                              ? "iq-investor-quality-quest-panel__verdict-chip--no"
                              : ""
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {row.ratingLabel}
                      </span>
                    ) : null}
                  </div>
                )}

                <EvidenceBoxes
                  itemId={row.id}
                  evidenceCount={displayEvidence}
                  tone={tone}
                  pulse={pulse || introPulse}
                  illuminated={isActive && !isRatedInSession}
                  verdictFlash={isRatedInSession}
                  reduceMotion={reduceMotion}
                />

                <AnimatePresence initial={false}>
                  {isExpanded ? (
                    <motion.div
                      key={`${row.id}-evidence-drawer`}
                      className="iq-investor-quality-quest-panel__evidence-drawer"
                      initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className="iq-investor-quality-quest-panel__evidence-drawer-label">
                        Evidence Collected:
                      </p>
                      {evidenceBullets.length > 0 ? (
                        <ul className="iq-investor-quality-quest-panel__evidence-list">
                          {evidenceBullets.map((bullet, bulletIndex) => (
                            <li key={`${row.id}-bullet-${bulletIndex}`}>{bullet}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="iq-investor-quality-quest-panel__evidence-empty">
                          Evidence collected — review your notes from the quest cards.
                        </p>
                      )}
                      <button
                        type="button"
                        className="iq-investor-quality-quest-panel__evidence-close"
                        onClick={(event) => {
                          event.stopPropagation();
                          onCloseEvidenceExpand?.();
                        }}
                      >
                        Close
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </>
            );

            return (
              <motion.li
                key={row.id}
                data-checklist-item-id={row.id}
                data-quality={row.id}
                layout={false}
                aria-label={`${rowIndex + 1}. ${row.label}`}
                className={[
                  "iq-investor-quality-quest-panel__row",
                  pulse ? "iq-investor-quality-quest-panel__row--pulse" : "",
                  introPulse
                    ? "iq-investor-quality-quest-panel__row--intro-pulse"
                    : "",
                  hiddenIncoming
                    ? "iq-investor-quality-quest-panel__row--incoming"
                    : "",
                  isActive ? "iq-investor-quality-quest-panel__row--active" : "",
                  isExpanded ? "iq-investor-quality-quest-panel__row--expanded" : "",
                  isReviewHighlight
                    ? "iq-investor-quality-quest-panel__row--review-highlight"
                    : "",
                  isDimmed ? "iq-investor-quality-quest-panel__row--dimmed" : "",
                  isRatedInSession && liveRating === "yes"
                    ? "iq-investor-quality-quest-panel__row--rated-yes"
                    : "",
                  isRatedInSession && liveRating === "no"
                    ? "iq-investor-quality-quest-panel__row--rated-no"
                    : "",
                  row.ratingLabel && !isRatedInSession
                    ? "iq-investor-quality-quest-panel__row--assessed"
                    : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={
                  {
                    "--iq-quality-accent": theme.accent,
                    "--iq-quality-glow": theme.glow,
                    "--iq-quality-glow-soft": theme.glowSoft,
                    ...(introPulse && !reduceMotion
                      ? { animationDelay: `${rowIndex * 0.1}s` }
                      : {})
                  } as React.CSSProperties
                }
                animate={
                  pulse && !reduceMotion && !ratingFocusMode
                    ? { opacity: [0.92, 1, 0.92] }
                    : undefined
                }
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                {ratingFocusMode ? (
                  <div className="iq-investor-quality-quest-panel__row-tooltip">
                    {rowInner}
                  </div>
                ) : (
                  <InvestorQualityChecklistTooltip
                    itemId={row.id}
                    variant="row"
                    triggerElement="div"
                    className="iq-investor-quality-quest-panel__row-tooltip"
                  >
                    {rowInner}
                  </InvestorQualityChecklistTooltip>
                )}
              </motion.li>
            );
          })}
        </ol>

        <footer className="iq-investor-quality-quest-panel__legend" aria-label="Assessment legend">
          <span className="iq-investor-quality-quest-panel__legend-item">
            <span className="iq-investor-quality-quest-panel__legend-emoji" aria-hidden>
              🟩
            </span>
            Strong
          </span>
          <span className="iq-investor-quality-quest-panel__legend-item">
            <span className="iq-investor-quality-quest-panel__legend-emoji" aria-hidden>
              🟥
            </span>
            Weak
          </span>
        </footer>
      </div>
    </aside>
  );
}
