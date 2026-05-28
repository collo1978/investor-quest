/** Global platform health scope only (no partner/client overlays in Phase 1). */

export type HealthDomainId =
  | "platform_release"
  | "data_integrations"
  | "content_completeness"
  | "learning_quality"
  | "communication_quality"
  | "player_progression"
  | "world_map"
  | "quest_session"
  | "admin_operations";

export type HealthCheckType = "automated" | "browser" | "manual";

/** Result of an executed check. `pending` = catalogued but not run yet (browser/manual lab). */
export type HealthCheckResultStatus = "pass" | "warn" | "fail" | "pending";

export type HealthSubsectionDefinition = {
  id: string;
  label: string;
  description?: string;
};

export type HealthDomainDefinition = {
  id: HealthDomainId;
  label: string;
  description: string;
  weight: number;
  /** Demo readiness fails if any check in this domain fails with blocksDemo. */
  demoCritical: boolean;
  subsections: HealthSubsectionDefinition[];
};

export type HealthCheckCatalogEntry = {
  id: string;
  name: string;
  domainId: HealthDomainId;
  subsectionId: string;
  checkType: HealthCheckType;
  weight: number;
  blocksDemo: boolean;
  defaultSuggestedFix: string;
  /** 1 = implemented in server runner; 2+ = future / placeholder */
  implementationPhase: 1 | 2 | 3;
};
