'use client';

import { useEffect, useCallback } from 'react';
import { Video } from '@/types/video';
import { useTranslation } from '@/i18n/useTranslation';
import { XIcon } from '@/components/Icons';

interface VideoModalProps {
  video: Video;
  onClose: () => void;
}

export default function VideoModal({ video, onClose }: VideoModalProps) {
  const { t } = useTranslation();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-5xl mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-primary transition-colors"
          aria-label={t('settings.close')}
        >
          <XIcon className="w-8 h-8" />
        </button>

        {/* Video player */}
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Video info */}
        <div className="mt-4 text-white">
          <h2 className="text-xl font-bold">{video.title}</h2>
          <p className="text-gray-400 mt-1">{video.channelTitle}</p>
          <p className="text-gray-400 text-sm mt-1">
            {t('video.from_playlist')}: {video.playlistName}
          </p>
        </div>
      </div>
    </div>
  );
}
