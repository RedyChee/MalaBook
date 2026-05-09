/**
 * Pre-generates fallback agent traces for the demo path.
 *
 * Demo path: Wei Lin (u_001) × her top 3 matches.
 * Each call hits /api/datespot to get a restaurantId, then /api/plan-date for the trace.
 * Both pairKey directions are cached.
 *
 * Usage: npm run pregen:agent
 *   - Requires the dev server running on http://localhost:3000.
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import users from "../data/users.json";
import { findTopMatches } from "../lib/match";
import type { AgentTraceStep, DatePlan, User } from "../lib/types";

const BASE = process.env.MALABOOK_BASE_URL ?? "http://localhost:3000";
const SAMPLE_USER_ID = "u_001";
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

type AgentResp = {
  trace: AgentTraceStep[];
  plan: DatePlan;
  source: "live" | "cache" | "generic";
};

async function main() {
  const cache: Record<string, { trace: AgentTraceStep[]; plan: DatePlan }> = {};

  for (const other of matches) {
    console.log(`\n--- ${me.name} <-> ${other.name} ---`);

    const ds = await postJSON<{ restaurantId: string; source: string }>(
      `${BASE}/api/datespot`,
      { userA: me, userB: other },
    );
    console.log(`[datespot:${ds.source}] -> ${ds.restaurantId}`);

    const agent = await postJSON<AgentResp>(`${BASE}/api/plan-date`, {
      userA: me,
      userB: other,
      restaurantId: ds.restaurantId,
    });
    console.log(`[plan-date:${agent.source}] ${agent.trace.length} steps`);
    console.log(`  headline: ${agent.plan.headline}`);

    if (agent.source !== "live") {
      console.warn(
        `  WARNING: pregen got source=${agent.source}, expected "live". Cache may be stale.`,
      );
    }

    const entry = { trace: agent.trace, plan: agent.plan };
    cache[pairKey(me.id, other.id)] = entry;
    cache[pairKey(other.id, me.id)] = entry;
  }

  const dataDir = path.join(process.cwd(), "data");
  fs.writeFileSync(
    path.join(dataDir, "fallback-agent-traces.json"),
    JSON.stringify(cache, null, 2) + "\n",
  );
  console.log(`\n[done] cached ${Object.keys(cache).length} agent runs.`);
}

main().catch((err) => {
  console.error("[pregen-agent-fail]", err);
  process.exit(1);
});
