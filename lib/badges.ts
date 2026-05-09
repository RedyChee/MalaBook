import type { FlavorProfile } from "./types";

export type BadgeTone = "fire" | "broth" | "leaf";

export type Badge = {
  id: string;
  label: string;
  emoji: string;
  tone: BadgeTone;
};

const SPICE_TIERS: Record<1 | 2 | 3 | 4 | 5, { label: string; emoji: string }> = {
  1: { label: "1-Chili Newcomer", emoji: "🌶️" },
  2: { label: "2-Chili Tinkerer", emoji: "🌶️" },
  3: { label: "3-Chili Warrior", emoji: "🔥" },
  4: { label: "4-Chili Veteran", emoji: "🔥" },
  5: { label: "5-Chili Inferno", emoji: "🌋" },
};

const POT_IDENTITY: Record<FlavorProfile["style"], { label: string; emoji: string }> = {
  dry: { label: "Dry-Pot Disciple", emoji: "🥘" },
  soup: { label: "Soup Sage", emoji: "🍲" },
  both: { label: "Bridge Builder", emoji: "🌉" },
};

const INGREDIENT_SIGS: Array<{
  match: RegExp;
  label: string;
  emoji: string;
}> = [
  { match: /lotus/i, label: "Lotus Root Loyalist", emoji: "🪷" },
  { match: /tripe/i, label: "Tripe Tycoon", emoji: "🐄" },
  { match: /enoki/i, label: "Enoki Enthusiast", emoji: "🍄" },
  { match: /tofu skin|yuba|beancurd/i, label: "Skin Connoisseur", emoji: "🧈" },
  { match: /quail egg/i, label: "Egg Aristocrat", emoji: "🥚" },
  { match: /vermicelli|noodle|glass noodle/i, label: "Noodle Whisperer", emoji: "🍜" },
  { match: /shrimp|prawn/i, label: "Crustacean Captain", emoji: "🦐" },
  { match: /beef/i, label: "Beef Devotee", emoji: "🥩" },
  { match: /pork/i, label: "Pork Patriot", emoji: "🥓" },
  { match: /lamb|mutton/i, label: "Lamb Loyalist", emoji: "🐑" },
  { match: /fish ball|fishball/i, label: "Fish-Ball Fanatic", emoji: "🎱" },
  { match: /squid|octopus/i, label: "Tentacle Tactician", emoji: "🦑" },
  { match: /mushroom|shiitake|king oyster/i, label: "Fungi Forager", emoji: "🍄" },
  { match: /cabbage|bok choy|spinach|leafy/i, label: "Leaf Liberator", emoji: "🥬" },
  { match: /potato/i, label: "Spud Sentinel", emoji: "🥔" },
  { match: /corn/i, label: "Corn Kernel", emoji: "🌽" },
];

export function deriveBadges(p: FlavorProfile): Badge[] {
  const out: Badge[] = [];

  const tier = SPICE_TIERS[p.spiceLevel];
  out.push({
    id: `tier-${p.spiceLevel}`,
    label: tier.label,
    emoji: tier.emoji,
    tone: "fire",
  });

  const pot = POT_IDENTITY[p.style];
  out.push({
    id: `pot-${p.style}`,
    label: pot.label,
    emoji: pot.emoji,
    tone: "broth",
  });

  const seen = new Set<string>();
  for (const ing of p.topIngredients ?? []) {
    if (out.length >= 4) break;
    const sig = INGREDIENT_SIGS.find((s) => s.match.test(ing));
    if (sig && !seen.has(sig.label)) {
      seen.add(sig.label);
      out.push({
        id: `sig-${sig.label.toLowerCase().replace(/\s+/g, "-")}`,
        label: sig.label,
        emoji: sig.emoji,
        tone: "leaf",
      });
    }
  }

  return out;
}

export const BADGE_TONE_CLASSES: Record<BadgeTone, string> = {
  fire: "bg-[var(--mala-red)]/10 text-[var(--mala-red)] border-[var(--mala-red)]/25",
  broth: "bg-[var(--mala-orange)]/10 text-[var(--mala-orange)] border-[var(--mala-orange)]/25",
  leaf: "bg-emerald-500/10 text-emerald-700 border-emerald-500/25",
};
