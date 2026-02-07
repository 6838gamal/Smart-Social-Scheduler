'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { dictionaries, type Locale } from '@/lib/dictionaries';

type Dictionary = typeof dictionaries['en'];

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  direction: 'ltr' | 'rtl';
  setDirection: (direction: 'ltr' | 'rtl') => void;
  dictionary: Dictionary;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState<Locale>('en');
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [locale, direction]);

  const value = useMemo(() => ({
    locale,
    setLocale: (newLocale) => {
        setLocale(newLocale);
        setDirection(newLocale === 'ar' ? 'rtl' : 'ltr');
    },
    direction,
    setDirection: (newDirection) => {
        setDirection(newDirection);
        setLocale(newDirection === 'rtl' ? 'ar' : 'en');
    },
    dictionary: dictionaries[locale],
  }), [locale, direction]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
