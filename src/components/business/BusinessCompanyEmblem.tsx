"use client";

import { HubCompanyEmblem } from "@/components/hub/HubCompanyEmblem";
import { BUSINESS_MAP_COMPANY_LOGO_POSITION } from "@/app/business/businessQuestMapPositions";

type Props = {
  logoUrl: string;
  companyName: string;
};

export function BusinessCompanyEmblem({ logoUrl, companyName }: Props) {
  return (
    <HubCompanyEmblem
      logoUrl={logoUrl}
      companyName={companyName}
      position={BUSINESS_MAP_COMPANY_LOGO_POSITION}
      emblemClassName="business-hub-company-emblem"
      innerSizeClass="h-[68%] w-[72%] max-h-[2.35rem] max-w-[2.7rem] sm:max-h-[2.5rem] sm:max-w-[2.9rem]"
      imageWidth={52}
      imageSizes="64px"
      altLabel={`${companyName} emblem`}
    />
  );
}
