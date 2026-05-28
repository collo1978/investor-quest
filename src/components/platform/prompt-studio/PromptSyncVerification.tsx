"use client";

import type { SyncPromptFromCodeResult } from "@/lib/supabase/promptTemplates/types";

import { formatAnalyticsDateTime } from "@/lib/analytics/formatDisplay";

import { panelClass } from "./promptStudioTheme";

type Props = {
  results: SyncPromptFromCodeResult[];
  title?: string;
};

function formatUpdatedAt(iso: string | null): string {
  if (!iso) return "—";
  try {
    return formatAnalyticsDateTime(iso);
  } catch {
    return iso;
  }
}

export function PromptSyncVerification({
  results,
  title = "Sync verification"
}: Props) {
  if (!results.length) return null;

  return (
    <section className={`${panelClass} space-y-3`}>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-300/90">
        {title}
      </h3>
      <ul className="space-y-2 text-xs">
        {results.map((r) => (
          <li
            key={r.templateKey}
            className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
          >
            <p className="font-mono text-white/85">{r.templateKey}</p>
            <p className="mt-1 text-white/60">
              Active version:{" "}
              <span className="text-white/90">v{r.versionNumber}</span>
              {r.published ? (
                <span className="ml-2 text-emerald-300">(new)</span>
              ) : (
                <span className="ml-2 text-white/45">(unchanged)</span>
              )}
            </p>
            <p className="text-white/55">
              Updated: {formatUpdatedAt(r.updatedAt)}
            </p>
            <p className="text-white/55">
              Source: <span className="text-emerald-200/90">{r.source}</span>
            </p>
            {r.changeNote ? (
              <p className="mt-1 text-white/40">{r.changeNote}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
