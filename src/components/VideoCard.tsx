'use client';

import { Video } from '@/types/video';
import { useSettings } from '@/contexts/SettingsContext';

interface VideoCardProps {
  video: Video;
  onClick: () => void;
}

export default function VideoCard({ video, onClick }: VideoCardProps) {
  const { settings } = useSettings();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(settings.language === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="cursor-pointer group" onClick={onClick}>
      <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-200 dark:bg-yt-surface">
        <img
          src={video.thumbnailHigh}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />

        {/* Duration badge */}
        {video.durationSeconds > 0 && (
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-xs font-medium rounded">
            {formatDuration(video.durationSeconds)}
          </span>
        )}
      </div>
      <div className="mt-2">
        <h3 className="font-medium text-sm line-clamp-2 text-gray-900 dark:text-yt-text group-hover:text-primary transition-colors">
          {video.title}
        </h3>
        <p className="text-gray-500 dark:text-yt-text-secondary text-xs mt-1">{video.channelTitle}</p>
        <p className="text-gray-400 dark:text-yt-text-secondary text-xs">{formatDate(video.displayDate)}</p>
      </div>
    </div>
  );
}
