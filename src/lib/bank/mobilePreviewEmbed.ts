export const MOBILE_PREVIEW_SEARCH_PARAM = "preview";
export const MOBILE_PREVIEW_SESSION_KEY = "iq-mobile-preview-embed";
export const MOBILE_PREVIEW_READY_MESSAGE = "iq-preview-ready" as const;

/** Append `?preview=1` for iframe dev preview routes. */
export function withMobilePreviewQuery(href: string): string {
  const [path, search = ""] = href.split("?");
  const params = new URLSearchParams(search);
  params.set(MOBILE_PREVIEW_SEARCH_PARAM, "1");
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function markMobilePreviewEmbedSession(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(MOBILE_PREVIEW_SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** True on the desktop preview shell (`/bank/mobile-preview`), not inside the iframe. */
export function isMobilePreviewShellPath(pathname: string): boolean {
  return (
    pathname === "/mobile-preview" ||
    pathname.startsWith("/bank/mobile-preview")
  );
}

/** True inside the Bank/Broker mobile preview iframe (query or iframe context). */
export function isMobilePreviewEmbed(): boolean {
  if (typeof window === "undefined") return false;

  try {
    if (
      new URLSearchParams(window.location.search).get(
        MOBILE_PREVIEW_SEARCH_PARAM
      ) === "1"
    ) {
      markMobilePreviewEmbedSession();
      return true;
    }
  } catch {
    /* ignore */
  }

  try {
    return (
      window.self !== window.top &&
      sessionStorage.getItem(MOBILE_PREVIEW_SESSION_KEY) === "1"
    );
  } catch {
    return false;
  }
}
