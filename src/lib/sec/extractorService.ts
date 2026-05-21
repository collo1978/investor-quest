import { requireSecApiKey } from "@/lib/sec/env";
import { SecApiRequestError } from "@/lib/sec/secApiClient";

const EXTRACTOR_ORIGIN = "https://api.sec-api.io/extractor";
const MAX_SECTION_CHARS = 500_000;
const PROCESSING_RETRIES = 4;
const PROCESSING_DELAY_MS = 750;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeExtractedText(raw: string): {
  text: string;
  truncated: boolean;
} {
  const trimmed = raw.trim();
  if (trimmed.length <= MAX_SECTION_CHARS) {
    return { text: trimmed, truncated: false };
  }
  return {
    text: trimmed.slice(0, MAX_SECTION_CHARS),
    truncated: true
  };
}

/** Extract a single 10-K / 10-Q section via SEC-API.io Extractor API. */
export async function extractFilingSection(params: {
  filingUrl: string;
  extractorItem: string;
}): Promise<{ text: string; truncated: boolean }> {
  const key = requireSecApiKey();
  const url = new URL(EXTRACTOR_ORIGIN);
  url.searchParams.set("url", params.filingUrl);
  url.searchParams.set("item", params.extractorItem);
  url.searchParams.set("type", "text");
  url.searchParams.set("token", key);

  let lastBody = "";

  for (let attempt = 0; attempt < PROCESSING_RETRIES; attempt++) {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Authorization: key, Accept: "text/plain" },
      cache: "no-store"
    });

    lastBody = await res.text();

    if (res.ok && lastBody && !lastBody.toLowerCase().includes("processing")) {
      return normalizeExtractedText(lastBody);
    }

    if (res.status === 404) {
      throw new SecApiRequestError(
        `Section ${params.extractorItem} not found in filing.`,
        404
      );
    }

    if (attempt < PROCESSING_RETRIES - 1) {
      await sleep(PROCESSING_DELAY_MS);
    }
  }

  if (!lastBody.trim()) {
    throw new SecApiRequestError("Extractor returned empty section.", 502);
  }

  return normalizeExtractedText(lastBody);
}
