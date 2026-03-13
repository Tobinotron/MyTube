'use client';

import { useMemo } from 'react';
import { Video } from '@/types/video';
import { useTranslation } from '@/i18n/useTranslation';
import VideoCard from './VideoCard';
import { useNavigation } from '@/contexts/NavigationContext';
import { DynamicIcon } from './Icons/DynamicIcon';

interface VideoGridProps {
  videos: Video[];
  onVideoClick: (video: Video) => void;
  groupByCategory?: boolean;
}

export default function VideoGrid({ videos, onVideoClick, groupByCategory = false }: VideoGridProps) {
  const { t } = useTranslation();
  const { categories } = useNavigation();

  // Build a lookup map from dynamic categories
  const categoryLookup = useMemo(() => {
    const lookup: Record<string, { name: string; icon: typeof categories[0]['icon']; order: number }> = {};
    categories.forEach((cat, index) => {
      lookup[cat.id] = { name: cat.name, icon: cat.icon, order: index };
    });
    return lookup;
  }, [categories]);

  // Group videos by category
  const groupedVideos = useMemo(() => {
    if (!groupByCategory) return null;

    const groups: Record<string, Video[]> = {};

    for (const video of videos) {
      if (!groups[video.categoryId]) {
        groups[video.categoryId] = [];
      }
      groups[video.categoryId].push(video);
    }

    // Sort categories by their defined order
    return Object.entries(groups)
      .sort(([a], [b]) => {
        const orderA = categoryLookup[a]?.order ?? 99;
        const orderB = categoryLookup[b]?.order ?? 99;
        return orderA - orderB;
      });
  }, [videos, groupByCategory, categoryLookup]);

  if (videos.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-yt-text-secondary py-12">
        <p>{t('videos.empty')}</p>
      </div>
    );
  }

  // Grouped view with category headers
  if (groupByCategory && groupedVideos) {
    return (
      <div className="space-y-8">
        {groupedVideos.map(([categoryId, categoryVideos]) => {
          const catInfo = categoryLookup[categoryId];

          return (
            <section key={categoryId}>
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-200 dark:border-yt-border">
                {catInfo && (
                  <DynamicIcon name={catInfo.icon} className="w-6 h-6 text-primary" />
                )}
                <h2 className="text-xl font-bold text-gray-900 dark:text-yt-text">
                  {catInfo?.name ?? categoryId}
                </h2>
                <span className="text-sm text-gray-500 dark:text-yt-text-secondary">
                  ({categoryVideos.length})
                </span>
              </div>

              {/* Videos Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categoryVideos.map((video) => (
                  <VideoCard
                    key={`${video.playlistId}-${video.id}`}
                    video={video}
                    onClick={() => onVideoClick(video)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  // Simple grid view (single category or search results)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video) => (
        <VideoCard
          key={`${video.playlistId}-${video.id}`}
          video={video}
          onClick={() => onVideoClick(video)}
        />
      ))}
    </div>
  );
}
