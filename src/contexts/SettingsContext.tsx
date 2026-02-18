'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Settings, Theme, Language, defaultSettings } from '@/types/settings';
import { useSiteConfig } from '@/contexts/SiteConfigContext';

interface SettingsContextValue {
  settings: Settings;
  isHydrated: boolean;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined
);

const SETTINGS_KEY = 'mytube-settings';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { config, isLoaded: configLoaded } = useSiteConfig();
  const [settings, setSettings, isHydrated] = useLocalStorage<Settings>(
    SETTINGS_KEY,
    defaultSettings
  );
  const [hasAppliedConfigDefault, setHasAppliedConfigDefault] = useState(false);

  // Apply site config default theme if no user preference exists
  useEffect(() => {
    if (isHydrated && configLoaded && !hasAppliedConfigDefault) {
      // Check if there's an existing preference in localStorage
      const storedSettings = window.localStorage.getItem(SETTINGS_KEY);
      if (!storedSettings) {
        // No stored preference, apply site config default
        setSettings((prev) => ({
          ...prev,
          theme: config.defaultColorScheme as Theme,
        }));
      }
      setHasAppliedConfigDefault(true);
    }
  }, [isHydrated, configLoaded, config.defaultColorScheme, hasAppliedConfigDefault, setSettings]);

  // Apply theme class to document when settings change
  useEffect(() => {
    if (isHydrated) {
      const root = document.documentElement;
      if (settings.theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      root.lang = settings.language;
    }
  }, [settings, isHydrated]);

  const setTheme = (theme: Theme) => {
    setSettings((prev) => ({ ...prev, theme }));
  };

  const setLanguage = (language: Language) => {
    setSettings((prev) => ({ ...prev, language }));
  };

  return (
    <SettingsContext.Provider
      value={{ settings, isHydrated, setTheme, setLanguage }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
