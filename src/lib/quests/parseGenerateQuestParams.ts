/** Query params for progressive quest generation routes. */
export type GenerateQuestQueryParams = {
  cardIds?: string[];
  runExtractIfMissing: boolean;
  forceRegenerate: boolean;
  fastMode?: boolean;
};

export function parseGenerateQuestParams(
  searchParams: URLSearchParams
): GenerateQuestQueryParams {
  const runExtract =
    searchParams.get("extract") === "1" ||
    searchParams.get("runExtract") === "true";

  const forceRegenerate =
    searchParams.get("force") === "1" ||
    searchParams.get("forceRegenerate") === "true";

  const fastParam = searchParams.get("fast");
  const fastMode =
    fastParam === "1" || fastParam === "true" ? true : undefined;

  const cardId = searchParams.get("cardId")?.trim();
  const cardIdsRaw = searchParams.get("cardIds")?.trim();

  const cardIds: string[] = [];
  if (cardId) cardIds.push(cardId);
  if (cardIdsRaw) {
    for (const part of cardIdsRaw.split(",")) {
      const id = part.trim();
      if (id && !cardIds.includes(id)) cardIds.push(id);
    }
  }

  return {
    cardIds: cardIds.length ? cardIds : undefined,
    runExtractIfMissing: runExtract,
    forceRegenerate,
    fastMode
  };
}
