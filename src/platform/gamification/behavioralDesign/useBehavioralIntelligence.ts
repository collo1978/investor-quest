"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { buildBehavioralIntelligence } from "@/platform/gamification/behavioralDesign/buildBehavioralIntelligence";
import { buildPlaceholderAnalyticsSnapshot } from "@/platform/gamification/behavioralDesign/analytics/placeholderAnalytics";
import {
  DEFAULT_BEHAVIORAL_AUDIT_SCORES,
  BEHAVIORAL_AUDIT_STORAGE_KEY
} from "@/platform/gamification/behavioralDesign/defaultScores";
import type { BehavioralAuditScores } from "@/platform/gamification/behavioralDesign/types";
import type { BehavioralIntelligenceReport } from "@/platform/gamification/behavioralDesign/analytics/types";

function loadScores(): BehavioralAuditScores {
  if (typeof window === "undefined") return DEFAULT_BEHAVIORAL_AUDIT_SCORES;
  try {
    const raw = window.localStorage.getItem(BEHAVIORAL_AUDIT_STORAGE_KEY);
    if (!raw) return DEFAULT_BEHAVIORAL_AUDIT_SCORES;
    return { ...DEFAULT_BEHAVIORAL_AUDIT_SCORES, ...JSON.parse(raw) } as BehavioralAuditScores;
  } catch {
    return DEFAULT_BEHAVIORAL_AUDIT_SCORES;
  }
}

export function useBehavioralIntelligence() {
  const [scores, setScores] = useState<BehavioralAuditScores>(DEFAULT_BEHAVIORAL_AUDIT_SCORES);
  const [hydrated, setHydrated] = useState(false);
  const [includeAnalytics, setIncludeAnalytics] = useState(true);

  useEffect(() => {
    setScores(loadScores());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: BehavioralAuditScores) => {
    setScores(next);
    try {
      window.localStorage.setItem(BEHAVIORAL_AUDIT_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const resetToDefaults = useCallback(() => {
    persist(DEFAULT_BEHAVIORAL_AUDIT_SCORES);
  }, [persist]);

  const intelligence: BehavioralIntelligenceReport | null = useMemo(() => {
    if (!hydrated) return null;
    const analytics = includeAnalytics ? buildPlaceholderAnalyticsSnapshot(28) : null;
    return buildBehavioralIntelligence({ manualScores: scores, analytics });
  }, [scores, hydrated, includeAnalytics]);

  const report = intelligence?.audit ?? null;

  return {
    scores,
    setScores: persist,
    resetToDefaults,
    report,
    intelligence,
    hydrated,
    includeAnalytics,
    setIncludeAnalytics
  };
}
