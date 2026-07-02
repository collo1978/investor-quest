/** Session flag — map zoom finished; business hub should play arrival UI. */
export const SCHOOLS_BUSINESS_ISLAND_ZOOM_ENTER_KEY =
  "iq-schools-business-island-zoom-enter";

/** While true, story orchestrator must not bounce the learner back to the map mid-handoff. */
export const SCHOOLS_BUSINESS_ISLAND_ZOOM_IN_PROGRESS_KEY =
  "iq-schools-business-island-zoom-in-progress";

/** @deprecated Camera scale is computed at runtime — see {@link computeProdigyBusinessIslandCamera}. */
export const PRODIGY_BUSINESS_ISLAND_CAMERA_ZOOM_SCALE = 3.08;

/** @deprecated Use {@link PRODIGY_BUSINESS_ISLAND_CAMERA_ZOOM_SCALE} — kept for legacy refs. */
export const PRODIGY_BUSINESS_ISLAND_HUB_ZOOM_SCALE = PRODIGY_BUSINESS_ISLAND_CAMERA_ZOOM_SCALE;

/** @deprecated Intermediate approach removed — single camera zoom only. */
export const PRODIGY_BUSINESS_ISLAND_APPROACH_ZOOM_SCALE = 1;

export const SCHOOLS_BUSINESS_ISLAND_ZOOM_MS = 820;

/** HQ entrance zoom before quest navigation (map camera hub). */
export const SCHOOLS_BUSINESS_HQ_ZOOM_MS = 780;

/** Hold on entrance glow after camera settles, before route change. */
export const SCHOOLS_BUSINESS_HQ_ENTER_HOLD_MS = 360;

/** Hub: island level visible first, then gameplay UI fades in. */
export const SCHOOLS_BUSINESS_ISLAND_UI_SETTLE_MS = 840;

/** Hub preview → full island level after learner taps ENTER. */
export const SCHOOLS_BUSINESS_ISLAND_ENTER_MS = 880;

/** Set when learner taps ENTER — survives remounts mid-transition. */
export const SCHOOLS_BUSINESS_ISLAND_HUB_ENTERED_KEY =
  "iq-schools-business-island-hub-entered";

/** Hold at approach zoom while ocean crossfade peaks, then route handoff. */
export const SCHOOLS_BUSINESS_ISLAND_HANDOFF_MS = 260;

export function markSchoolsBusinessIslandZoomInProgress(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(SCHOOLS_BUSINESS_ISLAND_ZOOM_IN_PROGRESS_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function clearSchoolsBusinessIslandZoomInProgress(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(SCHOOLS_BUSINESS_ISLAND_ZOOM_IN_PROGRESS_KEY);
  } catch {
    /* ignore */
  }
}

export function isSchoolsBusinessIslandZoomInProgress(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return (
      sessionStorage.getItem(SCHOOLS_BUSINESS_ISLAND_ZOOM_IN_PROGRESS_KEY) === "1"
    );
  } catch {
    return false;
  }
}

export function markSchoolsBusinessIslandZoomEnter(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(SCHOOLS_BUSINESS_ISLAND_ZOOM_ENTER_KEY, "1");
    sessionStorage.removeItem(SCHOOLS_BUSINESS_ISLAND_ZOOM_IN_PROGRESS_KEY);
  } catch {
    /* ignore */
  }
}

/** Read without clearing — safe for React Strict Mode effect re-runs. */
export function peekSchoolsBusinessIslandZoomEnter(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(SCHOOLS_BUSINESS_ISLAND_ZOOM_ENTER_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearSchoolsBusinessIslandZoomEnter(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(SCHOOLS_BUSINESS_ISLAND_ZOOM_ENTER_KEY);
  } catch {
    /* ignore */
  }
}

export function consumeSchoolsBusinessIslandZoomEnter(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    const hit = sessionStorage.getItem(SCHOOLS_BUSINESS_ISLAND_ZOOM_ENTER_KEY) === "1";
    if (hit) sessionStorage.removeItem(SCHOOLS_BUSINESS_ISLAND_ZOOM_ENTER_KEY);
    return hit;
  } catch {
    return false;
  }
}

export function markSchoolsBusinessIslandHubEntered(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(SCHOOLS_BUSINESS_ISLAND_HUB_ENTERED_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function hasSchoolsBusinessIslandHubEntered(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(SCHOOLS_BUSINESS_ISLAND_HUB_ENTERED_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearSchoolsBusinessIslandHubEntered(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(SCHOOLS_BUSINESS_ISLAND_HUB_ENTERED_KEY);
  } catch {
    /* ignore */
  }
}
