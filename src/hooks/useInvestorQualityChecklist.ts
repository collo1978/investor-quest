"use client";

import { useCallback, useEffect, useState } from "react";

import type { CompanyId } from "@/data/companies";
import type { InvestorQualityChecklistSnapshot } from "@/lib/business/investorQualityChecklist";
import {
  INVESTOR_QUALITY_CHECKLIST_CHANGED_EVENT,
  readInvestorQualityChecklist
} from "@/lib/business/investorQualityChecklistStorage";
import { SCHOOLS_DEMO_RESET_EVENT } from "@/lib/schools/resetSchoolsDemoProgress";

/** Reactive checklist snapshot keyed by company. */
export function useInvestorQualityChecklist(companyId: CompanyId) {
  const [snapshot, setSnapshot] = useState<InvestorQualityChecklistSnapshot>(() =>
    readInvestorQualityChecklist(companyId)
  );

  const refresh = useCallback(() => {
    setSnapshot(readInvestorQualityChecklist(companyId));
  }, [companyId]);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    const onDemoReset = () => refresh();
    window.addEventListener(INVESTOR_QUALITY_CHECKLIST_CHANGED_EVENT, onChange);
    window.addEventListener(SCHOOLS_DEMO_RESET_EVENT, onDemoReset);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(INVESTOR_QUALITY_CHECKLIST_CHANGED_EVENT, onChange);
      window.removeEventListener(SCHOOLS_DEMO_RESET_EVENT, onDemoReset);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  return { snapshot, refresh };
}
