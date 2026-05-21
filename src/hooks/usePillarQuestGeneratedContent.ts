"use client";



import { useCallback, useEffect, useRef, useState } from "react";



import type { PillarId } from "@/data/pillars";

import {

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

  postQuestGenerate,

  postSecExtract

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

    pipelinePhase: "loading",

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

          pipelinePhase:

            payload.status === "missing_extract" ? "extracting" : "generating",

          progress: buildQuestProgress(payload),

          error: null

        });

      }



      try {

        if (payload.status === "missing_extract") {

          await postSecExtract(ticker);

          payload = await refreshPayload();

          if (isPriorityReady(payload)) {

            applyPayload(payload, { generating: true, phase: "generating" });

          } else {

            setState((s) => ({

              ...s,

              payload,

              pipelinePhase: "generating",

              progress: buildQuestProgress(payload)

            }));

          }

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

        const message =

          err instanceof Error ? err.message : "Generation failed.";

        console.error("[quest-pipeline]", { pillarId, ticker, questSlug, message });

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

          err instanceof Error ? err.message : "Failed to load answers.";

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

