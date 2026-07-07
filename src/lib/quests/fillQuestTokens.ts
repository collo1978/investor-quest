import type { Company } from "@/data/companies";
import type { QuestDefinition } from "@/data/quests/types";
import type { QuizConfig, QuizQuestion } from "@/data/quests/types";

/** Active company label — falls back when name is missing. */
export function companyDisplayName(company: Pick<Company, "name">): string {
  const trimmed = company.name?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "this company";
}

/** `{Company.name}` token — "the company" when the name is unavailable. */
export function companyNameToken(company: Pick<Company, "name">): string {
  const trimmed = company.name?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "the company";
}

/** Replace `{Company.name}` / `{Company.ticker}` / `{Company.sector}` in quest copy. */
export function fillQuestTokens(input: string, company: Company): string {
  const name = companyNameToken(company);
  const ticker = company.ticker?.trim() || "—";
  const sector = company.sector?.trim() || "—";
  return input
    .replace(/\{Company\.name\}/g, name)
    .replace(/\{Company\.ticker\}/g, ticker)
    .replace(/\{Company\.sector\}/g, sector);
}

/** Bind player-facing quest strings to the selected company (cards, quiz, headers). */
export function bindQuestDefinitionToCompany(
  quest: QuestDefinition,
  company: Company
): QuestDefinition {
  let next: QuestDefinition = {
    ...quest,
    title: fillQuestTokens(quest.title, company),
    objective: fillQuestTokens(quest.objective, company),
    description: fillQuestTokens(quest.description, company),
    aiTask: fillQuestTokens(quest.aiTask, company),
    investorQuestion: fillQuestTokens(quest.investorQuestion, company),
    plainEnglishAnswer: quest.plainEnglishAnswer
      ? fillQuestTokens(quest.plainEnglishAnswer, company)
      : null,
    whyItMatters: fillQuestTokens(quest.whyItMatters, company),
    investorInsight: quest.investorInsight
      ? fillQuestTokens(quest.investorInsight, company)
      : undefined,
    cards: quest.cards
      ? quest.cards.map((c) => ({
          id: c.id,
          investorQuestion: fillQuestTokens(c.investorQuestion, company),
          plainEnglishAnswer: c.plainEnglishAnswer
            ? fillQuestTokens(c.plainEnglishAnswer, company)
            : null,
          whyItMatters: fillQuestTokens(c.whyItMatters, company),
          investorInsight: c.investorInsight
            ? fillQuestTokens(c.investorInsight, company)
            : undefined
        }))
      : undefined
  };

  if (next.quizConfig) {
    next = {
      ...next,
      quizConfig: fillQuizConfigTokens(next.quizConfig, company)
    };
  }

  return next;
}

function fillQuestion(q: QuizQuestion, company: Company): QuizQuestion {
  const prompt = fillQuestTokens(q.prompt, company);
  const explain = q.explain ? fillQuestTokens(q.explain, company) : q.explain;

  switch (q.kind) {
    case "multiple-choice":
      return {
        ...q,
        prompt,
        explain,
        choices: q.choices.map((c) => fillQuestTokens(c, company)),
        trueFalseStatement: q.trueFalseStatement
          ? fillQuestTokens(q.trueFalseStatement, company)
          : q.trueFalseStatement,
        rankingSteps: q.rankingSteps
          ? q.rankingSteps.map((s) => fillQuestTokens(s, company))
          : q.rankingSteps
      };
    case "scenario":
    case "odd-one-out":
    case "red-flag":
      return {
        ...q,
        prompt,
        explain,
        choices: q.choices.map((c) => fillQuestTokens(c, company))
      };
    case "fill-blank":
      return {
        ...q,
        prompt,
        explain,
        options: q.options.map((o) => fillQuestTokens(o, company))
      };
    case "true-false":
      return { ...q, prompt, explain };
    case "match":
      return {
        ...q,
        prompt,
        explain,
        pairs: q.pairs.map((p) => ({
          left: fillQuestTokens(p.left, company),
          right: fillQuestTokens(p.right, company)
        }))
      };
    case "order":
      return {
        ...q,
        prompt,
        explain,
        steps: q.steps.map((s) => fillQuestTokens(s, company))
      };
    case "bull-bear":
      return {
        ...q,
        prompt,
        explain,
        caption: q.caption ? fillQuestTokens(q.caption, company) : q.caption,
        labels: q.labels
          ? {
              bull: fillQuestTokens(q.labels.bull, company),
              bear: fillQuestTokens(q.labels.bear, company)
            }
          : q.labels
      };
    case "risk-meter":
      return {
        ...q,
        prompt,
        explain,
        levelLabels: q.levelLabels?.map((l) => fillQuestTokens(l, company))
      };
    case "swipe-cards":
      return {
        ...q,
        prompt,
        explain,
        cards: q.cards.map((c) => ({
          text: fillQuestTokens(c.text, company),
          verdict: c.verdict
        }))
      };
  }
}

/** Apply company tokens to every player-facing quiz string at instantiate time. */
export function fillQuizConfigTokens(
  config: QuizConfig,
  company: Company
): QuizConfig {
  return {
    ...config,
    questions: config.questions.map((q) => fillQuestion(q, company))
  };
}
