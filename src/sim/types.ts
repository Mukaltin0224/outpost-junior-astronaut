// Junior Astronaut Mission Trainer — ages 7–12.
// Run a lunar or Martian outpost. Split limited power across competing needs;
// every choice costs something. Real NASA data (DONKI space weather, OSDR/RAD
// radiation, Mars/Artemis environment) drives the hazards.

export type SiteId = 'moon' | 'mars';

/** The five things the crew needs. Power is the per-sol budget you split among the rest. */
export type NeedId = 'life' | 'shield' | 'food' | 'science' | 'crew';
export const NEEDS: NeedId[] = ['life', 'shield', 'food', 'science', 'crew'];

/** Meters shown to the player, 0–100. */
export type MeterId = 'life' | 'shield' | 'food' | 'health';
export const METERS: MeterId[] = ['life', 'shield', 'food', 'health'];

export type Tone = 'info' | 'good' | 'warn' | 'crit';

export type HazardId = 'flare' | 'dust' | 'night' | 'quiet';

/** A space-weather or environment event on a given sol. */
export interface Hazard {
  id: HazardId;
  sol: number;
  /** real NASA detail, e.g. flare class "X1.6" or dust-storm name */
  label?: string;
  /** source id into sources.json (e.g. "donki") */
  source?: string;
  /** true when this came from a live DONKI fetch, false when from the embedded archive */
  live?: boolean;
  /** extra radiation dose, mSv, if unshielded */
  dose?: number;
  /** power-budget multiplier for the sol (dust/night) */
  powerFactor?: number;
}

export interface LogEntry {
  sol: number;
  key: string;
  vars?: Record<string, string | number>;
  tone: Tone;
}

export interface SolRecord {
  sol: number;
  meters: Record<MeterId, number>;
  science: number;
  dose: number;
  budget: number;
  alloc: Record<NeedId, number>;
  hazard: HazardId | null;
}

export type FailReason = 'life' | 'food' | 'health';
export type Outcome = 'success' | 'partial' | 'failed';

export interface GameState {
  site: SiteId;
  seed: number;
  /** completed sols; the sol being planned is sol + 1 */
  sol: number;
  totalSols: number;
  /** power units to spend this sol (after dust/night) */
  budget: number;
  /** how the player split this sol's power */
  alloc: Record<NeedId, number>;
  meters: Record<MeterId, number>;
  science: number;
  scienceGoal: number;
  dose: number;
  doseLimit: number;
  /** one-way Earth link light-time, minutes (real) */
  commsMin: number;
  /** did the player ask Mission Control this sol (Mars: answer delayed) */
  hintAsked: boolean;
  hazards: Hazard[];
  log: LogEntry[];
  history: SolRecord[];
  /** data provenance for the Real Data page */
  flaresLive: boolean;
  status: 'running' | 'done';
  fail: FailReason | null;
}

export interface OutcomeReport {
  outcome: Outcome;
  reasons: { key: string; vars?: Record<string, string | number>; tone: Tone }[];
  dataUsed: string[];
}
