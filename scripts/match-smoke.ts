import users from "../data/users.json";
import { encodeProfile } from "../lib/flavor";
import { findTopMatches, cosineSimilarity } from "../lib/match";
import type { User } from "../lib/types";

const all = users as User[];

function fmtPct(x: number) {
  return (x * 100).toFixed(1) + "%";
}

console.log(`Loaded ${all.length} users\n`);

// Sanity 1: Re-encoding from flavorProfile matches the stored flavorVector
let mismatches = 0;
for (const u of all) {
  const recomputed = encodeProfile(u.flavorProfile);
  const stored = u.flavorVector;
  if (recomputed.length !== stored.length) {
    console.log(`[mismatch] ${u.id} ${u.name}: dim ${recomputed.length} vs ${stored.length}`);
    mismatches++;
    continue;
  }
  let maxDelta = 0;
  for (let i = 0; i < recomputed.length; i++) {
    maxDelta = Math.max(maxDelta, Math.abs(recomputed[i] - stored[i]));
  }
  if (maxDelta > 1e-3) {
    console.log(`[drift] ${u.id} ${u.name}: max-delta=${maxDelta.toFixed(3)}`);
    console.log(`  stored:     [${stored.map((v) => v.toFixed(2)).join(", ")}]`);
    console.log(`  recomputed: [${recomputed.map((v) => v.toFixed(2)).join(", ")}]`);
    mismatches++;
  }
}
console.log(`\n[encode-check] ${all.length - mismatches}/${all.length} stored vectors agree with re-encoded`);

// Sanity 2: Top matches for each user — eyeball the leaderboard
console.log("\n=== Top 3 matches per user ===");
for (const u of all) {
  const top = findTopMatches(u, all, 3);
  console.log(
    `\n${u.id} ${u.name} (${u.flavorProfile.style}, ${u.flavorProfile.spiceLevel}🌶️, ${u.flavorProfile.brothPreference} broth)`,
  );
  for (const m of top) {
    const fp = m.user.flavorProfile;
    console.log(
      `  ${fmtPct(m.score)}  ${m.user.name.padEnd(18)} (${fp.style}, ${fp.spiceLevel}🌶️, ${fp.brothPreference})`,
    );
  }
}

// Sanity 3: Identical profile self-similarity check
const selfSim = cosineSimilarity(all[0].flavorVector, all[0].flavorVector);
console.log(`\n[self-sim] ${all[0].name} vs self = ${selfSim.toFixed(4)} (expect 1.0000)`);
