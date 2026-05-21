/** Server-only SEC-API.io credentials (never expose to the client). */

export class SecApiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecApiConfigError";
  }
}

export function isSecApiConfigured(): boolean {
  return Boolean(process.env.SEC_API_KEY?.trim());
}

export function requireSecApiKey(): string {
  const key = process.env.SEC_API_KEY?.trim();
  if (!key) {
    throw new SecApiConfigError(
      "SEC_API_KEY is not configured. Add it to .env.local for SEC-API.io access."
    );
  }
  return key;
}
