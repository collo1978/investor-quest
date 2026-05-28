"use client";



import { useCallback, useEffect, useRef, useState } from "react";



import { companyByTicker } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import {
  CONTROLLED_DEMO_COMPANY_ID,
  CONTROLLED_DEMO_MODE
} from "@/lib/demo/controlledDemo";
import { isDemoQuestPlayable } from "@/lib/demo/playableDemo";

import {

  describeIncompleteQuestPayload,

  isPillarQuestPayloadReady,

  shouldRunQuestPipeline

} from "@/lib/quests/pillarQuestPayload";

import { getPillarQuestPipelineConfig } from "@/lib/quests/pillarQuestPipelineConfig";

import {

  getQuestAnswersPollMs,

  isClientFastQuestMode,

  isClientForceQuestRegenerate

} from "@/lib/quests/questGenerationModeClient";

import {

  buildQuestProgress,

  getMissingCardIds,

  getPriorityCardId,

  hasAnyGeneratedCard,

  type QuestPipelineProgress

} from "@/lib/quests/questPayloadProgress";

import {

  fetchQuestAnswersPayload,

  postQuestGenerate

} from "@/lib/quests/runQuestGenerationClient";

import type { PillarQuestAnswersPayload } from "@/lib/supabase/questCardAnswers/types";



export type QuestPipelinePhase =

  | "idle"

  | "loading"

  | "extracting"

  | "generating"

  | "refreshing";



type State = {

  payload: PillarQuestAnswersPayload | null;

  generating: boolean;

  pipelinePhase: QuestPipelinePhase;

  progress: QuestPipelineProgress | null;

  error: string | null;

};

function pipelineErrorMessage(err: unknown): string {
  if (CONTROLLED_DEMO_MODE) {
    return "One sec — lining up examples you'll actually recognize.";
  }
  if (err instanceof Error && err.message.trim()) return err.message;
  if (typeof err === "string" && err.trim()) return err;
  if (err && typeof err === "object") {
    const o = err as { error?: string; detail?: string; message?: string };
    const parts = [o.message, o.error, o.detail].filter(Boolean);
    if (parts.length) return parts.join(" — ");
  }
  return "Generation failed. Try again or use Admin → Quest copy & regeneration.";
}

export function usePillarQuestGeneratedContent(

  pillarId: PillarId,

  ticker: string,

  questSlug: string

) {

  const config = getPillarQuestPipelineConfig(pillarId);

  const forceRegenerate = isClientForceQuestRegenerate();

  const pollMs = getQuestAnswersPollMs();



  const [state, setState] = useState<State>({

    payload: null,

    generating: false,

    pipelinePhase: "idle",

    progress: null,

    error: null

  });

  const pipelineStarted = useRef(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);



  const stopPolling = useCallback(() => {

    if (pollRef.current) {

      clearInterval(pollRef.current);

      pollRef.current = null;

    }

  }, []);



  const refreshPayload = useCallback(async () => {

    if (!config) {

      throw new Error(`No quest pipeline configured for pillar: ${pillarId}`);

    }

    return fetchQuestAnswersPayload(config, ticker, questSlug);

  }, [config, ticker, questSlug, pillarId]);



  const applyPayload = useCallback(

    (

      payload: PillarQuestAnswersPayload,

      opts: { generating: boolean; phase?: QuestPipelinePhase }

    ) => {

      setState({

        payload,

        generating: opts.generating,

        pipelinePhase: opts.phase ?? (opts.generating ? "generating" : "idle"),

        progress: opts.generating ? buildQuestProgress(payload) : null,

        error: null

      });

    },

    []

  );



  const startPolling = useCallback(

    (priorityId: string) => {

      stopPolling();

      pollRef.current = setInterval(() => {

        void (async () => {

          try {

            const payload = await refreshPayload();



            if (isPillarQuestPayloadReady(payload)) {

              stopPolling();

              applyPayload(payload, { generating: false });

              return;

            }



            const playable = Boolean(

              payload.cards[priorityId]?.plainEnglishAnswer?.trim()

            );



            setState((s) => ({

              ...s,

              payload,

              progress: buildQuestProgress(payload),

              pipelinePhase: playable ? "generating" : s.pipelinePhase,

              generating: true

            }));

          } catch (err) {

            console.warn("[quest-pipeline:poll]", err);

          }

        })();

      }, pollMs);

    },

    [refreshPayload, stopPolling, pollMs, applyPayload]

  );



  const kickoffGenerate = useCallback(

    (cardIds: string[], extract: boolean) => {

      if (!config) return;

      void postQuestGenerate(config, {

        ticker,

        questSlug,

        cardIds,

        extract,

        force: forceRegenerate,

        fast: isClientFastQuestMode()

      }).catch((err) => {

        console.warn("[quest-pipeline:generate-kickoff]", err);

      });

    },

    [config, ticker, questSlug, forceRegenerate]

  );



  const runProgressivePipeline = useCallback(

    async (initialPayload: PillarQuestAnswersPayload) => {

      if (!config) return;



      const priorityId = getPriorityCardId(initialPayload.expectedCardIds);

      let payload = initialPayload;

      const isPriorityReady = (p: PillarQuestAnswersPayload) =>

        Boolean(p.cards[priorityId]?.plainEnglishAnswer?.trim());



      if (isPriorityReady(payload)) {

        applyPayload(payload, { generating: true, phase: "generating" });

      } else {

        setState({

          payload,

          generating: true,

          pipelinePhase: "generating",

          progress: buildQuestProgress(payload),

          error: null

        });

      }



      try {

        if (payload.status === "missing_extract") {
          stopPolling();
          setState({
            payload,
            generating: false,
            pipelinePhase: "idle",
            progress: null,
            error: describeIncompleteQuestPayload(payload)
          });
          return;
        }

        let missing = getMissingCardIds(payload);



        if (missing.includes(priorityId)) {

          kickoffGenerate([priorityId], false);

          startPolling(priorityId);

          return;

        }



        if (isPillarQuestPayloadReady(payload)) {

          stopPolling();

          applyPayload(payload, { generating: false });

          return;

        }



        missing = getMissingCardIds(payload);

        const rest = missing.filter((id) => id !== priorityId);



        if (rest.length) {

          kickoffGenerate(rest, false);

          startPolling(priorityId);

        } else {

          stopPolling();

          applyPayload(payload, { generating: false });

        }

      } catch (err) {

        const message = pipelineErrorMessage(err);

        console.error(
          "[quest-pipeline]",
          `${pillarId}/${ticker}/${questSlug}:`,
          message,
          err
        );

        stopPolling();

        setState((s) => ({

          ...s,

          generating: hasAnyGeneratedCard(s.payload),

          pipelinePhase: "idle",

          error: message

        }));

      }

    },

    [

      config,

      ticker,

      questSlug,

      pillarId,

      refreshPayload,

      startPolling,

      stopPolling,

      kickoffGenerate,

      applyPayload

    ]

  );



  useEffect(() => {

    if (!config) return;



    pipelineStarted.current = false;

    let cancelled = false;

    stopPolling();

    const demoCompany = companyByTicker(ticker);
    if (
      CONTROLLED_DEMO_MODE &&
      demoCompany?.id === CONTROLLED_DEMO_COMPANY_ID &&
      isDemoQuestPlayable(demoCompany.id, pillarId, questSlug)
    ) {
      setState({
        payload: null,
        generating: false,
        pipelinePhase: "idle",
        progress: null,
        error: null
      });
      return () => {
        cancelled = true;
        stopPolling();
      };
    }



    (async () => {

      setState((s) => ({

        ...s,

        pipelinePhase: "loading",

        error: null

      }));



      try {

        const payload = await refreshPayload();

        if (cancelled) return;



        const needsPipeline =

          shouldRunQuestPipeline(payload.status) &&

          (forceRegenerate || payload.status !== "ready");



        if (needsPipeline && !pipelineStarted.current) {

          pipelineStarted.current = true;

          void runProgressivePipeline(payload);

          return;

        }



        applyPayload(payload, { generating: false });

      } catch (err) {

        if (cancelled) return;

        const message =

          pipelineErrorMessage(err) || "Failed to load answers.";

        setState({

          payload: null,

          generating: false,

          pipelinePhase: "idle",

          progress: null,

          error: message

        });

      }

    })();



    return () => {

      cancelled = true;

      stopPolling();

    };

  }, [

    config,

    ticker,

    questSlug,

    refreshPayload,

    runProgressivePipeline,

    stopPolling,

    pillarId,

    forceRegenerate,

    applyPayload

  ]);



  const retryGenerate = useCallback(async () => {

    pipelineStarted.current = true;

    stopPolling();

    await runProgressivePipeline(

      state.payload ?? {

        pillarId,

        status: "needs_generation",

        questSlug,

        ticker,

        cards: {},

        sourceLabel: null,

        expectedCardIds: ["card-1", "card-2", "card-3"]

      }

    );

  }, [runProgressivePipeline, state.payload, pillarId, questSlug, ticker, stopPolling]);



  const loadingCardIds =

    state.payload && state.generating

      ? state.payload.expectedCardIds.filter(

          (id) => !state.payload!.cards[id]?.plainEnglishAnswer?.trim()

        )

      : [];



  return {

    ...state,

    retryGenerate,

    pipelineEnabled: Boolean(config),

    loadingCardIds,

    canReadQuest: hasAnyGeneratedCard(state.payload)

  };

}

