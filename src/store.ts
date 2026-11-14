import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { Lang } from './i18n';
import { fetchFlares } from './sim/donki';
import { advance, allocTotal, budgetForSol, createGame, presetAlloc, type PresetId } from './sim/model';
import type { GameState, NeedId, SiteId } from './sim/types';

/** localStorage can throw (private mode, blocked storage). The app must work without it. */
const safeStorage: StateStorage = {
  getItem: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  setItem: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* ignore */
    }
  },
  removeItem: (k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  },
};
const storage = createJSONStorage(() => safeStorage);

// ---------- settings ----------

interface Settings {
  lang: Lang;
  theme: 'light' | 'dark';
  set: (p: Partial<Pick<Settings, 'lang' | 'theme'>>) => void;
}

export const useSettings = create<Settings>()(
  persist(
    (set) => ({ lang: 'en', theme: 'light', set: (p) => set(p) }),
    { name: 'jamt.settings', storage },
  ),
);

// ---------- game ----------

interface Game {
  game: GameState | null;
  loading: boolean;
  start: (site: SiteId) => Promise<void>;
  setAlloc: (need: NeedId, delta: number) => void;
  applyPreset: (preset: PresetId) => void;
  nextSol: () => void;
  askHint: () => void;
  clear: () => void;
  demo: { run: number } | null;
  startDemo: () => void;
  stopDemo: () => void;
}

const patch = (g: GameState | null, f: (g: GameState) => void): GameState | null => {
  if (!g || g.status !== 'running') return g;
  const next = structuredClone(g);
  f(next);
  return next;
};

export const useGame = create<Game>()(
  persist(
    (set) => ({
      game: null,
      loading: false,
      demo: null,
      start: async (site) => {
        set({ loading: true });
        const flares = await fetchFlares(4);
        set({ game: createGame(site, flares), loading: false });
      },
      setAlloc: (need, delta) =>
        set((s) => ({
          game: patch(s.game, (g) => {
            const budget = budgetForSol(g, g.sol + 1);
            const next = g.alloc[need] + delta;
            if (next < 0) return;
            if (delta > 0 && allocTotal(g.alloc) >= budget) return;
            g.alloc[need] = Math.min(next, budget);
          }),
        })),
      applyPreset: (preset) => set((s) => ({ game: patch(s.game, (g) => (g.alloc = presetAlloc(g, preset))) })),
      nextSol: () => set((s) => ({ game: s.game ? advance(s.game, 1) : null })),
      askHint: () => set((s) => ({ game: patch(s.game, (g) => (g.hintAsked = true)) })),
      clear: () => set({ game: null }),
      startDemo: () => set((s) => ({ demo: { run: (s.demo?.run ?? 0) + 1 } })),
      stopDemo: () => set({ demo: null }),
    }),
    { name: 'jamt.game', storage, partialize: (s) => ({ game: s.game }) },
  ),
);

export function siteList(): SiteId[] {
  return ['moon', 'mars'];
}
