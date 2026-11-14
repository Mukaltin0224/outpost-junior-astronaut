# OUTPOST — Junior Astronaut Mission Trainer
### NASA Space Apps Challenge 2026 · "Build a Junior Astronaut Mission Trainer"

- **▶ Play it live:** https://outpost-junior-astronaut.vercel.app
- **💻 Open-source code:** https://github.com/Mukaltin0224/outpost-junior-astronaut
- **🎬 30-second demo video:** included with this submission

---

## High-level summary

**OUTPOST** is a free, browser-based game that puts children aged **7–12** in command of a **Moon or Mars base**. Each *sol* (space day) they get a limited amount of **power** and must split it between the crew's competing needs — **life support, radiation shielding, food, science, and crew rest**. You can't fund everything, so every choice has a real cost.

The hazards aren't invented. Solar storms are pulled from **NASA's live space-weather feed (DONKI)**, and the radiation, day/night and communication-delay numbers come from **real NASA missions**. In a few minutes a child makes the same kinds of trade-offs real astronauts and mission planners face — and the game is **honest about which numbers are real and which are simplified for play**.

---

## The challenge — and how we meet it

> *"...let kids ages 7–12 manage a lunar or Martian outpost, making real decisions about life support, radiation shielding, power budgeting, food production, and communication delay... every decision teaches something true."*

| Brief asks for | In OUTPOST |
|---|---|
| Ages 7–12 | Plain language, one-tap controls, built-in tutorial, splash intro |
| Manage a lunar/Martian outpost | Choose Moon (10 sols) or Mars (12 sols) |
| Life support | A meter you fund with power each sol |
| Radiation shielding | A meter you must raise **before** a solar storm or the crew takes a dose |
| Power budgeting | A fixed power budget split across 5 systems — the core of the game |
| Food production | A meter fed by a greenhouse system |
| Communication delay | Earth is ~1.3 s from the Moon but **3–22 min** from Mars → on Mars you decide locally |

---

## How it works

1. **Pick a base.** Moon (10 sols) or Mars (12 sols).
2. **Each sol you get 8 power.** Split it across 5 systems with +/− steppers or one-tap "quick plans" (Balanced / Stay safe / Do science / Shield up).
3. **Meters respond** to your choices and the sol's hazard — solar flare, lunar night, Mars dust storm, comms blackout.
4. **Radiation accumulates.** Raise shielding ahead of a flare, or the crew takes a dose toward a hard limit.
5. **Finish the mission** → a **Mission Report**: a sol-by-sol chart, what you did well, and the exact NASA datasets you relied on.

---

## Real NASA data (the heart of it)

- **NASA DONKI (live).** On mission start the game queries NASA's *Space Weather Database Of Notifications, Knowledge, Information* for recent **real solar flares** and uses them as in-game storms. Offline or if the call fails, it falls back to an archive of **real historic flares** (e.g. the 2003 X28, 2017 X9.3, 2024 X8.7) — never fabricated. Each flare is labelled **live** vs **archive** in-game.
- **Chang'e-4 LND** — first in-situ radiation measurement on the lunar surface (~1.3 mSv/day). *(Zhang et al., Science Advances, 2020.)*
- **NASA RAD / Curiosity** — Mars surface radiation (~0.64 mSv/day).
- **NASA Mars facts** — a sol is 24 h 39 min.
- **Lunar day/night cycle** — ~29.5 Earth days.
- **Deep-space communication light-time** — Earth–Mars 3–22 min; Earth–Moon ~1.3 s.

Every real fact is listed and sourced on the in-app **"Real data"** page and tagged **REAL NASA DATA** vs **game model**.

---

## Why it matters (Impact)

- **Free, no download, no account, works offline** (installable PWA) — runs on a cheap school laptop or a phone, including low-connectivity regions.
- **Bilingual** (English + Russian) for wider reach.
- Teaches **systems thinking and trade-offs**, not facts to memorize — the lesson sticks because the child *feels* the cost of each choice.
- **Honest by design:** a dedicated section explains what the game simplifies, so it builds scientific literacy instead of misconceptions.

## What makes it different (Creativity)

Most kids' space games invent their numbers. OUTPOST uses **this week's real NASA space weather** and openly **separates real data from game model**. It pairs that rigor with a warm **retro mission-control** look, a splash intro and a built-in tutorial, so a 7-year-old can start playing in seconds.

## Honesty about the model (Validity)

Shown in-app under *Real data → What the game simplifies*:
- How fast each resource rises/falls per unit of power is a **tuned game model**.
- Missions are a few sols so a child can finish in minutes; real missions last months.
- Radiation doses are based on **real daily rates** but rounded for a simple meter.

OUTPOST is a **learning game that uses real NASA data — not a mission planner.** The game model is covered by **18 automated tests**, and the app is deployed and working.

---

## Built with

React 18 · TypeScript · Vite · Tailwind CSS · Zustand · Recharts · PWA (vite-plugin-pwa) · Vitest · deployed on **Vercel**. Live data via the **NASA DONKI API**. Fully **open-source** on GitHub.

## Use of Artificial Intelligence (disclosure)

We used an AI assistant (Anthropic's **Claude**) as a pair-programmer to help implement the React/TypeScript code, tune game balance, and assemble the demo video. **All design decisions, the choice and verification of NASA datasets, game-balance targets, and testing were directed and reviewed by the team.** No AI-generated imagery is presented as real, and no fabricated numbers are presented as NASA data — every real fact is sourced on the Real data page.

---

## Evaluate it in 60 seconds (for judges)

1. Open the **live link** → choose **Moon** → play 2–3 sols.
2. You'll see a **real solar flare labelled from NASA** drive a storm.
3. Finish to the **Mission Report** that lists the exact NASA datasets used.
4. Everything marked **"REAL NASA DATA"** is sourced on the **Real data** page.

## Mapped to the judging criteria

- **Impact** — free, offline, bilingual; teaches real trade-offs to ages 7–12.
- **Creativity** — live NASA space weather inside a kids' game, plus radical honesty about model vs data.
- **Validity** — deployed and working; real, sourced data; automated tests; stated limitations.
- **Relevance** — hits *every* element of the brief (life support, shielding, power, food, comms delay, 7–12).
- **Presentation** — polished retro UI, splash, tutorial, a 30-second demo, and open-source code.

---

## References (NASA & scientific sources)

- NASA DONKI — Space Weather Database Of Notifications, Knowledge, Information (`https://api.nasa.gov`, DONKI).
- Chang'e-4 Lunar Lander Neutrons & Dosimetry (LND) — lunar surface radiation; Zhang et al., *Science Advances*, 2020.
- NASA RAD (Radiation Assessment Detector), Curiosity rover — Mars surface radiation.
- NASA Mars facts (sol length); NASA Moon day/night cycle; NASA deep-space communication light-time.

*(Full, tagged source list is built into the app's **Real data** page.)*

## Team & future work

Future ideas: more hazards, a Mars-specific communication-delay mini-mechanic, a teacher/classroom mode, and more languages.
