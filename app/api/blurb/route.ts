import { NextResponse } from "next/server";
import { extractText, getAnthropic, HAIKU_MODEL } from "@/lib/anthropic";
import { BLURB_SYSTEM, blurbUserPrompt } from "@/lib/prompts";
import { cachedBlurb, GENERIC_BLURB } from "@/lib/fallbacks";
import type { User } from "@/lib/types";

export const runtime = "nodejs";

type Body = { userA: User; userB: User };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { userA, userB } = body ?? {};
  if (!userA?.id || !userB?.id) {
    return NextResponse.json(
      { error: "Body must include { userA, userB } with full user objects" },
      { status: 400 },
    );
  }

  try {
    const resp = await getAnthropic().messages.create({
      model: HAIKU_MODEL,
      max_tokens: 80,
      system: BLURB_SYSTEM,
      messages: [{ role: "user", content: blurbUserPrompt(userA, userB) }],
    });
    const blurb = extractText(resp);
    if (!blurb) throw new Error("Empty response from model");
    return NextResponse.json({ blurb, source: "live" });
  } catch (err) {
    console.error("[/api/blurb] live call failed:", err);
    const cached = cachedBlurb(userA.id, userB.id);
    return NextResponse.json({
      blurb: cached ?? GENERIC_BLURB,
      source: cached ? "cache" : "generic",
    });
  }
}
