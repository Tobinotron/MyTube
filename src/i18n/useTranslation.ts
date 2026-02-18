'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { translations, TranslationKey } from './translations';

export function useTranslation() {
  const { settings } = useSettings();

  const t = (key: TranslationKey): string => {
    return (
      translations[settings.language]?.[key] ||
      translations['en'][key] ||
      key
    );
  };

  return { t, language: settings.language };
}
