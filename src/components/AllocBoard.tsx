import { FlaskConical, HeartPulse, Minus, Plus, Shield, Sprout, Wind, type LucideIcon } from 'lucide-react';
import { useT } from '../i18n';
import { allocTotal, budgetForSol, type Forecast, type PresetId } from '../sim/model';
import { NEEDS, type GameState, type MeterId, type NeedId } from '../sim/types';
import { useGame } from '../store';
import { ICON } from './ui';

export const NEED_ICON: Record<NeedId, LucideIcon> = {
  life: Wind,
  shield: Shield,
  food: Sprout,
  science: FlaskConical,
  crew: HeartPulse,
};
/** which 0–100 meter each need feeds (science has no meter — it's the goal) */
const NEED_METER: Record<NeedId, MeterId | null> = { life: 'life', shield: 'shield', food: 'food', science: null, crew: 'health' };

const PRESETS: PresetId[] = ['balanced', 'survival', 'science', 'shield'];

export function AllocBoard({ game, fc }: { game: GameState; fc: Forecast }) {
  const t = useT();
  const { setAlloc, applyPreset } = useGame();
  const budget = budgetForSol(game, game.sol + 1);
  const used = allocTotal(game.alloc);
  const left = budget - used;
  const running = game.status === 'running';

  return (
    <div>
      {/* power remaining */}
      <div className="mb-3 flex items-center gap-3">
        <span className="font-bold">{t('game.power')}</span>
        <span className="flex flex-1 gap-1" aria-hidden>
          {Array.from({ length: budget }, (_, i) => (
            <span key={i} className={`h-3 flex-1 rounded-full ${i < used ? 'bg-accent' : 'bg-paper-3'}`} />
          ))}
        </span>
        <span className={`num text-sm font-bold ${left === 0 ? 'text-ink-3' : 'text-accent-text'}`}>{left === 0 ? t('game.powerAll', { budget }) : t('game.powerLeft', { left, budget })}</span>
      </div>

      {/* quick plans */}
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={t('game.preset')}>
        <span className="label self-center">{t('game.preset')}</span>
        {PRESETS.map((p) => (
          <button key={p} type="button" className="btn btn-sm" disabled={!running} onClick={() => applyPreset(p)} title={t(`preset.${p}Tip`)}>
            {t(`preset.${p}`)}
          </button>
        ))}
      </div>

      {/* need steppers */}
      <ul className="m-0 grid list-none gap-2 p-0">
        {NEEDS.map((n) => {
          const Icon = NEED_ICON[n];
          const units = game.alloc[n];
          const meter = NEED_METER[n];
          const delta = meter ? fc.meters[meter] : fc.science;
          return (
            <li key={n} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border border-paper-3 bg-paper-2 p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent-text" aria-hidden>
                <Icon size={18} strokeWidth={2} />
              </span>
              <span className="min-w-0">
                <span className="block font-bold">{t(`need.${n}`)}</span>
                <span className="block truncate text-xs text-ink-3">{t(`need.${n}Tip`)}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="num hidden w-12 text-right text-xs text-ink-3 sm:inline">
                  {delta >= 0 ? '+' : '−'}
                  {Math.abs(Math.round(delta))}
                </span>
                <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full border border-paper-3 disabled:opacity-40" disabled={!running || units === 0} onClick={() => setAlloc(n, -1)} aria-label={`${t(`need.${n}`)} −`}>
                  <Minus {...ICON} aria-hidden />
                </button>
                <span className="num w-5 text-center text-lg font-bold" aria-label={`${units} ${t('need.unit')}`}>
                  {units}
                </span>
                <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full border border-accent bg-accent text-accent-on disabled:border-paper-3 disabled:bg-paper-3 disabled:text-ink-3" disabled={!running || left === 0} onClick={() => setAlloc(n, 1)} aria-label={`${t(`need.${n}`)} +`}>
                  <Plus {...ICON} aria-hidden />
                </button>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
