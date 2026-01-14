import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from '@repo/ui/i18n/loadLocales';

i18next.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  ns: ['actions', 'states', 'errors', 'reassurance'],
  defaultNS: 'actions',
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;

/**
 * Example usage:
 *   t('reportSomething', { ns: 'actions' })
 *   t('approximateIsFine', { ns: 'reassurance' })
 */
