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
import { migrateRaw } from "@/engine/progression/persistence";
import type { ProgressionStore, StoreSubscriber } from "@/engine/persistence/store";

function isAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!window.localStorage;
  } catch {
    return false;
  }
}

function readRaw(): GameState | null {
  if (!isAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return migrateRaw(parsed);
  } catch {
    return null;
  }
}

export const localStorageStore: ProgressionStore = {
  id: "localStorage",

  async load() {
    return readRaw();
  },

  async save(state: GameState) {
    if (!isAvailable()) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // quota or privacy mode — ignore
    }
  },

  async clear() {
    if (!isAvailable()) return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },

  subscribe(handler: StoreSubscriber) {
    if (!isAvailable()) return () => undefined;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = readRaw();
      if (next) handler(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }
};
