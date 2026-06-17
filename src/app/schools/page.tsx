import { redirect } from "next/navigation";

/** Schools entry — presenter demo lives at `/schools/demo`. */
export default function SchoolsRootPage() {
  redirect("/schools/demo");
}
