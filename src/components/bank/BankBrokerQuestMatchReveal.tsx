"use client";



import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { usePathname } from "next/navigation";

import { QuestMatchReveal } from "@/app/onboarding/QuestMatchReveal";

import {

  PICK_INTERESTS_FALLBACK,

  PICK_INTERESTS_REQUIRED_COUNT

} from "@/lib/bank/pickInterestsState";

import {

  CONTROLLED_DEMO_MODE,

  CONTROLLED_DEMO_COMPANY_ID

} from "@/lib/demo/controlledDemo";

import {

  buildControlledDemoOnboardingShowcase,

  buildControlledDemoQuestMatchPool,

  shuffleOnboardingDeck

} from "@/lib/demo/controlledOnboarding";

import { getOrCreateOnboardingGuestId } from "@/lib/onboarding/guestId";

import { buildQuestMatchFallbackCards } from "@/lib/onboarding/questMatchFallback";

import type {

  OnboardingInterest,

  RecommendedCompanyCard

} from "@/lib/onboarding/types";

import { DEFAULT_COMPANY_ID, isCompanyId, type CompanyId } from "@/lib/demoData";

import { useGame } from "@/components/GameProvider";

import { isSchoolsDemoPath } from "@/lib/schools/schoolsDemoHref";
import { isSchoolsDemoProtectedPath } from "@/lib/schools/schoolsDemoProtection";



type Props = {

  interestIds: string[];

  requiredInterestCount?: number;

  /** Fired when the player taps BEGIN QUEST on the reveal beat. */

  onRevealComplete: (winner: RecommendedCompanyCard) => void;

  enterQuestDisabled?: boolean;

  continueLabel?: string;

};



function resolveGameCompanyId(cardId: string): CompanyId {

  if (CONTROLLED_DEMO_MODE) return CONTROLLED_DEMO_COMPANY_ID;

  return isCompanyId(cardId) ? cardId : DEFAULT_COMPANY_ID;

}



/**

 * Game-show company match spin — demo always lands on NVIDIA.

 * Cinematic card fly + in-place reward reveal (no separate final screen).

 */

export function BankBrokerQuestMatchReveal({

  interestIds,

  requiredInterestCount = PICK_INTERESTS_REQUIRED_COUNT,

  onRevealComplete,

  enterQuestDisabled = false,

  continueLabel = "BEGIN QUEST"

}: Props) {

  const pathname = usePathname();

  const deckCompact = isSchoolsDemoPath(pathname);

  const { actions } = useGame();

  const [interestOptions, setInterestOptions] =

    useState<OnboardingInterest[]>(PICK_INTERESTS_FALLBACK);

  const [recommendedCards, setRecommendedCards] = useState<RecommendedCompanyCard[]>(

    []

  );

  const [loading, setLoading] = useState(true);

  const [questMatchKey, setQuestMatchKey] = useState(0);

  const loadStartedRef = useRef(false);

  const onRevealCompleteRef = useRef(onRevealComplete);

  onRevealCompleteRef.current = onRevealComplete;

  const winnerRef = useRef<RecommendedCompanyCard | null>(null);



  const interestLabelById = useMemo(() => {

    const map = new Map<string, string>();

    interestOptions.forEach((o) => map.set(o.id, o.label));

    return map;

  }, [interestOptions]);



  const questMatchPool = useMemo(() => {

    if (CONTROLLED_DEMO_MODE) {

      return buildControlledDemoQuestMatchPool(recommendedCards);

    }

    if (recommendedCards.length > 0) return recommendedCards;

    return buildQuestMatchFallbackCards();

  }, [recommendedCards]);



  const loadRecommendations = useCallback(

    async (selected: string[]): Promise<RecommendedCompanyCard[]> => {

      if (CONTROLLED_DEMO_MODE) {

        return shuffleOnboardingDeck(buildControlledDemoOnboardingShowcase(selected));

      }

      if (!selected.length) {

        return buildQuestMatchFallbackCards();

      }

      const qs = encodeURIComponent(selected.join(","));

      const res = await fetch(

        `/api/onboarding/recommendations?interests=${qs}&limit=12`,

        { cache: "no-store" }

      );

      if (!res.ok) {

        return buildQuestMatchFallbackCards();

      }

      const body = (await res.json()) as { companies?: RecommendedCompanyCard[] };

      if (Array.isArray(body.companies) && body.companies.length) {

        return body.companies;

      }

      return buildQuestMatchFallbackCards();

    },

    []

  );



  useEffect(() => {

    if (interestIds.length !== requiredInterestCount) return;

    if (loadStartedRef.current) return;

    loadStartedRef.current = true;



    let cancelled = false;

    void (async () => {

      setLoading(true);

      try {

        const skipOnboardingApi = isSchoolsDemoProtectedPath(pathname);

        if (!skipOnboardingApi) {

          const guestId = getOrCreateOnboardingGuestId();

          void fetch("/api/onboarding/interests", {

            method: "POST",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({ guestId, interestIds })

          });



          const res = await fetch("/api/onboarding/interests", { cache: "no-store" });

          if (res.ok) {

            const body = (await res.json()) as { interests?: OnboardingInterest[] };

            if (!cancelled && body.interests?.length) {

              setInterestOptions(body.interests);

            }

          }

        }



        const cards = await loadRecommendations(interestIds);

        if (cancelled) return;



        setRecommendedCards(cards);

        const winner =

          cards.find((c) => c.id === CONTROLLED_DEMO_COMPANY_ID) ?? cards[0];

        winnerRef.current = winner ?? null;

        if (winner) {

          actions.setActiveCompany(resolveGameCompanyId(winner.id));

        } else {

          actions.setActiveCompany(DEFAULT_COMPANY_ID);

        }

      } finally {

        if (!cancelled) {

          setLoading(false);

          setQuestMatchKey((k) => k + 1);

        }

      }

    })();



    return () => {

      cancelled = true;

    };

  }, [actions, interestIds, loadRecommendations, pathname, requiredInterestCount]);



  const handleWinnerChosen = (card: RecommendedCompanyCard) => {

    winnerRef.current = card;

    actions.setActiveCompany(resolveGameCompanyId(card.id));

  };



  const handleBeginQuest = () => {

    const winner =

      winnerRef.current ??

      recommendedCards.find((c) => c.id === CONTROLLED_DEMO_COMPANY_ID) ??

      recommendedCards[0];

    if (winner) {

      onRevealCompleteRef.current(winner);

    }

  };



  return (

    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#030308]">

      <div

        aria-hidden

        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_18%,rgba(139,92,246,0.2),transparent_62%),radial-gradient(ellipse_70%_45%_at_50%_100%,rgba(109,40,217,0.12),transparent_58%)]"

      />

      <div

        aria-hidden

        className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(139,92,246,0.35)_1px,transparent_1px)] [background-size:32px_32px]"

      />



      <div className="relative z-10 flex flex-1 flex-col">

        {loading ? (

          <p className="flex flex-1 items-center justify-center py-16 text-center text-sm text-ink-2">

            Finding your match…

          </p>

        ) : (

          <QuestMatchReveal

            key={questMatchKey}

            companies={questMatchPool}

            interestLabelById={interestLabelById}

            controlledDemoReveal={CONTROLLED_DEMO_MODE}

            onWinnerChosen={handleWinnerChosen}

            onEnterQuest={handleBeginQuest}

            enterQuestDisabled={enterQuestDisabled}

            continueLabel={continueLabel}

            deckCompact={deckCompact}

          />

        )}

      </div>

    </div>

  );

}

