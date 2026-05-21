"use client";

import { COMPANIES } from "@/data/companies";
import { pillarById, type PillarId } from "@/data/pillars";
import { inputClass } from "./promptStudioTheme";

export type PromptTestContext = {
  ticker: string;
  previewPillar: PillarId;
  questSlug: string;
  cardId: string;
};

type PreviewCard = {
  questSlug: string;
  cardId: string;
  promptFocus: string;
};

type PreviewPillar = {
  selectedQuestSlugs: string[];
  cards: PreviewCard[];
};

const PILLARS: PillarId[] = ["business", "financials", "management", "forces"];

export function PromptTestContextBar({
  ctx,
  onChange,
  previewMeta
}: {
  ctx: PromptTestContext;
  onChange: (patch: Partial<PromptTestContext>) => void;
  previewMeta: PreviewPillar | null;
}) {
  const cardsForQuest =
    previewMeta?.cards.filter((c) => c.questSlug === ctx.questSlug) ?? [];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="grid gap-1 text-xs text-white/60">
        Ticker
        <select
          className={inputClass}
          value={ctx.ticker}
          onChange={(e) => onChange({ ticker: e.target.value })}
        >
          {COMPANIES.map((c) => (
            <option key={c.id} value={c.ticker}>
              {c.ticker}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-xs text-white/60">
        Island
        <select
          className={inputClass}
          value={ctx.previewPillar}
          onChange={(e) =>
            onChange({ previewPillar: e.target.value as PillarId })
          }
        >
          {PILLARS.map((p) => (
            <option key={p} value={p}>
              {pillarById(p)?.title ?? p}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-xs text-white/60">
        Quest slug
        <select
          className={inputClass}
          value={ctx.questSlug}
          onChange={(e) => onChange({ questSlug: e.target.value })}
        >
          {(previewMeta?.selectedQuestSlugs ?? []).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-xs text-white/60">
        Card
        <select
          className={inputClass}
          value={ctx.cardId}
          onChange={(e) => onChange({ cardId: e.target.value })}
        >
          {cardsForQuest.map((c) => (
            <option key={c.cardId} value={c.cardId}>
              {c.cardId}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
