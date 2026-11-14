import { ExternalLink, Radio } from 'lucide-react';
import { useEffect } from 'react';
import { DataBadge } from '../components/SourceChip';
import { DocHead, Page, SectionHead } from '../components/ui';
import nasa from '../data/nasa.json';
import sources from '../data/sources.json';
import { useT } from '../i18n';

const real = sources.sources.filter((s) => s.real);

export default function RealData({ param }: { param: string | null }) {
  const t = useT();
  useEffect(() => {
    if (!param) return;
    const el = document.getElementById(param === 'model' ? 'model' : `src-${param}`);
    el?.scrollIntoView({ block: 'start' });
    el?.focus?.({ preventScroll: true });
  }, [param]);

  return (
    <Page>
      <DocHead doc={t('data.doc')} title={t('data.title')} lead={t('data.lead')} />

      <section aria-labelledby="d-live" className="mb-8 rounded-md border border-accent/40 bg-accent-soft p-4">
        <h2 id="d-live" className="mb-1 flex items-center gap-2 text-base font-bold text-accent-text">
          <Radio size={18} strokeWidth={2} aria-hidden />
          {t('data.live')}
        </h2>
        <p className="text-sm text-ink-2">{t('data.liveNote')}</p>
      </section>

      <section aria-labelledby="d-facts" className="mb-10">
        <SectionHead id="d-facts" right={<DataBadge real={true} />}>
          {t('data.facts')}
        </SectionHead>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink text-left">
                {(['fact', 'value', 'source'] as const).map((k) => (
                  <th key={k} scope="col" className="label py-1 pr-3 font-bold">
                    {t(`data.${k}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nasa.facts.map((f) => (
                <tr key={f.id} className="border-b border-paper-3 align-top">
                  <td className="py-2 pr-3">{t(`fact.${f.id}`)}</td>
                  <td className="num whitespace-nowrap py-2 pr-3 font-bold">{f.value}</td>
                  <td className="py-2">
                    <span className="flex flex-wrap gap-1">
                      {f.sources.map((sid) => {
                        const s = real.find((x) => x.id === sid);
                        return s ? (
                          <a key={sid} href={`#src-${sid}`} className="chip" title={s.title}>
                            NASA
                          </a>
                        ) : null;
                      })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="d-sets" className="mb-10">
        <SectionHead id="d-sets">{t('data.datasets')}</SectionHead>
        <ol className="m-0 list-none border-t border-ink p-0">
          {real.map((s) => (
            <li key={s.id} id={`src-${s.id}`} tabIndex={-1} className={`grid scroll-mt-4 grid-cols-[auto_1fr] gap-3 border-b border-paper-3 px-1 py-2 ${param === s.id ? 'bg-accent-soft' : ''}`}>
              <span className="num text-sm text-ink-3">{String(s.n).padStart(2, '0')}</span>
              <a className="link inline-flex items-start gap-1 break-words" href={s.url} target="_blank" rel="noopener noreferrer">
                <span>{s.title}</span>
                <ExternalLink size={14} strokeWidth={1.5} className="mt-1 shrink-0" aria-hidden />
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="model" id="model" tabIndex={-1} className="scroll-mt-4">
        <SectionHead id="model-h" right={<DataBadge real={false} />}>
          {t('data.modelNote')}
        </SectionHead>
        <ul className="m-0 list-none p-0 text-sm">
          {[1, 2, 3].map((n) => (
            <li key={n} className="flex gap-3 border-b border-paper-3 py-2">
              <span className="num text-ink-3">{String(n).padStart(2, '0')}</span>
              {t(`data.model${n}`)}
            </li>
          ))}
        </ul>
      </section>
    </Page>
  );
}
