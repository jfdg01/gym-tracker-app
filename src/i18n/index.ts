import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import 'intl-pluralrules';

import en from './locales/en.json';
import es from './locales/es.json';
import zh from './locales/zh.json';
import hi from './locales/hi.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';
import bn from './locales/bn.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import id from './locales/id.json';

const resources = {
    en: { translation: en },
    es: { translation: es },
    zh: { translation: zh },
    hi: { translation: hi },
    ar: { translation: ar },
    fr: { translation: fr },
    bn: { translation: bn },
    pt: { translation: pt },
    ru: { translation: ru },
    id: { translation: id },
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
