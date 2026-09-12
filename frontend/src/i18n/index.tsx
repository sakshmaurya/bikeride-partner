import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { en } from './en';
import { hi } from './hi';
import { gu } from './gu';
import { ta } from './ta';
import { te } from './te';

export type LanguageCode = 'en' | 'hi' | 'gu' | 'ta' | 'te';

export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  hi: 'हिंदी',
  gu: 'ગુજરાતી',
  ta: 'தமிழ்',
  te: 'తెలుగు',
};

type Language = LanguageCode;

type DeepStringify<T> = T extends string
  ? string
  : T extends object
  ? { [K in keyof T]: DeepStringify<T[K]> }
  : never;

export type Translations = DeepStringify<typeof en>;

const translationsMap: Record<Language, Translations> = {
  en,
  hi,
  gu,
  ta,
  te,
};

interface LanguageContextType {
  language: LanguageCode;
  translations: Translations;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi' || savedLanguage === 'gu' || savedLanguage === 'ta' || savedLanguage === 'te')) {
        setLanguageState(savedLanguage as LanguageCode);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: LanguageCode) => {
    try {
      await AsyncStorage.setItem('app_language', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        translations: translationsMap[language],
        setLanguage,
        loading: isLoading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return {
    language: context.language,
    translations: context.translations,
    setLanguage: context.setLanguage,
    loading: context.loading,
  };
};
