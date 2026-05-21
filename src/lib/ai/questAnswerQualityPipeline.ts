import { createChatCompletion } from "@/lib/ai/openaiClient";
import {
  resolveQuestGenerationOptions,
  type QuestGenerationOptions
} from "@/lib/ai/questGenerationMode";
import {
  analyzeQuestJargonGate,
  buildJargonRewriteUserPrompt,
  describeJargonGateFailure,
  JARGON_REWRITE_SYSTEM_PROMPT,
  type QuestJargonGateResult
} from "@/lib/quests/questJargonGate";

export type FinalizeQuestAnswerInput = {
  companyName: string;
  cardQuestion: string;
  questSlug?: string;
  cardId?: string;
  rawAnswer: string;
  splitAnswerAndInsight: (raw: string) => {
    plainEnglishAnswer: string;
    investorInsight: string | null;
  };
  model?: string;
  temperature?: number;
  generationOptions?: Partial<QuestGenerationOptions>;
  onTiming?: (event: string) => void;
};

export type FinalizeQuestAnswerResult =
  | {
      ok: true;
      plainEnglishAnswer: string;
      investorInsight: string | null;
      jargonGate: QuestJargonGateResult;
      rewriteAttempts: number;
      acceptedDespiteJargon?: boolean;
    }
  | {
      ok: false;
      reason: string;
      jargonGate: QuestJargonGateResult;
      rewriteAttempts: number;
    };

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms
    );
    promise
      .then((v) => {
        clearTimeout(timer);
        resolve(v);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Split, jargon-gate, optional rewrite — tuned for speed in fast dev mode.
 */
export async function finalizeQuestAnswer(
  input: FinalizeQuestAnswerInput
): Promise<FinalizeQuestAnswerResult> {
  const opts = resolveQuestGenerationOptions(input.generationOptions);
  const finalizeTimeoutMs = opts.finalizeTimeoutMs ?? 35_000;
  const maxJargonRewrites = opts.maxJargonRewrites ?? 1;
  const perCallTimeout = Math.max(
    4_000,
    Math.floor(finalizeTimeoutMs / (maxJargonRewrites + 1))
  );

  const jargonContext = {
    cardQuestion: input.cardQuestion,
    questSlug: input.questSlug,
    cardId: input.cardId
  };

  let { plainEnglishAnswer, investorInsight } = input.splitAnswerAndInsight(
    input.rawAnswer
  );

  if (!plainEnglishAnswer?.trim()) {
    return {
      ok: false,
      reason: "Empty answer after parsing.",
      jargonGate: analyzeQuestJargonGate("", null, jargonContext),
      rewriteAttempts: 0
    };
  }

  let gate = analyzeQuestJargonGate(
    plainEnglishAnswer,
    investorInsight,
    jargonContext
  );
  let rewriteAttempts = 0;

  if (gate.pass) {
    return {
      ok: true,
      plainEnglishAnswer,
      investorInsight,
      jargonGate: gate,
      rewriteAttempts: 0
    };
  }

  while (!gate.pass && rewriteAttempts < maxJargonRewrites) {
    rewriteAttempts++;
    input.onTiming?.(`jargonRewriteStart:${rewriteAttempts}`);
    try {
      const rewriteRaw = await withTimeout(
        createChatCompletion({
          system: JARGON_REWRITE_SYSTEM_PROMPT,
          user: buildJargonRewriteUserPrompt({
            companyName: input.companyName,
            cardQuestion: input.cardQuestion,
            questSlug: input.questSlug,
            cardId: input.cardId,
            plainEnglishAnswer,
            investorInsight,
            gate
          }),
          model: input.model,
          temperature: Math.min(input.temperature ?? 0.5, 0.45)
        }),
        perCallTimeout,
        "Jargon rewrite"
      );
      input.onTiming?.(`jargonRewriteDone:${rewriteAttempts}`);

      ({ plainEnglishAnswer, investorInsight } =
        input.splitAnswerAndInsight(rewriteRaw));

      if (!plainEnglishAnswer?.trim()) {
        break;
      }
      gate = analyzeQuestJargonGate(
        plainEnglishAnswer,
        investorInsight,
        jargonContext
      );
    } catch (err) {
      console.warn("[quest-pipeline:jargon-rewrite-timeout]", err);
      break;
    }
  }

  if (gate.pass) {
    return {
      ok: true,
      plainEnglishAnswer,
      investorInsight,
      jargonGate: gate,
      rewriteAttempts
    };
  }

  if (opts.acceptJargonOnFail && plainEnglishAnswer?.trim()) {
    return {
      ok: true,
      plainEnglishAnswer,
      investorInsight,
      jargonGate: gate,
      rewriteAttempts,
      acceptedDespiteJargon: true
    };
  }

  return {
    ok: false,
    reason: `Answer failed human-first quality after ${rewriteAttempts} rewrite(s): ${describeJargonGateFailure(gate)}`,
    jargonGate: gate,
    rewriteAttempts
  };
}
