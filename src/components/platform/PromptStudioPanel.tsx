"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { pillarById, type PillarId } from "@/data/pillars";
import type { PromptQualityAnalysis } from "@/lib/ai/promptQualityAnalysis";
import { PROMPT_STUDIO_TAG_SUGGESTIONS } from "@/lib/ai/promptQualityAnalysis";
import type {
  PromptTemplateDetailDto,
  PromptTemplateDto,
  SyncPromptFromCodeResult
} from "@/lib/supabase/promptTemplates/types";

import { OpsPageShell } from "@/components/operations/OpsPageShell";
import { OpsTouchButton } from "@/components/operations/OpsTouchButton";
import { opsPanel } from "@/components/operations/opsTheme";
import { humanizeTechnicalMessage } from "@/lib/operations/layman";

import { PromptComparePanel } from "./prompt-studio/PromptComparePanel";
import { PromptSyncConfirmModal } from "./prompt-studio/PromptSyncConfirmModal";
import { PromptSyncVerification } from "./prompt-studio/PromptSyncVerification";
import {
  PromptTestContextBar,
  type PromptTestContext
} from "./prompt-studio/PromptTestContextBar";
import { PromptQualityScorecard } from "./prompt-studio/PromptQualityScorecard";
import { PromptVersionInsightsPanel } from "./prompt-studio/PromptVersionInsightsPanel";
import { PromptQuestFlowPanel } from "./prompt-studio/PromptQuestFlowPanel";
import {
  btnGhost,
  btnPrimary,
  encodeTemplateKey,
  inputClass,
  panelClass,
  tabClass,
  textareaClass
} from "./prompt-studio/promptStudioTheme";

const PILLARS: PillarId[] = ["business", "financials", "management", "forces"];

type StudioTab = "quest" | "optimize" | "compare" | "edit" | "insights";

type PreviewPillar = {
  selectedQuestSlugs: string[];
  cards: Array<{ questSlug: string; cardId: string; promptFocus: string }>;
};

type EvaluatedPreview = {
  plainEnglishAnswer: string;
  investorInsight: string | null;
  userPrompt: string;
  model: string;
  temperature: number;
  promptSource: string;
  quality: PromptQualityAnalysis;
  priorCardCount: number;
};

export function PromptStudioPanel() {
  const [tab, setTab] = useState<StudioTab>("quest");
  const [templates, setTemplates] = useState<PromptTemplateDto[]>([]);
  const [variables, setVariables] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [detail, setDetail] = useState<PromptTemplateDetailDto | null>(null);
  const [draftBody, setDraftBody] = useState("");
  const [draftModel, setDraftModel] = useState("gpt-4o-mini");
  const [draftTemp, setDraftTemp] = useState(0.25);
  const [changeNote, setChangeNote] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [teachingNotes, setTeachingNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [syncModal, setSyncModal] = useState<"all" | "single" | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncPromptFromCodeResult[] | null>(
    null
  );

  const [testCtx, setTestCtx] = useState<PromptTestContext>({
    ticker: "AAPL",
    previewPillar: "business",
    questSlug: "",
    cardId: ""
  });
  const [previewMeta, setPreviewMeta] = useState<PreviewPillar | null>(null);
  const [previewRunning, setPreviewRunning] = useState(false);
  const [previewResult, setPreviewResult] = useState<EvaluatedPreview | null>(null);
  const [draftSystem, setDraftSystem] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/prompt-templates", { cache: "no-store" });
      const data = (await res.json()) as {
        templates?: PromptTemplateDto[];
        variables?: string[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to load templates.");
      setTemplates(data.templates ?? []);
      setVariables(data.variables ?? []);
      setSelectedKey((prev) => {
        if (prev) return prev;
        return data.templates?.[0]?.templateKey ?? null;
      });
    } catch (err) {
      setLoadError(humanizeTechnicalMessage(err instanceof Error ? err.message : "Load failed."));
    }
  }, []);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const loadDetail = useCallback(async (templateKey: string) => {
    try {
      const res = await fetch(
        `/api/admin/prompt-templates/${encodeTemplateKey(templateKey)}`,
        { cache: "no-store" }
      );
      const data = (await res.json()) as {
        template?: PromptTemplateDetailDto;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to load template.");
      const t = data.template ?? null;
      setDetail(t);
      if (t) {
        const active = t.versions.find((v) => v.isActive);
        setDraftBody(t.activeBody ?? "");
        setDraftModel(t.activeModel);
        setDraftTemp(t.activeTemperature);
        setTagsInput((active?.tags ?? []).join(", "));
        setTeachingNotes(active?.teachingNotes ?? "");
      }
    } catch (err) {
      setDetail(null);
      setStatus(err instanceof Error ? err.message : "Load failed.");
    }
  }, []);

  useEffect(() => {
    if (selectedKey) void loadDetail(selectedKey);
  }, [selectedKey, loadDetail]);

  const grouped = useMemo(() => {
    const map = new Map<PillarId, PromptTemplateDto[]>();
    for (const p of PILLARS) map.set(p, []);
    for (const t of templates) {
      if (t.pillarId && map.has(t.pillarId)) {
        map.get(t.pillarId)!.push(t);
      }
    }
    return map;
  }, [templates]);

  const loadPreviewMeta = useCallback(async () => {
    try {
      const qs = new URLSearchParams({
        ticker: testCtx.ticker,
        mode: "all",
        pillarId: testCtx.previewPillar
      });
      const res = await fetch(`/api/admin/quest-generation/preview-slugs?${qs}`);
      const data = (await res.json()) as {
        pillars?: Array<{
          selectedQuestSlugs: string[];
          cards: PreviewPillar["cards"];
        }>;
      };
      const pillar = data.pillars?.[0] ?? null;
      setPreviewMeta(pillar);
      const firstQuest = pillar?.selectedQuestSlugs?.[0] ?? "";
      setTestCtx((prev) => ({
        ...prev,
        questSlug:
          prev.questSlug && pillar?.selectedQuestSlugs.includes(prev.questSlug)
            ? prev.questSlug
            : firstQuest,
        cardId: prev.cardId || pillar?.cards?.[0]?.cardId || ""
      }));
    } catch {
      setPreviewMeta(null);
    }
  }, [testCtx.ticker, testCtx.previewPillar]);

  useEffect(() => {
    const t = window.setTimeout(() => void loadPreviewMeta(), 250);
    return () => window.clearTimeout(t);
  }, [loadPreviewMeta]);

  useEffect(() => {
    if (!previewMeta?.cards) return;
    const cards = previewMeta.cards.filter(
      (c) => c.questSlug === testCtx.questSlug
    );
    const first = cards[0]?.cardId ?? "";
    setTestCtx((prev) => ({
      ...prev,
      cardId:
        prev.cardId && cards.some((c) => c.cardId === prev.cardId)
          ? prev.cardId
          : first
    }));
  }, [previewMeta, testCtx.questSlug]);

  const isSystem = detail?.scope === "system";
  const pairedSystemKey = detail?.pillarId ? `system:${detail.pillarId}` : null;
  const pairedUserKey = detail?.pillarId ? `user:${detail.pillarId}` : null;

  useEffect(() => {
    if (!pairedSystemKey || detail?.scope !== "user") return;
    void fetch(`/api/admin/prompt-templates/${encodeTemplateKey(pairedSystemKey)}`)
      .then((r) => r.json())
      .then((d: { template?: PromptTemplateDetailDto }) => {
        setDraftSystem(d.template?.activeBody ?? null);
      })
      .catch(() => setDraftSystem(null));
  }, [pairedSystemKey, detail?.scope]);

  const parseTags = () =>
    tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const saveVersion = async (publish: boolean) => {
    if (!selectedKey) return;
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(
        `/api/admin/prompt-templates/${encodeTemplateKey(selectedKey)}/versions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            body: draftBody,
            model: isSystem ? undefined : draftModel,
            temperature: isSystem ? undefined : draftTemp,
            changeNote,
            tags: parseTags(),
            teachingNotes,
            publish
          })
        }
      );
      const data = (await res.json()) as {
        template?: PromptTemplateDetailDto;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setDetail(data.template ?? null);
      setChangeNote("");
      setStatus(publish ? "Published new version." : "Saved draft (not live).");
      await loadTemplates();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const rollback = async (versionId: string) => {
    if (!selectedKey) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/admin/prompt-templates/${encodeTemplateKey(selectedKey)}/activate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ versionId })
        }
      );
      const data = (await res.json()) as { template?: PromptTemplateDetailDto };
      if (!res.ok) throw new Error("Rollback failed");
      setDetail(data.template ?? null);
      if (data.template?.activeBody) setDraftBody(data.template.activeBody);
      setStatus("Rolled back to selected version.");
      await loadTemplates();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Rollback failed.");
    } finally {
      setSaving(false);
    }
  };

  const runPreview = async () => {
    if (!detail?.pillarId || !testCtx.questSlug || !testCtx.cardId) return;
    setPreviewRunning(true);
    setPreviewResult(null);

    let systemPrompt: string | undefined;
    if (detail.scope === "system") systemPrompt = draftBody;
    else if (draftSystem) systemPrompt = draftSystem;

    const userTemplate = detail.scope === "user" ? draftBody : undefined;

    try {
      const res = await fetch("/api/admin/prompt-templates/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pillarId: testCtx.previewPillar,
          ticker: testCtx.ticker,
          questSlug: testCtx.questSlug,
          cardId: testCtx.cardId,
          templateKey: detail.templateKey,
          draft: {
            systemPrompt,
            userTemplate,
            model: detail.scope === "user" ? draftModel : undefined,
            temperature: detail.scope === "user" ? draftTemp : undefined
          },
          saveEvaluation: true
        })
      });
      const data = (await res.json()) as EvaluatedPreview & {
        error?: string;
        detail?: string;
      };
      if (!res.ok) throw new Error(data.detail ?? data.error ?? "Preview failed");
      setPreviewResult(data);
      setStatus(
        `Evaluated · composite ${data.quality.compositeScore} · ${data.priorCardCount} prior cards used for repetition check.`
      );
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Preview failed.");
    } finally {
      setPreviewRunning(false);
    }
  };

  const SYNC_CONFIRM_MESSAGE =
    "This will create new active prompt versions from the latest code defaults. Old versions will remain available for rollback.";

  const applySyncResult = (
    result: SyncPromptFromCodeResult,
    template?: PromptTemplateDetailDto
  ) => {
    setSyncResults([result]);
    if (template) {
      setDetail(template);
      setDraftBody(template.activeBody ?? "");
      setDraftModel(template.activeModel);
      setDraftTemp(template.activeTemperature);
      const active = template.versions.find((v) => v.isActive);
      setTagsInput((active?.tags ?? []).join(", "));
      setTeachingNotes(active?.teachingNotes ?? "");
    }
    setStatus(
      result.published
        ? `Reset to code default — now live v${result.versionNumber}.`
        : `Already matches code default (v${result.versionNumber}).`
    );
  };

  const resetTemplateToCodeDefault = async () => {
    if (!selectedKey) return;
    setSyncing(true);
    setStatus(null);
    try {
      const res = await fetch(
        `/api/admin/prompt-templates/${encodeTemplateKey(selectedKey)}/sync-from-code`,
        { method: "POST" }
      );
      const data = (await res.json()) as {
        result?: SyncPromptFromCodeResult & { template?: PromptTemplateDetailDto };
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Reset failed.");
      const payload = data.result;
      if (!payload?.templateKey) throw new Error("Invalid reset response.");
      const { template, ...result } = payload;
      applySyncResult(result, template);
      await loadTemplates();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setSyncing(false);
      setSyncModal(null);
    }
  };

  const syncAllTemplatesFromCode = async () => {
    setSyncing(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/prompt-templates/sync-from-code", {
        method: "POST"
      });
      const data = (await res.json()) as {
        summary?: {
          synced: number;
          unchanged: number;
          results: SyncPromptFromCodeResult[];
        };
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Sync failed.");
      const summary = data.summary;
      if (!summary) throw new Error("Invalid sync response.");
      setSyncResults(summary.results);
      setStatus(
        `Synced ${summary.synced} template(s) from code defaults (${summary.unchanged} unchanged).`
      );
      if (selectedKey) await loadDetail(selectedKey);
      await loadTemplates();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Sync failed.");
    } finally {
      setSyncing(false);
      setSyncModal(null);
    }
  };

  const syncVersionMeta = async (versionId: string) => {
    if (!selectedKey) return;
    await fetch(
      `/api/admin/prompt-templates/${encodeTemplateKey(selectedKey)}/versions/${versionId}/meta`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tags: parseTags(),
          teachingNotes,
          changeNote
        })
      }
    );
  };

  return (
    <OpsPageShell
      title="Prompt Studio"
      subtitle="Tune how the game explains companies in plain English. Sync, test, and publish from your phone."
    >
      <OpsTouchButton
        variant="secondary"
        disabled={syncing || Boolean(loadError)}
        onClick={() => setSyncModal("all")}
        description="Pull latest teaching prompts from code into the live game"
      >
        Sync all prompts from code
      </OpsTouchButton>

      <PromptSyncConfirmModal
        open={syncModal === "all"}
        title="Sync all templates?"
        message={SYNC_CONFIRM_MESSAGE}
        confirmLabel="Sync all from code"
        busy={syncing}
        onCancel={() => setSyncModal(null)}
        onConfirm={() => void syncAllTemplatesFromCode()}
      />
      <PromptSyncConfirmModal
        open={syncModal === "single"}
        title="Reset this template?"
        message={SYNC_CONFIRM_MESSAGE}
        confirmLabel="Reset to code default"
        busy={syncing}
        onCancel={() => setSyncModal(null)}
        onConfirm={() => void resetTemplateToCodeDefault()}
      />

      {syncResults ? (
        <PromptSyncVerification results={syncResults} />
      ) : null}

      {loadError ? (
        <div className={panelClass}>
          <p className="text-sm text-rose-300">{loadError}</p>
          <p className="mt-2 text-xs text-white/50">
            Run migrations in{" "}
            <code className="text-white/70">supabase/migrations/</code> (prompt_templates
            + prompt_studio_evaluations), then refresh.
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside
          className={`${opsPanel} space-y-3 lg:sticky lg:top-6 lg:max-h-[min(70vh,calc(100dvh-12rem))] lg:overflow-y-auto [-webkit-overflow-scrolling:touch]`}
        >
          <h2 className="text-xs font-semibold uppercase text-white/50">Templates</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible [-webkit-overflow-scrolling:touch]">
          {PILLARS.map((pillarId) => {
            const items = grouped.get(pillarId) ?? [];
            if (!items.length) return null;
            return (
              <div key={pillarId} className="shrink-0 space-y-1 lg:shrink">
                <p className="text-[10px] font-medium uppercase text-white/40">
                  {pillarById(pillarId)?.title ?? pillarId}
                </p>
                {items.map((t) => (
                  <button
                    key={t.templateKey}
                    type="button"
                    onClick={() => setSelectedKey(t.templateKey)}
                    className={`block min-h-[44px] w-full rounded-xl px-3 py-2.5 text-left text-xs font-medium transition touch-manipulation ${
                      selectedKey === t.templateKey
                        ? "bg-[var(--partner-primary)]/25 text-white"
                        : "text-white/70 hover:bg-white/5"
                    }`}
                  >
                    {t.scope}
                    {t.activeVersionNumber != null ? (
                      <span className="ml-1 text-white/40">
                        v{t.activeVersionNumber}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            );
          })}
          </div>
        </aside>

        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
            {(
              [
                ["quest", "Quest flow"],
                ["optimize", "Single card"],
                ["compare", "Compare"],
                ["edit", "Edit prompt"],
                ["insights", "Best versions"]
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={tabClass(tab === id)}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className={`${panelClass} space-y-3`}>
            <h2 className="text-xs font-semibold uppercase text-white/50">
              Test context
            </h2>
            <PromptTestContextBar
              ctx={testCtx}
              onChange={(patch) => setTestCtx((prev) => ({ ...prev, ...patch }))}
              previewMeta={previewMeta}
            />
          </div>

          {tab === "quest" ? (
            <PromptQuestFlowPanel
              detail={detail}
              testCtx={testCtx}
              draftBody={draftBody}
              draftSystem={draftSystem}
              draftModel={draftModel}
              draftTemp={draftTemp}
            />
          ) : null}

          {detail && tab === "optimize" ? (
            <section className={`${panelClass} space-y-4`}>
              <p className="text-xs text-white/55">
                Editing <span className="text-white">{detail.label}</span> — draft
                scores are saved to version history when you preview.
              </p>
              <OpsTouchButton
                variant="primary"
                disabled={previewRunning}
                onClick={() => void runPreview()}
                description="Write a sample answer and score plain-English quality"
              >
                {previewRunning ? "Scoring…" : "Test this prompt"}
              </OpsTouchButton>
              {previewResult ? (
                <>
                  <PromptQualityScorecard quality={previewResult.quality} />
                  <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/25 p-4 font-mono text-xs text-white/85">
                    {previewResult.plainEnglishAnswer}
                  </pre>
                </>
              ) : null}
            </section>
          ) : null}

          {detail && tab === "compare" ? (
            <PromptComparePanel
              detail={detail}
              testCtx={testCtx}
              draftBody={draftBody}
              draftSystem={draftSystem}
            />
          ) : null}

          {detail && tab === "insights" ? (
            <PromptVersionInsightsPanel
              detail={detail}
              onRefreshDetail={() => selectedKey && void loadDetail(selectedKey)}
            />
          ) : null}

          {detail && tab === "edit" ? (
            <section className={`${panelClass} space-y-4`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-white">{detail.label}</h2>
                  <p className="font-mono text-[11px] text-white/45">
                    {detail.templateKey}
                  </p>
                </div>
                {detail.activeVersionNumber != null ? (
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                    Live v{detail.activeVersionNumber}
                  </span>
                ) : null}
              </div>

              <textarea
                className={textareaClass}
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
                spellCheck={false}
              />

              {!isSystem ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-xs text-white/60">
                    Model
                    <input
                      className={inputClass}
                      value={draftModel}
                      onChange={(e) => setDraftModel(e.target.value)}
                    />
                  </label>
                  <label className="grid gap-1 text-xs text-white/60">
                    Temperature
                    <input
                      type="number"
                      step="0.05"
                      min={0}
                      max={2}
                      className={inputClass}
                      value={draftTemp}
                      onChange={(e) =>
                        setDraftTemp(parseFloat(e.target.value) || 0.25)
                      }
                    />
                  </label>
                </div>
              ) : null}

              <label className="grid gap-1 text-xs text-white/60">
                Version note
                <input
                  className={inputClass}
                  value={changeNote}
                  onChange={(e) => setChangeNote(e.target.value)}
                  placeholder="What changed in this iteration?"
                />
              </label>

              <label className="grid gap-1 text-xs text-white/60">
                Tags (comma-separated)
                <input
                  className={inputClass}
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder={PROMPT_STUDIO_TAG_SUGGESTIONS.join(", ")}
                />
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_STUDIO_TAG_SUGGESTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/55 hover:bg-white/5"
                    onClick={() => {
                      const cur = parseTags();
                      if (!cur.includes(tag)) {
                        setTagsInput([...cur, tag].join(", "));
                      }
                    }}
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              <label className="grid gap-1 text-xs text-white/60">
                Teaching notes (style intent for your team)
                <textarea
                  className="min-h-[72px] rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/85"
                  value={teachingNotes}
                  onChange={(e) => setTeachingNotes(e.target.value)}
                  placeholder="e.g. Warmer tone, shorter bullets, assume zero finance background"
                />
              </label>

              <div className="grid gap-2 sm:grid-cols-2">
                <OpsTouchButton
                  variant="primary"
                  disabled={saving || !draftBody.trim()}
                  onClick={() => void saveVersion(true)}
                  description="Make this version live for players"
                >
                  Save & go live
                </OpsTouchButton>
                <OpsTouchButton
                  variant="secondary"
                  disabled={saving}
                  onClick={() => void saveVersion(false)}
                  description="Keep editing without changing the live prompt"
                >
                  Save draft only
                </OpsTouchButton>
                <OpsTouchButton
                  variant="secondary"
                  disabled={saving || syncing}
                  onClick={() => setSyncModal("single")}
                  description="Undo local edits — match latest code default"
                >
                  Reset to code default
                </OpsTouchButton>
                {detail.activeVersionId ? (
                  <button
                    type="button"
                    className={btnGhost}
                    onClick={() => void syncVersionMeta(detail.activeVersionId!)}
                  >
                    Update live tags/notes
                  </button>
                ) : null}
              </div>

              <ul className="max-h-48 space-y-1 overflow-y-auto border-t border-white/10 pt-3 text-xs">
                {detail.versions.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.02] px-2 py-1.5"
                  >
                    <span className="text-white/80">
                      v{v.versionNumber}
                      {v.isActive ? (
                        <span className="ml-1 text-emerald-300">live</span>
                      ) : null}
                      {v.isRecommended ? (
                        <span className="ml-1 text-amber-300">★</span>
                      ) : null}
                      {v.tags.length ? (
                        <span className="ml-1 text-white/40">
                          {v.tags.join(", ")}
                        </span>
                      ) : null}
                    </span>
                    {!v.isActive ? (
                      <button
                        type="button"
                        className="text-[var(--partner-primary)]"
                        onClick={() => void rollback(v.id)}
                      >
                        Rollback
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {tab === "edit" && variables.length > 0 ? (
            <section className={`${panelClass} space-y-2`}>
              <h2 className="text-xs font-semibold uppercase text-white/50">
                User template variables
              </h2>
              <p className="font-mono text-[11px] text-white/55">
                {variables.map((v) => `{{${v}}}`).join(" · ")}
              </p>
            </section>
          ) : null}

          {status ? (
            <p className="text-[15px] leading-relaxed text-white/75">{status}</p>
          ) : null}
        </div>
      </div>
    </OpsPageShell>
  );
}
