"use client";



import type { PartnerConfig } from "@/platform/types";

import {

  createContext,

  useCallback,

  useContext,

  useMemo,

  useState,

  type ReactNode

} from "react";

import {

  getPartnerById,

  resolvePartnerId

} from "@/platform/partners/partnerRegistry";



type PartnerPreviewContextValue = {

  partnerId: string;

  partner: PartnerConfig;

  setPartnerId: (id: string) => void;

  refreshCatalog: () => Promise<void>;

  /** Draft toggles for gamification mechanic ids (session-only) */

  mechanicOverrides: Record<string, boolean>;

  setMechanicEnabled: (mechanicId: string, enabled: boolean) => void;

};



const PartnerPreviewContext = createContext<PartnerPreviewContextValue | null>(

  null

);



export function PartnerPreviewProvider({

  initialPartnerId,

  registryVersion,

  refreshCatalog,

  children

}: {

  initialPartnerId: string;

  registryVersion: number;

  refreshCatalog: () => Promise<unknown>;

  children: ReactNode;

}) {

  const [partnerId, setPartnerIdState] = useState(() =>

    resolvePartnerId(initialPartnerId)

  );

  const [mechanicOverrides, setMechanicOverrides] = useState<

    Record<string, boolean>

  >({});



  const partner = useMemo(() => {

    const p = getPartnerById(partnerId);

    if (!p) return getPartnerById(resolvePartnerId(null))!;

    return p;

  }, [partnerId, registryVersion]);



  const setPartnerId = useCallback((id: string) => {

    setPartnerIdState(resolvePartnerId(id));

  }, []);



  const setMechanicEnabled = useCallback(

    (mechanicId: string, enabled: boolean) => {

      setMechanicOverrides((prev) => ({ ...prev, [mechanicId]: enabled }));

    },

    []

  );



  const handleRefreshCatalog = useCallback(async () => {

    await refreshCatalog();

  }, [refreshCatalog]);



  const value = useMemo(

    () => ({

      partnerId,

      partner,

      setPartnerId,

      refreshCatalog: handleRefreshCatalog,

      mechanicOverrides,

      setMechanicEnabled

    }),

    [

      partner,

      partnerId,

      mechanicOverrides,

      setMechanicEnabled,

      setPartnerId,

      handleRefreshCatalog

    ]

  );



  return (

    <PartnerPreviewContext.Provider value={value}>

      {children}

    </PartnerPreviewContext.Provider>

  );

}



export function usePartnerPreview(): PartnerPreviewContextValue {

  const ctx = useContext(PartnerPreviewContext);

  if (!ctx) {

    throw new Error(

      "usePartnerPreview must be used within PartnerPreviewProvider"

    );

  }

  return ctx;

}


