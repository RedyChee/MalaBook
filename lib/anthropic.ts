import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");
    client = new Anthropic({ apiKey });
  }
  return client;
}

export const HAIKU_MODEL = "claude-haiku-4-5-20251001";
export const SONNET_MODEL = "claude-sonnet-4-5";

export function extractText(resp: Anthropic.Message): string {
  return resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}
