'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { useTranslation } from '@/i18n/useTranslation';
import { SunIcon, MoonIcon } from '@/components/Icons';

export default function ThemeToggle() {
  const { settings, setTheme } = useSettings();
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700 dark:text-yt-text-secondary">{t('settings.theme')}</span>
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-yt-surface rounded-lg p-1">
        <button
          onClick={() => setTheme('light')}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors
            ${
              settings.theme === 'light'
                ? 'bg-white dark:bg-yt-hover shadow-sm text-gray-900 dark:text-yt-text'
                : 'text-gray-500 dark:text-yt-text-secondary hover:text-gray-700 dark:hover:text-yt-text-secondary'
            }
          `}
          aria-label={t('settings.theme.light')}
        >
          <SunIcon className="w-4 h-4" />
          <span className="text-sm">{t('settings.theme.light')}</span>
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors
            ${
              settings.theme === 'dark'
                ? 'bg-white dark:bg-yt-hover shadow-sm text-gray-900 dark:text-yt-text'
                : 'text-gray-500 dark:text-yt-text-secondary hover:text-gray-700 dark:hover:text-yt-text-secondary'
            }
          `}
          aria-label={t('settings.theme.dark')}
        >
          <MoonIcon className="w-4 h-4" />
          <span className="text-sm">{t('settings.theme.dark')}</span>
        </button>
      </div>
    </div>
  );
}
