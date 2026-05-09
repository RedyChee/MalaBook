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

export function findTopMatches(user: User, allUsers: User[], k = 3): Match[] {
  return allUsers
    .filter((o) => o.id !== user.id)
    .map((o) => ({ user: o, score: cosineSimilarity(user.flavorVector, o.flavorVector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
