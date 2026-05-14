import InvestorProfileHub from "./InvestorProfileHub";

/** Root profile hub only — XP ladder is `/xp-ladder` (not mounted here). */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ProfilePage() {
  return <InvestorProfileHub />;
}
