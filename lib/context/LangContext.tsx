'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { id } from '@/lib/i18n/id';
import { en } from '@/lib/i18n/en';

type Lang = 'id' | 'en';
type Translations = typeof id;

interface LangContextType {
  lang: Lang;
  t: Translations;
  toggle: () => void;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextType>({
  lang: 'id',
  t: id,
  toggle: () => {},
  setLang: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('id');

  useEffect(() => {
    const saved = localStorage.getItem('cybertech-lang') as Lang | null;
    if (saved === 'id' || saved === 'en') setLangState(saved);
  }, []);

  const setLang = (nextLang: Lang) => {
    setLangState(nextLang);
    localStorage.setItem('cybertech-lang', nextLang);
  };

  const toggle = () => {
    setLangState(prev => {
      const next = prev === 'id' ? 'en' : 'id';
      localStorage.setItem('cybertech-lang', next);
      return next;
    });
  };

  const t = lang === 'id' ? id : en;

  return (
    <LangContext.Provider value={{ lang, t, toggle, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
