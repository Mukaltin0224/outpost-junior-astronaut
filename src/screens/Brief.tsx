import { ArrowRight, ChevronDown, Loader2, Play, Radio } from 'lucide-react';
import { OrbitBadge, Reveal, Starfield } from '../components/Retro';
import { ICON } from '../components/ui';
import { useT } from '../i18n';
import { navigate } from '../router';
import { siteOf } from '../sim/model';
import type { SiteId } from '../sim/types';
import { siteList, useGame } from '../store';

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export default function Brief() {
  const t = useT();
  const { game, loading, start, startDemo } = useGame();
  const running = game && game.status === 'running' && game.sol < game.totalSols && !game.fail;
  const go = async (site: SiteId) => {
    await start(site);
    navigate('console');
  };

  return (
    <div>
      {/* ---------- HERO ---------- */}
      <section className="relative flex min-h-[86vh] flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
        <Starfield dense className="opacity-80" />
        <div className="relative motion-safe:animate-floaty">
          <OrbitBadge size={168} />
        </div>
        <p className="relative mt-6 label text-accent-text">Mission control · est. 2026</p>
        <h1 className="relative mt-2 text-2xl font-bold uppercase tracking-[0.14em] text-accent-text sm:text-3xl" style={{ textShadow: '3px 3px 0 rgb(var(--ink) / 0.25)' }}>
          OUTPOST
        </h1>
        <p className="relative mt-1 text-sm uppercase tracking-[0.2em] text-ink-2">{t('app.sub')}</p>
        <p className="relative mx-auto mt-5 max-w-[48ch] text-lg text-ink-2">{t('app.tagline')}</p>
        <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
          {running ? (
            <button type="button" className="btn btn-primary" onClick={() => navigate('console')}>
              {t('site.resume', { sol: game.sol + 1 })}
              <ArrowRight {...ICON} aria-hidden />
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => scrollTo('bases')}>
              {t('home.heroStart')}
              <ArrowRight {...ICON} aria-hidden />
            </button>
          )}
          <a className="btn no-underline" href="#/tutorial">
            {t('nav.tutorial')}
          </a>
        </div>
        <button type="button" onClick={() => scrollTo('idea')} className="relative mt-12 flex flex-col items-center gap-1 text-xs uppercase tracking-[0.2em] text-ink-3" aria-label={t('home.scroll')}>
          {t('home.scroll')}
          <ChevronDown size={18} className="motion-safe:animate-bounce" aria-hidden />
        </button>
      </section>

      {/* ---------- IDEA ---------- */}
      <section id="idea" className="mx-auto max-w-[920px] px-4 py-16 sm:px-6">
        <Reveal className="grid items-center gap-8 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="label text-accent-text">01 — The job</p>
            <h2 className="mt-2 text-xl sm:text-2xl">{t('home.ideaTitle')}</h2>
            <p className="mt-3 text-lg text-ink-2">{t('home.ideaBody')}</p>
          </div>
          <div className="card flex items-center justify-center bg-ink p-8">
            <Sunburst />
          </div>
        </Reveal>
      </section>

      {/* ---------- BASES ---------- */}
      <section id="bases" className="relative mx-auto max-w-[960px] px-4 py-16 sm:px-6">
        <Reveal>
          <p className="label text-accent-text">02 — {t('site.choose')}</p>
          <h2 className="mt-2 text-xl sm:text-2xl">{t('site.pick')}</h2>
        </Reveal>
        {loading && (
          <p className="mt-4 flex items-center gap-2 text-sm font-bold text-accent-text" role="status">
            <Loader2 size={16} className="animate-spin" aria-hidden />
            {t('app.loading')}
          </p>
        )}
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {siteList().map((id, i) => {
            const s = siteOf(id);
            const first = id === 'moon';
            return (
              <Reveal key={id} as="div" delay={i * 120}>
                <button type="button" disabled={loading} onClick={() => go(id)} className={`card group flex h-full w-full flex-col p-6 text-left transition-transform hover:-translate-y-1 disabled:opacity-60 ${first ? 'ring-2 ring-accent ring-offset-2 ring-offset-paper' : ''}`}>
                  <span className="flex items-center justify-between">
                    <span className="label text-ink-3">{s.code}</span>
                    {first && <span className="chip">{t('site.startHere')}</span>}
                  </span>
                  <span className="mt-2 text-2xl font-bold">{t(`site.${id}`)}</span>
                  <span className="num mt-1 text-sm font-bold text-accent-text">{t('site.sols', { n: s.totalSols })}</span>
                  <span className="mt-3 flex-1 text-ink-2">{t(`site.${id}Desc`)}</span>
                  <span className="mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border-2 border-ink bg-accent px-4 text-sm font-bold uppercase tracking-wide text-accent-on shadow-hard transition-transform group-hover:translate-x-1">
                    {t('site.go')}
                    <ArrowRight {...ICON} aria-hidden />
                  </span>
                </button>
              </Reveal>
            );
          })}
        </div>
        <Reveal delay={200}>
          <p className="mt-6 flex flex-wrap items-center gap-3 text-sm text-ink-2">
            <button type="button" className="btn btn-sm" onClick={startDemo} disabled={loading}>
              <Play size={14} strokeWidth={2} aria-hidden />
              {t('home.demo')}
            </button>
            {t('home.demoHint')}
          </p>
        </Reveal>
      </section>

      {/* ---------- REAL DATA ---------- */}
      <section className="relative overflow-hidden border-y-2 border-ink bg-ink py-16 text-paper">
        <Starfield className="opacity-40" />
        <Reveal className="relative mx-auto max-w-[920px] px-4 sm:px-6">
          <p className="label text-gold">03 — NASA</p>
          <h2 className="mt-2 flex items-center gap-3 text-xl text-paper sm:text-2xl">
            <Radio className="text-gold" aria-hidden /> {t('home.dataTitle')}
          </h2>
          <p className="mt-3 max-w-[60ch] text-lg text-paper/80">{t('home.dataBody')}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {['DONKI', '0.64 mSv/day', '24 h 39 min', '3–22 min'].map((f) => (
              <span key={f} className="num rounded-full border-2 border-gold/60 px-3 py-1 text-sm font-bold text-gold">
                {f}
              </span>
            ))}
          </div>
          <a className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-md border-2 border-paper bg-transparent px-4 text-sm font-bold uppercase tracking-wide text-paper no-underline hover:bg-paper hover:text-ink" href="#/data">
            {t('nav.data')}
            <ArrowRight {...ICON} aria-hidden />
          </a>
        </Reveal>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="mx-auto max-w-[960px] px-4 py-16 sm:px-6">
        <Reveal>
          <p className="label text-accent-text">04 — {t('home.how')}</p>
        </Reveal>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((n, i) => (
            <Reveal key={n} as="div" delay={i * 120}>
              <div className="card h-full p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-gold text-lg font-extrabold text-ink">{n}</span>
                <p className="mt-3 font-bold">{t(`home.step${n}`)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="relative overflow-hidden px-4 py-20 text-center">
        <Starfield className="opacity-60" />
        <Reveal className="relative mx-auto max-w-[640px]">
          <h2 className="text-2xl sm:text-3xl">{t('home.readyTitle')}</h2>
          <p className="mt-3 text-lg text-ink-2">{t('home.readyBody')}</p>
          <button type="button" className="btn btn-primary mt-6" onClick={() => scrollTo('bases')}>
            {t('home.heroStart')}
            <ArrowRight {...ICON} aria-hidden />
          </button>
        </Reveal>
      </section>
    </div>
  );
}

function Sunburst() {
  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28" aria-hidden>
      {Array.from({ length: 24 }, (_, i) => (
        <line key={i} x1="60" y1="60" x2="60" y2="8" stroke="rgb(var(--gold))" strokeWidth="2" strokeLinecap="round" transform={`rotate(${i * 15} 60 60)`} opacity={i % 2 ? 0.4 : 0.85} />
      ))}
      <circle cx="60" cy="60" r="16" fill="rgb(var(--accent))" stroke="rgb(var(--paper))" strokeWidth="2" />
    </svg>
  );
}
