import { NEED_ICON } from '../components/AllocBoard';
import { DocHead, Page, SectionHead } from '../components/ui';
import { useT } from '../i18n';
import { href } from '../router';
import { NEEDS } from '../sim/types';

const TERMS = ['sol', 'dose', 'shieldTerm', 'microgravity'] as const;
const TERM_DEF: Record<(typeof TERMS)[number], string> = { sol: 'solDef', dose: 'doseDef', shieldTerm: 'shieldDef', microgravity: 'microDef' };

export default function About() {
  const t = useT();
  return (
    <Page>
      <DocHead doc="HOW TO PLAY" title={t('nav.about')} lead={t('app.tagline')} />

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="a-how">
          <SectionHead id="a-how">{t('home.how')}</SectionHead>
          <ol className="m-0 list-none p-0">
            {[1, 2, 3].map((n) => (
              <li key={n} className="flex items-start gap-3 border-b border-paper-3 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-accent-on">{n}</span>
                <span className="pt-1 font-semibold">{t(`home.step${n}`)}</span>
              </li>
            ))}
          </ol>

          <h3 className="label mb-2 mt-6">{t('game.split')}</h3>
          <ul className="m-0 list-none p-0">
            {NEEDS.map((n) => {
              const Icon = NEED_ICON[n];
              return (
                <li key={n} className="flex items-center gap-3 border-b border-paper-3 py-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-text" aria-hidden>
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  <span>
                    <span className="font-bold">{t(`need.${n}`)}.</span> <span className="text-ink-2">{t(`need.${n}Tip`)}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <a className="btn btn-primary mt-6 inline-flex no-underline" href={href('brief')}>
            {t('nav.play')}
          </a>
        </section>

        <section aria-labelledby="a-words">
          <SectionHead id="a-words">Space words</SectionHead>
          <dl className="m-0">
            {TERMS.map((term) => (
              <div key={term} className="border-b border-paper-3 py-3">
                <dt className="font-bold">{t(`term.${term}`)}</dt>
                <dd className="m-0 mt-0.5 text-ink-2">{t(`term.${TERM_DEF[term]}`)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 rounded-md bg-accent-soft p-4 text-sm text-ink-2">{t('data.lead')}</p>
          <a className="link mt-3 inline-block text-sm" href={href('data')}>
            {t('nav.data')} →
          </a>
        </section>
      </div>
    </Page>
  );
}
