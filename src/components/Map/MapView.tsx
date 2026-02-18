'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Video } from '@/types/video';
import { useTranslation } from '@/i18n/useTranslation';
import { MapPinIcon } from '@/components/Icons';

// Dynamically import the map component to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import('./MapContainer'),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-[calc(100vh-180px)] min-h-[400px] bg-gray-100 dark:bg-yt-surface rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    ),
  }
);

interface MapViewProps {
  videos: Video[];
  onVideoClick: (video: Video) => void;
}

export default function MapView({ videos, onVideoClick }: MapViewProps) {
  const { t } = useTranslation();

  // Filter videos that have coordinates
  const geotaggedVideos = useMemo(() => {
    return videos.filter((video) => video.metadata?.coordinates);
  }, [videos]);

  if (geotaggedVideos.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPinIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-yt-text-secondary mb-4" />
        <p className="text-gray-500 dark:text-yt-text-secondary">{t('map.empty')}</p>
        <p className="text-gray-400 dark:text-yt-text-secondary text-sm mt-2">
          {t('map.empty_hint')}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-200 dark:border-yt-border">
        <MapPinIcon className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-yt-text">
          {t('map.title')}
        </h2>
        <span className="text-sm text-gray-500 dark:text-yt-text-secondary">
          ({geotaggedVideos.length} {t('series.videos')})
        </span>
      </div>

      {/* Map */}
      <MapContainer videos={geotaggedVideos} onVideoClick={onVideoClick} />
    </div>
  );
}
