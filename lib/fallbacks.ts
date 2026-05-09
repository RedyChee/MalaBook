import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

type BlurbCache = Record<string, string>;
type DatespotCache = Record<string, { restaurantId: string; reason: string }>;

let blurbCache: BlurbCache | null = null;
let datespotCache: DatespotCache | null = null;

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

export const GENERIC_BLURB =
  "Two mala souls who'd happily share the same ladle — your spice levels rhyme and your favorite ingredients overlap on the parts that matter most.";

export const GENERIC_DATESPOT_REASONING =
  "A reliable, well-loved Singapore mala spot that fits both your styles — comfortable for a first date and forgiving across spice tolerances.";
