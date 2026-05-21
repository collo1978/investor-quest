"use client";

import { HubCompanyEmblem } from "@/components/hub/HubCompanyEmblem";
import {
  LOCKED_FORCES_HUB_ROCKET_EMBLEM,
  LOCKED_FORCES_HUB_ROCKET_EMBLEM_INNER
} from "@/lib/hub/lockedCompanyEmblemPositions";

type Props = {
  logoUrl: string;
  companyName: string;
};

/** Locked mission mark on `/forces` hub rocket — all companies share this anchor. */
export function ForcesCompanyEmblem({ logoUrl, companyName }: Props) {
  return (
    <HubCompanyEmblem
      logoUrl={logoUrl}
      companyName={companyName}
      position={LOCKED_FORCES_HUB_ROCKET_EMBLEM}
      innerSizeClass={LOCKED_FORCES_HUB_ROCKET_EMBLEM_INNER}
      imageWidth={56}
      imageSizes="72px"
      altLabel={`${companyName} on rocket`}
    />
  );
}
