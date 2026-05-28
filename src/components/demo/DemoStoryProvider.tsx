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
  advanceDemoStoryStep,
  deactivateDemoStory,
  getDemoStorySnapshot,
  subscribeDemoStory,
  type DemoStoryStep
} from "@/lib/demo/demoStoryMode";

type DemoStoryContextValue = {
  active: boolean;
  step: DemoStoryStep;
  advance: (next: DemoStoryStep) => void;
  exit: () => void;
};

const DemoStoryContext = createContext<DemoStoryContextValue | null>(null);

export function DemoStoryProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeDemoStory,
    getDemoStorySnapshot,
    getDemoStorySnapshot
  );

  const advance = useCallback((next: DemoStoryStep) => {
    advanceDemoStoryStep(next);
  }, []);

  const exit = useCallback(() => {
    deactivateDemoStory();
  }, []);

  const value = useMemo<DemoStoryContextValue>(
    () => ({
      active: snapshot.active,
      step: snapshot.step,
      advance,
      exit
    }),
    [advance, exit, snapshot.active, snapshot.step]
  );

  return (
    <DemoStoryContext.Provider value={value}>{children}</DemoStoryContext.Provider>
  );
}

export function useDemoStory(): DemoStoryContextValue {
  const ctx = useContext(DemoStoryContext);
  if (!ctx) {
    return {
      active: false,
      step: "logo",
      advance: () => undefined,
      exit: () => undefined
    };
  }
  return ctx;
}
