import { ArrowRight, CloudFog, Moon, Radio, Sun } from 'lucide-react';
import { useMemo } from 'react';
import { AllocBoard } from '../components/AllocBoard';
import { MeterRow, ScienceRow } from '../components/Meters';
import { MissionLog } from '../components/MissionLog';
import { DataBadge, SourceChip } from '../components/SourceChip';
import { Bar, ICON, Page, SectionHead, StatusGlyph } from '../components/ui';
import { fmt, useLang, useT } from '../i18n';
import { href, navigate } from '../router';
import { budgetForSol, forecast, hazardOn, siteOf } from '../sim/model';
import { METERS, type GameState, type Hazard } from '../sim/types';
import { useGame } from '../store';

function Live({ haz }: { haz: Hazard }) {
  const t = useT();
  return (
    <span className="inline-flex items-center gap-1">
      <SourceChip id="donki" />
      <span className="text-xs text-ink-3">· {t(haz.live ? 'hazard.liveTag' : 'hazard.archiveTag')}</span>
    </span>
  );
}

function Banner({ icon, tone, children }: { icon: React.ReactNode; tone: 'ok' | 'warn' | 'crit'; children: React.ReactNode }) {
  const bg = tone === 'crit' ? 'border-crit/40 bg-crit/10' : tone === 'warn' ? 'border-warn/40 bg-warn/10' : 'border-ok/40 bg-ok/10';
  return (
    <div className={`flex items-start gap-2 rounded-md border p-3 text-sm ${bg}`} role="status">
      <span className="mt-0.5 shrink-0 text-ink-2" aria-hidden>
        {icon}
      </span>
      <p className="min-w-0">{children}</p>
    </div>
  );
}

function HazardBanner({ game }: { game: GameState }) {
  const t = useT();
  const planSol = game.sol + 1;
  const here = hazardOn(game.hazards, planSol);
  const coming = game.hazards.find((h) => h.id === 'flare' && h.sol > planSol && h.sol <= planSol + 2);
  if (here?.id === 'flare')
    return (
      <Banner icon={<Sun {...ICON} />} tone="crit">
        <b>{t('hazard.flare')} — {here.label}.</b> {t('hazard.flareTip', { cls: here.label ?? 'X' })} <Live haz={here} />
      </Banner>
    );
  if (here?.id === 'dust')
    return (
      <Banner icon={<CloudFog {...ICON} />} tone="warn">
        <b>{t('hazard.dust')}.</b> {t('hazard.dustTip')} <SourceChip id="duststorm" />
      </Banner>
    );
  if (here?.id === 'night')
    return (
      <Banner icon={<Moon {...ICON} />} tone="warn">
        <b>{t('hazard.night')}.</b> {t('hazard.nightTip')} <SourceChip id="moonnight" />
      </Banner>
    );
  if (coming)
    return (
      <Banner icon={<Sun {...ICON} />} tone="warn">
        <b>{t('hazard.flareComing', { in: coming.sol - planSol, cls: coming.label ?? 'X' })}</b> <Live haz={coming} />
      </Banner>
    );
  return <Banner icon={<StatusGlyph status="ok" />} tone="ok">{t('game.nominal')}</Banner>;
}

function Comms({ game }: { game: GameState }) {
  const t = useT();
  const askHint = useGame((s) => s.askHint);
  const planSol = game.sol + 1;
  const stormNow = hazardOn(game.hazards, planSol)?.id === 'flare';
  const mars = game.site === 'mars';
  const tip = (() => {
    const f = game.hazards.some((h) => h.id === 'flare' && h.sol >= planSol && h.sol <= planSol + 1);
    if (f && game.meters.shield < 60) return t('game.tipShield');
    if (Math.min(game.meters.life, game.meters.food) < 40) return t('game.tipLife');
    return t('game.tipScience');
  })();
  return (
    <div className="rounded-md border border-paper-3 bg-paper-2 p-3">
      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
        <Radio size={16} strokeWidth={1.75} className="text-ink-2" aria-hidden />
        {mars ? t('game.commsMars', { min: Math.round(game.commsMin) }) : t('game.commsMoon')}
        <SourceChip id="comms" />
      </p>
      {game.status === 'running' && (
        <>
          <button type="button" className="btn btn-sm mt-2" onClick={askHint} disabled={game.hintAsked}>
            {t('game.askHint')}
          </button>
          {game.hintAsked && (
            <p className="mt-2 text-sm text-ink-2" aria-live="polite">
              {stormNow ? t('game.hintLost') : mars ? t('game.hintMars', { min: Math.round(game.commsMin) }) : t('game.hintMoon', { tip })}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default function Console() {
  const t = useT();
  const lang = useLang();
  const { game, nextSol, demo } = useGame();
  const data = useMemo(() => (game ? { fc: forecast(game) } : null), [game]);

  if (!game || !data) {
    return (
      <Page>
        <p className="mb-4 text-ink-2">{t('game.noGame')}</p>
        <a className="btn" href={href('brief')}>
          {t('game.goHome')}
        </a>
      </Page>
    );
  }
  const { fc } = data;
  const s = siteOf(game.site);
  const running = game.status === 'running';
  const planSol = Math.min(game.sol + 1, game.totalSols);
  const budget = budgetForSol(game, game.sol + 1);
  const doseStatus = game.dose > game.doseLimit ? 'crit' : game.dose > game.doseLimit * 0.75 ? 'warn' : 'ok';

  const nextBtn = running ? (
    <button type="button" className="btn btn-primary min-h-[52px] w-full text-base" disabled={!!demo} onClick={nextSol}>
      {t('game.next')}
    </button>
  ) : (
    <button type="button" className="btn btn-primary min-h-[52px] w-full text-base" disabled={!!demo} onClick={() => navigate('report')}>
      {t('game.toReport')}
      <ArrowRight {...ICON} aria-hidden />
    </button>
  );

  return (
    <>
      <Page>
        <header className="mb-4">
          <p className="label">
            {t(`site.${game.site}`)} · {s.code}
          </p>
          <h1 className="num mb-2 mt-1 text-xl">{t('game.solOf', { sol: planSol, total: game.totalSols })}</h1>
          <Bar value={game.sol} max={game.totalSols} height="h-3" />
        </header>

        <div className="mb-4">
          <HazardBanner game={game} />
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <section className="lg:col-span-2" aria-labelledby="h-status">
            <div className="card p-4">
              <SectionHead id="h-status" right={<DataBadge real={false} />}>
                {t('game.thisSol')}
              </SectionHead>
              {METERS.map((m) => (
                <MeterRow key={m} id={m} value={game.meters[m]} delta={running ? fc.meters[m] : undefined} />
              ))}
              <ScienceRow value={game.science} goal={game.scienceGoal} delta={running ? fc.science : undefined} />
              <div className="mt-2 grid grid-cols-[28px_1fr_auto] items-center gap-x-2 border-t border-paper-3 pt-2" role="meter" aria-valuemin={0} aria-valuemax={game.doseLimit} aria-valuenow={Math.round(game.dose)} aria-label={t('game.dose')}>
                <span className="text-center text-ink-2" aria-hidden>☢</span>
                <div className="min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold">{t('game.dose')}</span>
                    <span className="num text-sm font-bold">{t('game.doseOf', { dose: Math.round(game.dose), limit: game.doseLimit })}</span>
                  </div>
                  <Bar value={game.dose} max={game.doseLimit} fill={doseStatus === 'crit' ? 'bg-crit' : doseStatus === 'warn' ? 'bg-warn' : 'bg-ok'} />
                </div>
                <StatusGlyph status={doseStatus} />
              </div>
            </div>
            <div className="mt-4">
              <Comms game={game} />
            </div>
          </section>

          <section className="lg:col-span-3" aria-labelledby="h-split">
            <div className="card p-4">
              <SectionHead id="h-split" right={<span className="num text-sm text-ink-3">{fmt(budget, lang)} {t('need.unit')}</span>}>
                {t('game.split')}
              </SectionHead>
              <p className="mb-3 text-sm text-ink-3">{t('game.splitHint')}</p>
              <AllocBoard game={game} fc={fc} />
            </div>
            <div className="mt-4 hidden lg:block">{nextBtn}</div>
          </section>
        </div>

        <section className="mt-6" aria-labelledby="h-log">
          <SectionHead id="h-log">{t('app.name')}</SectionHead>
          <MissionLog log={game.log} max={8} />
        </section>
      </Page>
      {!demo && <div className="sticky bottom-0 z-30 border-t border-paper-3 bg-paper-2 p-3 lg:hidden">{nextBtn}</div>}
    </>
  );
}
