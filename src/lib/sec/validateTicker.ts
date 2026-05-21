/** US equity ticker validation for SEC-API.io lookups. */

const TICKER_PATTERN = /^[A-Z][A-Z0-9.-]{0,9}$/;

export function validateTickerParam(
  raw: string | null
): { ok: true; ticker: string } | { ok: false; error: string } {
  if (!raw?.trim()) {
    return { ok: false, error: "Query parameter `ticker` is required." };
  }

  const ticker = raw.trim().toUpperCase();

  if (!TICKER_PATTERN.test(ticker)) {
    return {
      ok: false,
      error:
        "Invalid ticker. Use 1–10 characters: letters, digits, dots, or hyphens (e.g. AAPL, BRK.B)."
    };
  }

  return { ok: true, ticker };
}
