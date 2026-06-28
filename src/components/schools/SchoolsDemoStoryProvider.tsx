"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode
} from "react";

import {
  advanceSchoolsDemoStoryStep,
  deactivateSchoolsDemoStory,
  getSchoolsDemoStorySnapshot,
  subscribeSchoolsDemoStory,
  type SchoolsDemoStoryStep
} from "@/lib/schools/schoolsDemoStoryMode";

type SchoolsDemoStoryContextValue = {
  active: boolean;
  step: SchoolsDemoStoryStep;
  advance: (next: SchoolsDemoStoryStep) => void;
  exit: () => void;
};

const SchoolsDemoStoryContext =
  createContext<SchoolsDemoStoryContextValue | null>(null);

export function SchoolsDemoStoryProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeSchoolsDemoStory,
    getSchoolsDemoStorySnapshot,
    getSchoolsDemoStorySnapshot
  );

  const advance = useCallback((next: SchoolsDemoStoryStep) => {
    advanceSchoolsDemoStoryStep(next);
  }, []);

  const exit = useCallback(() => {
    deactivateSchoolsDemoStory();
  }, []);

  const value = useMemo<SchoolsDemoStoryContextValue>(
    () => ({
      active: snapshot.active,
      step: snapshot.step,
      advance,
      exit
    }),
    [advance, exit, snapshot.active, snapshot.step]
  );

  return (
    <SchoolsDemoStoryContext.Provider value={value}>
      {children}
    </SchoolsDemoStoryContext.Provider>
  );
}

export function useSchoolsDemoStory(): SchoolsDemoStoryContextValue {
  const ctx = useContext(SchoolsDemoStoryContext);
  if (!ctx) {
    return {
      active: false,
      step: "mission-brief-invitation",
      advance: () => undefined,
      exit: () => undefined
    };
  }
  return ctx;
}
