import { NextResponse } from "next/server";
import { extractText, getAnthropic, HAIKU_MODEL } from "@/lib/anthropic";
import type { Restaurant, User } from "@/lib/types";
import restaurants from "@/data/restaurants.json";

export const runtime = "nodejs";

type Body = { me: User; members: User[] };

const SYSTEM =
  "You are a Singapore mala expert helping plan a 4-person hotpot dinner. Pick ONE restaurant from the list " +
  "that handles groups well — prefer venues that serve split/yuanyang broths, ample seating, " +
  "and a wide signature menu so different palates can co-exist. Justify in 2 sentences referencing " +
  "the diversity (or alignment) of the diners. " +
  'Output strict JSON only, no markdown fence: {"restaurantId": "<id>", "reason": "<2 sentences>"}';

function profile(u: User) {
  return {
    name: u.name,
    style: u.flavorProfile.style,
    spiceLevel: u.flavorProfile.spiceLevel,
    topIngredients: u.flavorProfile.topIngredients,
    brothPreference: u.flavorProfile.brothPreference,
    vibe: u.flavorProfile.vibe,
  };
}

function compactRestaurants() {
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
  const { me, members } = body ?? {};
  if (!me?.id || !Array.isArray(members) || members.length < 1) {
    return NextResponse.json(
      { error: "Body must include { me, members[] }" },
      { status: 400 },
    );
  }

  const list = restaurants as Restaurant[];
  const userPrompt =
    `Diners (${members.length + 1} total):\n` +
    JSON.stringify([profile(me), ...members.map(profile)], null, 2) +
    `\n\nRestaurants:\n${JSON.stringify(compactRestaurants(), null, 2)}\n\n` +
    `Pick the best group spot and explain in 2 sentences. Output strict JSON: {"restaurantId": "...", "reason": "..."}`;

  try {
    const resp = await getAnthropic().messages.create({
      model: HAIKU_MODEL,
      max_tokens: 240,
      system: SYSTEM,
      messages: [{ role: "user", content: userPrompt }],
    });
    const text = extractText(resp);
    const parsed = tryParseJSON(text);
    if (!parsed) throw new Error("Model output was not parseable JSON");
    if (!list.some((r) => r.id === parsed.restaurantId)) {
      throw new Error(`Model picked unknown restaurantId: ${parsed.restaurantId}`);
    }
    return NextResponse.json({ ...parsed, source: "live" });
  } catch (err) {
    console.error("[/api/group-datespot] live call failed:", err);
    // Generic fallback — pick a "both" style or first
    const generic = list.find((r) => r.style === "both") ?? list[0];
    return NextResponse.json({
      restaurantId: generic.id,
      reason:
        "A group-friendly spot with split-pot options so everyone gets their broth — perfect for a 4-person table.",
      source: "generic",
    });
  }
}
