import type { PartnerConfig, PackageTierId } from "@/platform/types";
import { getPackageTier } from "@/platform/packages/packageDefinitions";

export function tierAllowsMechanic(
  tierId: PackageTierId,
  mechanicId: string
): boolean {
  return getPackageTier(tierId).allowedGamificationMechanicIds.includes(
    mechanicId
  );
}

export function policyHasMechanic(
  partner: PartnerConfig,
  mechanicId: string
): boolean {
  return partner.policy.gamificationMechanicIds.includes(mechanicId);
}

export function effectiveMechanicEnabled(args: {
  partner: PartnerConfig;
  mechanicId: string;
  overrides: Record<string, boolean | undefined>;
}): boolean {
  const base = policyHasMechanic(args.partner, args.mechanicId);
  const o = args.overrides[args.mechanicId];
  return typeof o === "boolean" ? o : base;
}
