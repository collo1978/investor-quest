/** Whether an active system prompt includes the everyday-life-first voice rules. */
export function systemPromptHasRelatableVoice(body: string): boolean {
  const b = body.toLowerCase();
  return (
    b.includes("everyday life") ||
    (b.includes("paragraph 1") && b.includes("analogy")) ||
    b.includes("opening rule")
  );
}

export function promptPayloadPreview(body: string, maxLen = 480): string {
  const trimmed = body.replace(/\s+/g, " ").trim();
  return trimmed.length <= maxLen ? trimmed : `${trimmed.slice(0, maxLen)}…`;
}
