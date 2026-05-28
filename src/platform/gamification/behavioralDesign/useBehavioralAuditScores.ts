"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { DEFAULT_BEHAVIORAL_AUDIT_SCORES, BEHAVIORAL_AUDIT_STORAGE_KEY } from "@/platform/gamification/behavioralDesign/defaultScores";
import { evaluateBehavioralDesign } from "@/platform/gamification/behavioralDesign/evaluateBehavioralDesign";
import type { BehavioralAuditScores } from "@/platform/gamification/behavioralDesign/types";

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

export function useBehavioralAuditScores() {
  const [scores, setScores] = useState<BehavioralAuditScores>(DEFAULT_BEHAVIORAL_AUDIT_SCORES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setScores(loadScores());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: BehavioralAuditScores) => {
    setScores(next);
    try {
      window.localStorage.setItem(BEHAVIORAL_AUDIT_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota */
    }
  }, []);

  const resetToDefaults = useCallback(() => {
    persist(DEFAULT_BEHAVIORAL_AUDIT_SCORES);
  }, [persist]);

  const report = useMemo(
    () => (hydrated ? evaluateBehavioralDesign(scores) : null),
    [scores, hydrated]
  );

  return { scores, setScores: persist, resetToDefaults, report, hydrated };
}
