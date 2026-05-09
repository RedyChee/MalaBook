import { NextResponse } from "next/server";
import { extractText, getAnthropic, HAIKU_MODEL } from "@/lib/anthropic";
import type { Restaurant, User } from "@/lib/types";

export const runtime = "nodejs";

type Body = {
  me: User;
  members: User[];
  restaurant: Pick<Restaurant, "id" | "name" | "nameZh" | "neighborhood">;
  when: string;
};

type GroupReply = { userId: string; reaction: string; accept: string };

const SYSTEM =
  "You are roleplaying multiple Singaporean mala-lovers replying in a group dating-app chat. " +
  "Each person replies in two short bubbles: a reaction (5-12 words, gut response) and an accept " +
  "(10-20 words, enthusiastic confirm referencing the time AND something specific to their taste). " +
  "Voices must sound DIFFERENT — each person has their own flavor identity. Use at most 1 emoji per person. " +
  "No quotes inside the strings. Sound like real people texting, not a brand. " +
  'Output strict JSON only, no markdown fence: {"replies": [{"userId": "...", "reaction": "...", "accept": "..."}, ...]}';

function profile(u: User) {
  return {
    id: u.id,
    name: u.name,
    style: u.flavorProfile.style,
    spiceLevel: u.flavorProfile.spiceLevel,
    topIngredients: u.flavorProfile.topIngredients,
    brothPreference: u.flavorProfile.brothPreference,
    vibe: u.flavorProfile.vibe,
    bio: u.bio,
  };
}

function tryParseJSON(text: string): GroupReply[] | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const obj = JSON.parse(match[0]);
    if (Array.isArray(obj?.replies)) {
      const valid: GroupReply[] = [];
      for (const r of obj.replies) {
        if (
          typeof r?.userId === "string" &&
          typeof r?.reaction === "string" &&
          typeof r?.accept === "string"
        ) {
          valid.push({ userId: r.userId, reaction: r.reaction.trim(), accept: r.accept.trim() });
        }
      }
      return valid.length > 0 ? valid : null;
    }
    return null;
  } catch {
    return null;
  }
}

function genericReplies(members: User[], when: string): GroupReply[] {
  return members.map((m) => ({
    userId: m.id,
    reaction:
      m.flavorProfile.spiceLevel >= 4
        ? "Group hotpot? Bring the burn 🔥"
        : "A 4-person pot, I'm in",
    accept: `${when} works — saving room for the ${m.flavorProfile.topIngredients[0] ?? "broth"}.`,
  }));
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { me, members, restaurant, when } = body ?? {};
  if (!me?.id || !Array.isArray(members) || members.length === 0 || !restaurant?.id || !when) {
    return NextResponse.json(
      { error: "Body must include { me, members[], restaurant, when }" },
      { status: 400 },
    );
  }

  const userPrompt =
    `${me.name} just suggested a 4-person hotpot in a group chat: ` +
    `"${restaurant.name} (${restaurant.nameZh}) at ${restaurant.neighborhood} — ${when}."\n\n` +
    `You are replying as EACH of these people, in turn:\n${JSON.stringify(members.map(profile), null, 2)}\n\n` +
    `For each person, output one reaction bubble + one accept bubble. The accept MUST reference "${when}" ` +
    `and something specific to that person's taste (an ingredient they love, their broth pref, or their style). ` +
    `Output strict JSON: {"replies": [{"userId":"<id>","reaction":"...","accept":"..."}, ...]}\n` +
    `Make sure every userId in your output matches one of: ${members.map((m) => m.id).join(", ")}`;

  try {
    const resp = await getAnthropic().messages.create({
      model: HAIKU_MODEL,
      max_tokens: 600,
      system: SYSTEM,
      messages: [{ role: "user", content: userPrompt }],
    });
    const text = extractText(resp);
    const parsed = tryParseJSON(text);
    if (!parsed) throw new Error("Model output was not parseable JSON");

    // Ensure every requested member has a reply; fill gaps with generic
    const byId = new Map(parsed.map((r) => [r.userId, r]));
    const replies: GroupReply[] = members.map(
      (m) => byId.get(m.id) ?? genericReplies([m], when)[0],
    );
    return NextResponse.json({ replies, source: "live" });
  } catch (err) {
    console.error("[/api/group-chat-reply] live call failed:", err);
    return NextResponse.json({ replies: genericReplies(members, when), source: "generic" });
  }
}
