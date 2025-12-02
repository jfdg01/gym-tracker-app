import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import 'intl-pluralrules';

import en from './locales/en.json';
import es from './locales/es.json';

const resources = {
    en: { translation: en },
    es: { translation: es },
};

const getLocales = () => {
    const locales = Localization.getLocales();
    return locales && locales.length > 0 ? locales[0].languageCode : 'en';
}

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: getLocales() || 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
