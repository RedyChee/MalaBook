# Post-Hackathon Roadmap

```mermaid
timeline
    title MalaBook Long-Term Roadmap
    Hackathon Demo : Web MVP : 20 seed users : 6 Claude routes + agent : SG mala only
    Month 1 : Real auth (Clerk) : Postgres + pgvector : Photo upload : 100 beta users
    Month 3 : iOS app (Expo/React Native) : In-app chat : Restaurant partnerships : Geolocation
    Month 6 : Android : Premium tier : Group dates (4-person hot pot tables) : Multi-city (KL, HK, Taipei)
    Year 1 : Expand cuisines : Korean BBQ : Japanese izakaya : Ramen : "TasteGraph" platform play
```

## Key technical evolutions

- JSON seed → Postgres + pgvector for real embedding search
- Replace LLM matching with a small fine-tuned classifier; keep LLM for the human-readable layer
- Restaurant ingestion pipeline (scrape menus, auto-tag spice/style)
- *"Did you actually go?"* feedback loop wired to match-quality learning (already prototyped via B2)
- Privacy: never store exact location, only neighborhood-level
