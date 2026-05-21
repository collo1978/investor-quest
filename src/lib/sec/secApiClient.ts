import { requireSecApiKey } from "@/lib/sec/env";

const SEC_API_ORIGIN = "https://api.sec-api.io";

export class SecApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "SecApiRequestError";
    this.status = status;
  }
}

function authHeaders(): HeadersInit {
  return {
    Authorization: requireSecApiKey(),
    Accept: "application/json"
  };
}

async function parseErrorBody(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string; error?: string };
    return body.message ?? body.error ?? res.statusText;
  } catch {
    return res.statusText;
  }
}

/** GET request to SEC-API.io (Mapping API and similar). */
export async function secApiGet<T>(path: string): Promise<T> {
  const url = `${SEC_API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: "GET",
    headers: authHeaders(),
    cache: "no-store"
  });

  if (!res.ok) {
    throw new SecApiRequestError(
      `SEC-API.io GET ${path} failed: ${await parseErrorBody(res)}`,
      res.status
    );
  }

  return (await res.json()) as T;
}

/** POST request to SEC-API.io Query API. */
export async function secApiPost<T>(body: unknown): Promise<T> {
  const res = await fetch(SEC_API_ORIGIN, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  if (!res.ok) {
    throw new SecApiRequestError(
      `SEC-API.io query failed: ${await parseErrorBody(res)}`,
      res.status
    );
  }

  return (await res.json()) as T;
}
