/** Beginner-friendly SEC source line for quest footers (no accession unless dev). */

import type { SecSectionRef } from "@/data/quests/types";

const ACCESSION_RE = /^\d{10}-\d{2}-\d{6,}$/;

function shortFormLabel(form: SecSectionRef["form"]): string | null {
  switch (form) {
    case "10-K":
      return "10-K";
    case "10-Q":
      return "10-Q";
    case "DEF 14A":
      return "DEF 14A";
    case "8-K":
      return "8-K";
    case "S-1":
      return "S-1";
    case "13F":
      return "13F";
    case "other":
      return null;
    default:
      return null;
  }
}

/** Player-facing section label — trim filing punctuation, keep Item refs readable. */
export function polishSourceSectionLabel(section: string): string {
  return section
    .replace(/\s+/g, " ")
    .replace(/\.\s*$/, "")
    .replace(/^Item\s+1\.?\s*/i, "Item 1 ")
    .trim();
}

/**
 * Filing footer copy: `NVIDIA 10-K • Item 1 Business`.
 * Uses quest `secSection` + company name — not generic "Data sourced from SEC filings".
 */
export function formatPlayerQuestSourceFromSection(
  secSection: SecSectionRef | null | undefined,
  companyName?: string | null
): string | null {
  if (!secSection) return null;

  const sectionRaw = secSection.section?.trim();
  const sectionLabel = sectionRaw ? polishSourceSectionLabel(sectionRaw) : null;
  const formLabel = shortFormLabel(secSection.form);
  const company = companyName?.trim();

  if (secSection.form === "other") {
    if (!sectionLabel) return null;
    if (company) return `${company} • ${sectionLabel}`;
    return sectionLabel;
  }

  if (!formLabel && !sectionLabel) return null;

  const head =
    company && formLabel
      ? `${company} ${formLabel}`
      : formLabel ?? company ?? null;

  if (head && sectionLabel) return `${head} • ${sectionLabel}`;
  return head ?? sectionLabel;
}

function normalizeLegacyFormToken(raw: string): SecSectionRef["form"] {
  const f = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (f === "10K" || f === "10-K") return "10-K";
  if (f === "10Q" || f === "10-Q") return "10-Q";
  if (f === "8K" || f === "8-K") return "8-K";
  if (f === "DEF14A" || f === "DEF-14A" || f === "DEF 14A") return "DEF 14A";
  if (f === "S1" || f === "S-1") return "S-1";
  if (f === "13F") return "13F";
  return "other";
}

/** @deprecated Prefer `formatPlayerQuestSourceFromSection`. */
export function formatPlayerQuestSourceLabel(
  sourceForm?: string | null,
  _sourceAccession?: string | null,
  companyName?: string | null
): string | null {
  if (!sourceForm?.trim()) return null;
  return formatPlayerQuestSourceFromSection(
    { form: normalizeLegacyFormToken(sourceForm), section: "" },
    companyName
  );
}

export type PlayerQuestSourceDisplay = {
  label: string | null;
  /** Shown only in dev/debug URL modes */
  accession: string | null;
};

function legacyFriendlyFormLabel(form: string | null | undefined): string {
  const f = (form ?? "10-K").trim().toUpperCase().replace(/\s+/g, "");
  if (f === "10-K" || f === "10K") return "Official SEC 10-K filing";
  if (f === "10-Q" || f === "10Q") return "Official SEC 10-Q filing";
  if (f === "DEF14A" || f === "DEF-14A") return "Official SEC proxy filing";
  if (f === "8-K" || f === "8K") return "Official SEC 8-K filing";
  return "Data sourced from SEC filings";
}

/**
 * Normalize legacy `SEC 10-K · 0001045810-…` strings for display.
 */
export function formatPlayerQuestSourceDisplay(
  raw: string | null | undefined,
  options?: { devMode?: boolean; companyName?: string | null }
): PlayerQuestSourceDisplay {
  if (!raw?.trim()) return { label: null, accession: null };

  const trimmed = raw.trim();
  const pipe = trimmed.match(/^SEC\s+(\S+)\s*[·•—-]\s*(\S.+)$/i);
  if (pipe) {
    const accession = pipe[2]!.trim();
    const fromSection = formatPlayerQuestSourceFromSection(
      { form: pipe[1] as SecSectionRef["form"], section: "" },
      options?.companyName
    );
    return {
      label: fromSection ?? legacyFriendlyFormLabel(pipe[1]),
      accession: options?.devMode && ACCESSION_RE.test(accession) ? accession : null
    };
  }

  if (ACCESSION_RE.test(trimmed)) {
    return {
      label: options?.companyName
        ? `${options.companyName.trim()} 10-K`
        : "Data sourced from SEC filings",
      accession: options?.devMode ? trimmed : null
    };
  }

  if (/^SEC\s+/i.test(trimmed)) {
    const form = trimmed.replace(/^SEC\s+/i, "").split(/[·•—,]/)[0]?.trim();
    const sectionPart = trimmed.split(/[·•—]/)[1]?.trim();
    const fromSection =
      sectionPart && form
        ? formatPlayerQuestSourceFromSection(
            { form: form as SecSectionRef["form"], section: sectionPart },
            options?.companyName
          )
        : null;
    return {
      label: fromSection ?? legacyFriendlyFormLabel(form),
      accession: null
    };
  }

  if (trimmed.includes("•")) {
    return { label: trimmed, accession: null };
  }

  if (trimmed.includes(",")) {
    const form = trimmed.split(",")[0]?.trim();
    const section = trimmed.split(",").slice(1).join(",").trim();
    const fromSection = formatPlayerQuestSourceFromSection(
      { form: (form ?? "10-K") as SecSectionRef["form"], section },
      options?.companyName
    );
    return { label: fromSection ?? legacyFriendlyFormLabel(form), accession: null };
  }

  return { label: trimmed, accession: null };
}
