import { FlaskConical, HeartPulse, Shield, Sprout, Wind, type LucideIcon } from 'lucide-react';
import { fmt, signed, useLang, useT } from '../i18n';
import { meterStatus } from '../sim/model';
import type { MeterId } from '../sim/types';
import { Bar, ICON, StatusGlyph, statusFill } from './ui';

const METER_ICON: Record<MeterId, LucideIcon> = { life: Wind, shield: Shield, food: Sprout, health: HeartPulse };

/** One 0–100 meter with icon, value, bar and status glyph. */
export function MeterRow({ id, value, delta }: { id: MeterId; value: number; delta?: number }) {
  const t = useT();
  const lang = useLang();
  const status = meterStatus(value);
  const Icon = METER_ICON[id];
  return (
    <div
      className="grid grid-cols-[28px_1fr_auto] items-center gap-x-2 py-1.5"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      aria-label={`${t(`meter.${id}`)}: ${t(`meter.${id}Hint`)}`}
      title={t(`meter.${id}Hint`)}
    >
      <span className="text-ink-2" aria-hidden>
        <Icon size={18} strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-semibold">{t(`meter.${id}`)}</span>
          <span className="num text-sm font-bold">
            {Math.round(value)}
            {delta !== undefined && <span className="ml-1 text-xs font-normal text-ink-3">{signed(delta, lang, 0)}</span>}
          </span>
        </div>
        <Bar value={value} fill={statusFill[status]} />
      </div>
      <StatusGlyph status={status} />
    </div>
  );
}

/** The science goal as a progress row. */
export function ScienceRow({ value, goal, delta }: { value: number; goal: number; delta?: number }) {
  const t = useT();
  const lang = useLang();
  return (
    <div className="grid grid-cols-[28px_1fr_auto] items-center gap-x-2 py-1.5" role="meter" aria-valuemin={0} aria-valuemax={goal} aria-valuenow={Math.round(value)} aria-label={t('meter.science')}>
      <span className="text-accent-text" aria-hidden>
        <FlaskConical size={18} strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-semibold">{t('meter.science')}</span>
          <span className="num text-sm font-bold">
            {Math.round(value)} / {fmt(goal, lang)}
            {delta !== undefined && delta > 0 && <span className="ml-1 text-xs font-normal text-ink-3">{signed(delta, lang, 0)}</span>}
          </span>
        </div>
        <Bar value={value} max={goal} fill="bg-accent" />
      </div>
      <span className="w-4" aria-hidden>
        {ICON && null}
      </span>
    </div>
  );
}
