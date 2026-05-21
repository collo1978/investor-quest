"use client";

import { HubCompanyEmblem } from "@/components/hub/HubCompanyEmblem";
import {
  LOCKED_FINANCIALS_HUB_SAFE_EMBLEM,
  LOCKED_FINANCIALS_HUB_SAFE_EMBLEM_INNER
} from "@/lib/hub/lockedCompanyEmblemPositions";

type Props = {
  logoUrl: string;
  companyName: string;
};

/** Locked vault mark on the safe right panel — all companies share this anchor. */
export function FinancialsCompanyEmblem({ logoUrl, companyName }: Props) {
  return (
    <HubCompanyEmblem
      logoUrl={logoUrl}
      companyName={companyName}
      position={LOCKED_FINANCIALS_HUB_SAFE_EMBLEM}
      innerSizeClass={LOCKED_FINANCIALS_HUB_SAFE_EMBLEM_INNER}
      imageWidth={72}
      imageSizes="88px"
      altLabel={`${companyName} on vault`}
    />
  );
}
