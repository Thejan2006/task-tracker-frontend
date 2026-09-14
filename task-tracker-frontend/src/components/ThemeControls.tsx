'use client';

import { useTheme } from './ThemeProvider';

const accents = ['#8b5cf6', '#06b6d4', '#f97316'];

export function ThemeControls() {
  const { mode, setMode, accent, setAccent } = useTheme();
  return (
    <div className="mr-2 flex items-center gap-[9px] max-[480px]:mr-0" aria-label="Theme controls">
      <button
        className="rounded-full border border-white/10 bg-white/[0.04] px-[11px] py-[7px] text-[0.72rem] text-[#9898ad]"
        onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
        aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
      >
        {mode === 'dark' ? 'Light' : 'Dark'}
      </button>
      <div className="flex gap-[5px] max-[480px]:hidden">
        {accents.map((color) => (
          <button
            key={color}
            className={`h-3 w-3 rounded-full border-2 border-transparent p-0 ${color === '#8b5cf6' ? 'bg-[#8b5cf6]' : color === '#06b6d4' ? 'bg-[#06b6d4]' : 'bg-[#f97316]'} ${accent === color ? 'outline outline-2 outline-offset-2 outline-[#f8f7ff]' : ''}`}
            onClick={() => setAccent(color)}
            aria-label={`Use ${color} accent`}
          />
        ))}
      </div>
    </div>
  );
}
