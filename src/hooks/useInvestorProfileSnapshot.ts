"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useGame } from "@/components/GameProvider";
import { useClientMounted } from "@/hooks/useClientMounted";
import type { CompanyId } from "@/data/companies";
import { BUSINESS_INVESTOR_FRAMEWORK_CHANGED_EVENT } from "@/lib/business/businessInvestorFrameworkStorage";
import {
  resolveChecklistBadgeIdsToAward,
  resolveInvestorProfileSnapshot
} from "@/lib/profile/resolveInvestorProfileSnapshot";
import type { InvestorProfileSnapshot } from "@/lib/profile/investorProfileTypes";
import { SCHOOLS_DEMO_RESET_EVENT } from "@/lib/schools/resetSchoolsDemoProgress";

/** Live investor profile — XP, mastery, checklist, achievements. */
export function useInvestorProfileSnapshot(): {
  snapshot: InvestorProfileSnapshot;
  selectedCompanyId: CompanyId;
  setSelectedCompanyId: (companyId: CompanyId) => void;
  refresh: () => void;
} {
  const { raw, actions } = useGame();
  const mounted = useClientMounted();
  const [tick, setTick] = useState(0);
  const [selectedCompanyId, setSelectedCompanyId] = useState<CompanyId>(
    raw.activeCompanyId as CompanyId
  );

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    setSelectedCompanyId(raw.activeCompanyId as CompanyId);
  }, [raw.activeCompanyId]);

  useEffect(() => {
    const onChange = () => refresh();
    window.addEventListener(BUSINESS_INVESTOR_FRAMEWORK_CHANGED_EVENT, onChange);
    window.addEventListener(SCHOOLS_DEMO_RESET_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(
        BUSINESS_INVESTOR_FRAMEWORK_CHANGED_EVENT,
        onChange
      );
      window.removeEventListener(SCHOOLS_DEMO_RESET_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  const snapshot = useMemo(() => {
    void tick;
    return resolveInvestorProfileSnapshot(raw, {
      includeClientStorage: mounted
    });
  }, [raw, tick, mounted]);

  useEffect(() => {
    if (!mounted) return;
    void tick;
    const badgeIds = resolveChecklistBadgeIdsToAward(raw.activeCompanyId as CompanyId);
    if (badgeIds.length === 0) return;
    actions.dispatch({
      type: "award-badges-if-new",
      badgeIds
    });
  }, [mounted, raw.activeCompanyId, raw.companies, tick, actions]);

  return { snapshot, selectedCompanyId, setSelectedCompanyId, refresh };
}
