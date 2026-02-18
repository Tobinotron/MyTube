'use client';

import { useEffect } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { useTranslation } from '@/i18n/useTranslation';
import {
  SettingsIcon,
  XIcon,
  HomeIcon,
  DynamicIcon,
  ListIcon,
  MapPinIcon,
  ClockIcon,
} from '@/components/Icons';

export default function MobileDrawer() {
  const {
    isMobileMenuOpen,
    closeMobileMenu,
    activeCategory,
    setActiveCategory,
    categories,
    showSeriesOverview,
    openSeriesOverview,
    activeSeries,
    showMapPage,
    openMapPage,
    showTimelinePage,
    openTimelinePage,
    openSettings,
  } = useNavigation();
  const { config } = useSiteConfig();
  const { t } = useTranslation();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, closeMobileMenu]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleCategoryClick = (categoryId: string | null) => {
    setActiveCategory(categoryId);
    closeMobileMenu();
  };

  const handleSeriesClick = () => {
    openSeriesOverview();
  };

  const handleMapClick = () => {
    openMapPage();
  };

  const handleTimelineClick = () => {
    openTimelinePage();
  };

  const handleHomeClick = () => {
    setActiveCategory(null);
    closeMobileMenu();
  };

  if (!isMobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-yt-bg
          shadow-xl transform transition-transform duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-yt-border">
          <span className="text-lg font-bold text-primary">{config.name}</span>
          <button
            onClick={closeMobileMenu}
            className="p-2 rounded-lg text-gray-600 dark:text-yt-text-secondary
              hover:bg-gray-100 dark:hover:bg-yt-hover"
            aria-label={t('mobile.close')}
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1">
          {/* Home / All Videos */}
          <button
            onClick={handleHomeClick}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-lg
              transition-colors duration-150
              ${
                activeCategory === null && !showSeriesOverview && !showMapPage && !showTimelinePage && activeSeries === null
                  ? 'bg-gray-200 dark:bg-yt-hover text-primary'
                  : 'text-gray-700 dark:text-yt-text-secondary hover:bg-gray-100 dark:hover:bg-yt-hover'
              }
            `}
          >
            <HomeIcon className="w-6 h-6" />
            <span>{t('videos.all')}</span>
          </button>

          {/* Category items */}
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-lg
                transition-colors duration-150
                ${
                  activeCategory === category.id
                    ? 'bg-gray-200 dark:bg-yt-hover text-primary'
                    : 'text-gray-700 dark:text-yt-text-secondary hover:bg-gray-100 dark:hover:bg-yt-hover'
                }
              `}
            >
              <DynamicIcon name={category.icon} className="w-6 h-6" />
              <span>{category.name}</span>
            </button>
          ))}

          {/* Divider - only show if at least one special page is enabled */}
          {(config.enableSeries || config.enableMap || config.enableTimeline) && (
            <div className="my-3 border-t border-gray-200 dark:border-yt-border" />
          )}

          {/* Series button */}
          {config.enableSeries && (
            <button
              onClick={handleSeriesClick}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-lg
                transition-colors duration-150
                ${
                  showSeriesOverview || activeSeries !== null
                    ? 'bg-gray-200 dark:bg-yt-hover text-primary'
                    : 'text-gray-700 dark:text-yt-text-secondary hover:bg-gray-100 dark:hover:bg-yt-hover'
                }
              `}
            >
              <ListIcon className="w-6 h-6" />
              <span>{t('nav.series')}</span>
            </button>
          )}

          {/* Map button */}
          {config.enableMap && (
            <button
              onClick={handleMapClick}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-lg
                transition-colors duration-150
                ${
                  showMapPage
                    ? 'bg-gray-200 dark:bg-yt-hover text-primary'
                    : 'text-gray-700 dark:text-yt-text-secondary hover:bg-gray-100 dark:hover:bg-yt-hover'
                }
              `}
            >
              <MapPinIcon className="w-6 h-6" />
              <span>{t('nav.map')}</span>
            </button>
          )}

          {/* Timeline button */}
          {config.enableTimeline && (
            <button
              onClick={handleTimelineClick}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-lg
                transition-colors duration-150
                ${
                  showTimelinePage
                    ? 'bg-gray-200 dark:bg-yt-hover text-primary'
                    : 'text-gray-700 dark:text-yt-text-secondary hover:bg-gray-100 dark:hover:bg-yt-hover'
                }
              `}
            >
              <ClockIcon className="w-6 h-6" />
              <span>{t('nav.timeline')}</span>
            </button>
          )}
        </nav>

        {/* Settings */}
        <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-gray-200 dark:border-yt-border">
          <button
            onClick={openSettings}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg
              text-gray-700 dark:text-yt-text-secondary
              hover:bg-gray-100 dark:hover:bg-yt-hover
              transition-colors duration-150"
          >
            <SettingsIcon className="w-6 h-6" />
            <span>{t('nav.settings')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
