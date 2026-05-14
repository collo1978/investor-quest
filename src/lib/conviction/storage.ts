import type { ConvictionRecord } from "./types";

const STORAGE_KEY = "investor-quest::conviction-records::v1";

function readRaw(): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function parseRecord(v: unknown): ConvictionRecord | null {
  if (!isRecord(v)) return null;
  const ticker = v.ticker;
  const island = v.island;
  const filing = v.filing;
  const conviction = v.conviction;
  const timestamp = v.timestamp;
  if (typeof ticker !== "string" || typeof island !== "string") return null;
  if (filing !== "10-K" && filing !== "10-Q" && filing !== "Earnings call")
    return null;
  if (conviction !== "confident" && conviction !== "cautious") return null;
  if (typeof timestamp !== "number") return null;
  return {
    ticker,
    island,
    filing,
    conviction,
    timestamp
  };
}

export function loadConvictionRecords(): ConvictionRecord[] {
  return readRaw()
    .map(parseRecord)
    .filter((x): x is ConvictionRecord => x !== null);
}

export function appendConvictionRecord(record: ConvictionRecord): void {
  if (typeof window === "undefined") return;
  const next = [...loadConvictionRecords(), record];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("conviction-updated"));
  } catch {
    // quota
  }
}
