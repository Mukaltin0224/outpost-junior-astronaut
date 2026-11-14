// Live space weather from NASA DONKI (Space Weather Database Of Notifications,
// Knowledge, Information). We pull real recent solar flares and use them as the
// game's solar storms. If the network or the API is unavailable we fall back to a
// small archive of real historic flares embedded in nasa.json. We never present
// archive data as live.
//
// Note: NASA's dedicated /DONKI/FLR endpoint currently returns 404, so we read real
// flares from the /DONKI/notifications feed (type=FLR) instead, which caps each
// query at 60 days — we step back in 60-day windows until we find recent flares.
import nasa from '../data/nasa.json';

export interface Flare {
  class: string; // e.g. "X1.6"
  date: string; // YYYY-MM-DD
  region: string; // active region, e.g. "AR3664", or "—"
  note?: string;
  live: boolean; // true = fetched now from DONKI, false = embedded archive
}

const DONKI_NOTIF = 'https://api.nasa.gov/DONKI/notifications';
// Your own free key from https://api.nasa.gov (set VITE_NASA_API_KEY in .env) gives
// reliable live data. DEMO_KEY is NASA's shared key and is heavily rate-limited.
const API_KEY = (import.meta.env?.VITE_NASA_API_KEY as string | undefined) || 'DEMO_KEY';

/** Strength score so we can pick the most dramatic flares: C=1, M=2, X=3 decade + magnitude. */
export function flareScore(cls: string): number {
  const m = /^([CMX])\s*([\d.]+)?/i.exec(cls.trim());
  if (!m) return 0;
  const decade = { C: 1, M: 2, X: 3 }[m[1].toUpperCase() as 'C' | 'M' | 'X'] ?? 0;
  return decade * 100 + (parseFloat(m[2] || '0') || 0);
}

/** Extra radiation dose (mSv) a flare would add to an unshielded outpost — game model. */
export function flareDose(cls: string): number {
  const m = /^([CMX])\s*([\d.]+)?/i.exec(cls.trim());
  if (!m) return 2;
  const mag = parseFloat(m[2] || '1') || 1;
  const base = { C: 0.6, M: 1.6, X: 4 }[m[1].toUpperCase() as 'C' | 'M' | 'X'] ?? 1;
  return Math.min(18, base * Math.max(1, Math.min(mag, 3)));
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

export function archiveFlares(): Flare[] {
  return (nasa.flareArchive as Omit<Flare, 'live'>[]).map((f) => ({ ...f, live: false }));
}

interface Notification {
  messageIssueTime?: string;
  messageBody?: string;
}

/** Pull real flares out of DONKI flare notifications (M/X class only). */
function parseNotifications(items: Notification[]): Flare[] {
  const seen = new Set<string>();
  const out: Flare[] = [];
  for (const n of items) {
    const body = n.messageBody ?? '';
    const cls = body.match(/-\s*([CMX]\d(?:\.\d)?)\s*Flare/i)?.[1];
    if (!cls) continue;
    const ar = body.match(/Active Region Number:?\s*(\d+)/i)?.[1];
    const date = (n.messageIssueTime ?? '').slice(0, 10);
    const key = `${cls}-${date}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ class: cls.toUpperCase(), date, region: ar ? `AR${ar}` : '—', live: true });
  }
  return out.filter((f) => flareScore(f.class) >= 200); // M and X class only
}

/**
 * Fetch the strongest `count` real flares. Steps back in 60-day windows (the API's
 * limit) from today until it finds flares, then resolves to live flares. On any
 * failure, empty result, or timeout, resolves to the embedded real-flare archive.
 */
export async function fetchFlares(count = 4, windows = 8): Promise<Flare[]> {
  const fallback = archiveFlares().sort((a, b) => flareScore(b.class) - flareScore(a.class)).slice(0, count);
  if (typeof fetch !== 'function') return fallback;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const now = Date.now();
    const collected: Flare[] = [];
    for (let i = 0; i < windows; i++) {
      const end = new Date(now - i * 60 * 86400000);
      const start = new Date(end.getTime() - 59 * 86400000);
      const url = `${DONKI_NOTIF}?startDate=${iso(start)}&endDate=${iso(end)}&type=FLR&api_key=${API_KEY}`;
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) continue;
      const data = (await res.json()) as Notification[];
      if (!Array.isArray(data)) continue;
      collected.push(...parseNotifications(data));
      if (collected.length >= count) break;
    }
    if (collected.length === 0) return fallback;
    collected.sort((a, b) => flareScore(b.class) - flareScore(a.class));
    return collected.slice(0, count);
  } catch {
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}
