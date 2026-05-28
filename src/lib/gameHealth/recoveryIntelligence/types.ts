import type { HealthDomainId } from "@/lib/gameHealth/registry/types";

export type RecoverySeverity = "critical" | "high" | "medium" | "low";

/** Connects a recovery driver to actionable card filters or platform checks. */
export type RecoveryDriverLink =
  | {
      kind: "actionable_filter";
      filter:
        | "all"
        | "placeholders"
        | "regen"
        | "category"
        | "learning_domain";
      categoryId?: string;
    }
  | { kind: "check"; checkId: string }
  | { kind: "subsection"; subsectionId: string };

export type RecoveryImpactDriver = {
  id: string;
  label: string;
  severity: RecoverySeverity;
  /** Estimated points currently dragging this domain score down. */
  scoreDragPercent: number;
  /** Estimated points recovered if this driver is fully resolved. */
  recoveryPercent: number;
  fixAction: string;
  count?: number;
  /** How to find flagged cards / issues for this driver. */
  link?: RecoveryDriverLink;
  /** Cards matching this driver (filled when actionable data is available). */
  affectedCardCount?: number;
};

export type RecoveryStep = {
  step: number;
  action: string;
  driverId: string;
  severity: RecoverySeverity;
};

export type RecoveryEstimate = {
  action: string;
  recoveryPercent: number;
  driverId: string;
};

export type DomainRecoveryIntelligence = {
  domainId: HealthDomainId;
  domainLabel: string;
  currentScore: number;
  drivers: RecoveryImpactDriver[];
  recommendedOrder: RecoveryStep[];
  estimatedRecovery: RecoveryEstimate[];
  /** Sum of recovery estimates (capped to remaining gap to 100). */
  totalRecoverablePercent: number;
};

export const RECOVERY_SEVERITY_ORDER: Record<RecoverySeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3
};
