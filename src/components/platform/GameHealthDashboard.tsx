"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { DemoContentRefreshPanel } from "@/components/platform/DemoContentRefreshPanel";
import { OpsHealthHero } from "@/components/operations/OpsHealthHero";
import { OpsIssueCard } from "@/components/operations/OpsIssueCard";
import { OpsPageShell } from "@/components/operations/OpsPageShell";
import { OpsTouchButton } from "@/components/operations/OpsTouchButton";
import { opsInput, opsPanel } from "@/components/operations/opsTheme";
import { humanizeTechnicalMessage } from "@/lib/operations/layman";
import type {
  GameHealthCheckRecord,
  GameHealthIssueRecord,
  GameHealthSettings
} from "@/lib/gameHealth/types";

type SupabaseDiagnostics = {
  configured: boolean;
  urlHost: string | null;
  hasNextPublicUrl: boolean;
  hasServerUrl: boolean;
  hasNextPublicAnonKey: boolean;
  hasPublishableKey: boolean;
  hasServerAnonKey: boolean;
  urlLooksValid: boolean;
  hint: string;
};

type DashboardData = {
  configured: boolean;
  latest: GameHealthCheckRecord | null;
  history: GameHealthCheckRecord[];
  openIssues: GameHealthIssueRecord[];
  settings: GameHealthSettings;
  diagnostics?: SupabaseDiagnostics;
  error?: string;
};

export function GameHealthDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [settingsForm, setSettingsForm] = useState<GameHealthSettings | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<SupabaseDiagnostics | null>(null);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const res = await fetch("/api/admin/game-health", { cache: "no-store" });
      const json = (await res.json()) as DashboardData & { error?: string };
      setDiagnostics(json.diagnostics ?? null);
      if (!res.ok) {
        setLoadError(json.error ?? "Mission Control could not reach the database.");
        setData(json.configured === true ? json : null);
        if (json.settings) setSettingsForm(json.settings);
        return;
      }
      setData(json);
      setSettingsForm(json.settings);
    } catch (err) {
      const msg = humanizeTechnicalMessage(err instanceof Error ? err.message : "Load failed.");
      setLoadError(msg);
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const refreshMs = 45_000;
    const intervalMs = (settingsForm?.checkIntervalMinutes ?? 15) * 60_000;

    const refreshTimer = window.setInterval(() => void load(), refreshMs);

    const cronTimer = window.setInterval(() => {
      void fetch("/api/admin/game-health/cron", { method: "POST" }).then(() =>
        load()
      );
    }, intervalMs);

    return () => {
      window.clearInterval(refreshTimer);
      window.clearInterval(cronTimer);
    };
  }, [load, settingsForm?.checkIntervalMinutes]);

  const runCheck = async () => {
    setRunning(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/game-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendAlerts: true })
      });
      const json = (await res.json()) as { check?: GameHealthCheckRecord; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Health check failed.");
      setMessage(`Check done — ${json.check?.score ?? "?"}%`);
      await load();
    } catch (err) {
      setMessage(humanizeTechnicalMessage(err instanceof Error ? err.message : "Check failed."));
    } finally {
      setRunning(false);
    }
  };

  const saveSettings = async () => {
    if (!settingsForm) return;
    try {
      const res = await fetch("/api/admin/game-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_settings",
          settings: settingsForm
        })
      });
      if (!res.ok) throw new Error("Could not save settings.");
      setMessage("Alert settings saved.");
      await load();
    } catch (err) {
      setMessage(humanizeTechnicalMessage(err instanceof Error ? err.message : "Save failed."));
    }
  };

  const historySpark = useMemo(() => {
    const pts = [...(data?.history ?? [])].reverse().slice(-12);
    return pts.map((h) => h.score);
  }, [data?.history]);

  if (loading) {
    return (
      <OpsPageShell
        title="Mission Control"
        subtitle="Loading live health…"
        showQuickNav={false}
        showBackLink={false}
      >
        <p className="py-12 text-center text-white/55">Running health scan…</p>
      </OpsPageShell>
    );
  }

  if (!data?.configured) {
    return (
      <OpsPageShell title="Mission Control" showQuickNav={false}>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-100">
          <p className="font-semibold text-[17px]">Database setup needed</p>
          <p className="mt-2 text-[15px] leading-relaxed">
            {loadError ??
              "Mission Control cannot connect to Supabase on this deployment."}
          </p>
          {diagnostics ? (
            <ul className="mt-4 space-y-2 text-[13px] text-amber-100/85">
              <li>
                Supabase host:{" "}
                <strong>{diagnostics.urlHost ?? "not detected"}</strong>
              </li>
              <li>
                Env on server: URL{" "}
                {diagnostics.hasNextPublicUrl || diagnostics.hasServerUrl
                  ? "yes"
                  : "missing"}{" "}
                · Key{" "}
                {diagnostics.hasNextPublicAnonKey ||
                diagnostics.hasPublishableKey ||
                diagnostics.hasServerAnonKey
                  ? "yes"
                  : "missing"}
              </li>
            </ul>
          ) : null}
          <p className="mt-4 text-[13px] leading-relaxed text-amber-100/75">
            On <strong>Vercel</strong>, set{" "}
            <code className="text-white/90">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="text-white/90">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
            for <strong>Production</strong>, then redeploy. If tables are missing,
            run the game_health migration in the{" "}
            <strong>same</strong> Supabase project as that URL.
          </p>
        </div>
      </OpsPageShell>
    );
  }

  return (
    <OpsPageShell
      title="Mission Control"
      subtitle="Monitor demo readiness and fix issues from your phone. Refreshes every 45 seconds."
      showQuickNav
      showBackLink={false}
    >
      <OpsHealthHero
        score={data.latest?.score ?? null}
        statusLabel={data.latest?.statusLabel}
        lastCheckAt={data.latest?.createdAt}
        slowestRoute={data.latest?.slowestRoute}
        durationSec={
          data.latest?.durationMs != null ? data.latest.durationMs / 1000 : null
        }
        running={running}
        onRunCheck={() => void runCheck()}
        onRefresh={() => void load()}
      />

      <DemoContentRefreshPanel onRefreshMissionControl={() => void load()} />

      {historySpark.length > 1 ? (
        <section className={opsPanel}>
          <h2 className="text-sm font-semibold text-white/80">Health trend</h2>
          <div className="mt-4 flex h-20 items-end gap-1.5">
            {historySpark.map((s, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-[var(--partner-primary)]/80"
                style={{
                  height: `${Math.max(12, s)}%`,
                  opacity: 0.35 + (s / 100) * 0.65
                }}
                title={`${s}%`}
              />
            ))}
          </div>
          <p className="mt-2 text-[12px] text-white/40">
            Last {historySpark.length} checks
          </p>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-white/80">
          Open issues ({data.openIssues.length})
        </h2>
        {data.openIssues.length === 0 ? (
          <p className={`${opsPanel} text-[15px] text-emerald-400/90`}>
            No open issues — looking good for a demo.
          </p>
        ) : (
          <ul className="space-y-3">
            {data.openIssues.map((issue) => (
              <OpsIssueCard key={issue.id} issue={issue} />
            ))}
          </ul>
        )}
      </section>

      {data.latest ? (
        <section className={opsPanel}>
          <button
            type="button"
            className="flex w-full min-h-[44px] items-center justify-between text-left text-sm font-semibold text-white/80 touch-manipulation"
            onClick={() => setShowTechnical((v) => !v)}
          >
            Technical check details
            <span className="text-white/40">{showTechnical ? "▲" : "▼"}</span>
          </button>
          {showTechnical ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <CheckList title="Passed" items={data.latest.passedChecks} tone="pass" />
              <CheckList title="Warnings" items={data.latest.warnings} tone="warn" />
              <CheckList title="Failed" items={data.latest.failedChecks} tone="fail" />
            </div>
          ) : null}
        </section>
      ) : null}

      <section className={opsPanel}>
        <button
          type="button"
          className="flex w-full min-h-[44px] items-center justify-between text-left text-sm font-semibold text-white/80 touch-manipulation"
          onClick={() => setShowAlerts((v) => !v)}
        >
          Phone alerts
          <span className="text-white/40">{showAlerts ? "▲" : "▼"}</span>
        </button>
        {showAlerts && settingsForm ? (
          <div className="mt-4 grid gap-4">
            <label className="grid gap-2 text-[14px] text-white/60">
              Email for alerts
              <input
                type="email"
                className={opsInput}
                value={settingsForm.alertEmail ?? ""}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, alertEmail: e.target.value })
                }
                placeholder="you@example.com"
              />
            </label>
            <label className="grid gap-2 text-[14px] text-white/60">
              Alert if score drops below (%)
              <input
                type="number"
                min={0}
                max={100}
                className={opsInput}
                value={settingsForm.alertBelowScore}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    alertBelowScore: Number(e.target.value)
                  })
                }
              />
            </label>
            <label className="flex min-h-[48px] items-center gap-3 text-[15px] text-white/80">
              <input
                type="checkbox"
                className="size-5 accent-[var(--partner-primary)]"
                checked={settingsForm.alertOnCritical}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    alertOnCritical: e.target.checked
                  })
                }
              />
              Text me when something breaks for players
            </label>
            <label className="flex min-h-[48px] items-center gap-3 text-[15px] text-white/80">
              <input
                type="checkbox"
                className="size-5 accent-[var(--partner-primary)]"
                checked={settingsForm.alertOnSlowLoading}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    alertOnSlowLoading: e.target.checked
                  })
                }
              />
              Text me when pages load slowly
            </label>
            <label className="grid gap-2 text-[14px] text-white/60">
              Auto-check every (minutes)
              <input
                type="number"
                min={5}
                max={120}
                className={opsInput}
                value={settingsForm.checkIntervalMinutes}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    checkIntervalMinutes: Number(e.target.value)
                  })
                }
              />
            </label>
            <OpsTouchButton variant="secondary" onClick={() => void saveSettings()}>
              Save alert settings
            </OpsTouchButton>
            <p className="text-[12px] text-white/40">
              Needs <code className="text-white/55">RESEND_API_KEY</code> for real
              emails. Otherwise alerts appear in the dev server log.
            </p>
          </div>
        ) : null}
      </section>

      {message ? (
        <p className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-[15px] text-white/80">
          {message}
        </p>
      ) : null}
    </OpsPageShell>
  );
}

function CheckList({
  title,
  items,
  tone
}: {
  title: string;
  items: Array<{ name: string; message: string; laymanSummary?: string }>;
  tone: "pass" | "warn" | "fail";
}) {
  const color =
    tone === "pass" ? "text-emerald-400" : tone === "warn" ? "text-amber-300" : "text-red-400";

  return (
    <div className="rounded-xl border border-white/8 bg-black/20 p-3">
      <h3 className={`text-xs font-bold uppercase tracking-wider ${color}`}>{title}</h3>
      <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto text-[12px] text-white/55">
        {items.length === 0 ? (
          <li>None</li>
        ) : (
          items.map((c) => (
            <li key={c.name}>
              <span className="font-medium text-white/75">
                {c.laymanSummary ?? c.name}
              </span>
              {c.laymanSummary ? (
                <span className="block text-[10px] text-white/35">{c.name}</span>
              ) : (
                <span className="block text-white/40">{c.message}</span>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
