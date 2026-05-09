import users from "../data/users.json";
import restaurants from "../data/restaurants.json";
import type { User, Restaurant } from "../lib/types";

const BASE = process.env.BASE_URL ?? "https://malabook.vercel.app";
const all = users as User[];
const restMap = new Map((restaurants as Restaurant[]).map(r => [r.id, r]));
const me = all.find(u => u.id === "u_001")!;
const targetIds = ["u_005", "u_009", "u_007"];

async function smokeBlurb() {
  console.log("--- /api/blurb ---");
  for (const id of targetIds) {
    const them = all.find(u => u.id === id)!;
    const t0 = Date.now();
    const res = await fetch(`${BASE}/api/blurb`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userA: me, userB: them }),
    });
    const dt = Date.now() - t0;
    const json = await res.json() as { blurb: string; source: string };
    console.log(`  ${id} ${them.name.padEnd(12)} ${res.status} src=${json.source} ${dt}ms`);
    console.log(`    "${json.blurb}"`);
  }
}

async function smokeDatespot() {
  console.log("--- /api/datespot ---");
  for (const id of targetIds) {
    const them = all.find(u => u.id === id)!;
    const t0 = Date.now();
    const res = await fetch(`${BASE}/api/datespot`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userA: me, userB: them }),
    });
    const dt = Date.now() - t0;
    const json = await res.json() as { restaurantId: string; reason: string; source: string };
    const r = restMap.get(json.restaurantId);
    const ok = r ? "OK" : "INVALID";
    console.log(`  ${id} ${them.name.padEnd(12)} ${res.status} src=${json.source} ${dt}ms → ${json.restaurantId} (${r?.name ?? "??"}) [${ok}]`);
    console.log(`    "${json.reason}"`);
  }
}

(async () => {
  await smokeBlurb();
  await smokeDatespot();
})();
