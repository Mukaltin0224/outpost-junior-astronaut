// Junior Astronaut Mission Trainer — pure game model (no UI, no storage).
// Core loop: each sol you split a limited POWER budget across five needs.
// Every choice costs something; real NASA space-weather drives the hazards.
import sites from '../data/sites.json';
import { flareDose, type Flare } from './donki';
import {
  METERS,
  NEEDS,
  type GameState,
  type Hazard,
  type LogEntry,
  type MeterId,
  type NeedId,
  type OutcomeReport,
  type SiteId,
  type SolRecord,
} from './types';

export interface SiteConfig {
  code: string;
  totalSols: number;
  powerBudget: number;
  scienceGoal: number;
  doseLimit: number;
  doseRate: number;
  commsMin: number;
  tutorial: boolean;
  start: Record<MeterId, number>;
  demand: { life: number; food: number; shieldDecay: number; healthDecay: number };
  restore: Record<NeedId, number>;
  nightSols: number[];
  nightPowerFactor: number;
  dustSols: number[];
  dustPowerFactor: number;
  flares: number;
}

const SITES = sites as unknown as Record<SiteId, SiteConfig>;
export const siteOf = (id: SiteId): SiteConfig => SITES[id];

const clamp = (v: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v));
const r1 = (v: number) => Math.round(v * 10) / 10;
/** How much of the radiation dose the shield blocks at full strength. */
const SHIELD_EFF = 0.8;
/** Below this shield level a flare also hurts the crew. */
const SHIELD_SAFE = 60;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Place real flares, dust and night onto sols. Flares come from DONKI (live) or the archive. */
export function buildHazards(site: SiteId, seed: number, flares: Flare[]): Hazard[] {
  const c = siteOf(site);
  const rnd = mulberry32(seed);
  const out: Hazard[] = [];
  c.nightSols.forEach((sol) => out.push({ id: 'night', sol, powerFactor: c.nightPowerFactor, source: 'moonnight' }));
  c.dustSols.forEach((sol) => out.push({ id: 'dust', sol, powerFactor: c.dustPowerFactor, source: 'duststorm' }));

  // Spread the available flares across the middle of the mission, one per chosen sol.
  const picks = flares.slice(0, c.flares);
  const taken = new Set(out.map((h) => h.sol));
  const lo = 4;
  const hi = c.totalSols - 1;
  const span = Math.max(1, Math.floor((hi - lo) / Math.max(1, picks.length)));
  picks.forEach((f, i) => {
    let sol = lo + i * span + Math.floor(rnd() * span);
    for (let t = 0; t < c.totalSols && taken.has(sol); t++) sol = lo + ((sol - lo + 1) % Math.max(1, hi - lo));
    sol = Math.min(hi, Math.max(lo, sol));
    taken.add(sol);
    out.push({ id: 'flare', sol, label: f.class, source: 'donki', live: f.live, dose: flareDose(f.class) });
  });
  return out.sort((a, b) => a.sol - b.sol);
}

export function hazardOn(hazards: Hazard[], sol: number): Hazard | null {
  return hazards.find((h) => h.sol === sol) ?? null;
}

/** Power available on the sol being planned (dust/night cut it). */
export function budgetForSol(g: GameState, sol: number): number {
  const c = siteOf(g.site);
  const h = hazardOn(g.hazards, sol);
  const factor = h && (h.id === 'dust' || h.id === 'night') ? h.powerFactor ?? 1 : 1;
  return Math.round(c.powerBudget * factor);
}

// ---------- allocation presets (sum to the sol's budget) ----------

export type PresetId = 'balanced' | 'survival' | 'science' | 'shield';

export function presetAlloc(g: GameState, preset: PresetId): Record<NeedId, number> {
  const budget = budgetForSol(g, g.sol + 1);
  const weights: Record<PresetId, Record<NeedId, number>> = {
    balanced: { life: 3, shield: 2, food: 2, science: 2, crew: 1 },
    survival: { life: 4, shield: 3, food: 2, science: 0, crew: 1 },
    science: { life: 2, shield: 1, food: 2, science: 4, crew: 1 },
    shield: { life: 2, shield: 5, food: 1, science: 1, crew: 1 },
  };
  return distribute(weights[preset], budget);
}

/** Turn relative weights into whole power units that sum exactly to the budget. */
function distribute(weights: Record<NeedId, number>, budget: number): Record<NeedId, number> {
  const total = NEEDS.reduce((s, n) => s + weights[n], 0) || 1;
  const alloc = {} as Record<NeedId, number>;
  let used = 0;
  NEEDS.forEach((n) => {
    alloc[n] = Math.floor((weights[n] / total) * budget);
    used += alloc[n];
  });
  // hand out the remainder to the highest-weight needs
  const order = [...NEEDS].sort((a, b) => weights[b] - weights[a]);
  let i = 0;
  while (used < budget) {
    alloc[order[i % order.length]]++;
    used++;
    i++;
  }
  return alloc;
}

export const allocTotal = (alloc: Record<NeedId, number>) => NEEDS.reduce((s, n) => s + alloc[n], 0);

// ---------- setup ----------

export function createGame(site: SiteId, flares: Flare[], seed = Date.now() % 100000): GameState {
  const c = siteOf(site);
  const g: GameState = {
    site,
    seed,
    sol: 0,
    totalSols: c.totalSols,
    budget: c.powerBudget,
    alloc: { life: 0, shield: 0, food: 0, science: 0, crew: 0 },
    meters: { ...c.start },
    science: 0,
    scienceGoal: c.scienceGoal,
    dose: 0,
    doseLimit: c.doseLimit,
    commsMin: c.commsMin,
    hintAsked: false,
    hazards: buildHazards(site, seed, flares),
    log: [{ sol: 0, key: 'log.start', vars: { site }, tone: 'info' }],
    history: [],
    flaresLive: flares.some((f) => f.live),
    status: 'running',
    fail: null,
  };
  g.budget = budgetForSol(g, 1);
  g.alloc = presetAlloc(g, 'balanced');
  return g;
}

// ---------- one sol ----------

export function stepSol(prev: GameState): GameState {
  if (prev.status !== 'running') return prev;
  const g: GameState = structuredClone(prev);
  const c = siteOf(g.site);
  const sol = g.sol + 1;
  const log: LogEntry[] = [];
  const say = (key: string, tone: LogEntry['tone'] = 'info', vars?: LogEntry['vars']) => log.push({ sol, key, vars, tone });
  const haz = hazardOn(g.hazards, sol);
  const budget = budgetForSol(g, sol);
  // clamp the plan to what power is actually available
  const alloc = { ...g.alloc };
  let over = allocTotal(alloc) - budget;
  for (const n of [...NEEDS].reverse()) {
    while (over > 0 && alloc[n] > 0) {
      alloc[n]--;
      over--;
    }
  }

  if (haz?.id === 'night') say('log.night', 'warn', { budget });
  if (haz?.id === 'dust') say('log.dust', 'warn', { budget });

  const m = g.meters;
  m.life = clamp(m.life + alloc.life * c.restore.life - c.demand.life);
  m.food = clamp(m.food + alloc.food * c.restore.food - c.demand.food);
  m.shield = clamp(m.shield + alloc.shield * c.restore.shield - c.demand.shieldDecay);
  m.health = clamp(m.health + alloc.crew * c.restore.crew - c.demand.healthDecay);
  g.science += alloc.science * c.restore.science;

  // background radiation (real per-sol dose), reduced by shielding
  const shieldFactor = 1 - SHIELD_EFF * (m.shield / 100);
  g.dose += c.doseRate * shieldFactor;

  // real solar flare from DONKI
  if (haz?.id === 'flare') {
    const spike = (haz.dose ?? 4) * shieldFactor;
    g.dose += spike;
    if (m.shield < SHIELD_SAFE) {
      const hit = Math.round((SHIELD_SAFE - m.shield) / 3 + 9);
      m.health = clamp(m.health - hit);
      say('log.flareHit', 'crit', { cls: haz.label ?? 'X', hit });
    } else {
      say('log.flareSafe', 'good', { cls: haz.label ?? 'X' });
    }
  }

  // warnings
  (['life', 'food', 'shield', 'health'] as MeterId[]).forEach((k) => {
    if (prev.meters[k] >= 35 && m[k] < 35) say('log.low', 'warn', { meter: k });
  });

  // failure checks
  if (m.life <= 0 && !g.fail) {
    g.fail = 'life';
    say('log.failLife', 'crit');
  } else if (m.food <= 0 && !g.fail) {
    g.fail = 'food';
    say('log.failFood', 'crit');
  } else if (m.health <= 0 && !g.fail) {
    g.fail = 'health';
    say('log.failHealth', 'crit');
  }

  if (log.length === 0) say('log.nominal', 'info', { sol });

  const rec: SolRecord = { sol, meters: { ...m }, science: Math.round(g.science), dose: r1(g.dose), budget, alloc, hazard: haz?.id ?? null };
  g.history.push(rec);
  g.log = [...g.log, ...log].slice(-60);
  g.sol = sol;
  g.hintAsked = false;
  g.budget = budgetForSol(g, sol + 1);
  g.alloc = presetAlloc({ ...g }, 'balanced');

  if (g.fail) g.status = 'done';
  else if (g.sol >= g.totalSols) g.status = 'done';
  return g;
}

export function advance(s: GameState, sols: number): GameState {
  let cur = s;
  for (let i = 0; i < sols && cur.status === 'running'; i++) cur = stepSol(cur);
  return cur;
}

// ---------- forecast (what next sol's plan will do) ----------

export interface Forecast {
  budget: number;
  used: number;
  meters: Record<MeterId, number>;
  science: number;
  dose: number;
  hazard: Hazard | null;
}

export function forecast(g: GameState): Forecast {
  const next = stepSol(g);
  const d = (k: MeterId) => next.meters[k] - g.meters[k];
  return {
    budget: budgetForSol(g, g.sol + 1),
    used: allocTotal(g.alloc),
    meters: { life: d('life'), shield: d('shield'), food: d('food'), health: d('health') },
    science: next.science - g.science,
    dose: next.dose - g.dose,
    hazard: hazardOn(g.hazards, g.sol + 1),
  };
}

// ---------- outcome ----------

export function judge(g: GameState): OutcomeReport {
  const reasons: OutcomeReport['reasons'] = [];
  const dataUsed = ['donki', g.site === 'mars' ? 'rad' : 'moonrad', g.site === 'mars' ? 'marsfacts' : 'moonnight', 'comms'];
  if (g.fail) {
    reasons.push({ key: `reason.fail.${g.fail}`, tone: 'crit', vars: { sol: g.sol } });
    return { outcome: 'failed', reasons, dataUsed };
  }
  let partial = false;
  const sci = Math.round(g.science);
  if (sci >= g.scienceGoal) reasons.push({ key: 'reason.scienceMet', tone: 'good', vars: { science: sci, goal: g.scienceGoal } });
  else {
    partial = true;
    reasons.push({ key: 'reason.scienceShort', tone: 'warn', vars: { science: sci, goal: g.scienceGoal } });
  }
  if (g.dose <= g.doseLimit) reasons.push({ key: 'reason.doseOk', tone: 'good', vars: { dose: Math.round(g.dose), limit: g.doseLimit } });
  else {
    partial = true;
    reasons.push({ key: 'reason.doseHigh', tone: 'warn', vars: { dose: Math.round(g.dose), limit: g.doseLimit } });
  }
  const weakest = METERS.reduce((w, k) => (g.meters[k] < g.meters[w] ? k : w), 'life' as MeterId);
  if (g.meters[weakest] < 25) {
    partial = true;
    reasons.push({ key: 'reason.weak', tone: 'warn', vars: { meter: weakest, v: Math.round(g.meters[weakest]) } });
  } else reasons.push({ key: 'reason.crewOk', tone: 'good' });
  return { outcome: partial ? 'partial' : 'success', reasons, dataUsed };
}

/** The two or three sols that hurt the most — for the mission report. */
export function keyMoments(g: GameState): { key: string; vars: Record<string, string | number>; tone: 'warn' | 'crit' | 'good' }[] {
  const out: { key: string; vars: Record<string, string | number>; tone: 'warn' | 'crit' | 'good'; weight: number }[] = [];
  g.history.forEach((r, i) => {
    const prev = i > 0 ? g.history[i - 1] : null;
    if (r.hazard === 'flare') {
      const dropped = prev ? prev.meters.health - r.meters.health : 0;
      if (dropped > 3) out.push({ key: 'moment.flareHit', vars: { sol: r.sol, hit: Math.round(dropped) }, tone: 'crit', weight: 50 + dropped });
      else out.push({ key: 'moment.flareHeld', vars: { sol: r.sol }, tone: 'good', weight: 8 });
    }
    (['life', 'food'] as MeterId[]).forEach((k) => {
      if (r.meters[k] < 20) out.push({ key: 'moment.ranLow', vars: { sol: r.sol, meter: k }, tone: 'warn', weight: 30 });
    });
  });
  if (g.fail) out.push({ key: `moment.fail.${g.fail}`, vars: { sol: g.sol }, tone: 'crit', weight: 100 });
  return out
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map(({ weight: _w, ...x }) => x);
}

export type Status = 'ok' | 'warn' | 'crit';
export function meterStatus(v: number): Status {
  return v >= 50 ? 'ok' : v >= 25 ? 'warn' : 'crit';
}
