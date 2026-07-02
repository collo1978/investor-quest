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
  const isMission = theme?.cardChrome === "mission";

  if (!label) return null;

  return (
    <footer className="mx-auto mt-12 max-w-2xl pb-1 text-center">
      <p
        className={[
          "text-[10px] leading-relaxed tracking-wide",
          isMission ? "iq-schools-quest-source-footer font-medium" : "text-ink-2/45"
        ].join(" ")}
        title={accession ? `SEC accession: ${accession}` : undefined}
      >
        {label}
      </p>
      {accession ? (
        <p
          className={
            isMission
              ? "iq-schools-quest-source-footer mt-1 font-mono text-[9px] opacity-85"
              : "mt-1 font-mono text-[9px] text-ink-2/35"
          }
          title="Dev only — accession number"
        >
          {accession}
        </p>
      ) : null}
    </footer>
  );
}
