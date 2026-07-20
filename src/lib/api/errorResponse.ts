import { NextResponse } from "next/server";

/**
 * Logs the full error server-side and returns a generic, client-safe message.
 * Use this instead of forwarding `err.message` from Supabase/OpenAI/third-party
 * SDKs directly to the client — those messages can include internal details
 * (table/column names, upstream provider errors, stack fragments).
 */
export function apiErrorResponse(
  context: string,
  err: unknown,
  status = 500,
  publicMessage = "Something went wrong. Please try again."
): NextResponse {
  console.error(`[${context}]`, err);
  return NextResponse.json({ error: publicMessage }, { status });
}
