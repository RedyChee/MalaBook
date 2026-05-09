import seed from "@/data/restaurant-ratings.json";

export type Rating = {
  spiceFit: number; // 1..5
  chemistry: number; // 1..5
  wouldMalaAgain: boolean;
};

export type RatingAgg = {
  spiceFitMean: number;
  chemistryMean: number;
  wouldMalaAgainPct: number;
  coupleCount: number;
};

const SEED = seed as Record<string, RatingAgg>;

const FEEDBACK_KEY = "malabook:feedback";
const BUMPS_KEY = "malabook:rating-bumps";

type FeedbackMap = Record<string, Rating>; // bookingId -> rating
type BumpsMap = Record<
  string,
  { spiceSum: number; chemistrySum: number; againCount: number; n: number }
>;

function isClient(): boolean {
  return typeof window !== "undefined";
}

function loadFeedback(): FeedbackMap {
  if (!isClient()) return {};
  try {
    const raw = sessionStorage.getItem(FEEDBACK_KEY);
    return raw ? (JSON.parse(raw) as FeedbackMap) : {};
  } catch {
    return {};
  }
}

function loadBumps(): BumpsMap {
  if (!isClient()) return {};
  try {
    const raw = sessionStorage.getItem(BUMPS_KEY);
    return raw ? (JSON.parse(raw) as BumpsMap) : {};
  } catch {
    return {};
  }
}

function fallbackAgg(): RatingAgg {
  return { spiceFitMean: 4.0, chemistryMean: 4.0, wouldMalaAgainPct: 75, coupleCount: 0 };
}

export function getRatings(restaurantId: string): RatingAgg {
  const base = SEED[restaurantId] ?? fallbackAgg();
  if (!isClient()) return base;
  const bumps = loadBumps()[restaurantId];
  if (!bumps || bumps.n === 0) return base;
  const totalN = base.coupleCount + bumps.n;
  const baseSpiceTotal = base.spiceFitMean * base.coupleCount + bumps.spiceSum;
  const baseChemTotal = base.chemistryMean * base.coupleCount + bumps.chemistrySum;
  const baseAgainCount =
    Math.round((base.wouldMalaAgainPct / 100) * base.coupleCount) + bumps.againCount;
  return {
    spiceFitMean: round1(baseSpiceTotal / totalN),
    chemistryMean: round1(baseChemTotal / totalN),
    wouldMalaAgainPct: Math.round((baseAgainCount / totalN) * 100),
    coupleCount: totalN,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function getFeedbackForBooking(bookingId: string): Rating | null {
  if (!isClient()) return null;
  const map = loadFeedback();
  return map[bookingId] ?? null;
}

export function submitFeedback(bookingId: string, restaurantId: string, r: Rating): void {
  if (!isClient()) return;
  const fb = loadFeedback();
  if (fb[bookingId]) return; // idempotent — never double-count
  fb[bookingId] = r;
  sessionStorage.setItem(FEEDBACK_KEY, JSON.stringify(fb));

  const bumps = loadBumps();
  const cur = bumps[restaurantId] ?? {
    spiceSum: 0,
    chemistrySum: 0,
    againCount: 0,
    n: 0,
  };
  cur.spiceSum += r.spiceFit;
  cur.chemistrySum += r.chemistry;
  cur.againCount += r.wouldMalaAgain ? 1 : 0;
  cur.n += 1;
  bumps[restaurantId] = cur;
  sessionStorage.setItem(BUMPS_KEY, JSON.stringify(bumps));
}
