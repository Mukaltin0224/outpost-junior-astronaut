import { describe, expect, it } from 'vitest';
import sources from '../data/sources.json';
import { archiveFlares, flareDose, flareScore } from './donki';
import { advance, allocTotal, budgetForSol, buildHazards, createGame, forecast, judge, presetAlloc, siteOf, stepSol, type PresetId } from './model';
import { NEEDS, type GameState, type SiteId } from './types';

const flares = archiveFlares().slice(0, 2);

function play(site: SiteId, preset: PresetId, seed = 7) {
  let g = createGame(site, flares, seed);
  while (g.status === 'running') {
    g.alloc = presetAlloc(g, preset);
    g = stepSol(g);
  }
  return g;
}

function playSmart(site: SiteId, seed = 7) {
  let g = createGame(site, flares, seed);
  while (g.status === 'running') {
    const nextSol = g.sol + 1;
    const flareNext = g.hazards.some((h) => h.id === 'flare' && h.sol >= nextSol && h.sol <= nextSol + 1);
    const low = Math.min(g.meters.life, g.meters.food, g.meters.health) < 40;
    g.alloc = presetAlloc(g, g.meters.shield < 60 && flareNext ? 'shield' : low ? 'survival' : 'science');
    g = stepSol(g);
  }
  return g;
}

describe('data', () => {
  it('flare archive entries are real flares with class, date and region', () => {
    const a = archiveFlares();
    expect(a.length).toBeGreaterThanOrEqual(5);
    a.forEach((f) => {
      expect(f.class).toMatch(/^[CMX][\d.]+$/);
      expect(f.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(f.live).toBe(false);
    });
  });

  it('flare strength orders C < M < X and dose rises with class', () => {
    expect(flareScore('X9.0')).toBeGreaterThan(flareScore('M5.8'));
    expect(flareScore('M5.8')).toBeGreaterThan(flareScore('C2.0'));
    expect(flareDose('X9.0')).toBeGreaterThan(flareDose('M2.0'));
    expect(flareDose('M2.0')).toBeGreaterThan(flareDose('C1.0'));
  });

  it('every source has a title and real/model flag', () => {
    sources.sources.forEach((s) => {
      expect(typeof s.title).toBe('string');
      expect(typeof s.real).toBe('boolean');
    });
  });
});

describe('power budget', () => {
  it('splitting power always sums to the sol budget', () => {
    const g = createGame('mars', flares, 7);
    (['balanced', 'survival', 'science', 'shield'] as PresetId[]).forEach((p) => {
      expect(allocTotal(presetAlloc(g, p))).toBe(budgetForSol(g, 1));
    });
  });

  it('a dust storm cuts the Mars power budget', () => {
    const g = createGame('mars', flares, 7);
    const dust = g.hazards.find((h) => h.id === 'dust')!;
    expect(budgetForSol(g, dust.sol)).toBeLessThan(siteOf('mars').powerBudget);
  });

  it('lunar night cuts the Moon power budget', () => {
    const g = createGame('moon', flares, 7);
    const night = g.hazards.find((h) => h.id === 'night')!;
    expect(budgetForSol(g, night.sol)).toBeLessThan(siteOf('moon').powerBudget);
  });
});

describe('simulation', () => {
  it('stepSol is pure', () => {
    const g = createGame('moon', flares, 7);
    const copy = structuredClone(g);
    stepSol(g);
    expect(g).toEqual(copy);
  });

  it('same seed and flares give the same hazard schedule (deterministic replay)', () => {
    expect(buildHazards('mars', 7, flares)).toEqual(buildHazards('mars', 7, flares));
    expect(createGame('mars', flares, 7).hazards).toEqual(createGame('mars', flares, 7).hazards);
  });

  it('places exactly one real flare per configured flare slot', () => {
    const g = createGame('moon', flares, 7);
    expect(g.hazards.filter((h) => h.id === 'flare').length).toBe(siteOf('moon').flares);
    expect(g.hazards.filter((h) => h.id === 'flare').every((h) => h.source === 'donki' && h.label)).toBe(true);
  });

  it('a solar flare hurts the crew when the shield is low, and is safe when high', () => {
    const base = createGame('moon', flares, 7);
    const flare = base.hazards.find((h) => h.id === 'flare')!;
    const atFlare = (shield: number) => {
      const g = structuredClone(base);
      g.sol = flare.sol - 1;
      g.meters.shield = shield;
      g.alloc = { life: 0, shield: 0, food: 0, science: 0, crew: 0 };
      return stepSol(g).meters.health - g.meters.health;
    };
    const safe = atFlare(100); // strong shield: only the tiny passive drain (~ -1)
    const hit = atFlare(20); // weak shield: a real radiation hit on top
    expect(safe).toBeGreaterThan(-3);
    expect(hit).toBeLessThan(safe - 5);
  });

  it('forecast matches what the sol actually does', () => {
    const g = advance(createGame('mars', flares, 7), 2);
    const f = forecast(g);
    const next = stepSol(g);
    expect(next.meters.life - g.meters.life).toBeCloseTo(f.meters.life, 6);
    expect(next.science - g.science).toBeCloseTo(f.science, 6);
  });
});

describe('outcomes teach the trade-off', () => {
  it('a thoughtful strategy wins on both sites', () => {
    expect(judge(playSmart('moon')).outcome).toBe('success');
    expect(judge(playSmart('mars')).outcome).toBe('success');
  });

  it('pouring everything into science neglects shielding and ends badly', () => {
    const moon = play('moon', 'science');
    expect(moon.dose).toBeGreaterThan(moon.doseLimit); // crew over-irradiated
    const mars = play('mars', 'science');
    expect(['partial', 'failed']).toContain(judge(mars).outcome);
  });

  it('never funding science misses the mission goal', () => {
    const g = play('moon', 'survival');
    expect(g.science).toBeLessThan(g.scienceGoal);
    expect(judge(g).outcome).not.toBe('success');
  });

  it('running a store to zero fails the mission and says why', () => {
    let g = createGame('mars', flares, 7);
    g.meters.food = 6;
    g.alloc = { life: 4, shield: 4, food: 0, science: 0, crew: 0 };
    g = stepSol(g);
    expect(g.fail).toBe('food');
    expect(judge(g).outcome).toBe('failed');
    expect(judge(g).reasons[0].key).toBe('reason.fail.food');
  });

  it('the report lists which real NASA datasets were used', () => {
    const r = judge(play('mars', 'balanced'));
    expect(r.dataUsed).toContain('donki');
    expect(r.dataUsed.length).toBeGreaterThanOrEqual(3);
  });
});

describe('sanity', () => {
  it('needs list and allocation stay consistent', () => {
    const g = createGame('moon', flares, 7);
    expect(Object.keys(g.alloc).sort()).toEqual([...NEEDS].sort());
  });
  it('a finished game ignores further steps', () => {
    const done: GameState = { ...createGame('moon', flares, 7), status: 'done' };
    expect(stepSol(done)).toBe(done);
  });
});
