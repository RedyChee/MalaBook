import { NextResponse } from "next/server";
import { extractText, getAnthropic, HAIKU_MODEL } from "@/lib/anthropic";
import type { Restaurant, User } from "@/lib/types";

export const runtime = "nodejs";

type Body = {
  me: User;
  matched: User;
  restaurant: Pick<Restaurant, "id" | "name" | "nameZh" | "neighborhood">;
  when: string;
};

type Reply = { reaction: string; accept: string };

const SYSTEM =
  "You are roleplaying as a Singaporean mala-lover replying to a date suggestion in a dating app chat. " +
  "Output STRICT JSON only, no markdown fence: " +
  '{"reaction": "<5-12 words, first instinct, can be playful or hesitant>", ' +
  '"accept": "<10-20 words, enthusiastic confirm referencing the time AND something specific to your taste>"} ' +
  "Use at most 2 emojis total across both lines. No quotes inside the strings. Sound like a real person texting, not a brand.";

function userPrompt(me: User, matched: User, r: Body["restaurant"], when: string): string {
  return (
    `You ARE ${matched.name}, age ${matched.age}. Your taste: ${matched.flavorProfile.style} pot at level ${matched.flavorProfile.spiceLevel}, ` +
    `${matched.flavorProfile.brothPreference} broth, loves ${matched.flavorProfile.topIngredients.join(", ")}, ` +
    `vibe = ${matched.flavorProfile.vibe}. Bio hint: "${matched.bio}".\n\n` +
    `${me.name} just suggested: "${r.name} (${r.nameZh}) at ${r.neighborhood} — ${when}." \n\n` +
    `Reply as ${matched.name} would in a dating-app chat. Two parts: a reaction bubble first (gut response, can tease your flavor identity), ` +
    `then an accept bubble that explicitly references "${when}" and something specific you'd order or look forward to. ` +
    `Output JSON: {"reaction": "...", "accept": "..."}`
  );
}

function tryParseJSON(text: string): Reply | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const obj = JSON.parse(match[0]);
    if (typeof obj?.reaction === "string" && typeof obj?.accept === "string") {
      return { reaction: obj.reaction.trim(), accept: obj.accept.trim() };
    }
    return null;
  } catch {
    return null;
  }
}

function genericReply(matched: User, when: string): Reply {
  return {
    reaction: `Oh wow ${matched.flavorProfile.spiceLevel >= 4 ? "yes — bring the burn" : "I'm in"} 🌶️`,
    accept: `${when} works — already thinking about the ${matched.flavorProfile.topIngredients[0] ?? "lotus root"}. See you there.`,
  };
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { me, matched, restaurant, when } = body ?? {};
  if (!me?.id || !matched?.id || !restaurant?.id || !when) {
    return NextResponse.json(
      { error: "Body must include { me, matched, restaurant, when }" },
      { status: 400 },
    );
  }

  try {
    const resp = await getAnthropic().messages.create({
      model: HAIKU_MODEL,
      max_tokens: 180,
      system: SYSTEM,
      messages: [{ role: "user", content: userPrompt(me, matched, restaurant, when) }],
    });
    const text = extractText(resp);
    const parsed = tryParseJSON(text);
    if (!parsed) throw new Error("Model output was not parseable JSON");
    return NextResponse.json({ ...parsed, source: "live" });
  } catch (err) {
    console.error("[/api/chat-reply] live call failed:", err);
    return NextResponse.json({ ...genericReply(matched, when), source: "generic" });
  }
}
