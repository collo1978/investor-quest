"use client";

import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import { useQuestProgressDebug } from "@/hooks/useQuestProgressDebug";
import { formatPlayerQuestSourceDisplay } from "@/lib/quests/questSourceLabel";

export function QuestSourceFooter({
  source
}: {
  source: string | null | undefined;
  theme?: PillarQuestTheme;
}) {
  const devMode = useQuestProgressDebug();
  const { label, accession } = formatPlayerQuestSourceDisplay(source, { devMode });

  if (!label) return null;

  return (
    <footer className="mx-auto mt-12 max-w-2xl pb-1 text-center">
      <p
        className="text-[10px] leading-relaxed tracking-wide text-ink-2/45"
        title={accession ? `SEC accession: ${accession}` : undefined}
      >
        {label}
      </p>
      {accession ? (
        <p className="mt-1 font-mono text-[9px] text-ink-2/35" title="Dev only — accession number">
          {accession}
        </p>
      ) : null}
    </footer>
  );
}
