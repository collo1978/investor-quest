/**
 * Engine — persistence index.
 *
 * Public surface for the persistence layer. The engine talks to
 * `ProgressionStore`; concrete adapters can be swapped at the app
 * boundary (e.g. <GameProvider store={remoteStore} />).
 */

export type {
  ProgressionStore,
  StoreSubscriber,
  StoreSync
} from "@/engine/persistence/store";

export { localStorageStore } from "@/engine/persistence/localStorageStore";
export { memoryStore, createMemoryStore } from "@/engine/persistence/memoryStore";

import { localStorageStore } from "@/engine/persistence/localStorageStore";
import { memoryStore } from "@/engine/persistence/memoryStore";

/**
 * The default store used in the app: `localStorage` in the browser and
 * an in-memory store on the server. Both implement the same interface.
 */
export function defaultStore() {
  return typeof window === "undefined" ? memoryStore : localStorageStore;
}
