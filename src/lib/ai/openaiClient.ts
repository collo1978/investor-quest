import { OpenAiConfigError, requireOpenAIKey } from "@/lib/ai/env";

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";

export class OpenAiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "OpenAiRequestError";
    this.status = status;
  }
}

export async function createChatCompletion(params: {
  system: string;
  user: string;
  model?: string;
  temperature?: number;
}): Promise<string> {
  const apiKey = requireOpenAIKey();

  const res = await fetch(OPENAI_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: params.model ?? "gpt-4o-mini",
      temperature: params.temperature ?? 0.25,
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user }
      ]
    }),
    cache: "no-store"
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = (await res.json()) as {
        error?: { message?: string };
      };
      detail = body.error?.message ?? detail;
    } catch {
      // ignore parse errors
    }
    throw new OpenAiRequestError(
      `OpenAI chat completion failed: ${detail}`,
      res.status
    );
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new OpenAiRequestError("OpenAI returned an empty completion.", 502);
  }

  return text;
}
