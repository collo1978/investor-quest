/**
 * Best-effort per-IP rate limiter for cost-incurring API routes.
 *
 * In-memory only — resets on cold start and isn't shared across serverless
 * instances, so it's not a hard guarantee. It's meant to blunt casual/scripted
 * abuse of paid AI/SEC-API endpoints (the "public-demo hardening" bar this
 * app needs), not to replace a real distributed rate limiter.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Returns true if the request should be allowed, false if rate-limited. */
export function checkRateLimit(
  request: Request,
  routeKey: string,
  limit = 10,
  windowMs = 60_000
): boolean {
  const key = `${routeKey}:${getClientKey(request)}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
