export class OpenAiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAiConfigError";
  }
}

export function isOpenAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function requireOpenAIKey(): string {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new OpenAiConfigError(
      "OPENAI_API_KEY is not configured. Add it to .env.local for Financial Quest generation."
    );
  }
  return key;
}
