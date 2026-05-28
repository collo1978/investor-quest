"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  applyCommunicationAuditToPlatformReport,
  mergePlatformReportWithLiveAudit
} from "@/lib/gameHealth/applyCommunicationAuditToReport";
import {
  filterOpenIssuesAfterCardRepair,
  type RepairVerificationResult
} from "@/lib/gameHealth/missionControlRepairSync";
import type { RepairQueueDoneItem } from "@/lib/operations/repairQueue";

import { MissionControlSimpleRepair } from "@/components/platform/MissionControlSimpleRepair";
import { CommunicationQualityPanel } from "@/components/platform/CommunicationQualityPanel";
import { BehavioralIntelligenceTeaser } from "@/components/platform/behavioralDesign/BehavioralIntelligenceTeaser";
import { DemoContentRefreshPanel } from "@/components/platform/DemoContentRefreshPanel";
import { PlatformHealthOverview } from "@/components/platform/PlatformHealthOverview";
import { OpsHealthHero } from "@/components/operations/OpsHealthHero";
import { OpsHealthTrendChart } from "@/components/operations/OpsHealthTrendChart";
import { OpsIssueCard } from "@/components/operations/OpsIssueCard";
import { OpsPageShell } from "@/components/operations/OpsPageShell";
import { OpsTouchButton } from "@/components/operations/OpsTouchButton";
import { opsInput, opsPanel } from "@/components/operations/opsTheme";
import { humanizeTechnicalMessage } from "@/lib/operations/layman";
import type {
  GameHealthCheckRecord,
  GameHealthIssueRecord,
  GameHealthSettings,
  PlatformHealthReport
} from "@/lib/gameHealth/types";

const SIMPLE_MODE_KEY = "mission-control-simple-mode";

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
  const [showAlerts, setShowAlerts] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<SupabaseDiagnostics | null>(null);
  const [liveReport, setLiveReport] = useState<PlatformHealthReport | null>(null);
  const [liveOpenIssues, setLiveOpenIssues] = useState<GameHealthIssueRecord[]>([]);
  const [simpleMode, setSimpleMode] = useState(true);
  const [doneRepairs, setDoneRepairs] = useState<RepairQueueDoneItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIMPLE_MODE_KEY);
      if (stored === "advanced") setSimpleMode(false);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const incoming = data?.latest?.platformReport;
    if (!incoming) {
      setLiveReport(null);
      setLiveOpenIssues([]);
      return;
    }
    setLiveReport((prev) => mergePlatformReportWithLiveAudit(incoming, prev));
    setLiveOpenIssues(data?.openIssues ?? []);
  }, [data?.latest?.platformReport, data?.openIssues]);

  const displayReport = liveReport ?? data?.latest?.platformReport ?? null;
  const displayOpenIssues =
    data?.openIssues != null ? liveOpenIssues : [];

  const domainScores = useMemo(
    () =>
      Object.fromEntries(
        (displayReport?.domains ?? []).map((d) => [d.domainId, d.score])
      ),
    [displayReport?.domains]
  );

  const handleRepairSync = useCallback(
    async (result: RepairVerificationResult) => {
      setLiveReport((prev) => {
        const base = prev ?? data?.latest?.platformReport;
        if (!base) return prev;
        return applyCommunicationAuditToPlatformReport(base, result.communicationQuality);
      });
      setLiveOpenIssues((prev) => {
        const base = prev.length > 0 ? prev : (data?.openIssues ?? []);
        return filterOpenIssuesAfterCardRepair(base, result.cardChange);
      });
      if (result.cardChange) {
        const loc = result.cardChange;
        setDoneRepairs((prev) => [
          {
            id: `fix:${loc.ticker}:${loc.cardId}:${Date.now()}`,
            title: `${loc.ticker} ${loc.cardId} fixed`,
            fixedAt: loc.fixedAt
          },
          ...prev
        ].slice(0, 12));
      }
    },
    [data?.latest?.platformReport, data?.openIssues]
  );

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
    if (!data?.configured) return;

    const refreshMs = 45_000;
    const intervalMinutes = settingsForm?.checkIntervalMinutes ?? 15;
    /** Browser background checks — never more often than every 5 minutes. */
    const intervalMs = Math.max(intervalMinutes, 5) * 60_000;

    const refreshTimer = window.setInterval(() => void load(), refreshMs);

    const runScheduledCheck = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        // Use main admin route (no cron secret). External schedulers use POST /cron.
        const res = await fetch("/api/admin/game-health", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sendAlerts: true })
        });
        if (res.ok) await load();
      } catch {
        /* Dev server offline or network blip — refresh timer still reloads dashboard data. */
      }
    };

    const cronTimer = window.setInterval(() => {
      void runScheduledCheck();
    }, intervalMs);

    return () => {
      window.clearInterval(refreshTimer);
      window.clearInterval(cronTimer);
    };
  }, [load, settingsForm?.checkIntervalMinutes, data?.configured]);

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
      const pct = json.check?.platformReport?.overallScore ?? json.check?.score ?? "?";
      setMessage(`Check done — ${pct}% platform health`);
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
      subtitle={
        simpleMode
          ? "Prioritized repair queue — fix what matters, verify it worked."
          : "Full audit intelligence — deep review and card-level repair."
      }
      showQuickNav
      showBackLink={false}
    >
      <div className="flex rounded-xl border border-white/12 bg-black/30 p-1">
        <button
          type="button"
          className={`min-h-[40px] flex-1 rounded-lg px-4 py-2 text-[13px] font-semibold touch-manipulation ${
            simpleMode ? "bg-violet-500/30 text-violet-100" : "text-white/55"
          }`}
          onClick={() => {
            setSimpleMode(true);
            try {
              localStorage.setItem(SIMPLE_MODE_KEY, "simple");
            } catch {
              /* ignore */
            }
          }}
        >
          Simple repair
        </button>
        <button
          type="button"
          className={`min-h-[40px] flex-1 rounded-lg px-4 py-2 text-[13px] font-semibold touch-manipulation ${
            !simpleMode ? "bg-violet-500/30 text-violet-100" : "text-white/55"
          }`}
          onClick={() => {
            setSimpleMode(false);
            try {
              localStorage.setItem(SIMPLE_MODE_KEY, "advanced");
            } catch {
              /* ignore */
            }
          }}
        >
          Advanced audit
        </button>
      </div>

      <OpsHealthHero
        score={displayReport?.overallScore ?? data.latest?.score ?? null}
        statusLabel={displayReport?.demoReadiness.status ?? data.latest?.statusLabel}
        lastCheckAt={data.latest?.createdAt}
        slowestRoute={data.latest?.slowestRoute}
        durationSec={
          data.latest?.durationMs != null ? data.latest.durationMs / 1000 : null
        }
        running={running}
        onRunCheck={() => void runCheck()}
        onRefresh={() => void load()}
      />

      {simpleMode ? (
        <MissionControlSimpleRepair
          report={displayReport}
          openIssues={displayOpenIssues}
          doneItems={doneRepairs}
          onRepairSync={handleRepairSync}
          onRefresh={load}
          onShowAdvanced={() => {
            setSimpleMode(false);
            try {
              localStorage.setItem(SIMPLE_MODE_KEY, "advanced");
            } catch {
              /* ignore */
            }
          }}
          onDoneItem={(item) => setDoneRepairs((prev) => [item, ...prev].slice(0, 12))}
        />
      ) : null}

      {!simpleMode && displayReport ? (
        <PlatformHealthOverview
          report={displayReport}
          openIssues={displayOpenIssues}
          onRepairComplete={handleRepairSync}
        />
      ) : null}

      {!simpleMode ? (
        <>
          <CommunicationQualityPanel
            report={displayReport?.communicationQuality}
            openIssues={displayOpenIssues}
            onRepairComplete={handleRepairSync}
          />

          <BehavioralIntelligenceTeaser />

          <DemoContentRefreshPanel onRefreshMissionControl={() => void load()} />

          <OpsHealthTrendChart history={data.history} />

          <section id="mission-control-open-issues" className="scroll-mt-6 space-y-3">
            <h2 className="text-sm font-semibold text-white/80">
              Open issues — resolution workflow ({displayOpenIssues.length})
            </h2>
            <p className="text-[12px] text-white/45">
              Card-level repair with before/after copy review.
            </p>
            {displayOpenIssues.length === 0 ? (
              <p className={`${opsPanel} text-[15px] text-emerald-400/90`}>
                No open issues — looking good for a demo.
              </p>
            ) : (
              <ul className="space-y-3">
                {displayOpenIssues.map((issue) => (
                  <OpsIssueCard
                    key={issue.id}
                    issue={issue}
                    domainScores={domainScores}
                    onIssueUpdated={load}
                  />
                ))}
              </ul>
            )}
          </section>
        </>
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
