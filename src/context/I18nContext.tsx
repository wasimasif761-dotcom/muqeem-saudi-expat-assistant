import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations.en;
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('muqeem_lang') as Language;
    if (saved && (saved === 'en' || saved === 'ur' || saved === 'ar')) {
      return saved;
    }
    // Default to English with easy switch to Urdu/Arabic
    return 'en';
  });

  const isRtl = lang === 'ur' || lang === 'ar';

  useEffect(() => {
    localStorage.setItem('muqeem_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    if (lang === 'ur') {
      document.body.style.fontFamily = 'var(--font-urdu)';
    } else if (lang === 'ar') {
      document.body.style.fontFamily = 'var(--font-arabic)';
    } else {
      document.body.style.fontFamily = 'var(--font-sans)';
    }
  }, [lang, isRtl]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
  };

  const t = translations[lang] || translations.en;

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isRtl }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}
