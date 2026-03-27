import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import zhHans from './locales/zh-Hans.json';
import zhHant from './locales/zh-Hant.json';
import de from './locales/de.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import ar from './locales/ar.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import tr from './locales/tr.json';
import id from './locales/id.json';
import uk from './locales/uk.json';
import hi from './locales/hi.json';

const LANGUAGE_STORAGE_KEY = 'user-language';

const resources = {
  en: { translation: en },
  'zh-Hans': { translation: zhHans },
  'zh-Hant': { translation: zhHant },
  de: { translation: de },
  es: { translation: es },
  fr: { translation: fr },
  ja: { translation: ja },
  ko: { translation: ko },
  ar: { translation: ar },
  pt: { translation: pt },
  ru: { translation: ru },
  tr: { translation: tr },
  id: { translation: id },
  uk: { translation: uk },
  hi: { translation: hi },
};

export type SupportedLanguage =
  | 'en' | 'zh-Hans' | 'zh-Hant' | 'de'
  | 'es' | 'fr' | 'ja' | 'ko' | 'ar' | 'pt'
  | 'ru' | 'tr' | 'id' | 'uk' | 'hi';

export const SUPPORTED_LANGUAGES: { code: SupportedLanguage; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh-Hans', name: 'Simplified Chinese', nativeName: '简体中文' },
  { code: 'zh-Hant', name: 'Traditional Chinese', nativeName: '繁體中文' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
];

const SIMPLE_LANG_CODES: SupportedLanguage[] = ['de', 'es', 'fr', 'ja', 'ko', 'ar', 'pt', 'ru', 'tr', 'id', 'uk', 'hi'];

const getDeviceLanguage = (): SupportedLanguage => {
  const locale = Localization.getLocales()[0]?.languageTag || 'en';

  if (locale.startsWith('zh')) {
    if (locale.includes('Hans') || locale === 'zh-CN' || locale === 'zh-SG') {
      return 'zh-Hans';
    }
    if (locale.includes('Hant') || locale === 'zh-TW' || locale === 'zh-HK' || locale === 'zh-MO') {
      return 'zh-Hant';
    }
    return 'zh-Hans';
  }

  const langPrefix = locale.split('-')[0].toLowerCase();
  const match = SIMPLE_LANG_CODES.find((code) => code === langPrefix);
  if (match) return match;

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
const ALL_SUPPORTED_CODES = SUPPORTED_LANGUAGES.map((l) => l.code as string);

AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((savedLang) => {
  if (savedLang && ALL_SUPPORTED_CODES.includes(savedLang)) {
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
