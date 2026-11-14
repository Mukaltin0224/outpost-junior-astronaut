import sources from '../data/sources.json';
import { useT } from '../i18n';
import { href } from '../router';

const byId = Object.fromEntries(sources.sources.map((s) => [s.id, s]));

/** Small numbered link to a dataset on the Real Data page. */
export function SourceChip({ id }: { id: string }) {
  const t = useT();
  const s = byId[id];
  if (!s || s.id === 'model') return null;
  return (
    <a className="chip" href={href('data', id)} title={s.title} aria-label={`${t('app.source')}: ${s.title}`}>
      NASA
    </a>
  );
}

export function SourceChips({ ids }: { ids: string[] }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {ids.filter((id) => id !== 'model').map((id) => (
        <SourceChip key={id} id={id} />
      ))}
    </span>
  );
}

/** Badge marking a value as real NASA data or a simplified game number. */
export function DataBadge({ real }: { real: boolean }) {
  const t = useT();
  if (real) return <span className="inline-flex items-center rounded-full bg-ok/15 px-2 text-xs font-bold text-ok-text">{t('app.real')}</span>;
  return (
    <a href={href('data', 'model')} className="inline-flex items-center rounded-full bg-paper-3 px-2 text-xs font-semibold text-ink-3 no-underline" title={t('app.disclaimer')}>
      {t('app.model')}
    </a>
  );
}
