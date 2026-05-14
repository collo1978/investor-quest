import { redirect } from "next/navigation";

/** `/` redirects to the quest map (intro screen bypassed). */
export default function HomePage() {
  redirect("/map");
}
