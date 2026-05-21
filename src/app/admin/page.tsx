import { redirect } from "next/navigation";
import { DEFAULT_PARTNER_ID } from "@/platform/partners/partnerRegistry";

export default function AdminIndexPage() {
  redirect(
    `/admin/branding?partner=${encodeURIComponent(DEFAULT_PARTNER_ID)}`
  );
}
