'use client';

import dynamic from 'next/dynamic';
import { Video } from '@/types/video';
import { useTranslation } from '@/i18n/useTranslation';
import { Clock } from 'lucide-react';

// Dynamically import the timeline container for code splitting
const TimelineContainer = dynamic(() => import('./TimelineContainer'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-[calc(100vh-180px)] min-h-[400px] bg-gray-100 dark:bg-yt-surface rounded-lg">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  ),
});

interface TimelineViewProps {
  videos: Video[];
  onVideoClick: (video: Video) => void;
}

export default function TimelineView({
  videos,
  onVideoClick,
}: TimelineViewProps) {
  const { t } = useTranslation();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-200 dark:border-yt-border">
        <Clock className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-yt-text">
          {t('timeline.title')}
        </h2>
        <span className="text-sm text-gray-500 dark:text-yt-text-secondary">
          ({videos.length} {t('series.videos')})
        </span>
      </div>

      {/* Timeline */}
      <TimelineContainer videos={videos} onVideoClick={onVideoClick} />
    </div>
  );
}
