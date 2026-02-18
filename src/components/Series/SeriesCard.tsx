'use client';

import { Video } from '@/types/video';
import { useTranslation } from '@/i18n/useTranslation';
import { ListIcon } from '@/components/Icons';

interface SeriesCardProps {
  seriesName: string;
  videos: Video[];
  onClick: () => void;
}

export default function SeriesCard({ seriesName, videos, onClick }: SeriesCardProps) {
  const { t } = useTranslation();
  const videoCount = videos.length;
  const thumbnail = videos[0]?.thumbnailHigh || '';

  const totalDuration = videos.reduce((sum, v) => sum + v.durationSeconds, 0);
  const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="cursor-pointer group" onClick={onClick}>
      <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-200 dark:bg-yt-surface">
        {/* Thumbnail */}
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={seriesName}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ListIcon className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200" />

        {/* Right side overlay with video count */}
        <div className="absolute top-0 right-0 bottom-0 w-2/5 bg-black/80 flex flex-col items-center justify-center gap-1">
          <span className="text-white text-2xl font-bold">{videoCount}</span>
          <ListIcon className="w-6 h-6 text-white" />
        </div>

        {/* Play all overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-black/70 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span className="text-sm font-medium">{t('series.play_all')}</span>
          </div>
        </div>
      </div>

      {/* Series info */}
      <div className="mt-2">
        <h3 className="font-medium text-sm line-clamp-2 text-gray-900 dark:text-yt-text group-hover:text-primary transition-colors">
          {seriesName}
        </h3>
        <p className="text-gray-500 dark:text-yt-text-secondary text-xs mt-1">
          {videoCount} {t('series.videos')} · {formatTotalDuration(totalDuration)}
        </p>
      </div>
    </div>
  );
}
