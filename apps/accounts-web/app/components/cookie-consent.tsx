import { useEffect } from 'react';

import * as VanillaCookieConsent from 'vanilla-cookieconsent';

import 'vanilla-cookieconsent/dist/cookieconsent.css';

export function showCookiePreferences() {
  VanillaCookieConsent.showPreferences();
}

export function CookieConsent() {
  useEffect(() => {
    document.documentElement.classList.add('cc--darkmode');

    void VanillaCookieConsent.run({
      guiOptions: {
        consentModal: {
          layout: 'box inline',
          position: 'bottom right',
          equalWeightButtons: true,
          flipButtons: false,
        },
        preferencesModal: {
          layout: 'box',
          position: 'right',
          equalWeightButtons: true,
          flipButtons: false,
        },
      },
      categories: {
        necessary: {
          readOnly: true,
          enabled: true,
        },
        analytics: {},
      },
      language: {
        default: 'en',
        translations: {
          en: {
            consentModal: {
              title: 'We use cookies',
              description:
                'Authn Accounts uses essential cookies for secure authentication and session management, plus optional analytics cookies to improve your experience.',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all',
              showPreferencesBtn: 'Manage preferences',
              footer:
                '<a href="/privacy">Privacy Policy</a>\n<a href="/terms">Terms of Service</a>',
            },
            preferencesModal: {
              title: 'Cookie Preferences',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all',
              savePreferencesBtn: 'Save preferences',
              closeIconLabel: 'Close modal',
              serviceCounterLabel: 'Service|Services',
              sections: [
                {
                  title: 'Cookie Usage',
                  description:
                    'We use cookies to ensure core authentication security and to understand how you interact with Authn Accounts.',
                },
                {
                  title:
                    'Strictly Necessary Cookies <span class="pm__badge">Always Enabled</span>',
                  description:
                    'These cookies are required for secure sign-in, session continuity, CSRF protection, and storing your cookie consent preferences.',
                  linkedCategory: 'necessary',
                },
                {
                  title: 'Analytics Cookies',
                  description:
                    'These cookies help us measure authentication reliability and improve user experience without tracking sensitive identity data.',
                  linkedCategory: 'analytics',
                },
                {
                  title: 'More Information',
                  description:
                    'For any questions regarding our cookie policy and your choices, please visit our <a class="cc__link" href="/privacy">Privacy Policy</a> or <a class="cc__link" href="/help">Help Center</a>.',
                },
              ],
            },
          },
        },
      },
    });
  }, []);

  return null;
}
