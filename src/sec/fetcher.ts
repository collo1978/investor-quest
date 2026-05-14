/**
 * SEC Content Layer — filing fetcher (stub).
 *
 * Future home for SEC EDGAR fetch logic. Not yet implemented; kept as
 * an interface so callers can be wired now and swapped later.
 */

import type { CompanyId } from "@/data/companies";
import type { SecFilingRef, SecForm } from "@/sec/types";

export type SecFetcher = {
  listFilings: (
    companyId: CompanyId,
    form: SecForm,
    opts?: { limit?: number }
  ) => Promise<SecFilingRef[]>;
  getSectionText: (
    filing: SecFilingRef,
    sectionId: string
  ) => Promise<string | null>;
};

/** Placeholder implementation; returns empty results. Replace with a real EDGAR client. */
export const stubSecFetcher: SecFetcher = {
  async listFilings() {
    return [];
  },
  async getSectionText() {
    return null;
  }
};
