import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import amTranslations from './locales/am/translation.json';
import enTranslations from './locales/en/translation.json';
import esTranslations from './locales/es/translation.json';
import frTranslations from './locales/fr/translation.json';
import ruTranslations from './locales/ru/translation.json';
import chTranslations from './locales/ch/translation.json';
import arTranslations from './locales/ar/translation.json';

i18n
    .use(initReactI18next) // Passes the i18n instance to react-i18next
    .init({
        resources: {
            en: { translation: enTranslations },
            es: { translation: esTranslations },
            am: { translation: amTranslations },
            fr: { translation: frTranslations },
            ru: { translation: ruTranslations },
            ch: { translation: chTranslations },
            ar: { translation: arTranslations },
        },
        lng: 'en', // Set the default starting language
        fallbackLng: 'en', // Fallback if a translation is missing in another language
        interpolation: {
            escapeValue: false // React already safely handles XSS escaping
        }
    });

export default i18n;