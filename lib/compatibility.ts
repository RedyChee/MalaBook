import type { BrothPreference, DiningVibe, FlavorProfile, FlavorStyle } from "./types";

// ---------- Self bars: a single user's flavor signature, 5 axes ----------

export type SelfBar = {
  key: "numbing" | "broth" | "adventurous" | "communal" | "intensity";
  label: string;
  score: number; // 0..1
  caption: string;
};

const OFFAL_RX = /tripe|intestine|blood|gizzard|liver/i;
const BOLD_RX = /tripe|intestine|blood|gizzard|liver|squid|sotong|prawn|fish slices/i;

const BROTH_BIAS: Record<BrothPreference, number> = {
  mala: 0.95,
  split: 0.6,
  mushroom: 0.25,
  tomato: 0.15,
};

const COMMUNAL_BIAS: Record<DiningVibe, number> = {
  "loud-group": 1.0,
  casual: 0.55,
  "intimate-booth": 0.15,
};

export function selfFlavorBars(p: FlavorProfile): SelfBar[] {
  const ings = p.topIngredients ?? [];
  const offal = ings.filter((i) => OFFAL_RX.test(i)).length;
  const bold = ings.filter((i) => BOLD_RX.test(i)).length;

  const numbing = p.spiceLevel / 5;
  const broth = BROTH_BIAS[p.brothPreference];
  const adventurous = Math.min(1, bold / 4 + offal * 0.1);
  const communal = COMMUNAL_BIAS[p.vibe];
  const intensity = Math.min(1, numbing * 0.5 + broth * 0.3 + adventurous * 0.2);

  return [
    {
      key: "numbing",
      label: "Numbing tolerance",
      score: numbing,
      caption: numbing >= 0.8 ? "Lives in the burn" : numbing >= 0.5 ? "Holds the line" : "Gentle dipper",
    },
    {
      key: "broth",
      label: "Broth bias",
      score: broth,
      caption:
        p.brothPreference === "mala" ? "Mala-bound, no debate" :
        p.brothPreference === "split" ? "Yuanyang diplomat" :
        p.brothPreference === "tomato" ? "Sweet & tangy soul" :
        "Earthy mushroom mood",
    },
    {
      key: "adventurous",
      label: "Adventurousness",
      score: adventurous,
      caption: adventurous >= 0.6 ? "Orders the bold stuff" : adventurous >= 0.3 ? "Tries new bites" : "Plays it safe",
    },
    {
      key: "communal",
      label: "Communal energy",
      score: communal,
      caption:
        p.vibe === "loud-group" ? "Loud table conductor" :
        p.vibe === "casual" ? "Plastic stools, real talk" :
        "Two-top whisperer",
    },
    {
      key: "intensity",
      label: "Overall intensity",
      score: intensity,
      caption: intensity >= 0.7 ? "Full-send mala" : intensity >= 0.4 ? "Balanced burn" : "Slow simmer",
    },
  ];
}

// ---------- Pairwise breakdown: two users, 5 axes of compatibility ----------

export type CompatAxis = {
  key: "numbingSync" | "broth" | "style" | "ingredients" | "vibe";
  label: string;
  score: number; // 0..1
  caption: string;
  shared?: string[];
};

export type CompatBreakdown = {
  axes: CompatAxis[];
  strongest: CompatAxis;
  weakest: CompatAxis;
};

const STYLE_AFFINITY: Record<FlavorStyle, Record<FlavorStyle, number>> = {
  dry: { dry: 1, soup: 0.2, both: 0.6 },
  soup: { dry: 0.2, soup: 1, both: 0.6 },
  both: { dry: 0.6, soup: 0.6, both: 1 },
};

const BROTH_AFFINITY: Record<BrothPreference, Record<BrothPreference, number>> = {
  mala: { mala: 1, split: 0.7, mushroom: 0.25, tomato: 0.15 },
  split: { mala: 0.7, split: 1, mushroom: 0.6, tomato: 0.6 },
  mushroom: { mala: 0.25, split: 0.6, mushroom: 1, tomato: 0.4 },
  tomato: { mala: 0.15, split: 0.6, mushroom: 0.4, tomato: 1 },
};

const VIBE_AFFINITY: Record<DiningVibe, Record<DiningVibe, number>> = {
  "loud-group": { "loud-group": 1, casual: 0.6, "intimate-booth": 0.25 },
  casual: { "loud-group": 0.6, casual: 1, "intimate-booth": 0.55 },
  "intimate-booth": { "loud-group": 0.25, casual: 0.55, "intimate-booth": 1 },
};

function sharedOf(a: string[], b: string[]): string[] {
  const setB = new Set(b.map((x) => x.toLowerCase()));
  return a.filter((x) => setB.has(x.toLowerCase()));
}

export function computeCompatibility(a: FlavorProfile, b: FlavorProfile): CompatBreakdown {
  // Numbing sync
  const spiceDelta = Math.abs(a.spiceLevel - b.spiceLevel);
  const numbingSync = 1 - spiceDelta / 4;
  const numbingCaption =
    spiceDelta === 0 ? `Both run at level ${a.spiceLevel} — lockstep` :
    spiceDelta === 1 ? "One chili apart — same lane" :
    spiceDelta === 2 ? "Different burns, same intent" :
    "You'll order separate pots — and that's fine";

  // Broth
  const brothScore = BROTH_AFFINITY[a.brothPreference][b.brothPreference];
  const brothCaption =
    a.brothPreference === b.brothPreference
      ? `Both swear by ${a.brothPreference}`
      : a.brothPreference === "split" || b.brothPreference === "split"
        ? "Yuanyang saves the day"
        : `${a.brothPreference} vs ${b.brothPreference} — opposites simmer`;

  // Style
  const styleScore = STYLE_AFFINITY[a.style][b.style];
  const styleCaption =
    a.style === b.style
      ? `Both go ${a.style} pot`
      : a.style === "both" || b.style === "both"
        ? "One of you bridges — easy table"
        : "Dry vs soup — split the order";

  // Ingredient overlap
  const shared = sharedOf(a.topIngredients ?? [], b.topIngredients ?? []);
  const minLen = Math.max(1, Math.min(a.topIngredients?.length ?? 1, b.topIngredients?.length ?? 1));
  const overlapScore = Math.min(1, shared.length / minLen);
  const ingCaption =
    shared.length >= 3 ? `Both love ${shared.slice(0, 3).join(", ")}` :
    shared.length >= 1 ? `Common ground: ${shared.join(", ")}` :
    "Different favorites, but mala bridges anything";

  // Vibe
  const vibeScore = VIBE_AFFINITY[a.vibe][b.vibe];
  const vibeCaption =
    a.vibe === b.vibe
      ? `Both want a ${a.vibe.replace("-", " ")} table`
      : "Different vibes — pick a place that flexes";

  const axes: CompatAxis[] = [
    { key: "numbingSync", label: "Numbing sync", score: numbingSync, caption: numbingCaption },
    { key: "broth", label: "Broth alignment", score: brothScore, caption: brothCaption },
    { key: "style", label: "Pot style", score: styleScore, caption: styleCaption },
    { key: "ingredients", label: "Ingredient overlap", score: overlapScore, caption: ingCaption, shared },
    { key: "vibe", label: "Vibe sync", score: vibeScore, caption: vibeCaption },
  ];

  let strongest = axes[0];
  let weakest = axes[0];
  for (const ax of axes) {
    if (ax.score > strongest.score) strongest = ax;
    if (ax.score < weakest.score) weakest = ax;
  }

  return { axes, strongest, weakest };
}

// Heat-styled gradient color for a 0..1 score. Cream → orange → red.
export function heatColor(score: number): string {
  if (score >= 0.8) return "var(--mala-red)";
  if (score >= 0.55) return "var(--mala-orange)";
  if (score >= 0.3) return "#F59E0B";
  return "var(--mala-charcoal)";
}
