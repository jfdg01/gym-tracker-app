import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './locales/en.json';
import es from './locales/es.json';

const RESOURCES = {
    en: { translation: en },
    es: { translation: es },
};

i18n
    .use(initReactI18next)
    .init({
        resources: RESOURCES,
        lng: Localization.getLocales()[0]?.languageCode ?? 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
        }
    });

export default i18n;
