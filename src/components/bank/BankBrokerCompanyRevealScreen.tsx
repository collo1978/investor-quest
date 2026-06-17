"use client";



import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";



import { BankBrokerQuestMatchReveal } from "@/components/bank/BankBrokerQuestMatchReveal";

import { useGame } from "@/components/GameProvider";

import { useMobilePreviewEmbed } from "@/hooks/useMobilePreviewEmbed";

import { BANK_BROKER_PICK_INTERESTS_ROUTE } from "@/lib/bank/bankBrokerPreviewRoutes";

import { hrefForBankOnboardingStep } from "@/lib/bank/bankBrokerOnboardingFlow";

import { hrefForBankMissionBrief } from "@/lib/bank/bankBrokerMissionBriefNavigation";

import {

  PICK_INTERESTS_REQUIRED_COUNT,

  readPickInterestsSelection,

  writePickInterestsSelection

} from "@/lib/bank/pickInterestsState";

import { CONTROLLED_DEMO_MODE } from "@/lib/demo/controlledDemo";

import { preloadImage } from "@/lib/preloadImage";

import { BANK_10K_MISSION_BRIEF_IMG_SRC } from "@/components/bank/BankBroker10kMissionBriefScreen";



/** Dev preview: seed interests so the spin board shows without running pick-interests first. */

const PREVIEW_DEFAULT_INTERESTS = ["ai", "gaming"] as const;



type Props = {

  onLetsGo?: () => void;

  onPickInterestsMissing?: () => void;

  /** Defaults to bank flow (2). Schools passes 1. */

  requiredInterestCount?: number;

};



/**

 * Pick interests → cinematic quest reward reveal → BEGIN QUEST → map / mission brief.

 */

export function BankBrokerCompanyRevealScreen({

  onLetsGo,

  onPickInterestsMissing,

  requiredInterestCount = PICK_INTERESTS_REQUIRED_COUNT

}: Props) {

  const router = useRouter();

  const isPreviewEmbed = useMobilePreviewEmbed();

  const { state, actions, persistenceReady } = useGame();

  const [interestIds, setInterestIds] = useState<string[]>([]);



  useEffect(() => {

    let ids = readPickInterestsSelection();

    if (

      ids.length !== requiredInterestCount &&

      (isPreviewEmbed || CONTROLLED_DEMO_MODE)

    ) {

      ids = [...PREVIEW_DEFAULT_INTERESTS].slice(0, requiredInterestCount);

      writePickInterestsSelection(ids);

    }

    setInterestIds(ids);

    preloadImage(BANK_10K_MISSION_BRIEF_IMG_SRC);

  }, [isPreviewEmbed, requiredInterestCount]);



  useEffect(() => {

    if (interestIds.length === 0) return;

    if (interestIds.length !== requiredInterestCount) {

      if (onPickInterestsMissing) {

        onPickInterestsMissing();

        return;

      }

      router.replace(

        hrefForBankOnboardingStep(BANK_BROKER_PICK_INTERESTS_ROUTE, isPreviewEmbed)

      );

    }

  }, [interestIds, isPreviewEmbed, onPickInterestsMissing, requiredInterestCount, router]);



  const handleBeginQuest = () => {

    if (onLetsGo) {

      onLetsGo();

      return;

    }



    actions.setProfile({

      playerName: state.playerName ?? "Investor",

      goal: state.goal ?? "Build conviction"

    });



    if (!isPreviewEmbed && !persistenceReady) return;



    router.replace(hrefForBankMissionBrief(isPreviewEmbed));

  };



  if (

    interestIds.length > 0 &&

    interestIds.length !== requiredInterestCount

  ) {

    return null;

  }



  return (

    <BankBrokerQuestMatchReveal

      interestIds={interestIds}

      requiredInterestCount={requiredInterestCount}

      onRevealComplete={() => handleBeginQuest()}

      enterQuestDisabled={!isPreviewEmbed && !persistenceReady}

      continueLabel="LET'S GO"

    />

  );

}

