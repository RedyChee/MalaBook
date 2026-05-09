import type { User } from "./types";

export const BLURB_SYSTEM =
  "You write playful 1-sentence dating compatibility blurbs based on " +
  "Chinese mala (numbing-spicy) food preferences. Tone: flirty, confident, " +
  "food-poetic. Max 25 words. Output only the blurb itself — no preamble, " +
  "no quotes.";

export function blurbUserPrompt(a: User, b: User): string {
  const fa = a.flavorProfile;
  const fb = b.flavorProfile;
  return (
    `User A (${a.name}) loves ${fa.style} mala at level ${fa.spiceLevel}, ` +
    `favorites: ${fa.topIngredients.join(", ")}, ${fa.brothPreference} broth, ${fa.vibe} vibe.\n` +
    `User B (${b.name}) loves ${fb.style} at level ${fb.spiceLevel}, ` +
    `favorites: ${fb.topIngredients.join(", ")}, ${fb.brothPreference} broth, ${fb.vibe} vibe.\n` +
    `Why are they a flavor match?`
  );
}

export const DATESPOT_SYSTEM =
  "You are a Singapore mala expert. Given two diners' flavor profiles and a " +
  "list of restaurants, pick exactly ONE restaurant and justify in 2 sentences. " +
  'Output JSON only, no markdown fence: {"restaurantId": "<id>", "reason": "<2 sentences>"}';

export function datespotUserPrompt(a: User, b: User, restaurants: unknown[]): string {
  const profile = (u: User) => ({
    name: u.name,
    style: u.flavorProfile.style,
    spiceLevel: u.flavorProfile.spiceLevel,
    topIngredients: u.flavorProfile.topIngredients,
    brothPreference: u.flavorProfile.brothPreference,
    vibe: u.flavorProfile.vibe,
  });
  return (
    `Diners:\n${JSON.stringify([profile(a), profile(b)], null, 2)}\n\n` +
    `Restaurants:\n${JSON.stringify(restaurants, null, 2)}\n\n` +
    `Pick the best date spot and explain in 2 sentences. ` +
    `Output strict JSON: {"restaurantId": "...", "reason": "..."}`
  );
}
