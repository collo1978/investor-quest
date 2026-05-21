import { requireSecApiKey } from "@/lib/sec/env";
import { SecApiRequestError } from "@/lib/sec/secApiClient";

const ARCHIVE_ORIGIN = "https://archive.sec-api.io";

/**
 * Convert a sec.gov EDGAR filing URL to SEC-API.io Archive Download URL.
 * Backend-only — never call sec.gov directly from the client.
 */
export function toSecArchiveUrl(edgarUrl: string): string {
  const key = requireSecApiKey();
  const match = edgarUrl.match(
    /\/Archives\/edgar\/data\/(\d+)\/(\d+)\/([^/?#]+)/i
  );

  if (!match) {
    throw new Error(`Cannot map EDGAR URL to SEC-API archive: ${edgarUrl}`);
  }

  const [, cik, accession, filename] = match;
  const path = `${cik}/${accession}/${filename}`;
  return `${ARCHIVE_ORIGIN}/${path}?token=${encodeURIComponent(key)}`;
}

/** Download filing HTML/text via SEC-API.io Archive (not direct sec.gov). */
export async function downloadFilingContent(edgarUrl: string): Promise<string> {
  const archiveUrl = toSecArchiveUrl(edgarUrl);
  const res = await fetch(archiveUrl, {
    method: "GET",
    headers: { Authorization: requireSecApiKey() },
    cache: "no-store"
  });

  if (!res.ok) {
    throw new SecApiRequestError(
      `SEC-API archive download failed (${res.status})`,
      res.status
    );
  }

  return res.text();
}
