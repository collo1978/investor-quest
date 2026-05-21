"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import {
  ANALYTICS_FEATURE_CATALOG,
  ANALYTICS_TIERS,
  TIER_LABELS,
  type AnalyticsFeatureFlags,
  type AnalyticsTierId
} from "@/lib/analytics/tiers";
import type { PartnerAnalyticsSettingsDto } from "@/lib/analytics/partnerSettingsTypes";
import { listPartners } from "@/platform/partners/partnerRegistry";
import { useClientMounted } from "@/hooks/useClientMounted";

function GlowToggle({
  checked,
  disabled,
  onChange,
  label,
  mounted
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
  label: string;
  mounted: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/30 px-4 py-3 transition hover:border-violet-400/30">
      <span className="text-sm text-white/85">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          "relative h-7 w-12 shrink-0 rounded-full border transition",
          checked
            ? "border-violet-400/60 bg-violet-500/40 shadow-[0_0_20px_-4px_rgba(168,85,247,0.8)]"
            : "border-white/15 bg-white/5",
          disabled ? "opacity-40" : ""
        ].join(" ")}
      >
        <motion.span
          layout={mounted}
          className={[
            "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md",
            checked ? "left-[22px]" : "left-0.5"
          ].join(" ")}
          transition={
            mounted
              ? { type: "spring", stiffness: 500, damping: 32 }
              : undefined
          }
        />
      </button>
    </label>
  );
}

export function PartnerFeatureAccessPanel() {
  const mounted = useClientMounted();
  const partners = listPartners();
  const [editPartnerId, setEditPartnerId] = useState(partners[0]?.id ?? "");
  const [settings, setSettings] = useState<PartnerAnalyticsSettingsDto | null>(
    null
  );
  const [allSettings, setAllSettings] = useState<PartnerAnalyticsSettingsDto[]>(
    []
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/analytics/settings", {
        cache: "no-store"
      });
      const body = (await res.json()) as {
        settings: PartnerAnalyticsSettingsDto[];
        error?: string;
      };
      if (!res.ok) throw new Error(body.error ?? "Load failed");
      setAllSettings(body.settings);
      const current =
        body.settings.find((s) => s.partnerId === editPartnerId) ??
        body.settings[0] ??
        null;
      setSettings(current);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Load failed");
    }
  }, [editPartnerId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const row = allSettings.find((s) => s.partnerId === editPartnerId);
    if (row) setSettings(row);
  }, [editPartnerId, allSettings]);

  const save = async (patch: {
    analyticsTier?: AnalyticsTierId;
    applyTierPreset?: boolean;
    flags?: Partial<AnalyticsFeatureFlags>;
  }) => {
    if (!editPartnerId) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/analytics/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId: editPartnerId,
          ...patch
        })
      });
      const body = (await res.json()) as {
        settings: PartnerAnalyticsSettingsDto;
        error?: string;
      };
      if (!res.ok) throw new Error(body.error ?? "Save failed");
      setSettings(body.settings);
      setAllSettings((prev) =>
        prev.map((s) =>
          s.partnerId === body.settings.partnerId ? body.settings : s
        )
      );
      setMessage("Partner analytics access updated.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const flags = settings?.flags;

  return (
    <section className="space-y-5 rounded-3xl border border-violet-400/25 bg-gradient-to-br from-violet-600/10 via-black/40 to-black/60 p-6 shadow-[0_0_48px_-16px_rgba(168,85,247,0.45)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-violet-300">
            SaaS feature flags
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Partner feature access
          </h2>
          <p className="mt-2 max-w-xl text-sm text-white/60">
            Toggle intelligence modules per client. Tier presets apply defaults;
            overrides persist in Supabase.{" "}
            {/* TODO: Stripe subscription sync · usage-based billing */}
          </p>
        </div>
        {settings ? (
          <div className="rounded-2xl border border-violet-400/35 bg-violet-500/10 px-4 py-2 text-right">
            <div className="text-[10px] uppercase tracking-wider text-white/45">
              Current tier
            </div>
            <div className="text-lg font-semibold text-violet-200">
              {TIER_LABELS[settings.analyticsTier]}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="grid gap-1 text-[10px] text-white/50">
          Edit partner
          <select
            className="min-w-[200px] rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={editPartnerId}
            onChange={(e) => setEditPartnerId(e.target.value)}
          >
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.branding.partnerName}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-[10px] text-white/50">
          Apply tier preset
          <div className="flex gap-2">
            {ANALYTICS_TIERS.map((tier) => (
              <button
                key={tier}
                type="button"
                disabled={saving}
                onClick={() =>
                  void save({ analyticsTier: tier, applyTierPreset: true })
                }
                className={[
                  "rounded-xl border px-3 py-2 text-[11px] font-semibold uppercase tracking-wider transition",
                  settings?.analyticsTier === tier
                    ? "border-violet-400/50 bg-violet-500/25 text-violet-100"
                    : "border-white/10 bg-black/30 text-white/60 hover:border-violet-400/30"
                ].join(" ")}
              >
                {TIER_LABELS[tier]}
              </button>
            ))}
          </div>
        </label>
      </div>

      {message ? (
        <p className="text-sm text-violet-200/90">{message}</p>
      ) : null}

      {flags ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {(["core", "pro", "enterprise"] as const).map((group) => (
            <div key={group} className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                {group === "core"
                  ? "Basic"
                  : group === "pro"
                    ? "Pro"
                    : "Enterprise"}
              </h3>
              {ANALYTICS_FEATURE_CATALOG.filter((f) => f.group === group).map(
                (feat) => (
                  <GlowToggle
                    key={feat.key}
                    mounted={mounted}
                    label={feat.label}
                    checked={flags[feat.key]}
                    disabled={saving || feat.key === "enable_basic_metrics"}
                    onChange={(next) =>
                      void save({ flags: { [feat.key]: next } })
                    }
                  />
                )
              )}
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        {allSettings.map((s) => {
          const activeCount = Object.values(s.flags).filter(Boolean).length;
          return (
            <button
              key={s.partnerId}
              type="button"
              onClick={() => setEditPartnerId(s.partnerId)}
              className={[
                "rounded-xl border p-3 text-left transition",
                editPartnerId === s.partnerId
                  ? "border-violet-400/45 bg-violet-500/15"
                  : "border-white/10 bg-black/25 hover:border-violet-400/25"
              ].join(" ")}
            >
              <div className="text-sm font-semibold text-white">
                {s.partnerName}
              </div>
              <div className="mt-1 text-[10px] text-violet-300/80">
                {TIER_LABELS[s.analyticsTier]} · {activeCount} modules on
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
