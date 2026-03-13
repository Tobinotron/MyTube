'use client';

import { useEffect, useCallback, useState } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useTranslation } from '@/i18n/useTranslation';
import { X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';

export default function SettingsModal() {
  const { isSettingsOpen, closeSettings, triggerRefresh } = useNavigation();
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    triggerRefresh();
    // Close after a short delay to show the action
    setTimeout(() => {
      setIsRefreshing(false);
      closeSettings();
    }, 500);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSettings();
      }
    },
    [closeSettings]
  );

  useEffect(() => {
    if (isSettingsOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isSettingsOpen, handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeSettings();
    }
  };

  if (!isSettingsOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-yt-bg rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-yt-border">
          <h2 className="text-xl font-bold text-gray-900 dark:text-yt-text">
            {t('settings.title')}
          </h2>
          <button
            onClick={closeSettings}
            className="p-2 rounded-lg text-gray-500 dark:text-yt-text-secondary
              hover:bg-gray-100 dark:hover:bg-yt-hover transition-colors"
            aria-label={t('settings.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          <ThemeToggle />
          <LanguageSelector />

          {/* Data section */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-yt-text-secondary uppercase tracking-wider mb-3">
              {t('settings.data')}
            </h3>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full flex items-center justify-between px-4 py-3
                bg-gray-100 dark:bg-yt-surface rounded-lg
                hover:bg-gray-200 dark:hover:bg-yt-hover
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors"
            >
              <div className="text-left">
                <div className="text-gray-900 dark:text-yt-text font-medium">
                  {t('settings.refresh')}
                </div>
                <div className="text-sm text-gray-500 dark:text-yt-text-secondary">
                  {t('settings.refresh.description')}
                </div>
              </div>
              {isRefreshing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-yt-border">
          <button
            onClick={closeSettings}
            className="w-full py-2 px-4 bg-primary hover:opacity-90
              text-white font-medium rounded-lg transition-colors"
          >
            {t('settings.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
