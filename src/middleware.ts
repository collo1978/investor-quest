import { type NextRequest, NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionToken
} from "@/lib/admin/adminSession";
import { getControlledDemoRedirect } from "@/lib/demo/controlledDemo";
import { REQUEST_PATHNAME_HEADER } from "@/lib/requestPathname";
import { isSchoolsPreviewPath } from "@/lib/schools/schoolsDemoHref";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

// `/api/admin/game-health/cron` authenticates itself via a header secret
// (GAME_HEALTH_CRON_SECRET) and is invoked by an external cron/dashboard
// timer with no browser session — exempt it from the cookie gate below.
const ADMIN_GATE_EXEMPT_PATHS = new Set([
  "/admin-login",
  "/api/admin/login",
  "/api/admin/game-health/cron"
]);

function isAdminGatedPath(pathname: string): boolean {
  if (ADMIN_GATE_EXEMPT_PATHS.has(pathname)) return false;
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/api/admin" ||
    pathname.startsWith("/api/admin/")
  );
}

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
    url.pathname = "/schools/demo";
    return withRequestPathname(NextResponse.redirect(url), "/schools/demo");
  }

  // `/schools/preview/*` is an internal design-review surface (art-style comparisons,
  // unlisted screens) — its links only render in the dev sidebar (NODE_ENV !== "production").
  // Block direct access in production so it isn't reachable by guessing the URL.
  if (
    process.env.NODE_ENV === "production" &&
    isSchoolsPreviewPath(pathname)
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (isAdminGatedPath(pathname)) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const authorized = await isValidAdminSessionToken(token);
    if (!authorized) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/admin-login";
      url.search = `?next=${encodeURIComponent(pathname)}`;
      return withRequestPathname(NextResponse.redirect(url), "/admin-login");
    }
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
