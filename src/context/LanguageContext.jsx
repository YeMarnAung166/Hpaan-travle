import { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import my from '../locales/my.json';

const translations = { en, my };

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved && (saved === 'en' || saved === 'my') ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language === 'en' ? 'en' : 'my';
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        console.warn(`Translation missing: ${key}`);
        return key;
      }
    }
    return value;
  };

  // Helper function to get localized content from database items
  const getLocalized = (item, fieldEn, fieldMy) => {
    if (!item) return '';
    if (language === 'my' && item[`${fieldEn}_my`]) {
      return item[`${fieldEn}_my`];
    }
    return item[fieldEn];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getLocalized }}>
      {children}
    </LanguageContext.Provider>
  );
};