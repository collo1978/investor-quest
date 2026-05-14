import { redirect } from "next/navigation";

/** Legacy URL — ladder lives at `/xp-ladder` only. */
export default function LegacyProfileXpLadderRedirect() {
  redirect("/xp-ladder");
}
