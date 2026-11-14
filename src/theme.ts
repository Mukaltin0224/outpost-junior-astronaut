import { useSettings } from './store';

/** Hex values for places that cannot read CSS variables (chart strokes). Mirrors index.css. */
const COLORS = {
  light: { paper: '#FAF3E3', line: '#D3C2A0', ink: '#122036', ink2: '#30405A', ink3: '#606878', accent: '#E2552D', bone: '#E0A22E', muscle: '#178C88', heart: '#C13D5A', balance: '#7856B4', bars: '#E6D4B0' },
  dark: { paper: '#162238', line: '#30405C', ink: '#F3E9D0', ink2: '#CEC6B0', ink3: '#96A0B2', accent: '#F06E46', bone: '#F0BE5A', muscle: '#46BEB4', heart: '#FF78A0', balance: '#AA8CFF', bars: '#2A3A58' },
};

export function useColors() {
  const theme = useSettings((s) => s.theme);
  return COLORS[theme];
}
