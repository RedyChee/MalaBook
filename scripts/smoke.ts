import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set in .env.local");

  const client = new Anthropic({ apiKey });

  const t0 = Date.now();
  const resp = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 80,
    system:
      "You write playful 1-sentence dating compatibility blurbs based on Chinese mala food preferences. Tone: flirty, confident, food-poetic. Max 25 words.",
    messages: [
      {
        role: "user",
        content:
          "User A loves dry mala at level 5, favorites: beef tripe, pork intestine, lotus root. " +
          "User B loves dry at level 4, favorites: lotus root, duck blood, pork belly. " +
          "Why are they a flavor match?",
      },
    ],
  });
  const elapsed = Date.now() - t0;

  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  console.log(`[ok] model=${resp.model} latency=${elapsed}ms`);
  console.log(`[blurb] ${text.trim()}`);
  console.log(
    `[usage] input=${resp.usage.input_tokens} output=${resp.usage.output_tokens}`,
  );
}

main().catch((err) => {
  console.error("[smoke-fail]", err);
  process.exit(1);
});
