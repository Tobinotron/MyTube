'use client';

import { useState, useEffect, useMemo } from 'react';
import { Video } from '@/types/video';
import { useNavigation } from '@/contexts/NavigationContext';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { useTranslation } from '@/i18n/useTranslation';
import VideoGrid from '@/components/VideoGrid';
import VideoModal from '@/components/VideoModal';
import SeriesGrid from '@/components/Series/SeriesGrid';
import MapView from '@/components/Map/MapView';
import TimelineView from '@/components/Timeline/TimelineView';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar/Sidebar';
import MobileDrawer from '@/components/Sidebar/MobileDrawer';
import SettingsModal from '@/components/Settings/SettingsModal';
import { ChevronLeft, List } from 'lucide-react';
import { searchVideos } from '@/lib/searchUtils';
import { VideoGridSkeleton } from '@/components/Skeletons';

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { activeCategory, activeSeries, showSeriesOverview, openSeriesOverview, showMapPage, showTimelinePage, isSidebarExpanded, setCategories, setCategoriesLoading, setAvailableSeries, refreshTrigger } = useNavigation();
  const { config } = useSiteConfig();
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchVideos() {
      setLoading(true);
      setError(null);
      try {
        // Add refresh=true query param when triggered by user
        const url = refreshTrigger > 0 ? '/api/videos?refresh=true' : '/api/videos';
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch videos');
        }

        setVideos(data.videos);
        if (data.categories) {
          setCategories(data.categories);
        }

        // Extract unique series from video metadata
        const seriesSet = new Set<string>();
        for (const video of data.videos) {
          if (video.metadata?.series) {
            seriesSet.add(video.metadata.series);
          }
        }
        setAvailableSeries(Array.from(seriesSet).sort());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
        setCategoriesLoading(false);
      }
    }

    fetchVideos();
  }, [refreshTrigger, setCategories, setCategoriesLoading, setAvailableSeries]);

  // Search-filtered videos (used for Series, Map, Timeline pages)
  const searchFilteredVideos = useMemo(() => {
    return searchVideos(videos, searchQuery);
  }, [videos, searchQuery]);

  // Filter videos by active category, series, and search query (used for main video grid)
  const filteredVideos = useMemo(() => {
    let result = searchFilteredVideos;

    // Filter by category
    if (activeCategory) {
      result = result.filter((video) => video.categoryId === activeCategory);
    }

    // Filter by series
    if (activeSeries) {
      result = result.filter((video) => video.metadata?.series === activeSeries);
    }

    return result;
  }, [searchFilteredVideos, activeCategory, activeSeries]);

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-yt-bg">
      {/* Fixed Header */}
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      <MobileDrawer />

      {/* Settings Modal */}
      <SettingsModal />

      {/* Main Content - offset for fixed header and sidebar */}
      <main
        className={`
          pt-14 min-h-screen transition-all duration-200
          md:ml-16 ${isSidebarExpanded ? 'md:ml-60' : 'md:ml-16'}
        `}
      >
        <div className="p-4 md:p-6">
          {loading ? (
            <VideoGridSkeleton />
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{t('videos.error')}: {error}</p>
              <p className="text-gray-500 dark:text-yt-text-secondary text-sm">
                {t('error.api_key')}
              </p>
            </div>
          ) : (showSeriesOverview && config.enableSeries) ? (
            <SeriesGrid videos={searchFilteredVideos} />
          ) : (showMapPage && config.enableMap) ? (
            <MapView videos={searchFilteredVideos} onVideoClick={handleVideoClick} />
          ) : (showTimelinePage && config.enableTimeline) ? (
            <TimelineView videos={searchFilteredVideos} onVideoClick={handleVideoClick} />
          ) : (
            <>
              {/* Back button when viewing a series */}
              {activeSeries && (
                <div className="mb-6">
                  <button
                    onClick={openSeriesOverview}
                    className="flex items-center gap-2 text-gray-600 dark:text-yt-text-secondary hover:text-primary transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span>{t('series.back')}</span>
                  </button>
                  <div className="flex items-center gap-3 mt-3 pb-2 border-b border-gray-200 dark:border-yt-border">
                    <List className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-yt-text">
                      {activeSeries}
                    </h2>
                    <span className="text-sm text-gray-500 dark:text-yt-text-secondary">
                      ({filteredVideos.length} {t('series.videos')})
                    </span>
                  </div>
                </div>
              )}
              <VideoGrid
                videos={filteredVideos}
                onVideoClick={handleVideoClick}
                groupByCategory={!activeCategory && !activeSeries && !searchQuery.trim()}
              />
            </>
          )}
        </div>
      </main>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={handleCloseModal} />
      )}
    </div>
  );
}
