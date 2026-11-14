/** Retro-space design tokens. Values live in src/index.css (light + dark). */
const v = (n) => `rgb(var(--${n}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#fff',
      paper: { DEFAULT: v('paper'), 2: v('paper-2'), 3: v('paper-3') },
      ink: { DEFAULT: v('ink'), 2: v('ink-2'), 3: v('ink-3') },
      bar: { DEFAULT: v('bar'), fg: v('bar-fg') },
      accent: { DEFAULT: v('accent'), text: v('accent-text'), on: v('accent-on'), soft: v('accent-soft') },
      gold: { DEFAULT: v('gold'), soft: v('gold-soft') },
      teal: { DEFAULT: v('teal'), soft: v('teal-soft') },
      hot: v('hot'),
      ok: { DEFAULT: v('ok'), text: v('ok-text') },
      warn: { DEFAULT: v('warn'), text: v('warn-text') },
      crit: { DEFAULT: v('crit'), text: v('crit-text') },
      block: { ared: v('block-ared'), t2: v('block-t2'), cevis: v('block-cevis'), hiit: v('block-hiit'), bands: v('block-bands'), lbnp: v('block-lbnp') },
    },
    fontFamily: {
      sans: ['"Chakra Petch"', 'system-ui', 'sans-serif'],
      mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
    },
    fontSize: {
      xs: ['12px', '1.5'],
      sm: ['14px', '1.5'],
      base: ['16px', '1.5'],
      lg: ['20px', '1.35'],
      xl: ['30px', '1.12'],
      '2xl': ['46px', '1.04'],
      '3xl': ['64px', '1.0'],
    },
    borderRadius: { none: '0', sm: '6px', DEFAULT: '10px', md: '12px', lg: '18px', full: '9999px' },
    extend: {
      boxShadow: { hard: '4px 4px 0 0 rgb(var(--shadow) / 0.9)', hardlg: '7px 7px 0 0 rgb(var(--shadow) / 0.9)' },
      letterSpacing: { label: '0.1em' },
      transitionDuration: { DEFAULT: '200ms' },
      keyframes: {
        orbit: { to: { transform: 'rotate(360deg)' } },
        twinkle: { '0%,100%': { opacity: '0.25' }, '50%': { opacity: '1' } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        scan: { to: { transform: 'translateY(100%)' } },
        popin: { from: { opacity: '0', transform: 'scale(0.9)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: {
        orbit: 'orbit 18s linear infinite',
        twinkle: 'twinkle 3s ease-in-out infinite',
        floaty: 'floaty 6s ease-in-out infinite',
        popin: 'popin 0.5s cubic-bezier(0.2,0.7,0.3,1) both',
      },
    },
  },
  plugins: [],
};
