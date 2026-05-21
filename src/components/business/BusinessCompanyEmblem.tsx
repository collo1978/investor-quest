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
      innerSizeClass="h-[68%] w-[72%] max-h-[3.25rem] max-w-[3.75rem] sm:max-h-[3.5rem] sm:max-w-[4rem]"
      imageWidth={64}
      imageSizes="80px"
      altLabel={`${companyName} emblem`}
    />
  );
}
