import { Moon, Sun } from 'lucide-react';
import { Suspense, lazy, useEffect, useState } from 'react';
import { DemoBar, useDemoRunner } from './components/Demo';
import { Splash } from './components/Splash';
import { ICON } from './components/ui';
import { useT, type Lang } from './i18n';
import { href, useRoute, type RouteName } from './router';
import { useGame, useSettings } from './store';

const SCREENS: Record<RouteName, React.LazyExoticComponent<React.ComponentType<{ param: string | null }>>> = {
  brief: lazy(() => import('./screens/Brief')),
  console: lazy(() => import('./screens/Console')),
  report: lazy(() => import('./screens/Report')),
  tutorial: lazy(() => import('./screens/Tutorial')),
  data: lazy(() => import('./screens/RealData')),
  about: lazy(() => import('./screens/About')),
};

const NAV: RouteName[] = ['brief', 'tutorial', 'data', 'about'];
const LANGS: Lang[] = ['en', 'ru'];
const NAV_KEY: Record<string, string> = { brief: 'play', tutorial: 'tutorial', data: 'data', about: 'about' };

function Header({ current }: { current: RouteName }) {
  const t = useT();
  const { lang, theme, set } = useSettings();
  const active: RouteName = current === 'console' || current === 'report' ? 'brief' : current;
  return (
    <header className="border-b border-paper-3 bg-bar text-bar-fg">
      <div className="mx-auto flex max-w-[960px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <a href={href('brief')} className="no-underline">
          <span className="block text-lg font-extrabold tracking-[0.14em] text-accent-text">{t('app.name')}</span>
          <span className="block text-xs opacity-75">{t('app.sub')}</span>
        </a>
        <nav aria-label={t('nav.label')} className="order-3 w-full sm:order-none sm:ml-auto sm:w-auto">
          <ul className="m-0 flex list-none gap-1 rounded-full bg-paper p-1">
            {NAV.map((n) => (
              <li key={n} className="flex-1 sm:flex-none">
                <a href={href(n)} aria-current={active === n ? 'page' : undefined} className={`flex min-h-[40px] items-center justify-center rounded-full px-4 text-sm font-bold no-underline transition-colors ${active === n ? 'bg-accent text-accent-on' : 'text-ink-2 hover:text-accent-text'}`}>
                  {t(`nav.${NAV_KEY[n]}`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          <div className="flex rounded-full bg-paper p-1" role="group" aria-label={t('app.lang')}>
            {LANGS.map((l) => (
              <button key={l} type="button" aria-pressed={lang === l} onClick={() => set({ lang: l })} className={`min-h-[32px] rounded-full px-2.5 text-xs font-bold uppercase ${lang === l ? 'bg-accent text-accent-on' : 'text-ink-2'}`}>
                {l}
              </button>
            ))}
          </div>
          <button type="button" aria-pressed={theme === 'dark'} aria-label={t('app.theme')} title={t(theme === 'dark' ? 'app.themeOn' : 'app.themeOff')} onClick={() => set({ theme: theme === 'dark' ? 'light' : 'dark' })} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-paper-3 hover:border-accent">
            {theme === 'dark' ? <Sun {...ICON} aria-hidden /> : <Moon {...ICON} aria-hidden />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const t = useT();
  const route = useRoute();
  const { lang, theme } = useSettings();
  const demo = useGame((s) => s.demo);
  useDemoRunner();
  const [splash, setSplash] = useState(() => {
    try {
      return !sessionStorage.getItem('jamt.splash');
    } catch {
      return true;
    }
  });
  const dismissSplash = () => {
    try {
      sessionStorage.setItem('jamt.splash', '1');
    } catch {
      /* ignore */
    }
    setSplash(false);
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = lang;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#141A36' : '#FFFFFF');
  }, [theme, lang]);

  const Screen = SCREENS[route.name];
  return (
    <div className={`grain flex min-h-screen flex-col ${demo ? 'pb-24' : ''}`}>
      {splash && <Splash onDone={dismissSplash} />}
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-paper focus:px-3 focus:py-2 focus:text-ink">
        {t('app.skip')}
      </a>
      <Header current={route.name} />
      <main id="main" className="flex-1" tabIndex={-1}>
        <Suspense fallback={<p className="p-6 text-sm text-ink-3">{t('app.loading')}</p>}>
          <Screen param={route.param} />
        </Suspense>
      </main>
      <footer className="border-t border-paper-3 px-4 py-4 text-xs text-ink-3 sm:px-6">
        <div className="mx-auto flex max-w-[960px] flex-col gap-1 sm:flex-row sm:justify-between">
          <p>{t('app.disclaimer')}</p>
          <p>{t('app.footer')}</p>
        </div>
      </footer>
      <DemoBar />
    </div>
  );
}
