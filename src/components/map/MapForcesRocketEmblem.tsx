"use client";

import { HubCompanyEmblem } from "@/components/hub/HubCompanyEmblem";
import { LOCKED_MAP_FORCES_ROCKET_EMBLEM } from "@/lib/hub/lockedCompanyEmblemPositions";

type Props = {
  logoUrl: string;
  companyName: string;
};

/** Locked mission mark on the quest-map Forces rocket — all companies share this anchor. */
export function MapForcesRocketEmblem({ logoUrl, companyName }: Props) {
  return (
    <HubCompanyEmblem
      logoUrl={logoUrl}
      companyName={companyName}
      position={LOCKED_MAP_FORCES_ROCKET_EMBLEM}
      innerSizeClass="h-[72%] w-[80%]"
      imageWidth={40}
      imageSizes="46px"
      altLabel={`${companyName} on map rocket`}
    />
  );
}
