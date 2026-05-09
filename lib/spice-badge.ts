import type { SpiceLevel } from "./types";

const BADGES: Record<SpiceLevel, { title: string; sub: string }> = {
  1: { title: "Mild Soul", sub: "Gentle dipper" },
  2: { title: "Sweet Heat", sub: "Light tingle" },
  3: { title: "3-Chili Warrior", sub: "Holds the line" },
  4: { title: "Numbing Daredevil", sub: "Loves a sweat" },
  5: { title: "Mala Mystic", sub: "Lives in the burn" },
};

export function spiceBadge(level: SpiceLevel) {
  return BADGES[level];
}

export function sharedIngredients(a: string[], b: string[], max = 2): string[] {
  const setB = new Set(b.map((x) => x.toLowerCase()));
  return a.filter((x) => setB.has(x.toLowerCase())).slice(0, max);
}
