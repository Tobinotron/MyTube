'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { SiteConfig, defaultSiteConfig } from '@/types/siteConfig';

interface SiteConfigContextValue {
  config: SiteConfig;
  isLoaded: boolean;
}

const SiteConfigContext = createContext<SiteConfigContextValue | undefined>(
  undefined
);

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch('/api/site-config');
        if (response.ok) {
          const data = await response.json();
          setConfig({ ...defaultSiteConfig, ...data });
        }
      } catch (error) {
        console.warn('Failed to load site config, using defaults:', error);
      } finally {
        setIsLoaded(true);
      }
    }
    loadConfig();
  }, []);

  // Apply CSS custom property for primary color
  useEffect(() => {
    if (isLoaded) {
      document.documentElement.style.setProperty(
        '--color-primary',
        config.primaryColor
      );
      // Also set RGB values for opacity variants
      const hex = config.primaryColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      document.documentElement.style.setProperty(
        '--color-primary-rgb',
        `${r}, ${g}, ${b}`
      );
    }
  }, [config.primaryColor, isLoaded]);

  return (
    <SiteConfigContext.Provider value={{ config, isLoaded }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext);
  if (context === undefined) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
}
