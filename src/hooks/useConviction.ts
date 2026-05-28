"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  appendConvictionRecord,
  convictionLeaderboard,
  loadConvictionRecords,
  meterForTicker,
  type ConvictionRecord,
  type ConvictionMeter,
  type LeaderboardRow
} from "@/lib/conviction";

export function useConviction() {
  // Always start empty so SSR and the first client render match; sync from storage in useEffect.
  const [records, setRecords] = useState<ConvictionRecord[]>([]);

  useEffect(() => {
    const sync = () => setRecords(loadConvictionRecords());
    sync();
    window.addEventListener("conviction-updated", sync);
    return () => window.removeEventListener("conviction-updated", sync);
  }, []);

  const leaderboard = useMemo(
    () => convictionLeaderboard(records),
    [records]
  );

  const meterFor = useCallback(
    (ticker: string): ConvictionMeter => meterForTicker(ticker, records),
    [records]
  );

  const record = useCallback((r: ConvictionRecord) => {
    appendConvictionRecord(r);
  }, []);

  return { records, leaderboard, meterFor, record };
}

export type { ConvictionRecord, ConvictionMeter, LeaderboardRow };
