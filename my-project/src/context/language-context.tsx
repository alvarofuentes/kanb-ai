'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useMemo, useSyncExternalStore } from 'react';
import { Language, translations, Translations } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'kanb-ai-language';

// Custom store for language that syncs with localStorage
function createLanguageStore() {
  let listeners: Array<() => void> = [];
  let language: Language = 'en';

  // Initialize from localStorage on client
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(LANGUAGE_KEY) as Language | null;
    if (saved === 'en' || saved === 'es') {
      language = saved;
    }
  }

  return {
    getSnapshot: () => language,
    subscribe: (listener: () => void) => {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter(l => l !== listener);
      };
    },
    setLanguage: (newLang: Language) => {
      language = newLang;
      if (typeof window !== 'undefined') {
        localStorage.setItem(LANGUAGE_KEY, newLang);
      }
      listeners.forEach(l => l());
    },
  };
}

const languageStore = createLanguageStore();

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Use useSyncExternalStore for SSR-safe localStorage sync
  const language = useSyncExternalStore(
    languageStore.subscribe,
    languageStore.getSnapshot,
    () => 'en' as Language // Server snapshot
  );

  const setLanguage = useCallback((lang: Language) => {
    languageStore.setLanguage(lang);
  }, []);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: translations[language],
  }), [language, setLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
