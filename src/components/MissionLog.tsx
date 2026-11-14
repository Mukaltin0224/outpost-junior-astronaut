import { useT } from '../i18n';
import type { LogEntry } from '../sim/types';
import { StatusGlyph, toneStatus } from './ui';

/** Short flight-log lines, newest first. */
export function MissionLog({ log, max = 30 }: { log: LogEntry[]; max?: number }) {
  const t = useT();
  const lines = [...log].reverse().slice(0, max);
  return (
    <ol className="m-0 list-none p-0 text-sm leading-relaxed" aria-live="polite" aria-label="log">
      {lines.length === 0 && <li className="text-ink-3">{t('log.empty')}</li>}
      {lines.map((e, i) => {
        const vars = { ...e.vars };
        if (typeof vars.meter === 'string') vars.meter = t(`meter.${vars.meter}`);
        const status = toneStatus(e.tone);
        return (
          <li key={`${e.sol}-${e.key}-${i}`} className={`flex gap-2 border-b border-paper-3 py-1.5 ${e.tone === 'crit' ? 'font-semibold text-crit-text' : 'text-ink-2'}`}>
            <span className="num shrink-0 text-ink-3">S{String(e.sol).padStart(2, '0')}</span>
            <span className="w-4 shrink-0">{status && <StatusGlyph status={status} />}</span>
            <span>{t(e.key, vars)}</span>
          </li>
        );
      })}
    </ol>
  );
}
