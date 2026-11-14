import { useCallback } from 'react';
import { useSettings } from '../store';
import en from './en.json';
import ru from './ru.json';

export type Lang = 'en' | 'ru';
export type Vars = Record<string, string | number>;
export type T = (key: string, vars?: Vars) => string;

const dict: Record<Lang, unknown> = { en, ru };

function lookup(obj: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj);
}

/** Raw dictionary value (string or array), falling back to English. */
export function raw(lang: Lang, key: string): unknown {
  return lookup(dict[lang], key) ?? lookup(en, key);
}

export function translate(lang: Lang, key: string, vars?: Vars): string {
  const v = raw(lang, key);
  if (typeof v !== 'string') return key;
  return v.replace(/\{(\w+)\}/g, (_, k: string) => (vars && k in vars ? String(vars[k]) : `{${k}}`));
}

export function useT(): T {
  const lang = useSettings((s) => s.lang);
  return useCallback((key: string, vars?: Vars) => translate(lang, key, vars), [lang]);
}

export function useLang(): Lang {
  return useSettings((s) => s.lang);
}

/** Locale number format: 1,234 in EN, 1 234 in RU. */
export function fmt(n: number, lang: Lang, digits = 0): string {
  return new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n);
}

/** Signed number with a real minus sign. */
export function signed(n: number, lang: Lang, digits = 1): string {
  const r = Math.abs(n) < 0.05 && digits <= 1 ? 0 : n;
  const s = fmt(Math.abs(r), lang, digits);
  return r > 0 ? `+${s}` : r < 0 ? `−${s}` : s;
}
