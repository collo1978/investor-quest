import type { ReactNode } from "react";

import { SchoolsDemoNavMenu } from "@/components/schools/SchoolsDemoNavMenu";

/** Shared Schools shell — nav menu on canonical `/schools/*` and presenter `/schools/demo/*`. */
export default function SchoolsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SchoolsDemoNavMenu />
      {children}
    </>
  );
}
