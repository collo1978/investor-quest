/**
 * SEC Content Layer — section parser (stub).
 *
 * Splits a raw filing into addressable sections. Stub only.
 */

import type { SecFilingRef, SecSection } from "@/sec/types";

export type SecParser = {
  /**
   * Given a raw filing document, return its sections (keyed by stable
   * section ids such as `item-1`, `item-1a`, `item-7`).
   */
  parse: (filing: SecFilingRef, rawText: string) => Promise<SecSection[]>;
};

export const stubSecParser: SecParser = {
  async parse() {
    return [];
  }
};
