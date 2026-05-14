/**
 * Engine — persistence abstraction.
 *
 * `ProgressionStore` is the boundary between the engine and *any* backing
 * store. Today we ship `localStorage` and `memory` adapters; tomorrow
 * the same interface can be implemented by a remote database, an
 * authenticated user account, an IndexedDB cache, or a cross-device
 * sync service — without touching the data, engine, or UI layers.
 *
 * Async-by-default so remote stores fit naturally. Sync adapters
 * (localStorage / memory) simply resolve immediately.
 */

import type { GameState } from "@/engine/progression/state";

export type StoreSubscriber = (state: GameState) => void;

export interface ProgressionStore {
  /** Identifier (useful for debugging / telemetry). */
  readonly id: string;

  /**
   * Load the persisted state. Returns `null` if nothing has been saved
   * yet so the caller can fall back to a fresh `initialState()`.
   */
  load(): Promise<GameState | null>;

  /** Persist the full state snapshot. */
  save(state: GameState): Promise<void>;

  /** Erase the persisted state. */
  clear(): Promise<void>;

  /**
   * Optional hook for remote stores that push updates (websocket, BroadcastChannel,
   * Supabase realtime, etc.). Local stores can return a no-op unsubscribe.
   * Returns an unsubscribe function.
   */
  subscribe?(handler: StoreSubscriber): () => void;
}

/**
 * Lightweight result type used by the engine host when applying an
 * action: lets a remote store sync deltas instead of full snapshots.
 */
export type StoreSync = {
  store: ProgressionStore;
  /** Optional middleware: receive every action + resulting state. */
  onAction?: (input: {
    action: unknown; // GameAction — kept loose here to avoid circular import
    state: GameState;
  }) => void;
};
