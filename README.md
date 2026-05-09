# 🌶️ MalaBook

> **Match by mala. Meet over málà.**

MalaBook is a flavor-first dating app that matches people by their Chinese spice preferences — dry stir-fry (干锅 / 麻辣香锅) vs numbing soup (麻辣烫 / 火锅), spice tolerance, and favourite ingredients (lotus root, beef tripe, enoki, tofu skin, …). Claude picks the perfect mala spot for the first date so couples skip the awkward *"where should we eat?"* conversation.

🔗 **Live demo:** https://malabook.vercel.app

Built in one day for the Singapore AI Engineer Hackathon (2026-05-09).

## Features

- **Flavor onboarding** — 7-question quiz (style, spice 1–5, top ingredients, broth, vibe) → 14-dim flavor vector
- **AI matching** — cosine similarity over 20 seed users + Claude-generated 1-line blurbs
- **Compatibility radar** — 5-axis breakdown (numbing sync · broth alignment · pot style · ingredient overlap · vibe sync)
- **Date-spot recommender** — Claude picks one of 20 SG mala restaurants and explains why
- **Date-planning agent** — Sonnet 4.6 tool-use loop drafts an opening line + agenda
- **Booking loop** — solo + group (4-person hotpot) chat threads with simulated replies
- **Post-date feedback** — spice fit / chemistry / would-mala-again ratings feed an aggregate strip
- **Shareable flavor card** — 1080×1080 PNG export via `html-to-image`
- **Derived badges** — spice tier, pot identity, ingredient signatures

## Quick start

```bash
# 1. Install
npm install

# 2. Set your Anthropic key
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local

# 3. Run dev
npm run dev
# → http://localhost:3000
```

Useful scripts:

| Script | Purpose |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` / `start` | Production build / serve |
| `npm run lint` / `typecheck` | ESLint / TypeScript checks |
| `npm run smoke` | One-shot Claude `/v1/messages` test |
| `npm run smoke:match` | Sanity-check the matching algorithm |
| `npm run pregen` | Regenerate `data/fallback-blurbs.json` + `data/fallback-datespots.json` |
| `npm run pregen:agent` | Regenerate `data/fallback-agent-traces.json` |

## Tech stack

Next.js 16 (App Router) · React 19 · Tailwind v4 · shadcn/ui · Anthropic Claude (Haiku 4.5 + Sonnet 4.6) · `html-to-image` · Vercel.

No database — `data/*.json` is the source of truth and `sessionStorage` holds the current user.

## Project structure

```
app/                Next.js routes (onboarding, matches, match/[id], profile, api/*)
components/         shadcn/ui + custom (compat-radar, flavor-card, agent-trace, …)
lib/                flavor.ts, match.ts, compatibility.ts, prompts.ts, agent-*.ts, …
data/               users.json, restaurants.json, restaurant-ratings.json, fallback-*.json
scripts/            smoke / match-smoke / pregen-fallbacks / pregen-agent-traces
public/avatars/     AI-generated user portraits
docs/               architecture, hackathon log, demo script, roadmap
design-assets/      moodboards & raw design refs
```

## Documentation

- **[docs/architecture.md](docs/architecture.md)** — data model, flavor vector, AI routes, agent loop, system diagram
- **[docs/hackathon-log.md](docs/hackathon-log.md)** — day-of build plan, Block 1–4 checklists, decision points, risks
- **[docs/demo.md](docs/demo.md)** — 3-minute demo script + finalist pitch
- **[docs/roadmap.md](docs/roadmap.md)** — post-hackathon evolution
- **[docs/avatar_prompts.md](docs/avatar_prompts.md)** — image-gen prompts for seed-user portraits
- **[docs/mala_singapore_locations.md](docs/mala_singapore_locations.md)** — restaurant research

---

> 🌶️🍲 *Go build it. The mala waits for no one.*
