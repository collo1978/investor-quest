"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePartnerPreview } from "@/components/platform/PartnerPreviewContext";
import { savePartnerBranding } from "@/lib/admin/savePartnerBranding";
import type { PartnerBrandingUpdateInput } from "@/lib/supabase/partners/brandingUpdateShared";
import { TONE_PRESET_OPTIONS } from "@/lib/supabase/partners/brandingUpdateShared";
import type { PartnerBranding, TonePresetId } from "@/platform/types";
import { getPartnerCatalogSource } from "@/platform/partners/partnerRegistry";

function brandingToForm(b: PartnerBranding): PartnerBrandingUpdateInput {
  return {
    partnerName: b.partnerName,
    logoUrl: b.logoUrl,
    colorPrimary: b.colors.primary,
    colorSecondary: b.colors.secondary,
    colorAccent: b.colors.accent,
    tonePresetId: b.tonePresetId,
    wordingDeckId: b.wordingDeckId
  };
}

function formsEqual(a: PartnerBrandingUpdateInput, b: PartnerBrandingUpdateInput) {
  return (
    a.partnerName === b.partnerName &&
    a.logoUrl === b.logoUrl &&
    a.colorPrimary === b.colorPrimary &&
    a.colorSecondary === b.colorSecondary &&
    a.colorAccent === b.colorAccent &&
    a.tonePresetId === b.tonePresetId &&
    a.wordingDeckId === b.wordingDeckId
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-[var(--partner-primary)]/40 placeholder:text-white/30 focus:ring-2";

export default function AdminBrandingPage() {
  const { partner, partnerId, refreshCatalog } = usePartnerPreview();
  const catalogSource = getPartnerCatalogSource();

  const savedSnapshot = useMemo(
    () => brandingToForm(partner.branding),
    [partner.branding]
  );

  const [form, setForm] = useState<PartnerBrandingUpdateInput>(savedSnapshot);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    setForm(savedSnapshot);
    setMessage(null);
  }, [partnerId, savedSnapshot]);

  const dirty = !formsEqual(form, savedSnapshot);

  const updateField = useCallback(
    <K extends keyof PartnerBrandingUpdateInput>(
      key: K,
      value: PartnerBrandingUpdateInput[K]
    ) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setMessage(null);
    },
    []
  );

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const result = await savePartnerBranding(partnerId, form);
      await refreshCatalog();
      const where =
        result.persisted === "supabase"
          ? "Supabase"
          : "local demo storage (Supabase unavailable)";
      setMessage({
        type: "success",
        text: `Branding saved to ${where}. Changes persist after refresh.`
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Could not save branding."
      });
    } finally {
      setSaving(false);
    }
  };

  const previewBranding: PartnerBranding = {
    ...partner.branding,
    partnerName: form.partnerName,
    logoUrl: form.logoUrl,
    colors: {
      ...partner.branding.colors,
      primary: form.colorPrimary,
      secondary: form.colorSecondary,
      accent: form.colorAccent
    },
    tonePresetId: form.tonePresetId,
    wordingDeckId: form.wordingDeckId
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">Branding</h1>
          <p className="max-w-2xl text-sm text-white/65">
            Edit partner identity and theme tokens. Saves to{" "}
            {catalogSource === "supabase" ? "Supabase" : "local demo storage"}{" "}
            when you click Save.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            disabled={!dirty || saving}
            onClick={() => setForm(savedSnapshot)}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reset
          </button>
          <button
            type="button"
            disabled={!dirty || saving}
            onClick={() => void handleSave()}
            className="rounded-xl bg-[var(--partner-primary)] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_24px_color-mix(in_srgb,var(--partner-primary)_45%,transparent)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save branding"}
          </button>
        </div>
      </header>

      {message ? (
        <div
          className={[
            "rounded-xl border px-4 py-3 text-sm",
            message.type === "success"
              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
              : "border-rose-400/30 bg-rose-500/10 text-rose-100"
          ].join(" ")}
        >
          {message.text}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 lg:col-span-1"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
            Identity
          </div>

          <label className="grid gap-1 text-[11px] text-white/55">
            Partner name
            <input
              className={inputClass}
              value={form.partnerName}
              onChange={(e) => updateField("partnerName", e.target.value)}
              required
            />
          </label>

          <label className="grid gap-1 text-[11px] text-white/55">
            Logo URL
            <input
              className={inputClass}
              value={form.logoUrl}
              onChange={(e) => updateField("logoUrl", e.target.value)}
              placeholder="/screens/quest-map.png"
              required
            />
          </label>

          <div className="pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
            Colors
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                ["Primary", "colorPrimary"],
                ["Secondary", "colorSecondary"],
                ["Accent", "colorAccent"]
              ] as const
            ).map(([label, key]) => (
              <label key={key} className="grid gap-1 text-[11px] text-white/55">
                {label}
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                    value={form[key]}
                    onChange={(e) => updateField(key, e.target.value)}
                  />
                  <input
                    className={inputClass}
                    value={form[key]}
                    onChange={(e) => updateField(key, e.target.value)}
                    pattern="^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$"
                    required
                  />
                </div>
              </label>
            ))}
          </div>

          <div className="pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
            Copy decks
          </div>

          <label className="grid gap-1 text-[11px] text-white/55">
            Tone preset
            <select
              className={inputClass}
              value={form.tonePresetId}
              onChange={(e) =>
                updateField("tonePresetId", e.target.value as TonePresetId)
              }
            >
              {TONE_PRESET_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-[11px] text-white/55">
            Wording deck id
            <input
              className={inputClass}
              value={form.wordingDeckId}
              onChange={(e) => updateField("wordingDeckId", e.target.value)}
              required
            />
          </label>
        </form>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
              Live preview
            </div>
            <div className="mt-2 text-lg font-semibold text-white">
              {previewBranding.partnerName}
            </div>
            <div className="mt-4 grid gap-2 text-sm text-white/70">
              <div>
                <span className="text-white/45">Tone:</span>{" "}
                {previewBranding.tonePresetId}
              </div>
              <div>
                <span className="text-white/45">Copy deck:</span>{" "}
                {previewBranding.wordingDeckId}
              </div>
            </div>
            <div className="relative mt-4 h-28 w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewBranding.logoUrl}
                alt=""
                className="h-full w-auto max-w-full object-contain opacity-90"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
              Brand colors
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["Primary", previewBranding.colors.primary],
                  ["Secondary", previewBranding.colors.secondary],
                  ["Accent", previewBranding.colors.accent]
                ] as const
              ).map(([label, hex]) => (
                <div key={label} className="rounded-xl border border-white/10 p-3">
                  <div className="text-[10px] uppercase tracking-wide text-white/45">
                    {label}
                  </div>
                  <div
                    className="mt-2 h-10 w-full rounded-lg border border-white/10"
                    style={{ background: hex }}
                  />
                  <div className="mt-2 break-all text-[10px] text-white/60">
                    {hex}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["Surface (read-only)", previewBranding.colors.surface],
                  ["Text (read-only)", previewBranding.colors.text]
                ] as const
              ).map(([label, hex]) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/10 p-3 opacity-70"
                >
                  <div className="text-[10px] uppercase tracking-wide text-white/45">
                    {label}
                  </div>
                  <div
                    className="mt-2 h-8 w-full rounded-lg border border-white/10"
                    style={{ background: hex }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
