"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PillarId } from "@/data/pillars";
import { PILLAR_META } from "@/data/pillars";
import {
  FORCES_CATEGORY_META,
} from "@/data/quests/forcesCategories";
import type { QuestType } from "@/data/quests/types";
import { usePartnerPreview } from "@/components/platform/PartnerPreviewContext";
import { listPartners } from "@/platform/partners/partnerRegistry";
import type { SecFilingFormType } from "@/lib/sec/types";

type SectionOption = {
  formType: SecFilingFormType;
  sectionKey: string;
  sectionLabel: string;
  questCategory: string;
};

type QuestCardDto = {
  id: string;
  slug: string;
  pillarId: PillarId;
  questType: QuestType;
  title: string;
  objective: string;
  description: string;
  investorQuestion: string;
  whyThisMatters: string;
  plainEnglishAnswer: string | null;
  sourceFilingType: SecFilingFormType;
  sourceSectionKey: string;
  sourceSectionLabel: string;
  aiPromptTemplate: string;
  xpReward: number;
  quizFormat: string;
  displayOrder: number;
  hubIcon: string | null;
  hubSubtitle: string | null;
  hubCardCount: number | null;
  hubRoute: string | null;
  hubLocked: boolean | null;
  forcesCategory: string | null;
  partnerIds: string[];
  isActive: boolean;
};

type CatalogResponse = {
  cards: QuestCardDto[];
  countsByPillar?: Partial<Record<PillarId, number>>;
  questTypes: QuestType[];
  quizFormats: { kind: string; label: string }[];
  sectionOptions: SectionOption[];
  source?: "supabase";
  error?: string;
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-[var(--partner-primary)]/40 focus:ring-2";

const emptyCard = (pillarId: PillarId): Omit<QuestCardDto, "id"> => ({
  slug: "",
  pillarId,
  questType: "snapshot",
  title: "",
  objective: "",
  description: "",
  investorQuestion: "",
  whyThisMatters: "",
  plainEnglishAnswer: null,
  sourceFilingType: "10-K",
  sourceSectionKey: "item_1",
  sourceSectionLabel: "Item 1 — Business",
  aiPromptTemplate: "",
  xpReward: 100,
  quizFormat: "multiple-choice",
  displayOrder: 0,
  hubIcon:
    pillarId === "business"
      ? "snapshot"
      : pillarId === "financials"
        ? "growth"
        : pillarId === "management"
          ? "leadership"
          : pillarId === "forces"
            ? "positive-inside"
            : null,
  hubSubtitle: null,
  hubCardCount:
    pillarId === "business" ||
    pillarId === "financials" ||
    pillarId === "management"
      ? 3
      : pillarId === "forces"
        ? 5
        : null,
  hubRoute: null,
  hubLocked:
    pillarId === "business" ||
    pillarId === "financials" ||
    pillarId === "management" ||
    pillarId === "forces"
      ? true
      : null,
  forcesCategory: pillarId === "forces" ? "positive-inside" : null,
  partnerIds: [],
  isActive: true
});

export function QuestContentManager() {
  const { partnerId } = usePartnerPreview();
  const partners = useMemo(() => listPartners(), []);

  const [pillarTab, setPillarTab] = useState<PillarId>("business");
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<QuestCardDto | null>(null);
  const [isNew, setIsNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/admin/quest-content?partner=${encodeURIComponent(partnerId)}`,
        { cache: "no-store" }
      );
      const body = (await res.json()) as CatalogResponse;
      if (!res.ok) throw new Error(body.error ?? "Failed to load quest content.");
      setCatalog(body);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Load failed.");
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    void load();
  }, [load]);

  const pillarCards = useMemo(() => {
    const cards = catalog?.cards ?? [];
    return cards
      .filter((c) => c.pillarId === pillarTab)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [catalog?.cards, pillarTab]);

  const forcesGrouped = useMemo(() => {
    if (pillarTab !== "forces") return null;
    return FORCES_CATEGORY_META.map((cat) => ({
      ...cat,
      cards: pillarCards.filter((c) => c.forcesCategory === cat.id)
    }));
  }, [pillarTab, pillarCards]);

  const sectionOptionsForForm = useMemo(() => {
    const ft = editing?.sourceFilingType ?? "10-K";
    return (catalog?.sectionOptions ?? []).filter((s) => s.formType === ft);
  }, [catalog?.sectionOptions, editing?.sourceFilingType]);

  const saveCard = async () => {
    if (!editing) return;
    setMessage(null);
    const payload = { ...editing };
    try {
      const res = await fetch(
        isNew ? "/api/admin/quest-content" : `/api/admin/quest-content/${editing.id}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Save failed.");
      setEditing(null);
      setIsNew(false);
      setMessage("Quest card saved.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed.");
    }
  };

  const toggleActive = async (card: QuestCardDto) => {
    try {
      const res = await fetch(`/api/admin/quest-content/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !card.isActive })
      });
      if (!res.ok) throw new Error("Toggle failed.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Toggle failed.");
    }
  };

  const moveCard = async (cardId: string, direction: -1 | 1) => {
    const idx = pillarCards.findIndex((c) => c.id === cardId);
    if (idx < 0) return;
    const nextIdx = idx + direction;
    if (nextIdx < 0 || nextIdx >= pillarCards.length) return;

    const reordered = [...pillarCards];
    const [removed] = reordered.splice(idx, 1);
    reordered.splice(nextIdx, 0, removed);

    try {
      const res = await fetch("/api/admin/quest-content/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pillarId: pillarTab,
          orderedIds: reordered.map((c) => c.id)
        })
      });
      if (!res.ok) throw new Error("Reorder failed.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Reorder failed.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Quest content</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/65">
            Master Admin: create and manage quest cards. Content loads from Supabase
            when cards exist; otherwise the game uses built-in demo templates.
            SEC sections are extracted per{" "}
            <code className="text-white/80">source_section_key</code> — never full
            filings.
          </p>
        </div>
        <button
          type="button"
          className="rounded-xl bg-[var(--partner-primary)] px-4 py-2 text-sm font-semibold text-white"
          onClick={() => {
            setIsNew(true);
            setEditing({ id: "", ...emptyCard(pillarTab) });
          }}
        >
          + New quest card
        </button>
      </header>

      {message ? (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
          {message}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {PILLAR_META.map((p) => {
          const count =
            catalog?.countsByPillar?.[p.id] ??
            (catalog?.cards ?? []).filter((c) => c.pillarId === p.id).length;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPillarTab(p.id)}
              className={[
                "rounded-xl px-3 py-2 text-xs font-semibold",
                pillarTab === p.id
                  ? "bg-[color-mix(in_srgb,var(--partner-primary)_25%,transparent)] text-white"
                  : "bg-white/5 text-white/60 hover:text-white"
              ].join(" ")}
            >
              {p.title}
              {count > 0 ? (
                <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-neon-300">
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
        {catalog?.source === "supabase" ? (
          <span className="ml-2 text-[10px] uppercase tracking-wider text-white/40">
            Supabase · {(catalog.cards ?? []).length} cards
          </span>
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-white/50">Loading quest cards…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            {pillarCards.length === 0 ? (
              <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                No Supabase cards for <strong className="text-white/80">{pillarTab}</strong> yet.
                {(catalog?.cards ?? []).length > 0 ? (
                  <>
                    {" "}
                    Other pillars have cards — check the tab badges above.
                  </>
                ) : (
                  <>
                    {" "}
                    Run the quest_content_cards migration and seed SQL in Supabase, then
                    refresh. Until then the game uses demo templates from{" "}
                    <code className="text-white/70">src/data/quests/templates</code>.
                  </>
                )}
              </p>
            ) : forcesGrouped ? (
              forcesGrouped.map((group) => (
                <section key={group.id} className="mb-4 space-y-2">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-300/90">
                    {group.title}
                    <span className="ml-2 font-normal normal-case tracking-normal text-white/45">
                      {group.subtitle} · {group.cards.length} cards
                    </span>
                  </h3>
                  {group.cards.map((card) => {
                    const index = pillarCards.findIndex((c) => c.id === card.id);
                    return (
                      <div
                        key={card.id}
                        className={[
                          "rounded-xl border p-4",
                          card.isActive
                            ? "border-white/15 bg-white/5"
                            : "border-white/5 bg-black/20 opacity-60"
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            className="text-left"
                            onClick={() => {
                              setIsNew(false);
                              setEditing(card);
                            }}
                          >
                            <div className="font-semibold text-white">{card.title}</div>
                            <div className="mt-1 text-xs text-white/50">
                              {card.slug} · order {card.displayOrder}
                            </div>
                          </button>
                          <div className="flex shrink-0 gap-1">
                            <button
                              type="button"
                              className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-white/70"
                              disabled={index <= 0}
                              onClick={() => void moveCard(card.id, -1)}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-white/70"
                              disabled={index < 0 || index >= pillarCards.length - 1}
                              onClick={() => void moveCard(card.id, 1)}
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-white/70"
                              onClick={() => void toggleActive(card)}
                            >
                              {card.isActive ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </div>
                        <p className="mt-2 line-clamp-2 text-xs text-white/65">
                          {card.description || card.investorQuestion}
                        </p>
                      </div>
                    );
                  })}
                </section>
              ))
            ) : (
              pillarCards.map((card, index) => (
                <div
                  key={card.id}
                  className={[
                    "rounded-xl border p-4",
                    card.isActive
                      ? "border-white/15 bg-white/5"
                      : "border-white/5 bg-black/20 opacity-60"
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      className="text-left"
                      onClick={() => {
                        setIsNew(false);
                        setEditing(card);
                      }}
                    >
                      <div className="font-semibold text-white">{card.title}</div>
                      <div className="mt-1 text-xs text-white/50">
                        {card.slug} · {card.sourceFilingType} · {card.sourceSectionKey}
                      </div>
                    </button>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-white/70"
                        disabled={index === 0}
                        onClick={() => void moveCard(card.id, -1)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-white/70"
                        disabled={index === pillarCards.length - 1}
                        onClick={() => void moveCard(card.id, 1)}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-white/70"
                        onClick={() => void toggleActive(card)}
                      >
                        {card.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-white/65">
                    {card.investorQuestion}
                  </p>
                </div>
              ))
            )}
          </div>

          {editing ? (
            <form
              className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5"
              onSubmit={(e) => {
                e.preventDefault();
                void saveCard();
              }}
            >
              <h2 className="text-lg font-semibold text-white">
                {isNew ? "New quest card" : "Edit quest card"}
              </h2>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-[11px] text-white/55">
                  Slug
                  <input
                    className={inputClass}
                    value={editing.slug}
                    onChange={(e) =>
                      setEditing({ ...editing, slug: e.target.value })
                    }
                    required
                  />
                </label>
                <label className="grid gap-1 text-[11px] text-white/55">
                  Pillar
                  <select
                    className={inputClass}
                    value={editing.pillarId}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        pillarId: e.target.value as PillarId
                      })
                    }
                  >
                    {PILLAR_META.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="grid gap-1 text-[11px] text-white/55">
                Title
                <input
                  className={inputClass}
                  value={editing.title}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                  required
                />
              </label>

              {editing.pillarId === "forces" ? (
                <label className="grid gap-1 text-[11px] text-white/55">
                  Forces category
                  <select
                    className={inputClass}
                    value={editing.forcesCategory ?? "positive-inside"}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        forcesCategory: e.target.value
                      })
                    }
                  >
                    {FORCES_CATEGORY_META.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <label className="grid gap-1 text-[11px] text-white/55">
                Short explanation
                <textarea
                  className={`${inputClass} min-h-[64px]`}
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                />
              </label>

              <label className="grid gap-1 text-[11px] text-white/55">
                Question (investor)
                <textarea
                  className={`${inputClass} min-h-[72px]`}
                  value={editing.investorQuestion}
                  onChange={(e) =>
                    setEditing({ ...editing, investorQuestion: e.target.value })
                  }
                  required
                />
              </label>

              <label className="grid gap-1 text-[11px] text-white/55">
                Why this matters
                <textarea
                  className={`${inputClass} min-h-[72px]`}
                  value={editing.whyThisMatters}
                  onChange={(e) =>
                    setEditing({ ...editing, whyThisMatters: e.target.value })
                  }
                  required
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-[11px] text-white/55">
                  Order number (map)
                  <input
                    type="number"
                    min={1}
                    max={99}
                    className={inputClass}
                    value={editing.displayOrder}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        displayOrder: Number(e.target.value) || 0
                      })
                    }
                  />
                </label>
              </div>

              {editing.pillarId === "business" ||
              editing.pillarId === "financials" ||
              editing.pillarId === "management" ||
              editing.pillarId === "forces" ? (
                <fieldset
                  className={[
                    "rounded-xl border p-3",
                    editing.pillarId === "business"
                      ? "border-amber-400/25 bg-amber-500/5"
                      : editing.pillarId === "financials"
                        ? "border-emerald-400/25 bg-emerald-500/5"
                        : editing.pillarId === "forces"
                          ? "border-orange-400/25 bg-orange-500/5"
                          : "border-violet-400/25 bg-violet-500/5"
                  ].join(" ")}
                >
                  <legend
                    className={[
                      "px-1 text-[11px] font-semibold uppercase tracking-wider",
                      editing.pillarId === "business"
                        ? "text-amber-200/90"
                        : editing.pillarId === "financials"
                          ? "text-emerald-200/90"
                          : editing.pillarId === "forces"
                            ? "text-orange-200/90"
                            : "text-violet-200/90"
                    ].join(" ")}
                  >
                    {editing.pillarId === "business"
                      ? "Business"
                      : editing.pillarId === "financials"
                        ? "Financials"
                        : editing.pillarId === "forces"
                          ? "Forces"
                          : "Management"}{" "}
                    hub map (overlay)
                  </legend>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1 text-[11px] text-white/55">
                      Hub subtitle
                      <input
                        className={inputClass}
                        value={editing.hubSubtitle ?? ""}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            hubSubtitle: e.target.value || null
                          })
                        }
                        placeholder="Defaults to investor question"
                      />
                    </label>
                    <label className="grid gap-1 text-[11px] text-white/55">
                      Icon key
                      <input
                        className={inputClass}
                        value={editing.hubIcon ?? ""}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            hubIcon: e.target.value || null
                          })
                        }
                        placeholder={
                          editing.pillarId === "financials"
                            ? "growth, cash, …"
                            : editing.pillarId === "management"
                              ? "leadership, compensation, …"
                              : editing.pillarId === "forces"
                                ? "positive-inside, launch, …"
                                : "snapshot, revenue, …"
                        }
                      />
                    </label>
                    <label className="grid gap-1 text-[11px] text-white/55">
                      Card count badge
                      <input
                        type="number"
                        min={0}
                        className={inputClass}
                        value={editing.hubCardCount ?? ""}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            hubCardCount:
                              e.target.value === ""
                                ? null
                                : Number(e.target.value)
                          })
                        }
                      />
                    </label>
                    <label className="grid gap-1 text-[11px] text-white/55">
                      Route
                      <input
                        className={inputClass}
                        value={editing.hubRoute ?? ""}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            hubRoute: e.target.value || null
                          })
                        }
                        placeholder={
                          editing.pillarId === "financials"
                            ? "/financials/growth"
                            : editing.pillarId === "management"
                              ? "/quest?pillar=management&quest=board-leadership"
                              : editing.pillarId === "forces"
                                ? "/forces/category/positive-inside"
                                : "/business/what-they-do"
                        }
                      />
                    </label>
                  </div>
                  <label className="mt-3 flex items-center gap-2 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={editing.hubLocked === true}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          hubLocked: e.target.checked ? true : null
                        })
                      }
                    />
                    Force locked on hub map
                  </label>
                  <p className="mt-1 text-[10px] text-white/45">
                    Unchecked = auto policy (quest 1 open; future progression).
                  </p>
                </fieldset>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-[11px] text-white/55">
                  Source filing type
                  <select
                    className={inputClass}
                    value={editing.sourceFilingType}
                    onChange={(e) => {
                      const sourceFilingType = e.target
                        .value as SecFilingFormType;
                      const first = (catalog?.sectionOptions ?? []).find(
                        (s) => s.formType === sourceFilingType
                      );
                      setEditing({
                        ...editing,
                        sourceFilingType,
                        sourceSectionKey: first?.sectionKey ?? "",
                        sourceSectionLabel: first?.sectionLabel ?? ""
                      });
                    }}
                  >
                    <option value="10-K">10-K</option>
                    <option value="10-Q">10-Q</option>
                    <option value="DEF 14A">DEF 14A</option>
                  </select>
                </label>
                <label className="grid gap-1 text-[11px] text-white/55">
                  Source section
                  <select
                    className={inputClass}
                    value={editing.sourceSectionKey}
                    onChange={(e) => {
                      const opt = sectionOptionsForForm.find(
                        (s) => s.sectionKey === e.target.value
                      );
                      setEditing({
                        ...editing,
                        sourceSectionKey: e.target.value,
                        sourceSectionLabel: opt?.sectionLabel ?? e.target.value
                      });
                    }}
                  >
                    {sectionOptionsForForm.map((s) => (
                      <option key={s.sectionKey} value={s.sectionKey}>
                        {s.sectionLabel}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="grid gap-1 text-[11px] text-white/55">
                AI prompt template
                <textarea
                  className={`${inputClass} min-h-[96px] font-mono text-xs`}
                  value={editing.aiPromptTemplate}
                  onChange={(e) =>
                    setEditing({ ...editing, aiPromptTemplate: e.target.value })
                  }
                  placeholder="Use {Company.name} tokens. Only the mapped SEC section excerpt will be sent — not the full filing."
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="grid gap-1 text-[11px] text-white/55">
                  Quest type
                  <select
                    className={inputClass}
                    value={editing.questType}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        questType: e.target.value as QuestType
                      })
                    }
                  >
                    {(catalog?.questTypes ?? []).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-[11px] text-white/55">
                  Quiz format
                  <select
                    className={inputClass}
                    value={editing.quizFormat}
                    onChange={(e) =>
                      setEditing({ ...editing, quizFormat: e.target.value })
                    }
                  >
                    {(catalog?.quizFormats ?? []).map((f) => (
                      <option key={f.kind} value={f.kind}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-[11px] text-white/55">
                  XP reward
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={editing.xpReward}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        xpReward: Number(e.target.value) || 0
                      })
                    }
                  />
                </label>
              </div>

              <fieldset className="rounded-xl border border-white/10 p-3">
                <legend className="px-1 text-[11px] text-white/55">
                  Partner availability (empty = all partners)
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {partners.map((p) => {
                    const checked = editing.partnerIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-[10px] text-white/70"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setEditing({
                              ...editing,
                              partnerIds: checked
                                ? editing.partnerIds.filter((id) => id !== p.id)
                                : [...editing.partnerIds, p.id]
                            });
                          }}
                        />
                        {p.branding.partnerName}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <label className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={editing.isActive}
                  onChange={(e) =>
                    setEditing({ ...editing, isActive: e.target.checked })
                  }
                />
                Active
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-[var(--partner-primary)] px-4 py-2 text-sm font-semibold text-white"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80"
                  onClick={() => {
                    setEditing(null);
                    setIsNew(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="rounded-xl border border-dashed border-white/15 p-6 text-sm text-white/50">
              Select a card to edit, or create a new one.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

