import type { FlavorProfile } from "./types";

const OFFAL_RX = /tripe|intestine|blood|gizzard|liver/i;

export type FlavorTitle = { title: string; sub: string };

export function deriveTitle(p: FlavorProfile): FlavorTitle {
  const offalCount = (p.topIngredients ?? []).filter((i) => OFFAL_RX.test(i)).length;

  if (p.spiceLevel >= 4 && offalCount >= 2) {
    return { title: "Numbing Pilgrim", sub: "Goes deep for the burn" };
  }
  if (p.spiceLevel >= 4 && p.style === "dry") {
    return { title: "Sichuan Soulmate", sub: "Born for the dry pot" };
  }
  if (p.brothPreference === "split") {
    return { title: "Bridge Builder", sub: "Both sides of the pot" };
  }
  if (p.spiceLevel <= 2 && p.style === "soup") {
    return { title: "Soup Diplomat", sub: "Softer broths, deeper talks" };
  }
  if (p.vibe === "loud-group" && p.spiceLevel >= 3) {
    return { title: "Hotpot Conductor", sub: "Runs the table" };
  }
  if (p.vibe === "intimate-booth") {
    return { title: "Quiet Simmer", sub: "Slow burn, two seats" };
  }
  if (p.vibe === "casual") {
    return { title: "Hawker Soul", sub: "Plastic stools, real talk" };
  }
  return { title: "Mala Curious", sub: "Still finding your fire" };
}

export function autoBio(p: FlavorProfile, name: string): string {
  const t = deriveTitle(p);
  const top = (p.topIngredients ?? []).slice(0, 2).join(" + ") || "the whole table";
  return `${t.title} · ${name} runs on ${top}.`;
}
