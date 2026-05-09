import users from "../data/users.json";
import { findTopMatches } from "../lib/match";
import type { User } from "../lib/types";

const all = users as User[];
const meId = process.argv[2] ?? "u_001";
const me = all.find(u => u.id === meId);
if (!me) {
  console.error(`User ${meId} not found`);
  process.exit(1);
}
console.log(`Top 3 for ${me.name} (${me.id}):`);
for (const m of findTopMatches(me, all, 3)) {
  console.log(`  ${m.user.id}\t${m.user.name.padEnd(14)}\t${(m.score*100).toFixed(1)}%`);
}
