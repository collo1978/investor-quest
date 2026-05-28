/**
 * Engine — localStorage adapter implementing `ProgressionStore`.
 *
 * Synchronous under the hood (localStorage is sync) but exposed as async
 * to satisfy the interface; remote stores will be genuinely async.
 *
 * Also listens to the browser `storage` event so the same player in
 * another tab gets cross-tab sync for free.
 */

import { STORAGE_KEY, type GameState } from "@/engine/progression/state";
import {
  clearPersistedSnapshots,
  loadPersistedSnapshot,
  savePersistedSnapshot,
  STORAGE_BACKUP_KEY
} from "@/engine/progression/persistence";
import type { ProgressionStore, StoreSubscriber } from "@/engine/persistence/store";

function isAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!window.localStorage;
  } catch {
    return false;
  }
}

export const localStorageStore: ProgressionStore = {
  id: "localStorage",

  async load() {
    if (!isAvailable()) return null;
    return loadPersistedSnapshot();
  },

  async save(state: GameState) {
    if (!isAvailable()) return;
    savePersistedSnapshot(state, { mergeIfDiskNewer: true });
  },

  async clear() {
    if (!isAvailable()) return;
    clearPersistedSnapshots();
  },

  subscribe(handler: StoreSubscriber) {
    if (!isAvailable()) return () => undefined;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY && e.key !== STORAGE_BACKUP_KEY) return;
      const next = loadPersistedSnapshot();
      if (next) handler(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }
};
