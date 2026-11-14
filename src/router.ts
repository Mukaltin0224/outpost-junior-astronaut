import { useSyncExternalStore } from 'react';

export type RouteName = 'brief' | 'console' | 'report' | 'tutorial' | 'data' | 'about';
const NAMES: RouteName[] = ['brief', 'console', 'report', 'tutorial', 'data', 'about'];

export interface Route {
  name: RouteName;
  param: string | null;
}

function parse(hash: string): Route {
  const [, name, param] = hash.replace(/^#/, '').split('/');
  return { name: NAMES.includes(name as RouteName) ? (name as RouteName) : 'brief', param: param ? decodeURIComponent(param) : null };
}

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
};

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash);
  return parse(hash);
}

export function href(name: RouteName, param?: string): string {
  return `#/${name}${param ? `/${encodeURIComponent(param)}` : ''}`;
}

export function navigate(name: RouteName, param?: string): void {
  window.location.hash = href(name, param);
  window.scrollTo({ top: 0 });
}
