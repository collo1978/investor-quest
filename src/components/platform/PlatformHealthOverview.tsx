"use client";

import { tierFromScoreOrLabel } from "@/lib/operations/healthTier";
import type { GameHealthIssueRecord, PlatformHealthReport } from "@/lib/gameHealth/types";

import { PlatformHealthDomainPanel } from "@/components/platform/PlatformHealthDomainPanel";
import { opsPanel } from "@/components/operations/opsTheme";

export function PlatformHealthOverview({
  report,
  openIssues,
  onRepairComplete
}: {
  report: PlatformHealthReport;
  openIssues?: GameHealthIssueRecord[];
  onRepairComplete?: (
    result: import("@/lib/gameHealth/missionControlRepairSync").RepairVerificationResult
  ) => void | Promise<void>;
}) {
  const overallTier = tierFromScoreOrLabel(
    report.overallScore,
    report.demoReadiness.status
  );
  const demoTier = tierFromScoreOrLabel(
    report.demoReadiness.overallScore,
    report.demoReadiness.status
  );

  return (
    <div className="space-y-4">
      <section className={`${opsPanel} grid gap-4 sm:grid-cols-2`}>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
            Platform health
          </p>
          <p
            className="mt-2 font-[var(--font-grotesk)] text-5xl font-bold tabular-nums leading-none"
            style={{ color: overallTier.color }}
          >
            {report.overallScore}%
          </p>
          <p className="mt-2 text-[13px] text-white/55">
            Weighted across {report.domains.length} domains. Pending and unavailable
            audits do not lower scores.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/25 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
            Demo readiness
          </p>
          <p
            className="mt-2 text-xl font-bold"
            style={{ color: demoTier.color }}
          >
            {report.demoReadiness.ready ? "Ready for demo" : "Not demo ready"}
          </p>
          <p className="mt-1 text-[14px] text-white/70">{report.demoReadiness.status}</p>
          {report.bottleneckLabel ? (
            <p className="mt-3 text-[12px] text-amber-200/85">
              <span className="font-semibold">Bottleneck: </span>
              {report.bottleneckLabel} (
              {report.domains.find((d) => d.domainId === report.bottleneckDomainId)?.score}
              %)
            </p>
          ) : null}
          {report.demoReadiness.blockers.length > 0 ? (
            <ul className="mt-3 space-y-1 text-[12px] text-white/55">
              {report.demoReadiness.blockers.map((b) => (
                <li key={b}>• {b}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <section className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Pass", value: report.overallCounts.pass, color: "#22c58b" },
          { label: "Warn", value: report.overallCounts.warn, color: "#f5c547" },
          { label: "Fail", value: report.overallCounts.fail, color: "#ef4444" },
          { label: "Pending", value: report.overallCounts.pending, color: "#a78bfa" },
          {
            label: "N/A",
            value: report.overallCounts.unavailable ?? 0,
            color: "#38bdf8"
          }
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              {item.label}
            </p>
            <p
              className="mt-1 font-[var(--font-grotesk)] text-2xl font-bold tabular-nums"
              style={{ color: item.color }}
            >
              {item.value}
            </p>
          </div>
        ))}
      </section>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-white/80">Health by domain</h2>
        {report.domains.map((domain) => (
          <PlatformHealthDomainPanel
            key={domain.domainId}
            domain={domain}
            communicationQuality={report.communicationQuality}
            openIssues={openIssues}
            onRepairComplete={onRepairComplete}
          />
        ))}
      </div>
    </div>
  );
}
