'use client';

import { useMemo } from 'react';
import { Video } from '@/types/video';
import { useTranslation } from '@/i18n/useTranslation';
import { useNavigation } from '@/contexts/NavigationContext';
import SeriesCard from './SeriesCard';
import { ListIcon } from '@/components/Icons';

interface SeriesGridProps {
  videos: Video[];
}

export default function SeriesGrid({ videos }: SeriesGridProps) {
  const { t } = useTranslation();
  const { setActiveSeries } = useNavigation();

  // Group videos by series
  const seriesMap = useMemo(() => {
    const map = new Map<string, Video[]>();

    for (const video of videos) {
      const series = video.metadata?.series;
      if (series) {
        if (!map.has(series)) {
          map.set(series, []);
        }
        map.get(series)!.push(video);
      }
    }

    // Sort each series by display date (newest first)
    map.forEach((seriesVideos) => {
      seriesVideos.sort(
        (a, b) => new Date(b.displayDate).getTime() - new Date(a.displayDate).getTime()
      );
    });

    return map;
  }, [videos]);

  const seriesList = useMemo(() => {
    return Array.from(seriesMap.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [seriesMap]);

  if (seriesList.length === 0) {
    return (
      <div className="text-center py-12">
        <ListIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-yt-text-secondary mb-4" />
        <p className="text-gray-500 dark:text-yt-text-secondary">{t('series.empty')}</p>
        <p className="text-gray-400 dark:text-yt-text-secondary text-sm mt-2">
          {t('series.empty_hint')}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-200 dark:border-yt-border">
        <ListIcon className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-yt-text">
          {t('series.title')}
        </h2>
        <span className="text-sm text-gray-500 dark:text-yt-text-secondary">
          ({seriesList.length})
        </span>
      </div>

      {/* Series grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {seriesList.map(([seriesName, seriesVideos]) => (
          <SeriesCard
            key={seriesName}
            seriesName={seriesName}
            videos={seriesVideos}
            onClick={() => setActiveSeries(seriesName)}
          />
        ))}
      </div>
    </div>
  );
}
