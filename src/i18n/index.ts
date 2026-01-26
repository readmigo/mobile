import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import zhHans from './locales/zh-Hans.json';
import zhHant from './locales/zh-Hant.json';

const LANGUAGE_STORAGE_KEY = 'user-language';

const resources = {
  en: { translation: en },
  'zh-Hans': { translation: zhHans },
  'zh-Hant': { translation: zhHant },
};

export type SupportedLanguage = 'en' | 'zh-Hans' | 'zh-Hant';

export const SUPPORTED_LANGUAGES: { code: SupportedLanguage; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh-Hans', name: 'Simplified Chinese', nativeName: '简体中文' },
  { code: 'zh-Hant', name: 'Traditional Chinese', nativeName: '繁體中文' },
];

const getDeviceLanguage = (): SupportedLanguage => {
  const locale = Localization.getLocales()[0]?.languageTag || 'en';

  if (locale.startsWith('zh')) {
    // Check for simplified vs traditional Chinese
    if (locale.includes('Hans') || locale === 'zh-CN' || locale === 'zh-SG') {
      return 'zh-Hans';
    }
    if (locale.includes('Hant') || locale === 'zh-TW' || locale === 'zh-HK' || locale === 'zh-MO') {
      return 'zh-Hant';
    }
    return 'zh-Hans'; // Default to simplified for other zh locales
  }

  return 'en';
};

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

// Load saved language preference
AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((savedLang) => {
  if (savedLang && (savedLang === 'en' || savedLang === 'zh-Hans' || savedLang === 'zh-Hant')) {
    i18n.changeLanguage(savedLang);
  }
});

export default i18n;

export const changeLanguage = async (lang: SupportedLanguage): Promise<void> => {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  await i18n.changeLanguage(lang);
};

export const getCurrentLanguage = (): SupportedLanguage => {
  return i18n.language as SupportedLanguage;
};
