import { useEffect, useRef, type ReactNode } from 'react';

/** Deterministic little PRNG so the starfield is stable between renders. */
function stars(n: number, seed: number) {
  let a = seed;
  const rnd = () => ((a = (a * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  return Array.from({ length: n }, () => ({ x: rnd() * 100, y: rnd() * 100, r: 0.6 + rnd() * 1.6, d: (rnd() * 3).toFixed(2) }));
}

/** Decorative twinkling starfield + a slow orbiting planet. Hidden from screen readers. */
export function Starfield({ className = '', dense = false }: { className?: string; dense?: boolean }) {
  const pts = stars(dense ? 70 : 38, 1337);
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <svg className="h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 100 100">
        {pts.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r / 4} fill="rgb(var(--star))" className="animate-twinkle" style={{ animationDelay: `${s.d}s` }} />
        ))}
      </svg>
    </div>
  );
}

/** A retro orbit ring with a planet that slowly circles — the hero motif. */
export function OrbitBadge({ size = 170 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <circle cx="60" cy="60" r="56" fill="none" stroke="rgb(var(--ink))" strokeWidth="2" />
        <circle cx="60" cy="60" r="56" fill="none" stroke="rgb(var(--gold))" strokeWidth="2" strokeDasharray="3 5" />
        {/* sunburst */}
        {Array.from({ length: 16 }, (_, i) => (
          <line key={i} x1="60" y1="60" x2="60" y2="18" stroke="rgb(var(--accent))" strokeWidth="1.3" strokeLinecap="round" transform={`rotate(${i * 22.5} 60 60)`} opacity="0.5" />
        ))}
        <circle cx="60" cy="60" r="20" fill="rgb(var(--accent))" stroke="rgb(var(--ink))" strokeWidth="2" />
        <circle cx="53" cy="54" r="4" fill="rgb(var(--accent-on))" opacity="0.5" />
      </svg>
      {/* orbiting moon */}
      <div className="absolute inset-0 motion-safe:animate-orbit">
        <span className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-ink bg-teal" />
      </div>
    </div>
  );
}

/** Wrap content to fade/slide it in when it scrolls into view (CSS class .reveal → .is-in). */
export function Reveal({ children, className = '', delay = 0, as: As = 'div' }: { children: ReactNode; className?: string; delay?: number; as?: 'div' | 'section' | 'li' }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-in');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add('is-in');
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <As ref={ref as never} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </As>
  );
}
