import { type NextRequest, NextResponse } from "next/server";

import { getControlledDemoRedirect } from "@/lib/demo/controlledDemo";
import { REQUEST_PATHNAME_HEADER } from "@/lib/requestPathname";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

function withRequestPathname(
  response: NextResponse,
  pathname: string
): NextResponse {
  response.headers.set(REQUEST_PATHNAME_HEADER, pathname);
  return response;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/schools") {
    const url = request.nextUrl.clone();
    url.pathname = "/schools/opening";
    return withRequestPathname(NextResponse.redirect(url), "/schools/opening");
  }

  const redirectTo = getControlledDemoRedirect(pathname, request.nextUrl.search);
  if (redirectTo) {
    const url = request.nextUrl.clone();
    url.pathname = redirectTo;
    return withRequestPathname(NextResponse.redirect(url), redirectTo);
  }
  const isSchoolsDemoPresenter =
    pathname === "/schools/demo" ||
    pathname.startsWith("/schools/demo/");
  const response = isSchoolsDemoPresenter
    ? NextResponse.next({ request })
    : await updateSupabaseSession(request);
  return withRequestPathname(response, pathname);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
