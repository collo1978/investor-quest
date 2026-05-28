"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { RecoveryAuditLoadInline } from "@/components/platform/RecoveryAuditLoadInline";
import { RecoveryInlineCardRepair } from "@/components/platform/RecoveryInlineCardRepair";
import { RecoveryIntelligencePanel } from "@/components/platform/RecoveryIntelligencePanel";
import { actionableDetailsFromOpenIssues } from "@/lib/communicationQuality/actionableFromIssues";
import { allActionableDetailsFromReport } from "@/lib/communicationQuality/actionableDisplay";
import type { CommunicationQualityReport } from "@/lib/communicationQuality/types";
import {
  actionableCardKey,
  type AuditActionableDetail
} from "@/lib/gameHealth/resolutionIntelligence/actionableDetail";
import {
  buildCommunicationRecovery,
  buildDomainRecoveryIntelligence,
  domainRequiresCardAudit,
  enrichDriversWithCardCounts,
  filterActionablesForDriver
} from "@/lib/gameHealth/recoveryIntelligence";
import type { DomainRecoveryIntelligence } from "@/lib/gameHealth/recoveryIntelligence";
import type { RepairVerificationResult } from "@/lib/gameHealth/missionControlRepairSync";
import { domainScoreFromCommunicationReport } from "@/lib/gameHealth/recoveryIntelligence/domainScores";
import type { HealthDomainId } from "@/lib/gameHealth/registry/types";
import type {
  GameHealthIssueRecord,
  PlatformHealthDomainResult
} from "@/lib/gameHealth/types";
import { humanizeTechnicalMessage } from "@/lib/operations/layman";

type Props = {
  intelligence: DomainRecoveryIntelligence;
  domain: PlatformHealthDomainResult;
  domainId: HealthDomainId;
  domainLabel: string;
  domainScore: number;
  communicationQuality?: CommunicationQualityReport | null;
  openIssues?: GameHealthIssueRecord[];
  compact?: boolean;
  onRepairComplete?: (result: RepairVerificationResult) => void | Promise<void>;
};

export function RecoveryRepairWorkflow({
  intelligence: initialIntelligence,
  domain,
  domainId,
  domainLabel,
  domainScore,
  communicationQuality,
  openIssues = [],
  compact,
  onRepairComplete
}: Props) {
  const needsCardAudit = domainRequiresCardAudit(domainId);

  const [auditReport, setAuditReport] = useState<CommunicationQualityReport | null>(
    communicationQuality ?? null
  );
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [autoLoadFailed, setAutoLoadFailed] = useState(false);
  const autoLoadStarted = useRef(false);

  useEffect(() => {
    setAuditReport(communicationQuality ?? null);
  }, [communicationQuality]);

  const effectiveReport = auditReport ?? communicationQuality ?? null;

  const actionableDetails = useMemo(() => {
    const fromReport = effectiveReport
      ? allActionableDetailsFromReport(effectiveReport, domainId)
      : [];
    if (fromReport.length > 0) return fromReport;
    return actionableDetailsFromOpenIssues(openIssues, domainId);
  }, [effectiveReport, domainId, openIssues]);

  const intelligence = useMemo(() => {
    if (effectiveReport && needsCardAudit) {
      const rebuilt = buildDomainRecoveryIntelligence(domain, effectiveReport);
      if (rebuilt && rebuilt.drivers.length > 0) return rebuilt;
      const comm = buildCommunicationRecovery(
        effectiveReport,
        domainId,
        domainLabel,
        domainScore
      );
      if (comm.drivers.length > 0) return comm;
    }
    return initialIntelligence;
  }, [
    domain,
    domainId,
    domainLabel,
    domainScore,
    effectiveReport,
    initialIntelligence,
    needsCardAudit
  ]);

  const enrichedIntelligence = useMemo(
    () => ({
      ...intelligence,
      drivers: enrichDriversWithCardCounts(intelligence.drivers, actionableDetails)
    }),
    [intelligence, actionableDetails]
  );

  const defaultDriverId = useMemo(() => {
    const withCards = enrichedIntelligence.drivers.find(
      (d) => (d.affectedCardCount ?? 0) > 0
    );
    return (
      withCards?.id ??
      enrichedIntelligence.recommendedOrder[0]?.driverId ??
      enrichedIntelligence.drivers[0]?.id ??
      null
    );
  }, [enrichedIntelligence]);

  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [liveDomainScore, setLiveDomainScore] = useState(domainScore);
  const [scoreBeforeRepair, setScoreBeforeRepair] = useState(domainScore);
  const [pinnedRepairs, setPinnedRepairs] = useState<Map<string, AuditActionableDetail>>(
    () => new Map()
  );

  useEffect(() => {
    setLiveDomainScore(domainScore);
    setScoreBeforeRepair(domainScore);
  }, [domainScore]);

  useEffect(() => {
    if (!selectedDriverId && defaultDriverId) {
      setSelectedDriverId(defaultDriverId);
    }
  }, [defaultDriverId, selectedDriverId]);

  const loadCardAudit = useCallback(async () => {
    if (!needsCardAudit || auditLoading) return;

    setAuditLoading(true);
    setAuditError(null);

    try {
      const res = await fetch("/api/admin/game-health/communication-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const json = (await res.json()) as {
        ok?: boolean;
        report?: CommunicationQualityReport;
        error?: string;
      };

      if (!res.ok || !json.ok || !json.report) {
        throw new Error(json.error ?? "Could not load card audit.");
      }

      setAuditReport(json.report);
      setAutoLoadFailed(false);
      const auditScore = domainScoreFromCommunicationReport(json.report, domainId);
      setLiveDomainScore(auditScore);
      await onRepairComplete?.({
        domainId,
        domainScore: auditScore,
        beforeScore: liveDomainScore,
        communicationQuality: json.report,
        communicationOverall: json.report.overallHealthPercent,
        cardsStillFlagged: json.report.cardsNeedingRegeneration.length
      });
    } catch (err) {
      const msg = humanizeTechnicalMessage(
        err instanceof Error ? err.message : "Card audit failed."
      );
      setAuditError(msg);
      setAutoLoadFailed(true);
    } finally {
      setAuditLoading(false);
    }
  }, [auditLoading, domainId, liveDomainScore, needsCardAudit, onRepairComplete]);

  useEffect(() => {
    autoLoadStarted.current = false;
  }, [domainId, communicationQuality?.executedAt]);

  useEffect(() => {
    if (!needsCardAudit || actionableDetails.length > 0 || auditLoading) return;
    if (autoLoadStarted.current) return;
    autoLoadStarted.current = true;
    void loadCardAudit();
  }, [needsCardAudit, actionableDetails.length, auditLoading, loadCardAudit]);

  const selectedDriver = useMemo(
    () => enrichedIntelligence.drivers.find((d) => d.id === selectedDriverId) ?? null,
    [enrichedIntelligence.drivers, selectedDriverId]
  );

  const filteredCards = useMemo(() => {
    const matched = filterActionablesForDriver(selectedDriver, actionableDetails);
    if (matched.length > 0) return matched;
    if (selectedDriver && actionableDetails.length > 0) {
      return actionableDetails;
    }
    return matched;
  }, [selectedDriver, actionableDetails]);

  const selectDriver = useCallback(
    (driverId: string) => {
      setSelectedDriverId(driverId);
      setScoreBeforeRepair(liveDomainScore);
      if (
        needsCardAudit &&
        actionableDetails.length === 0 &&
        !auditLoading
      ) {
        void loadCardAudit();
      }
    },
    [actionableDetails.length, auditLoading, liveDomainScore, loadCardAudit, needsCardAudit]
  );

  const handleRepairComplete = useCallback(
    async (result: RepairVerificationResult) => {
      setLiveDomainScore(result.domainScore);
      setAuditReport(result.communicationQuality);
      await onRepairComplete?.(result);
    },
    [onRepairComplete]
  );

  const cardsToRender = useMemo(() => {
    const byKey = new Map<string, AuditActionableDetail>();
    for (const detail of filteredCards) {
      byKey.set(actionableCardKey(detail), detail);
    }
    for (const [key, detail] of pinnedRepairs) {
      if (!byKey.has(key)) byKey.set(key, detail);
    }
    return [...byKey.values()];
  }, [filteredCards, pinnedRepairs]);

  const inlineRepair = useMemo(() => {
    if (!selectedDriver) return null;

    if (cardsToRender.length > 0) {
      return (
        <>
          {cardsToRender.map((detail, index) => (
            <RecoveryInlineCardRepair
              key={actionableCardKey(detail)}
              detail={detail}
              domainId={domainId}
              domainLabel={domainLabel}
              domainScoreBefore={scoreBeforeRepair}
              defaultExpanded={index === 0}
              onRepairComplete={(r) => {
                setPinnedRepairs((prev) => {
                  const next = new Map(prev);
                  next.set(actionableCardKey(detail), detail);
                  return next;
                });
                void handleRepairComplete(r);
              }}
            />
          ))}
        </>
      );
    }

    if (needsCardAudit) {
      return (
        <RecoveryAuditLoadInline
          loading={auditLoading}
          error={auditError}
          autoLoadFailed={autoLoadFailed}
          onLoad={() => void loadCardAudit()}
        />
      );
    }

    return null;
  }, [
    auditError,
    auditLoading,
    autoLoadFailed,
    domainId,
    domainLabel,
    cardsToRender,
    handleRepairComplete,
    loadCardAudit,
    needsCardAudit,
    scoreBeforeRepair,
    selectedDriver
  ]);

  return (
    <RecoveryIntelligencePanel
      intelligence={{
        ...enrichedIntelligence,
        currentScore: liveDomainScore
      }}
      compact={compact}
      selectedDriverId={selectedDriverId}
      onSelectDriver={selectDriver}
      filteredCardCount={filteredCards.length}
      domainScore={liveDomainScore}
      scoreBeforeRepair={scoreBeforeRepair}
      inlineRepair={inlineRepair}
      auditLoading={auditLoading && filteredCards.length === 0}
    />
  );
}
