import type { CompanyId } from "@/data/companies";
import { DEFAULT_COMPANY_ID, isCompanyId } from "@/lib/demoData";

export const SCHOOLS_PICK_COMPANY_STORAGE_KEY = "iq-schools-pick-company";

export type SchoolsPickCompanySelection = {
  sectorId: string;
  industryId: string;
  companyName: string;
};

const EMPTY_SELECTION: SchoolsPickCompanySelection = {
  sectorId: "",
  industryId: "",
  companyName: ""
};

/** Map display names to playable demo company ids where available. */
const COMPANY_NAME_TO_ID: Record<string, CompanyId> = {
  NVIDIA: "nvda",
  Apple: "aapl",
  Microsoft: "msft",
  Nike: "nke"
};

export function resolveSchoolsPickCompanyGameId(companyName: string): CompanyId {
  const direct = COMPANY_NAME_TO_ID[companyName];
  if (direct) return direct;

  const normalized = companyName.toLowerCase();
  for (const [name, id] of Object.entries(COMPANY_NAME_TO_ID)) {
    if (name.toLowerCase() === normalized) return id;
  }

  if (isCompanyId(normalized)) return normalized;
  return DEFAULT_COMPANY_ID;
}

export function readSchoolsPickCompanySelection(): SchoolsPickCompanySelection {
  if (typeof sessionStorage === "undefined") return { ...EMPTY_SELECTION };
  try {
    const raw = sessionStorage.getItem(SCHOOLS_PICK_COMPANY_STORAGE_KEY);
    if (!raw) return { ...EMPTY_SELECTION };
    const parsed = JSON.parse(raw) as Partial<SchoolsPickCompanySelection>;
    return {
      sectorId: typeof parsed.sectorId === "string" ? parsed.sectorId : "",
      industryId: typeof parsed.industryId === "string" ? parsed.industryId : "",
      companyName: typeof parsed.companyName === "string" ? parsed.companyName : ""
    };
  } catch {
    return { ...EMPTY_SELECTION };
  }
}

export function writeSchoolsPickCompanySelection(
  selection: SchoolsPickCompanySelection
): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(SCHOOLS_PICK_COMPANY_STORAGE_KEY, JSON.stringify(selection));
  } catch {
    /* ignore */
  }
}

export function isSchoolsPickCompanyComplete(
  selection: SchoolsPickCompanySelection
): boolean {
  return Boolean(
    selection.sectorId && selection.industryId && selection.companyName
  );
}
