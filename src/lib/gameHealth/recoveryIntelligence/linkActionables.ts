import type { AuditActionableDetail } from "@/lib/gameHealth/resolutionIntelligence/actionableDetail";

import type { RecoveryDriverLink, RecoveryImpactDriver } from "./types";

const LEARNING_CATEGORIES = new Set([
  "jargon_detection",
  "beginner_friendliness",
  "cognitive_load",
  "conversational_tone",
  "question_alignment"
]);

function detailMatchesLearning(detail: AuditActionableDetail): boolean {
  return detail.findings.some(
    (f) => f.categoryId != null && LEARNING_CATEGORIES.has(f.categoryId)
  );
}

function filterByDriverId(driverId: string, details: AuditActionableDetail[]): AuditActionableDetail[] {
  if (
    driverId === "learning_plain_language" ||
    driverId.includes("plain_language") ||
    driverId.includes("jargon") ||
    driverId === "subsection:plain_language" ||
    driverId === "subsection:pedagogy"
  ) {
    const learning = details.filter(detailMatchesLearning);
    return learning.length > 0 ? learning : details;
  }
  if (driverId.startsWith("subsection:")) {
    return details;
  }
  if (driverId.startsWith("category:")) {
    const catId = driverId.replace("category:", "");
    return details.filter((d) => d.findings.some((f) => f.categoryId === catId));
  }
  return details;
}

export function filterActionablesForLink(
  link: RecoveryDriverLink | undefined,
  details: AuditActionableDetail[]
): AuditActionableDetail[] {
  if (!link) return details;

  if (link.kind === "check") {
    return filterByDriverId(link.checkId, details);
  }
  if (link.kind === "subsection") {
    return filterByDriverId(`subsection:${link.subsectionId}`, details);
  }

  switch (link.filter) {
    case "all":
      return details;
    case "learning_domain":
      return details.filter(detailMatchesLearning).length > 0
        ? details.filter(detailMatchesLearning)
        : details;
    case "placeholders":
      return details.filter((d) =>
        d.findings.some(
          (f) =>
            f.code === "template_fallback" ||
            f.reason.toLowerCase().includes("placeholder")
        )
      );
    case "regen":
      return details;
    case "category":
      if (!link.categoryId) return details;
      return details.filter((d) =>
        d.findings.some((f) => f.categoryId === link.categoryId)
      );
    default:
      return details;
  }
}

export function filterActionablesForDriver(
  driver: RecoveryImpactDriver | null | undefined,
  details: AuditActionableDetail[]
): AuditActionableDetail[] {
  if (!driver) return details;
  if (driver.link) return filterActionablesForLink(driver.link, details);
  return filterByDriverId(driver.id, details);
}

export function countActionablesForDriver(
  driver: RecoveryImpactDriver,
  details: AuditActionableDetail[]
): number {
  return filterActionablesForDriver(driver, details).length;
}

export function enrichDriversWithCardCounts(
  drivers: RecoveryImpactDriver[],
  details: AuditActionableDetail[]
): RecoveryImpactDriver[] {
  if (details.length === 0) return drivers;
  return drivers.map((d) => ({
    ...d,
    affectedCardCount: countActionablesForDriver(d, details)
  }));
}

export function scrollToActionableCard(key: string): void {
  const el = document.getElementById(`recovery-card-${key}`);
  el?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function scrollToElementId(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
