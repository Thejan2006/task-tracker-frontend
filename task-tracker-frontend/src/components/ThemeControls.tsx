'use client';

import { useTheme } from './ThemeProvider';

const accents = ['#8b5cf6', '#06b6d4', '#f97316'];

export function ThemeControls() {
  const { mode, setMode, accent, setAccent } = useTheme();
  return (
    <div className="theme-controls" aria-label="Theme controls">
      <button
        className="theme-toggle"
        onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
        aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
      >
        {mode === 'dark' ? 'Light' : 'Dark'}
      </button>
      <div className="accent-picker">
        {accents.map((color) => (
          <button
            key={color}
            className={`accent-dot ${accent === color ? 'active' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => setAccent(color)}
            aria-label={`Use ${color} accent`}
          />
        ))}
      </div>
    </div>
  );
}
