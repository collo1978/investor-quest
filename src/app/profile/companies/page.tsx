import { redirect } from "next/navigation";

/** Legacy URL — company progress lives at `/company-progress`. */
export default function ProfileCompaniesRedirect() {
  redirect("/company-progress");
}
