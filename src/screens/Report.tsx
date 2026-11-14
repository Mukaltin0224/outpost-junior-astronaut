import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MeterRow } from '../components/Meters';
import { SourceChips } from '../components/SourceChip';
import { Page, SectionHead, StatusGlyph, statusText, toneStatus } from '../components/ui';
import { fmt, useLang, useT } from '../i18n';
import { href, navigate } from '../router';
import sourcesData from '../data/sources.json';
import { judge, keyMoments } from '../sim/model';
import { METERS, type Outcome } from '../sim/types';
import { useGame } from '../store';
import { useColors } from '../theme';

const sourceById = Object.fromEntries(sourcesData.sources.map((s) => [s.id, s]));

const OUTCOME_STATUS: Record<Outcome, 'ok' | 'warn' | 'crit'> = { success: 'ok', partial: 'warn', failed: 'crit' };
const RULE: Record<Outcome, string> = { success: 'border-ok', partial: 'border-warn', failed: 'border-crit' };

export default function Report() {
  const t = useT();
  const lang = useLang();
  const c = useColors();
  const { game, start } = useGame();

  const data = useMemo(() => {
    if (!game || game.status === 'running') return null;
    return {
      report: judge(game),
      moments: keyMoments(game),
      chart: game.history.map((h) => ({ sol: h.sol, life: Math.round(h.meters.life), shield: Math.round(h.meters.shield), food: Math.round(h.meters.food), health: Math.round(h.meters.health) })),
    };
  }, [game]);

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
  const { report, moments, chart } = data;
  const st = OUTCOME_STATUS[report.outcome];

  return (
    <Page>
      <header className={`mb-6 border-l-8 ${RULE[report.outcome]} pl-4`}>
        <p className="label">{t('report.doc')} · {t(`site.${game.site}`)}</p>
        <h1 className={`mt-1 flex items-center gap-3 text-xl sm:text-2xl ${statusText(st)}`}>
          <StatusGlyph status={st} />
          {t(`outcome.${report.outcome}`)}
        </h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <section aria-labelledby="r-why" className="mb-8">
            <SectionHead id="r-why">{t('outcome.why')}</SectionHead>
            <ul className="m-0 list-none p-0">
              {report.reasons.map((r) => {
                const s = toneStatus(r.tone) ?? 'ok';
                const vars = { ...r.vars };
                if (typeof vars.meter === 'string') vars.meter = t(`meter.${vars.meter}`);
                return (
                  <li key={r.key} className="flex gap-2 border-b border-paper-3 py-2">
                    <StatusGlyph status={s} label={t(`meter.${s}`)} />
                    <span className={r.tone === 'crit' ? 'font-semibold' : ''}>{t(r.key, vars)}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="r-key" className="mb-8">
            <SectionHead id="r-key">{t('report.key')}</SectionHead>
            {moments.length === 0 && <p className="text-ink-2">{t('report.noKey')}</p>}
            <ol className="m-0 grid list-none gap-2 p-0">
              {moments.map((m, i) => {
                const s = toneStatus(m.tone) ?? 'ok';
                const vars = { ...m.vars };
                if (typeof vars.meter === 'string') vars.meter = t(`meter.${vars.meter}`);
                return (
                  <li key={m.key + i} className="card flex gap-3 p-3">
                    <StatusGlyph status={s} label={t(`meter.${s}`)} />
                    <span>{t(m.key, vars)}</span>
                  </li>
                );
              })}
            </ol>
          </section>

          <section aria-labelledby="r-chart">
            <SectionHead id="r-chart">{t('report.chart')}</SectionHead>
            <div className="h-56 w-full" role="img" aria-label={t('report.chart')}>
              <ResponsiveContainer>
                <LineChart data={chart} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid stroke={c.line} vertical={false} />
                  <XAxis dataKey="sol" tick={{ fill: c.ink3, fontSize: 12 }} stroke={c.ink3} tickLine={false} />
                  <YAxis domain={[0, 100]} ticks={[0, 25, 50, 100]} tick={{ fill: c.ink3, fontSize: 12 }} stroke={c.ink3} tickLine={false} />
                  <Tooltip contentStyle={{ background: c.paper, border: `1px solid ${c.ink}`, borderRadius: 10, fontSize: 12, color: c.ink }} labelFormatter={(v) => `${t('term.sol')} ${v}`} />
                  <Line dataKey="life" name={t('meter.life')} stroke={c.muscle} strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  <Line dataKey="shield" name={t('meter.shield')} stroke={c.accent} strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  <Line dataKey="food" name={t('meter.food')} stroke={c.bone} strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  <Line dataKey="health" name={t('meter.health')} stroke={c.heart} strokeWidth={2.5} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <aside className="lg:col-span-5">
          <section aria-labelledby="r-data" className="card mb-6 p-4">
            <SectionHead id="r-data">{t('report.dataUsed')}</SectionHead>
            <ul className="m-0 list-none p-0 text-sm">
              {report.dataUsed.map((id) => (
                <li key={id} className="flex items-start gap-2 border-b border-paper-3 py-1.5">
                  <SourceChips ids={[id]} />
                  <a className="link" href={href('data', id)}>
                    {sourceById[id]?.title ?? id}
                  </a>
                </li>
              ))}
            </ul>
            <a className="link mt-2 inline-block text-sm" href={href('data')}>
              {t('nav.data')} →
            </a>
          </section>

          <section aria-labelledby="r-meters" className="mb-6">
            <SectionHead id="r-meters">{t('report.meters')}</SectionHead>
            {METERS.map((m) => (
              <MeterRow key={m} id={m} value={game.meters[m]} />
            ))}
          </section>

          <section aria-labelledby="r-final" className="mb-6">
            <SectionHead id="r-final">{t('report.final')}</SectionHead>
            <dl className="grid grid-cols-[1fr_auto] gap-x-4 text-sm">
              {(
                [
                  [t('meter.science'), `${Math.round(game.science)} / ${fmt(game.scienceGoal, lang)}`],
                  [t('game.dose'), `${Math.round(game.dose)} / ${game.doseLimit} mSv`],
                  [t('term.sol'), `${game.sol} / ${game.totalSols}`],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="col-span-2 grid grid-cols-subgrid border-b border-paper-3 py-1.5">
                  <dt className="text-ink-2">{k}</dt>
                  <dd className="num m-0 text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={async () => {
                await start(game.site);
                navigate('console');
              }}
            >
              {t('report.again')}
            </button>
            <a className="btn no-underline" href={href('brief')}>
              {t('report.change')}
            </a>
          </div>
        </aside>
      </div>
    </Page>
  );
}
