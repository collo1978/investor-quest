"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { usePathname } from "next/navigation";

import { fetchAndHydrateQuestContentCatalog } from "@/platform/quests/questContentLoader";
import {
  getQuestCatalogSource,
  type QuestContentCatalogSource
} from "@/platform/quests/questContentRegistry";
import { getAnalyticsPartnerId } from "@/lib/analytics/identity";
import { isSchoolsFunnelPath } from "@/lib/schools/schoolsDemoProtection";
import {
  DEFAULT_PARTNER_ID
} from "@/platform/partners/partnerRegistry";

type CatalogContextValue = {
  version: number;
  status: "idle" | "loading" | "ready";
  source: QuestContentCatalogSource;
  refetch: (partnerId?: string) => Promise<void>;
};

const QuestContentCatalogContext = createContext<CatalogContextValue | null>(
  null
);

function shouldHydrateCatalog(pathname: string): boolean {
  if (isSchoolsFunnelPath(pathname)) return false;
  if (!pathname.startsWith("/admin")) return true;
  return (
    pathname === "/admin/quests" || pathname.startsWith("/admin/quests/")
  );
}

export function QuestContentCatalogProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [version, setVersion] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle");

  const enabled = shouldHydrateCatalog(pathname);

  const refetch = useCallback(
    async (partnerId?: string) => {
      if (!enabled) return;
      setStatus("loading");
      let pid = partnerId;
      if (!pid) {
        if (pathname.startsWith("/admin") && typeof window !== "undefined") {
          pid =
            new URLSearchParams(window.location.search).get("partner") ??
            DEFAULT_PARTNER_ID;
        } else {
          pid = getAnalyticsPartnerId();
        }
      }
      await fetchAndHydrateQuestContentCatalog(pid);
      setStatus("ready");
      setVersion((v) => v + 1);
    },
    [enabled, pathname]
  );

  useEffect(() => {
    if (!enabled) {
      setStatus("ready");
      return;
    }
    void refetch();
  }, [enabled, refetch]);

  const value = useMemo(
    () => ({
      version,
      status,
      source: getQuestCatalogSource(),
      refetch
    }),
    [version, status, refetch]
  );

  return (
    <QuestContentCatalogContext.Provider value={value}>
      {children}
    </QuestContentCatalogContext.Provider>
  );
}

export function useQuestCatalog(): CatalogContextValue {
  const ctx = useContext(QuestContentCatalogContext);
  if (!ctx) {
    throw new Error(
      "useQuestCatalog must be used within QuestContentCatalogProvider"
    );
  }
  return ctx;
}
