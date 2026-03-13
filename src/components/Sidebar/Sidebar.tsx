'use client';

import { useNavigation } from '@/contexts/NavigationContext';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { useTranslation } from '@/i18n/useTranslation';
import SidebarItem from './SidebarItem';
import { Settings, Home, List, MapPin, Clock } from 'lucide-react';
import { DynamicIcon } from '@/components/Icons/DynamicIcon';
import { SidebarCategorySkeleton } from '@/components/Skeletons';

export default function Sidebar() {
  const {
    isSidebarExpanded,
    activeCategory,
    setActiveCategory,
    categories,
    categoriesLoading,
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

  return (
    <aside
      className={`
        hidden md:flex flex-col
        fixed top-14 left-0 bottom-0
        bg-white dark:bg-yt-bg
        border-r border-gray-200 dark:border-yt-border
        sidebar-transition z-30
        ${isSidebarExpanded ? 'w-60' : 'w-16'}
      `}
    >
      {/* Navigation items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {/* Home / All Videos */}
        <SidebarItem
          icon={<Home className="w-6 h-6" />}
          label={t('videos.all')}
          isActive={activeCategory === null && !showSeriesOverview && !showMapPage && !showTimelinePage && activeSeries === null}
          isExpanded={isSidebarExpanded}
          onClick={() => setActiveCategory(null)}
        />

        {/* Category items */}
        {categoriesLoading ? (
          <SidebarCategorySkeleton isExpanded={isSidebarExpanded} />
        ) : (
          categories.map((category) => (
            <SidebarItem
              key={category.id}
              icon={<DynamicIcon name={category.icon} className="w-6 h-6" />}
              label={category.name}
              isActive={activeCategory === category.id}
              isExpanded={isSidebarExpanded}
              onClick={() => setActiveCategory(category.id)}
            />
          ))
        )}

        {/* Divider - only show if at least one special page is enabled */}
        {(config.enableSeries || config.enableMap || config.enableTimeline) && (
          <div className="my-3 border-t border-gray-200 dark:border-yt-border" />
        )}

        {/* Series button */}
        {config.enableSeries && (
          <SidebarItem
            icon={<List className="w-6 h-6" />}
            label={t('nav.series')}
            isActive={showSeriesOverview || activeSeries !== null}
            isExpanded={isSidebarExpanded}
            onClick={openSeriesOverview}
          />
        )}

        {/* Map button */}
        {config.enableMap && (
          <SidebarItem
            icon={<MapPin className="w-6 h-6" />}
            label={t('nav.map')}
            isActive={showMapPage}
            isExpanded={isSidebarExpanded}
            onClick={openMapPage}
          />
        )}

        {/* Timeline button */}
        {config.enableTimeline && (
          <SidebarItem
            icon={<Clock className="w-6 h-6" />}
            label={t('nav.timeline')}
            isActive={showTimelinePage}
            isExpanded={isSidebarExpanded}
            onClick={openTimelinePage}
          />
        )}
      </nav>

      {/* Settings at bottom */}
      <div className="px-2 py-4 border-t border-gray-200 dark:border-yt-border">
        <SidebarItem
          icon={<Settings className="w-6 h-6" />}
          label={t('nav.settings')}
          isExpanded={isSidebarExpanded}
          onClick={openSettings}
        />
      </div>
    </aside>
  );
}
