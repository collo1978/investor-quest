import { type NextRequest, NextResponse } from "next/server";

import { getControlledDemoRedirect } from "@/lib/demo/controlledDemo";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const redirectTo = getControlledDemoRedirect(
    request.nextUrl.pathname,
    request.nextUrl.search
  );
  if (redirectTo) {
    const url = request.nextUrl.clone();
    url.pathname = redirectTo;
    return NextResponse.redirect(url);
  }
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
