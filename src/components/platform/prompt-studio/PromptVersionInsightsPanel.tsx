"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  PromptTemplateDetailDto,
  PromptVersionInsightsDto
} from "@/lib/supabase/promptTemplates/types";

import {
  btnGhost,
  encodeTemplateKey,
  panelClass,
  scoreColor
} from "./promptStudioTheme";

export function PromptVersionInsightsPanel({
  detail,
  onRefreshDetail
}: {
  detail: PromptTemplateDetailDto;
  onRefreshDetail: () => void;
}) {
  const [insights, setInsights] = useState<PromptVersionInsightsDto[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/prompt-templates/${encodeTemplateKey(detail.templateKey)}/insights`,
        { cache: "no-store" }
      );
      const data = (await res.json()) as {
        insights?: PromptVersionInsightsDto[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to load insights");
      setInsights(data.insights ?? []);
    } catch {
      setInsights([]);
    } finally {
      setLoading(false);
    }
  }, [detail.templateKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const markRecommended = async (versionId: string, recommended: boolean) => {
    await fetch(
      `/api/admin/prompt-templates/${encodeTemplateKey(detail.templateKey)}/versions/${versionId}/meta`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRecommended: recommended })
      }
    );
    await load();
    onRefreshDetail();
  };

  const recommended = insights.filter(
    (i) => i.isRecommended || i.autoBest
  );

  return (
    <section className={`${panelClass} space-y-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Version performance</h2>
          <p className="text-xs text-white/55">
            Rankings from saved preview runs. Mark a winner as recommended for your
            team.
          </p>
        </div>
        <button type="button" className={btnGhost} onClick={() => void load()}>
          Refresh
        </button>
      </div>

      {recommended.length > 0 ? (
        <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-3 text-xs text-emerald-100">
          <p className="font-semibold">Recommended for teaching</p>
          <ul className="mt-1 space-y-0.5">
            {recommended.map((r) => (
              <li key={r.versionId}>
                v{r.versionNumber}
                {r.autoBest && !r.isRecommended ? " (top scored, 2+ runs)" : ""}
                {r.isRecommended ? " (starred)" : ""}
                {r.avgComposite != null ? ` · composite ${r.avgComposite}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-xs text-white/45">
          Run previews or comparisons with “save evaluation” to build rankings.
        </p>
      )}

      {loading ? (
        <p className="text-xs text-white/50">Loading insights…</p>
      ) : (
        <ul className="space-y-2">
          {insights.map((row) => (
            <li
              key={row.versionId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs"
            >
              <div className="min-w-0 flex-1">
                <span className="font-medium text-white">
                  v{row.versionNumber}
                  {row.rank > 0 ? (
                    <span className="ml-2 text-white/40">#{row.rank}</span>
                  ) : null}
                </span>
                {row.tags.length > 0 ? (
                  <span className="ml-2 text-[var(--partner-primary)]/90">
                    {row.tags.join(" · ")}
                  </span>
                ) : null}
                {row.changeNote ? (
                  <p className="text-white/45">{row.changeNote}</p>
                ) : null}
                {row.teachingNotes ? (
                  <p className="italic text-white/40">{row.teachingNotes}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                {row.runCount > 0 ? (
                  <span className={scoreColor(row.avgComposite ?? 0)}>
                    {row.avgComposite} composite · {row.runCount} run
                    {row.runCount === 1 ? "" : "s"}
                  </span>
                ) : (
                  <span className="text-white/35">No runs yet</span>
                )}
                <button
                  type="button"
                  className={
                    row.isRecommended
                      ? "text-amber-300"
                      : "text-white/50 hover:text-amber-200"
                  }
                  onClick={() =>
                    void markRecommended(row.versionId, !row.isRecommended)
                  }
                  title="Mark recommended"
                >
                  {row.isRecommended ? "★" : "☆"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
