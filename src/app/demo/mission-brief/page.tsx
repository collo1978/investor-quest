"use client";

import { useRouter } from "next/navigation";

import { BankBroker10kMissionBriefScreen } from "@/components/bank/BankBroker10kMissionBriefScreen";
import { useGame } from "@/components/GameProvider";
import { useMobilePreviewEmbed } from "@/hooks/useMobilePreviewEmbed";
import { hrefForBankMapAfterMissionBrief } from "@/lib/bank/bankBrokerMissionBriefNavigation";

export default function DemoMissionBriefPage() {
  const router = useRouter();
  const isPreviewEmbed = useMobilePreviewEmbed();
  const { actions, persistenceReady } = useGame();

  const handleMissionAccepted = () => {
    actions.completeOnboarding();
    actions.dismissQuestMapBrief();
    router.replace(hrefForBankMapAfterMissionBrief(isPreviewEmbed));
  };

  return (
    <BankBroker10kMissionBriefScreen
      onMissionAccepted={handleMissionAccepted}
      acceptedDisabled={!isPreviewEmbed && !persistenceReady}
    />
  );
}
