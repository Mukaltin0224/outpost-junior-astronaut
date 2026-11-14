import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useT } from '../i18n';
import { navigate } from '../router';
import { presetAlloc, stepSol, type PresetId } from '../sim/model';
import { useGame } from '../store';
import { ICON } from './ui';

const CAPS = ['s1', 's2', 's3', 's4', 's5'];

/** 60-second self-playing Moon mission, ending at the report. */
export function useDemoRunner() {
  const run = useGame((s) => s.demo?.run);
  const setCap = (window as unknown as { __setDemoCap?: (n: number) => void }).__setDemoCap;
  useEffect(() => {
    if (run === undefined) return;
    let dead = false;
    const alive = () => !dead && useGame.getState().demo?.run === run;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      const api = useGame.getState();
      await api.start('moon');
      navigate('console');
      await sleep(600);
      while (alive()) {
        const g = useGame.getState().game;
        if (!g || g.status !== 'running') break;
        const nextSol = g.sol + 1;
        const flareSoon = g.hazards.some((h) => h.id === 'flare' && h.sol >= nextSol && h.sol <= nextSol + 1);
        const low = Math.min(g.meters.life, g.meters.food) < 40;
        const preset: PresetId = g.meters.shield < 60 && flareSoon ? 'shield' : low ? 'survival' : 'science';
        const phase = g.sol < 2 ? 0 : flareSoon || g.hazards.some((h) => h.id === 'flare' && h.sol === g.sol) ? (g.meters.shield < 60 ? 1 : 2) : g.hazards.some((h) => h.id === 'night' && h.sol === nextSol) ? 3 : 0;
        setCap?.(phase);
        useGame.setState({ game: { ...g, alloc: presetAlloc(g, preset) } });
        await sleep(1400);
        if (!alive()) return;
        useGame.setState({ game: stepSol(useGame.getState().game!) });
        await sleep(900);
      }
      if (alive()) {
        setCap?.(4);
        await sleep(1500);
        navigate('report');
        await sleep(3000);
        if (alive()) useGame.getState().stopDemo();
      }
    })();
    return () => {
      dead = true;
    };
  }, [run, setCap]);
}

export function DemoBar() {
  const t = useT();
  const demo = useGame((s) => s.demo);
  const stop = useGame((s) => s.stopDemo);
  const [cap, setCap] = useState(0);
  useEffect(() => {
    (window as unknown as { __setDemoCap?: (n: number) => void }).__setDemoCap = setCap;
  }, []);
  if (!demo) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-hot bg-bar text-bar-fg" role="status" aria-live="polite">
      <div className="mx-auto flex max-w-[900px] items-center gap-3 px-4 py-3">
        <span className="label shrink-0 text-hot">{t('demo.label')}</span>
        <p className="min-w-0 flex-1 text-sm sm:text-base">{t(`demo.${CAPS[Math.min(cap, CAPS.length - 1)]}`)}</p>
        <button type="button" onClick={stop} className="inline-flex min-h-[40px] shrink-0 items-center gap-1 rounded-full border border-bar-fg/50 px-3 text-sm hover:border-bar-fg">
          <X {...ICON} aria-hidden />
          {t('demo.exit')}
        </button>
      </div>
    </div>
  );
}
