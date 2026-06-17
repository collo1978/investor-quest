import { isSchoolsDemoProtectedPath } from "@/lib/schools/schoolsDemoProtection";

let warmed = false;

/** Warm interests API while the user is on the prior onboarding beat. */
export function warmBankPickInterestsCatalog(): void {
  if (isSchoolsDemoProtectedPath()) return;
  if (warmed || typeof window === "undefined") return;
  warmed = true;
  void fetch("/api/onboarding/interests", { cache: "no-store" }).catch(() => {});
}
