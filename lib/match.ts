import type { Match, User } from "./types";

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function isGenderMutualMatch(a: User, b: User): boolean {
  // Non-binary always passes the filter — keeps the demo inclusive without
  // forcing users to declare a stance toward enby people.
  const aWantsB =
    a.interestedIn === "everyone" ||
    b.gender === "nonbinary" ||
    (a.interestedIn === "women" && b.gender === "woman") ||
    (a.interestedIn === "men" && b.gender === "man");
  const bWantsA =
    b.interestedIn === "everyone" ||
    a.gender === "nonbinary" ||
    (b.interestedIn === "women" && a.gender === "woman") ||
    (b.interestedIn === "men" && a.gender === "man");
  return aWantsB && bWantsA;
}

export function findTopMatches(
  user: User,
  allUsers: User[],
  k = 3,
  opts: { genderFilter?: boolean } = {},
): Match[] {
  const pool = allUsers.filter((o) => {
    if (o.id === user.id) return false;
    if (opts.genderFilter && !isGenderMutualMatch(user, o)) return false;
    return true;
  });
  return pool
    .map((o) => ({ user: o, score: cosineSimilarity(user.flavorVector, o.flavorVector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
