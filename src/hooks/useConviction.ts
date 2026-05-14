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
  const [records, setRecords] = useState<ConvictionRecord[]>(() =>
    typeof window === "undefined" ? [] : loadConvictionRecords()
  );

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
