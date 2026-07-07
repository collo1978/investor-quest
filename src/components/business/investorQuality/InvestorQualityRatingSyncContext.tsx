"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

import type {
  InvestorQualityChecklistItemId,
  InvestorQualityRatingValue
} from "@/lib/business/investorQualityChecklist";

export const INVESTOR_QUALITY_RATING_INTRO_PULSE_MS = 2800;
export const INVESTOR_QUALITY_EVIDENCE_REVIEW_HIGHLIGHT_MS = 2600;

type LiveRatings = Partial<
  Record<InvestorQualityChecklistItemId, InvestorQualityRatingValue>
>;

type RatingSyncContextValue = {
  activeItemId: InvestorQualityChecklistItemId | null;
  liveRatings: LiveRatings;
  introPulseItemIds: readonly InvestorQualityChecklistItemId[];
  expandedEvidenceItemId: InvestorQualityChecklistItemId | null;
  reviewHighlightItemId: InvestorQualityChecklistItemId | null;
  setActiveItemId: (itemId: InvestorQualityChecklistItemId | null) => void;
  setLiveRating: (
    itemId: InvestorQualityChecklistItemId,
    value: InvestorQualityRatingValue
  ) => void;
  triggerIntroPulse: (itemIds: readonly InvestorQualityChecklistItemId[]) => void;
  toggleEvidenceExpand: (itemId: InvestorQualityChecklistItemId) => void;
  closeEvidenceExpand: () => void;
  requestEvidenceReview: (itemId: InvestorQualityChecklistItemId) => void;
};

const InvestorQualityRatingSyncContext =
  createContext<RatingSyncContextValue | null>(null);

export function InvestorQualityRatingSyncProvider({
  children
}: {
  children: ReactNode;
}) {
  const [activeItemId, setActiveItemId] =
    useState<InvestorQualityChecklistItemId | null>(null);
  const [liveRatings, setLiveRatings] = useState<LiveRatings>({});
  const [introPulseItemIds, setIntroPulseItemIds] = useState<
    readonly InvestorQualityChecklistItemId[]
  >([]);
  const [expandedEvidenceItemId, setExpandedEvidenceItemId] =
    useState<InvestorQualityChecklistItemId | null>(null);
  const [reviewHighlightItemId, setReviewHighlightItemId] =
    useState<InvestorQualityChecklistItemId | null>(null);

  const setLiveRating = useCallback(
    (itemId: InvestorQualityChecklistItemId, value: InvestorQualityRatingValue) => {
      setLiveRatings((prev) => ({ ...prev, [itemId]: value }));
    },
    []
  );

  const triggerIntroPulse = useCallback(
    (itemIds: readonly InvestorQualityChecklistItemId[]) => {
      if (itemIds.length === 0) return;
      setIntroPulseItemIds([...itemIds]);
    },
    []
  );

  const toggleEvidenceExpand = useCallback(
    (itemId: InvestorQualityChecklistItemId) => {
      setExpandedEvidenceItemId((prev) => (prev === itemId ? null : itemId));
    },
    []
  );

  const closeEvidenceExpand = useCallback(() => {
    setExpandedEvidenceItemId(null);
  }, []);

  const requestEvidenceReview = useCallback(
    (itemId: InvestorQualityChecklistItemId) => {
      setExpandedEvidenceItemId(itemId);
      setReviewHighlightItemId(itemId);
    },
    []
  );

  useEffect(() => {
    if (introPulseItemIds.length === 0) return;
    const timer = window.setTimeout(
      () => setIntroPulseItemIds([]),
      INVESTOR_QUALITY_RATING_INTRO_PULSE_MS
    );
    return () => window.clearTimeout(timer);
  }, [introPulseItemIds]);

  useEffect(() => {
    if (!reviewHighlightItemId) return;
    const timer = window.setTimeout(
      () => setReviewHighlightItemId(null),
      INVESTOR_QUALITY_EVIDENCE_REVIEW_HIGHLIGHT_MS
    );
    return () => window.clearTimeout(timer);
  }, [reviewHighlightItemId]);

  const value = useMemo(
    () => ({
      activeItemId,
      liveRatings,
      introPulseItemIds,
      expandedEvidenceItemId,
      reviewHighlightItemId,
      setActiveItemId,
      setLiveRating,
      triggerIntroPulse,
      toggleEvidenceExpand,
      closeEvidenceExpand,
      requestEvidenceReview
    }),
    [
      activeItemId,
      liveRatings,
      introPulseItemIds,
      expandedEvidenceItemId,
      reviewHighlightItemId,
      setLiveRating,
      triggerIntroPulse,
      toggleEvidenceExpand,
      closeEvidenceExpand,
      requestEvidenceReview
    ]
  );

  return (
    <InvestorQualityRatingSyncContext.Provider value={value}>
      {children}
    </InvestorQualityRatingSyncContext.Provider>
  );
}

export function useInvestorQualityRatingSync(): RatingSyncContextValue | null {
  return useContext(InvestorQualityRatingSyncContext);
}
