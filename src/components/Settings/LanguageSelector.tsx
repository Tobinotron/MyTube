'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { useTranslation } from '@/i18n/useTranslation';
import { Language } from '@/types/settings';

const LANGUAGES: { code: Language; labelKey: 'settings.language.en' | 'settings.language.de' }[] = [
  { code: 'en', labelKey: 'settings.language.en' },
  { code: 'de', labelKey: 'settings.language.de' },
];

export default function LanguageSelector() {
  const { settings, setLanguage } = useSettings();
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700 dark:text-yt-text-secondary">{t('settings.language')}</span>
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-yt-surface rounded-lg p-1">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`
              px-3 py-1.5 rounded-md text-sm transition-colors
              ${
                settings.language === lang.code
                  ? 'bg-white dark:bg-yt-hover shadow-sm text-gray-900 dark:text-yt-text'
                  : 'text-gray-500 dark:text-yt-text-secondary hover:text-gray-700 dark:hover:text-yt-text-secondary'
              }
            `}
          >
            {t(lang.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}
