"use client";

import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import { useQuestProgressDebug } from "@/hooks/useQuestProgressDebug";
import { formatPlayerQuestSourceDisplay } from "@/lib/quests/questSourceLabel";

export function QuestSourceFooter({
  source,
  theme
}: {
  source: string | null | undefined;
  theme?: PillarQuestTheme;
}) {
  const devMode = useQuestProgressDebug();
  const { label, accession } = formatPlayerQuestSourceDisplay(source, { devMode });

  if (!label) return null;

  return (
    <footer className="mx-auto mt-7 max-w-2xl text-center">
      <p
        className="text-[11px] font-medium tracking-wide text-ink-2/80"
        title={accession ? `SEC accession: ${accession}` : undefined}
      >
        <span className="text-ink-2/60">Source: </span>
        <span style={theme ? { color: theme.hi } : undefined}>{label}</span>
      </p>
      {accession ? (
        <p className="mt-1 font-mono text-[9px] text-ink-2/50" title="Dev only — accession number">
          {accession}
        </p>
      ) : null}
    </footer>
  );
}
