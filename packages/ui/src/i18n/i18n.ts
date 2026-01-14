/**
 * UI packages must never define visible copy inline.
 * All visible strings must come from /locales.
 *
 * Namespace intent mapping:
 *   buttons → actions
 *   labels/status → states
 *   errors → errors
 *   reassurance/help → reassurance
 */

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './loadLocales';

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
