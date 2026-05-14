import { FILING_WEIGHTS } from "./weights";
import type { ConvictionRecord } from "./types";

export type ConvictionMeter = {
  confidentPct: number;
  cautiousPct: number;
  confidentWeight: number;
  cautiousWeight: number;
};

export function meterForTicker(
  ticker: string,
  records: readonly ConvictionRecord[]
): ConvictionMeter {
  const rows = records.filter(
    (r) => r.ticker.toUpperCase() === ticker.toUpperCase()
  );
  let confidentWeight = 0;
  let cautiousWeight = 0;
  for (const r of rows) {
    const w = FILING_WEIGHTS[r.filing] ?? 1;
    if (r.conviction === "confident") confidentWeight += w;
    else cautiousWeight += w;
  }
  const total = confidentWeight + cautiousWeight;
  if (total <= 0) {
    return {
      confidentPct: 0,
      cautiousPct: 0,
      confidentWeight: 0,
      cautiousWeight: 0
    };
  }
  return {
    confidentPct: Math.round((confidentWeight / total) * 100),
    cautiousPct: Math.round((cautiousWeight / total) * 100),
    confidentWeight,
    cautiousWeight
  };
}

export type LeaderboardRow = {
  rank: number;
  ticker: string;
  confidentPct: number;
};

/** One row per ticker; score = weighted confident share. */
export function convictionLeaderboard(
  records: readonly ConvictionRecord[]
): LeaderboardRow[] {
  const byTicker = new Map<string, ConvictionRecord[]>();
  for (const r of records) {
    const k = r.ticker.toUpperCase();
    const arr = byTicker.get(k) ?? [];
    arr.push(r);
    byTicker.set(k, arr);
  }
  const rows: LeaderboardRow[] = [];
  for (const [ticker, list] of byTicker) {
    const m = meterForTicker(ticker, list);
    if (m.confidentWeight + m.cautiousWeight === 0) continue;
    rows.push({ rank: 0, ticker, confidentPct: m.confidentPct });
  }
  rows.sort((a, b) => b.confidentPct - a.confidentPct);
  rows.forEach((r, i) => {
    r.rank = i + 1;
  });
  return rows;
}
