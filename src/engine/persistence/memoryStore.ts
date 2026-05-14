/**
 * Engine — in-memory adapter implementing `ProgressionStore`.
 *
 * Used during SSR and in tests. Safe to call from anywhere; never
 * touches `window`.
 */

import type { GameState } from "@/engine/progression/state";
import type { ProgressionStore } from "@/engine/persistence/store";

export function createMemoryStore(initial?: GameState | null): ProgressionStore {
  let snapshot: GameState | null = initial ?? null;
  const subscribers = new Set<(state: GameState) => void>();

  return {
    id: "memory",

    async load() {
      return snapshot;
    },

    async save(state) {
      snapshot = state;
      for (const s of subscribers) s(state);
    },

    async clear() {
      snapshot = null;
    },

    subscribe(handler) {
      subscribers.add(handler);
      return () => subscribers.delete(handler);
    }
  };
}

/** Singleton for the SSR/no-op path. */
export const memoryStore: ProgressionStore = createMemoryStore(null);
