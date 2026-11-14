# OUTPOST — Junior Astronaut Mission Trainer

NASA Space Apps Challenge 2026 · "Build a Junior Astronaut Mission Trainer"

A browser game for **ages 7–12**. You run a **Moon or Mars base**. Each **sol** (day) you get a limited amount of **power** and must split it across the crew's competing needs — **life support, shielding, food, science, and crew rest**. You can't fund everything, so every choice costs something. Real NASA space weather drives the hazards.

> Challenge brief: *"...let kids ages 7–12 manage a lunar or Martian outpost, making real decisions about life support, radiation shielding, power budgeting, food production, and communication delay... every decision teaches something true about what astronauts and mission planners actually navigate."*

## Run

```bash
npm install
npm run dev
npm test
npm run build
```

Browser-playable, no download or account. Works offline after first load (PWA).

**Live data (optional):** the game calls NASA DONKI with the shared `DEMO_KEY`, which is heavily rate-limited, so it usually falls back to the embedded real-flare archive. For reliable *live* flares, get a free key at https://api.nasa.gov, copy `.env.example` to `.env`, and set `VITE_NASA_API_KEY`. Either way the flares are real and labelled live-vs-archive in-game.

## How it meets the challenge

- **Outpost resource management, 7–12.** Three core meters to watch (life support, shielding, food) plus a crew-health readout and a science goal — not five or six systems at once, as the brief advises.
- **Every choice is a trade-off.** Power spent on shielding is power not spent on science or food. There is no free "safe" option.
- **Real NASA data, not invented numbers:**
  - **DONKI (live).** On mission start, the game calls NASA's Space Weather Database (`api.nasa.gov/DONKI/FLR`) for real recent **solar flares** and uses them as your in-game solar storms. Offline or if the call fails, it falls back to a small archive of **real historic flares** (e.g. the 2017 X9.3, the May 2024 X8.7) — never fabricated. Live vs. archive is labelled in-game.
  - **Radiation** doses from NASA's RAD (Mars ~0.64 mSv/day) and Chang'e-4 LND (Moon ~1.3 mSv/day).
  - **Environment** from NASA Mars facts (sol = 24 h 39 min, ~586 W/m² sunlight), the lunar night (~14 Earth days), and dust-storm power loss.
  - **Communication delay** — Earth is ~1.3 s from the Moon but minutes from Mars, so on Mars you must decide locally. Every real fact is listed and sourced on the **Real data** page, and marked **REAL NASA DATA** vs **game model**.
- **Plain language.** Terms like *sol, radiation dose, shielding, microgravity* are explained in-context and on the How-to-play page.
- **Replayable.** Live flares change by date; hazard placement varies by seed.

## Structure

- `src/sim/model.ts` — pure game model (power budget, five needs, hazards, outcome) with unit tests in `model.test.ts`.
- `src/sim/donki.ts` — live DONKI fetch + real-flare archive fallback.
- `src/data/` — `sites.json` (Moon/Mars config), `nasa.json` (real facts + flare archive), `sources.json` (datasets, each flagged real/model).
- `src/screens/` — Brief (home), Console (the game), Report, RealData, About.
- `src/i18n/` — English and Russian.

## Honest notes on the model

Shown in-app under **Real data → What the game simplifies**:
- How fast each resource rises/falls per unit of power is a tuned game model.
- Missions are a few sols long so a child can finish in minutes; real missions last months.
- Radiation doses are based on real daily rates but rounded for a simple meter.

Learning game that uses real NASA data — not a mission planner.
