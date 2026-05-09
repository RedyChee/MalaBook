import type Anthropic from "@anthropic-ai/sdk";
import restaurants from "@/data/restaurants.json";
import users from "@/data/users.json";
import { computeCompatibility } from "./compatibility";
import { sharedIngredients } from "./spice-badge";
import type { FlavorProfile, Restaurant, SpiceLevel, User } from "./types";

type ToolName =
  | "get_restaurant_details"
  | "get_match_compatibility"
  | "pick_signature_dish";

export type ToolStep = {
  name: ToolName;
  label: string;
  summary: string;
  args: Record<string, unknown>;
  result: unknown;
};

export const AGENT_TOOLS: Anthropic.Tool[] = [
  {
    name: "get_restaurant_details",
    description:
      "Look up the full record for a Singapore mala restaurant by id. Returns name, neighborhood, " +
      "style (dry/soup/both), spice range, signature dishes, vibe description, price range, and notes.",
    input_schema: {
      type: "object",
      properties: {
        restaurantId: {
          type: "string",
          description: "Restaurant id, e.g. 'r_001'",
        },
      },
      required: ["restaurantId"],
    },
  },
  {
    name: "get_match_compatibility",
    description:
      "Compute mala compatibility between two diners by user id. Returns shared ingredients, " +
      "spice delta, broth/style/vibe alignment, the strongest and weakest axis, and an overall score.",
    input_schema: {
      type: "object",
      properties: {
        userIdA: { type: "string" },
        userIdB: { type: "string" },
      },
      required: ["userIdA", "userIdB"],
    },
  },
  {
    name: "pick_signature_dish",
    description:
      "Pick exactly two dishes from a restaurant's signature list to recommend. Bias toward dishes " +
      "containing any of the shared ingredients between the two diners, and toward the diners' " +
      "tolerated spice level. Returns two dish names with a one-line reason for each.",
    input_schema: {
      type: "object",
      properties: {
        restaurantId: { type: "string" },
        sharedIngredients: {
          type: "array",
          items: { type: "string" },
          description: "Ingredients both diners love (may be empty).",
        },
        sharedSpiceLevel: {
          type: "integer",
          minimum: 1,
          maximum: 5,
          description: "The lower of the two diners' spice levels.",
        },
      },
      required: ["restaurantId", "sharedIngredients", "sharedSpiceLevel"],
    },
  },
];

const ALL_RESTAURANTS = restaurants as Restaurant[];
const ALL_USERS = users as User[];

function findRestaurant(id: string): Restaurant | null {
  return ALL_RESTAURANTS.find((r) => r.id === id) ?? null;
}

function findUser(id: string): User | null {
  return ALL_USERS.find((u) => u.id === id) ?? null;
}

type ToolContext = {
  // Allow the API route to inject the live "me" profile that doesn't live in users.json
  liveUsers?: User[];
};

function resolveUser(id: string, ctx: ToolContext): User | null {
  if (ctx.liveUsers) {
    const hit = ctx.liveUsers.find((u) => u.id === id);
    if (hit) return hit;
  }
  return findUser(id);
}

export function executeTool(
  name: string,
  rawArgs: unknown,
  ctx: ToolContext = {},
): { ok: true; step: ToolStep } | { ok: false; error: string } {
  const args = (rawArgs ?? {}) as Record<string, unknown>;

  if (name === "get_restaurant_details") {
    const restaurantId = String(args.restaurantId ?? "");
    const r = findRestaurant(restaurantId);
    if (!r) return { ok: false, error: `Unknown restaurantId: ${restaurantId}` };
    const result = {
      id: r.id,
      name: r.name,
      neighborhood: r.neighborhood,
      style: r.style,
      spiceRange: r.spiceRange,
      signature: r.signature,
      vibe: r.vibe,
      priceRange: r.priceRange,
      notes: r.notes ?? null,
    };
    return {
      ok: true,
      step: {
        name: "get_restaurant_details",
        label: `Looking up ${r.name}`,
        summary: `${r.neighborhood} · ${r.style}-style · spice ${r.spiceRange[0]}–${r.spiceRange[1]} · ${r.priceRange}`,
        args,
        result,
      },
    };
  }

  if (name === "get_match_compatibility") {
    const userIdA = String(args.userIdA ?? "");
    const userIdB = String(args.userIdB ?? "");
    const a = resolveUser(userIdA, ctx);
    const b = resolveUser(userIdB, ctx);
    if (!a || !b) {
      return {
        ok: false,
        error: `Unknown user id(s): ${!a ? userIdA : ""} ${!b ? userIdB : ""}`.trim(),
      };
    }
    const breakdown = computeCompatibility(a.flavorProfile, b.flavorProfile);
    const shared = sharedIngredients(
      a.flavorProfile.topIngredients ?? [],
      b.flavorProfile.topIngredients ?? [],
      4,
    );
    const score =
      breakdown.axes.reduce((acc, ax) => acc + ax.score, 0) / breakdown.axes.length;
    const spiceDelta = Math.abs(a.flavorProfile.spiceLevel - b.flavorProfile.spiceLevel);
    const sharedSpiceLevel = Math.min(
      a.flavorProfile.spiceLevel,
      b.flavorProfile.spiceLevel,
    ) as SpiceLevel;

    const result = {
      score: Math.round(score * 100) / 100,
      sharedIngredients: shared,
      spiceDelta,
      sharedSpiceLevel,
      strongest: { label: breakdown.strongest.label, caption: breakdown.strongest.caption },
      weakest: { label: breakdown.weakest.label, caption: breakdown.weakest.caption },
      brothA: a.flavorProfile.brothPreference,
      brothB: b.flavorProfile.brothPreference,
      styleA: a.flavorProfile.style,
      styleB: b.flavorProfile.style,
      vibeA: a.flavorProfile.vibe,
      vibeB: b.flavorProfile.vibe,
    };

    const sharedBit =
      shared.length > 0 ? `shared: ${shared.join(", ")}` : "no overlap, mala bridges anything";
    return {
      ok: true,
      step: {
        name: "get_match_compatibility",
        label: `Comparing ${a.name} × ${b.name}`,
        summary: `${Math.round(score * 100)}% sync · ${sharedBit} · spice Δ ${spiceDelta}`,
        args,
        result,
      },
    };
  }

  if (name === "pick_signature_dish") {
    const restaurantId = String(args.restaurantId ?? "");
    const r = findRestaurant(restaurantId);
    if (!r) return { ok: false, error: `Unknown restaurantId: ${restaurantId}` };

    const inputShared = Array.isArray(args.sharedIngredients)
      ? (args.sharedIngredients as unknown[]).map((x) => String(x).toLowerCase())
      : [];
    const tolerance = Number(args.sharedSpiceLevel ?? 3);

    // Score each signature dish by ingredient overlap; ties broken by stable order
    const scored = r.signature.map((dish, i) => {
      const lower = dish.toLowerCase();
      const overlap = inputShared.filter((ing) => lower.includes(ing)).length;
      return { dish, overlap, idx: i };
    });
    scored.sort((a, b) => b.overlap - a.overlap || a.idx - b.idx);
    const picks = scored.slice(0, 2).map((s) => s.dish);

    const matchedShared = inputShared.filter((ing) =>
      picks.some((p) => p.toLowerCase().includes(ing)),
    );

    const result = {
      restaurantId: r.id,
      restaurantName: r.name,
      picks,
      reasonHints: {
        sharedMatched: matchedShared,
        spiceFitNote:
          tolerance <= 2
            ? "stay on the milder end of this stall's range"
            : tolerance >= 4
              ? "lean into the numbing end"
              : "middle-of-the-range heat is comfortable",
      },
    };

    return {
      ok: true,
      step: {
        name: "pick_signature_dish",
        label: `Picking dishes at ${r.name}`,
        summary: `${picks.join(" + ")}${matchedShared.length ? ` · matches ${matchedShared.join(", ")}` : ""}`,
        args,
        result,
      },
    };
  }

  return { ok: false, error: `Unknown tool: ${name}` };
}

// Helper to ensure the input "me" + matched user are findable by id-resolving tools
export function buildToolContext(userA: User, userB: User): ToolContext {
  return { liveUsers: [userA, userB] };
}

export function userSummaryForPrompt(u: User): string {
  const f: FlavorProfile = u.flavorProfile;
  return (
    `${u.name} (${u.id}, age ${u.age}, ${u.gender}, into ${u.interestedIn}) — ` +
    `${f.style} style, spice ${f.spiceLevel}/5, ${f.brothPreference} broth, ${f.vibe} vibe, ` +
    `loves: ${(f.topIngredients ?? []).join(", ") || "n/a"}.`
  );
}
