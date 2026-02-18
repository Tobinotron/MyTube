'use client';

import { useMemo } from 'react';
import { Video } from '@/types/video';
import { useSettings } from '@/contexts/SettingsContext';

interface TimelineContainerProps {
  videos: Video[];
  onVideoClick: (video: Video) => void;
}

interface TimelineItem {
  type: 'video' | 'break' | 'year';
  video?: Video;
  year?: number;
  daysGap?: number;
  spacing: number; // pixels of margin-top
  side: 'left' | 'right';
}

// Even spacing with break markers for large gaps
const VIDEO_SPACING = 16; // Consistent spacing between videos
const BREAK_THRESHOLD_DAYS = 60; // Show "..." for gaps > 60 days

export default function TimelineContainer({
  videos,
  onVideoClick,
}: TimelineContainerProps) {
  const { settings } = useSettings();

  // Process videos into timeline items with scaled spacing
  const timelineItems = useMemo(() => {
    if (videos.length === 0) return [];

    // Sort videos by date (newest first)
    const sortedVideos = [...videos].sort(
      (a, b) =>
        new Date(b.displayDate).getTime() - new Date(a.displayDate).getTime()
    );

    const items: TimelineItem[] = [];
    let currentSide: 'left' | 'right' = 'left';
    let lastYear: number | null = null;

    sortedVideos.forEach((video, index) => {
      const videoDate = new Date(video.displayDate);
      const videoYear = videoDate.getFullYear();

      // Add year header if year changed
      if (lastYear !== videoYear) {
        items.push({
          type: 'year',
          year: videoYear,
          spacing: lastYear === null ? 0 : 32,
          side: currentSide,
        });
        lastYear = videoYear;
      }

      // Calculate days since previous video for break detection
      let daysGap = 0;

      if (index > 0) {
        const prevDate = new Date(sortedVideos[index - 1].displayDate);
        daysGap = Math.abs(
          (prevDate.getTime() - videoDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Add break marker for large gaps
        if (daysGap > BREAK_THRESHOLD_DAYS) {
          items.push({
            type: 'break',
            daysGap: Math.round(daysGap),
            spacing: 5,
            side: currentSide,
          });
        }
      }

      const lastItem = items[items.length - 1];
      const noSpacing = items.length === 0 || lastItem?.type === 'year';
      const afterBreak = lastItem?.type === 'break';

      items.push({
        type: 'video',
        video,
        spacing: noSpacing ? 0 : afterBreak ? 5 : VIDEO_SPACING,
        side: currentSide,
      });

      currentSide = currentSide === 'left' ? 'right' : 'left';
    });

    return items;
  }, [videos]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(
      settings.language === 'de' ? 'de-DE' : 'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    );
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
    <div className="timeline-container pb-8 relative">
      {/* Central timeline axis */}
      <div className="timeline-axis-line" />

      {timelineItems.map((item, index) => {
        if (item.type === 'year') {
          return (
            <div
              key={`year-${item.year}`}
              className="timeline-year-marker"
              style={{ marginTop: item.spacing }}
            >
              <div className="timeline-year-badge">
                {item.year}
              </div>
            </div>
          );
        }

        if (item.type === 'break') {
          return (
            <div
              key={`break-${index}`}
              className="timeline-break"
              style={{ marginTop: item.spacing }}
            >
              <div className="timeline-break-dots">
                <div className="timeline-dot" />
                <div className="timeline-dot" />
                <div className="timeline-dot" />
              </div>
            </div>
          );
        }

        const video = item.video!;
        const isLeft = item.side === 'left';

        return (
          <div
            key={video.id}
            className={`timeline-video-item ${isLeft ? 'left' : 'right'}`}
            style={{ marginTop: item.spacing }}
          >
            {/* Card with pointer */}
            <div
              className={`timeline-video-card ${isLeft ? 'card-left' : 'card-right'}`}
              onClick={() => onVideoClick(video)}
            >
              {/* Thumbnail */}
              <div className="timeline-thumb">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  loading="lazy"
                />
                {video.durationSeconds > 0 && (
                  <span className="timeline-duration">
                    {formatDuration(video.durationSeconds)}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="timeline-info">
                <h3 className="timeline-title">{video.title}</h3>
                <p className="timeline-date">{formatDate(video.displayDate)}</p>
              </div>

              {/* Pointer triangle */}
              <div className={`timeline-pointer ${isLeft ? 'pointer-right' : 'pointer-left'}`} />
            </div>

            {/* Node on timeline */}
            <div className="timeline-node" />
          </div>
        );
      })}
    </div>
  );
}
