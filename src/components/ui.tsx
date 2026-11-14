import { CircleCheck, OctagonAlert, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Status } from '../sim/model';
import type { Tone } from '../sim/types';

export const ICON = { size: 16, strokeWidth: 1.5 } as const;

const STATUS_CLASS: Record<Status, string> = { ok: 'text-ok-text', warn: 'text-warn-text', crit: 'text-crit-text' };

/** Status is never colour alone: always an icon with a distinct shape. */
export function StatusGlyph({ status, label }: { status: Status; label?: string }) {
  const Icon = status === 'ok' ? CircleCheck : status === 'warn' ? TriangleAlert : OctagonAlert;
  return (
    <span className={`inline-flex shrink-0 ${STATUS_CLASS[status]}`} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <Icon {...ICON} />
    </span>
  );
}

export const toneStatus = (tone: Tone): Status | null => (tone === 'good' ? 'ok' : tone === 'warn' ? 'warn' : tone === 'crit' ? 'crit' : null);
export const statusText = (status: Status) => STATUS_CLASS[status];
export const statusFill: Record<Status, string> = { ok: 'bg-ok', warn: 'bg-warn', crit: 'bg-crit' };

/** Numbered section label with a rule, as in mission documents. */
export function SectionHead({ children, right, id }: { children: ReactNode; right?: ReactNode; id?: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <h2 id={id} className="label shrink-0">
        {children}
      </h2>
      <span className="h-px flex-1 bg-paper-3" aria-hidden />
      {right}
    </div>
  );
}

/** Page header for the document-style screens. */
export function DocHead({ doc, title, lead, children }: { doc: string; title: string; lead?: string; children?: ReactNode }) {
  return (
    <header className="mb-6 border-b border-paper-3 pb-4">
      <p className="label">{doc}</p>
      <h1 className="mt-1 text-xl sm:text-2xl">{title}</h1>
      {lead && <p className="mt-2 max-w-[64ch] text-ink-2">{lead}</p>}
      {children}
    </header>
  );
}

export function Page({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return <div className={`mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 ${wide ? 'max-w-[1440px]' : 'max-w-[1120px]'}`}>{children}</div>;
}

/** Horizontal bar with optional threshold ticks. Decorative: pair it with text or a meter role outside. */
export function Bar({ value, max = 100, fill = 'bg-accent', ticks = [], height = 'h-2.5' }: { value: number; max?: number; fill?: string; ticks?: number[]; height?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <span className={`relative block w-full overflow-hidden rounded-full bg-paper-3 ${height}`} aria-hidden>
      <span className={`meter-fill absolute inset-y-0 left-0 ${fill}`} style={{ width: `${pct}%` }} />
      {ticks.map((t) => (
        <span key={t} className="absolute inset-y-0 w-px bg-ink-3" style={{ left: `${(t / max) * 100}%` }} />
      ))}
    </span>
  );
}
