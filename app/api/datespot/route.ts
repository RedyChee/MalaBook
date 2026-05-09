import { NextResponse } from "next/server";
import { extractText, getAnthropic, HAIKU_MODEL } from "@/lib/anthropic";
import { DATESPOT_SYSTEM, datespotUserPrompt } from "@/lib/prompts";
import { cachedDatespot, GENERIC_DATESPOT_REASONING } from "@/lib/fallbacks";
import type { Restaurant, User } from "@/lib/types";
import restaurants from "@/data/restaurants.json";

export const runtime = "nodejs";

type Body = { userA: User; userB: User };

function compactRestaurants(): Pick<
  Restaurant,
  "id" | "name" | "neighborhood" | "style" | "spiceRange" | "signature" | "vibe" | "priceRange"
>[] {
  return (restaurants as Restaurant[]).map((r) => ({
    id: r.id,
    name: r.name,
    neighborhood: r.neighborhood,
    style: r.style,
    spiceRange: r.spiceRange,
    signature: r.signature,
    vibe: r.vibe,
    priceRange: r.priceRange,
  }));
}

function tryParseJSON(text: string): { restaurantId: string; reason: string } | null {
  // Tolerate ```json fences or stray text — extract first {...} block
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const obj = JSON.parse(match[0]);
    if (typeof obj?.restaurantId === "string" && typeof obj?.reason === "string") {
      return { restaurantId: obj.restaurantId, reason: obj.reason };
    }
    return null;
  } catch {
    return null;
  }
}

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

  const list = (restaurants as Restaurant[]);
  try {
    const resp = await getAnthropic().messages.create({
      model: HAIKU_MODEL,
      max_tokens: 220,
      system: DATESPOT_SYSTEM,
      messages: [
        { role: "user", content: datespotUserPrompt(userA, userB, compactRestaurants()) },
      ],
    });
    const text = extractText(resp);
    const parsed = tryParseJSON(text);
    if (!parsed) throw new Error("Model output was not parseable JSON");
    if (!list.some((r) => r.id === parsed.restaurantId)) {
      throw new Error(`Model picked unknown restaurantId: ${parsed.restaurantId}`);
    }
    return NextResponse.json({ ...parsed, source: "live" });
  } catch (err) {
    console.error("[/api/datespot] live call failed:", err);
    const cached = cachedDatespot(userA.id, userB.id);
    if (cached) {
      return NextResponse.json({ ...cached, source: "cache" });
    }
    // Generic fallback: pick the first "both" restaurant or the first one overall
    const generic = list.find((r) => r.style === "both") ?? list[0];
    return NextResponse.json({
      restaurantId: generic.id,
      reason: GENERIC_DATESPOT_REASONING,
      source: "generic",
    });
  }
}
