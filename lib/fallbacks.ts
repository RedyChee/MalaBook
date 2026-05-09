import fs from "fs";
import path from "path";
import type { AgentTraceStep, DatePlan } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

type BlurbCache = Record<string, string>;
type DatespotCache = Record<string, { restaurantId: string; reason: string }>;
type AgentCache = Record<string, { trace: AgentTraceStep[]; plan: DatePlan }>;

let blurbCache: BlurbCache | null = null;
let datespotCache: DatespotCache | null = null;
let agentCache: AgentCache | null = null;

function readJSON<T>(filename: string, fallback: T): T {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, filename), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function pairKey(aId: string, bId: string): string {
  return `${aId}::${bId}`;
}

export function cachedBlurb(aId: string, bId: string): string | null {
  if (!blurbCache) blurbCache = readJSON<BlurbCache>("fallback-blurbs.json", {});
  return blurbCache[pairKey(aId, bId)] ?? blurbCache[pairKey(bId, aId)] ?? null;
}

export function cachedDatespot(
  aId: string,
  bId: string,
): { restaurantId: string; reason: string } | null {
  if (!datespotCache) datespotCache = readJSON<DatespotCache>("fallback-datespots.json", {});
  return (
    datespotCache[pairKey(aId, bId)] ?? datespotCache[pairKey(bId, aId)] ?? null
  );
}

export function cachedAgentRun(
  aId: string,
  bId: string,
): { trace: AgentTraceStep[]; plan: DatePlan } | null {
  if (!agentCache) agentCache = readJSON<AgentCache>("fallback-agent-traces.json", {});
  return agentCache[pairKey(aId, bId)] ?? agentCache[pairKey(bId, aId)] ?? null;
}

export function genericAgentRun(restaurantName: string, neighborhood: string): {
  trace: AgentTraceStep[];
  plan: DatePlan;
} {
  return {
    trace: [
      {
        name: "get_restaurant_details",
        label: `Looking up ${restaurantName}`,
        summary: `${neighborhood} · ready for a first mala date`,
      },
    ],
    plan: {
      headline: `Your Date at ${restaurantName}, ${neighborhood}`,
      timing: "Weeknight, 7pm — beat the dinner queue and grab a corner table.",
      order: "Split a yuanyang broth and order one dry pot to share — easy across spice tolerances.",
      conversationStarter:
        "What's the one mala ingredient you'd refuse to skip — and the one you'd never order?",
    },
  };
}

export const GENERIC_BLURB =
  "Two mala souls who'd happily share the same ladle — your spice levels rhyme and your favorite ingredients overlap on the parts that matter most.";

export const GENERIC_DATESPOT_REASONING =
  "A reliable, well-loved Singapore mala spot that fits both your styles — comfortable for a first date and forgiving across spice tolerances.";
