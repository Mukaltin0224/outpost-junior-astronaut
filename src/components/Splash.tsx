import { useEffect, useState } from 'react';
import { useT } from '../i18n';
import { OrbitBadge, Starfield } from './Retro';

const BOOT = ['boot1', 'boot2', 'boot3'];

/** Full-screen retro intro shown once per browser session. Auto-dismisses; click/key to skip. */
export function Splash({ onDone }: { onDone: () => void }) {
  const t = useT();
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const stepMs = reduce ? 120 : 520;
    const timers = BOOT.map((_, i) => setTimeout(() => setStep(i + 1), stepMs * (i + 1)));
    const end = setTimeout(() => leave(), stepMs * (BOOT.length + 1) + 700);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(end);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const leave = () => {
    setLeaving(true);
    setTimeout(onDone, 520);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={t('splash.tap')}
      onClick={leave}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && leave()}
      className={`fixed inset-0 z-[60] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-[#0C1424] px-6 text-center text-[#F3E9D0] transition-opacity duration-500 ${leaving ? 'opacity-0' : 'opacity-100'}`}
    >
      <Starfield dense />
      <div className="relative motion-safe:animate-floaty">
        <OrbitBadge size={150} />
      </div>
      <h1 className="relative mt-6 text-3xl font-bold tracking-[0.18em] text-[#E2552D] sm:text-3xl" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.5)' }}>
        OUTPOST
      </h1>
      <p className="relative mt-1 text-sm uppercase tracking-[0.22em] opacity-80">{t('splash.sub')}</p>

      <ul className="relative mt-8 min-h-[92px] w-full max-w-[320px] space-y-1.5 text-left font-mono text-sm">
        {BOOT.map((k, i) => (
          <li key={k} className={`flex items-center justify-between gap-3 transition-opacity duration-300 ${step > i ? 'opacity-100' : 'opacity-0'}`}>
            <span className="opacity-80">{t(`splash.${k}`)}</span>
            <span className="font-bold text-[#46BEB4]">OK</span>
          </li>
        ))}
        <li className={`pt-1 font-bold text-[#E0A22E] transition-opacity duration-300 ${step >= BOOT.length ? 'opacity-100' : 'opacity-0'}`}>▸ {t('splash.ready')}</li>
      </ul>

      <p className="relative mt-8 text-xs uppercase tracking-[0.2em] opacity-60">{t('splash.tap')}</p>
    </div>
  );
}
