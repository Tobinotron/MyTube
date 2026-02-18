import { VideoMetadata } from './metadata';

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  thumbnailHigh: string;
  channelTitle: string;
  publishedAt: string;
  playlistId: string;
  playlistName: string;
  categoryId: string;
  categoryName: string;
  // Additional video details
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string; // ISO 8601 duration (e.g., "PT4M13S")
  durationSeconds: number;
  tags: string[];
  // Metadata from video description
  metadata?: VideoMetadata;
  displayDate: string; // Effective date for display/sorting (uses metadata date if available)
  cleanDescription: string; // Description without the metadata section
}

export interface Playlist {
  id: string;
  name: string;
}

export interface PlaylistConfig {
  playlists: Playlist[];
}

export interface YouTubePlaylistItemResponse {
  items: YouTubePlaylistItem[];
  nextPageToken?: string;
}

export interface YouTubePlaylistItem {
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
      maxres?: { url: string };
    };
    channelTitle: string;
    publishedAt: string;
    resourceId: {
      videoId: string;
    };
  };
}

export interface YouTubeVideoResponse {
  items: YouTubeVideoItem[];
}

export interface YouTubeVideoItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
      maxres?: { url: string };
    };
    channelTitle: string;
    publishedAt: string;
    tags?: string[];
  };
  contentDetails: {
    duration: string;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}
