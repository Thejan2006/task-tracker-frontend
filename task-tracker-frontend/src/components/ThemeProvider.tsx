'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'dark' | 'light';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme-mode') as ThemeMode | null;
    if (stored === 'dark' || stored === 'light') {
      setMode(stored);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setMode('dark');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;

    if (mode === 'dark') {
      root.classList.add('dark', 'theme-dark');
      root.classList.remove('light', 'theme-light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light', 'theme-light');
      root.classList.remove('dark', 'theme-dark');
      root.style.colorScheme = 'light';
    }

    localStorage.setItem('theme-mode', mode);
  }, [mode, mounted]);

  const toggle = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'));
  const value = useMemo(() => ({ mode, setMode, toggle }), [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
