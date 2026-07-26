'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggle: (e?: React.MouseEvent<HTMLElement>) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // Default is strictly 'dark' for all visitors.
    // Only switch to light if user manually saved 'light' preference previously.
    const saved = localStorage.getItem('cybertech-theme') as Theme | null;
    if (saved === 'light') {
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const applyThemeChange = (next: Theme) => {
    setTheme(next);
    localStorage.setItem('cybertech-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const toggle = (e?: React.MouseEvent<HTMLElement>) => {
    const next = theme === 'dark' ? 'light' : 'dark';

    // Check for View Transitions API support for GPU-accelerated circular ripple transition
    const doc = document as any;
    if (!doc.startViewTransition) {
      applyThemeChange(next);
      return;
    }

    // Capture click position for expanding circular ripple
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (e && e.clientX && e.clientY) {
      x = e.clientX;
      y = e.clientY;
    }

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    document.documentElement.classList.add('theme-transitioning');

    const transition = doc.startViewTransition(() => {
      applyThemeChange(next);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        [
          { clipPath: `circle(0px at ${x}px ${y}px)` },
          { clipPath: `circle(${endRadius}px at ${x}px ${y}px)` },
        ],
        {
          duration: 480,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove('theme-transitioning');
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
