/**
 * Pre-generates fallback blurbs and date-spot picks for the demo path.
 *
 * Demo path: Wei Lin (u_001) × her top 3 matches (Zhi Hao, Aiden Goh, Daniel Koh).
 * Both directions are cached so the lookup hits regardless of pair ordering.
 *
 * Usage: npm run pregen
 *   - Requires the dev server running on http://localhost:3000.
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import users from "../data/users.json";
import { findTopMatches } from "../lib/match";
import type { User } from "../lib/types";

const BASE = process.env.MALABOOK_BASE_URL ?? "http://localhost:3000";
const SAMPLE_USER_ID = "u_001"; // Wei Lin
const TOP_K = 3;

const all = users as User[];
const sampleUser = all.find((u) => u.id === SAMPLE_USER_ID);
if (!sampleUser) throw new Error(`Sample user ${SAMPLE_USER_ID} not found`);
const me: User = sampleUser;

const matches = findTopMatches(me, all, TOP_K).map((m) => m.user);

const pairKey = (a: string, b: string) => `${a}::${b}`;

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${url} -> ${r.status}: ${await r.text()}`);
  return (await r.json()) as T;
}

async function main() {
  const blurbCache: Record<string, string> = {};
  const datespotCache: Record<string, { restaurantId: string; reason: string }> = {};

  for (const other of matches) {
    console.log(`\n--- ${me.name} <-> ${other.name} ---`);

    const blurbResp = await postJSON<{ blurb: string; source: string }>(
      `${BASE}/api/blurb`,
      { userA: me, userB: other },
    );
    console.log(`[blurb:${blurbResp.source}] ${blurbResp.blurb}`);
    blurbCache[pairKey(me.id, other.id)] = blurbResp.blurb;
    blurbCache[pairKey(other.id, me.id)] = blurbResp.blurb;

    const dsResp = await postJSON<{
      restaurantId: string;
      reason: string;
      source: string;
    }>(`${BASE}/api/datespot`, { userA: me, userB: other });
    console.log(`[datespot:${dsResp.source}] -> ${dsResp.restaurantId}`);
    console.log(`  reason: ${dsResp.reason}`);
    const entry = { restaurantId: dsResp.restaurantId, reason: dsResp.reason };
    datespotCache[pairKey(me.id, other.id)] = entry;
    datespotCache[pairKey(other.id, me.id)] = entry;
  }

  const dataDir = path.join(process.cwd(), "data");
  fs.writeFileSync(
    path.join(dataDir, "fallback-blurbs.json"),
    JSON.stringify(blurbCache, null, 2) + "\n",
  );
  fs.writeFileSync(
    path.join(dataDir, "fallback-datespots.json"),
    JSON.stringify(datespotCache, null, 2) + "\n",
  );

  console.log(
    `\n[done] cached ${Object.keys(blurbCache).length} blurbs and ${Object.keys(datespotCache).length} datespots.`,
  );
}

main().catch((err) => {
  console.error("[pregen-fail]", err);
  process.exit(1);
});
