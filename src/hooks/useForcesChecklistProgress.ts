"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { CompanyId } from "@/data/companies";
import {
  resolveForcesInvestorChecklistSnapshot,
  type ForcesInvestorChecklistSnapshot
} from "@/lib/forces/forcesInvestorFramework";
import {
  FORCES_INVESTOR_FRAMEWORK_CHANGED_EVENT,
  readForcesInvestorFrameworkState
} from "@/lib/forces/forcesInvestorFrameworkStorage";
import { SCHOOLS_DEMO_RESET_EVENT } from "@/lib/schools/resetSchoolsDemoProgress";

type Options = {
  companyId: CompanyId;
};

/** Reactive Risk Island Investor Checklist — groups, sections, principles. */
export function useForcesChecklistProgress({ companyId }: Options): {
  snapshot: ForcesInvestorChecklistSnapshot;
  refresh: () => void;
} {
  const [tick, setTick] = useState(0);
  const [stored, setStored] = useState(() => readForcesInvestorFrameworkState(companyId));

  const refresh = useCallback(() => {
    setStored(readForcesInvestorFrameworkState(companyId));
    setTick((n) => n + 1);
  }, [companyId]);

  useEffect(() => {
    const onReset = () => refresh();
    const onFrameworkChange = () => refresh();
    window.addEventListener(SCHOOLS_DEMO_RESET_EVENT, onReset);
    window.addEventListener(FORCES_INVESTOR_FRAMEWORK_CHANGED_EVENT, onFrameworkChange);
    window.addEventListener("storage", onFrameworkChange);
    return () => {
      window.removeEventListener(SCHOOLS_DEMO_RESET_EVENT, onReset);
      window.removeEventListener(FORCES_INVESTOR_FRAMEWORK_CHANGED_EVENT, onFrameworkChange);
      window.removeEventListener("storage", onFrameworkChange);
    };
  }, [refresh]);

  const snapshot = useMemo(
    () =>
      resolveForcesInvestorChecklistSnapshot({
        companyId,
        stored
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick busts cache after demo reset
    [companyId, stored, tick]
  );

  return { snapshot, refresh };
}
