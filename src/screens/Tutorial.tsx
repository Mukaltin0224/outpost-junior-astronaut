import { ArrowLeftRight, ChevronLeft, ChevronRight, FlaskConical, Minus, Play, Plus, Rocket, Shield, Sun, Zap } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { MeterRow } from '../components/Meters';
import { OrbitBadge } from '../components/Retro';
import { ICON, Page, StatusGlyph } from '../components/ui';
import { useT } from '../i18n';
import { navigate } from '../router';

const STEPS = ['s1', 's2', 's3', 's4', 's5', 's6'] as const;

export default function Tutorial() {
  const t = useT();
  const [i, setI] = useState(0);
  const total = STEPS.length;
  const last = i === total - 1;
  const key = STEPS[i];

  const finish = () => {
    navigate('brief');
    setTimeout(() => document.getElementById('bases')?.scrollIntoView({ behavior: 'smooth' }), 120);
  };

  return (
    <Page>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b-2 border-paper-3 pb-4">
        <div>
          <p className="label text-accent-text">{t('tutorial.doc')}</p>
          <h1 className="mt-1 text-xl sm:text-2xl">{t('tutorial.title')}</h1>
          <p className="mt-1 text-ink-2">{t('tutorial.lead')}</p>
        </div>
        <button type="button" className="link text-sm" onClick={finish}>
          {t('tutorial.skip')} →
        </button>
      </header>

      {/* progress dots */}
      <div className="mb-5 flex items-center gap-2" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={i + 1} aria-label={t('tutorial.step', { n: i + 1, total })}>
        {STEPS.map((s, n) => (
          <button key={s} type="button" aria-label={t('tutorial.step', { n: n + 1, total })} onClick={() => setI(n)} className={`h-2.5 rounded-full border-2 border-ink transition-all ${n === i ? 'w-8 bg-accent' : n < i ? 'w-2.5 bg-ink' : 'w-2.5 bg-paper'}`} />
        ))}
      </div>

      {/* step card — re-animates on change via key */}
      <article key={key} className="card animate-popin grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_1.1fr] md:items-center">
        <div className="order-2 md:order-1">
          <p className="num text-sm font-bold text-accent-text">{t('tutorial.step', { n: i + 1, total })}</p>
          <h2 className="mt-1 text-xl sm:text-2xl">{t(`tutorial.${key}t`)}</h2>
          <p className="mt-3 text-lg text-ink-2">{t(`tutorial.${key}b`)}</p>
        </div>
        <div className="order-1 flex min-h-[200px] items-center justify-center rounded-md border-2 border-ink bg-ink/5 p-5 md:order-2">
          <Visual step={i} />
        </div>
      </article>

      {/* nav */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button type="button" className="btn" disabled={i === 0} onClick={() => setI((n) => Math.max(0, n - 1))}>
          <ChevronLeft {...ICON} aria-hidden />
          {t('tutorial.prev')}
        </button>
        {last ? (
          <button type="button" className="btn btn-primary" onClick={finish}>
            <Play size={16} strokeWidth={2.5} aria-hidden />
            {t('tutorial.start')}
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => setI((n) => Math.min(total - 1, n + 1))}>
            {t('tutorial.next')}
            <ChevronRight {...ICON} aria-hidden />
          </button>
        )}
      </div>
    </Page>
  );
}

function Visual({ step }: { step: number }) {
  const t = useT();
  if (step === 0) return <div className="motion-safe:animate-floaty"><OrbitBadge size={140} /></div>;

  if (step === 1)
    return (
      <div className="w-full max-w-[260px] space-y-1">
        <MeterRow id="life" value={70} />
        <MeterRow id="shield" value={26} />
        <MeterRow id="food" value={78} />
      </div>
    );

  if (step === 2)
    return (
      <div className="w-full max-w-[280px]">
        <div className="mb-4 flex items-center gap-2">
          <Zap size={18} className="text-accent-text" aria-hidden />
          <span className="flex flex-1 gap-1" aria-hidden>
            {Array.from({ length: 8 }, (_, k) => (
              <span key={k} className={`h-3 flex-1 rounded-full ${k < 5 ? 'bg-accent' : 'bg-paper-3'}`} />
            ))}
          </span>
        </div>
        <div className="flex items-center gap-3 rounded-md border-2 border-paper-3 bg-paper-2 p-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent-text" aria-hidden>
            <Shield size={18} strokeWidth={2} />
          </span>
          <span className="flex-1 font-bold">{t('need.shield')}</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-paper-3" aria-hidden>
            <Minus {...ICON} />
          </span>
          <span className="num w-5 text-center text-lg font-bold">2</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-accent text-accent-on motion-safe:animate-twinkle" aria-hidden>
            <Plus {...ICON} />
          </span>
        </div>
      </div>
    );

  if (step === 3)
    return (
      <div className="flex items-center gap-4" aria-hidden>
        <Badge icon={<Shield size={22} strokeWidth={2} />} label={t('need.shield')} up />
        <ArrowLeftRight size={28} className="text-accent-text" />
        <Badge icon={<FlaskConical size={22} strokeWidth={2} />} label={t('need.science')} />
      </div>
    );

  if (step === 4)
    return (
      <div className="w-full max-w-[300px] rounded-md border-2 border-crit/50 bg-crit/10 p-4" aria-hidden>
        <p className="flex items-center gap-2 font-bold text-crit-text">
          <Sun {...ICON} /> {t('hazard.flare')} — X1.6
        </p>
        <p className="mt-1 text-sm text-ink-2">{t('hazard.flareTip', { cls: 'X1.6' })}</p>
        <p className="num mt-2 text-xs font-bold text-accent-text">▸ {t('need.shield')} ↑↑↑</p>
      </div>
    );

  // step 5
  return (
    <div className="flex flex-col items-center gap-3" aria-hidden>
      <span className="inline-flex min-h-[52px] items-center gap-2 rounded-md border-2 border-ink bg-accent px-6 text-base font-bold uppercase tracking-wide text-accent-on shadow-hard motion-safe:animate-floaty">
        {t('game.next')}
      </span>
      <Rocket size={28} className="text-accent-text" />
    </div>
  );
}

function Badge({ icon, label, up }: { icon: ReactNode; label: string; up?: boolean }) {
  return (
    <span className="flex w-24 flex-col items-center gap-1 rounded-md border-2 border-ink bg-paper-2 p-3 text-center">
      <span className={`flex h-10 w-10 items-center justify-center rounded-full ${up ? 'bg-ok text-white' : 'bg-paper-3 text-ink-2'}`}>{icon}</span>
      <span className="text-xs font-bold">{label}</span>
      <span className={up ? 'text-ok-text' : 'text-ink-3'}>{up ? <StatusGlyph status="ok" /> : '—'}</span>
    </span>
  );
}
