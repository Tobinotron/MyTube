import {
  Video,
  YouTubePlaylistItemResponse,
  YouTubeVideoResponse,
} from '@/types/video';
import { Category } from '@/types/category';
import { parseVideoMetadata, getEffectiveDate } from './metadataParser';
import { fetchOrsRoute } from './openRouteService';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// Parse ISO 8601 duration (e.g., "PT4M13S") to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// Fetch video details for a batch of video IDs (max 50)
async function fetchVideoDetails(
  videoIds: string[],
  apiKey: string,
  forceRefresh: boolean = false
): Promise<Map<string, YouTubeVideoResponse['items'][0]>> {
  if (videoIds.length === 0) {
    return new Map();
  }

  const url = new URL(`${YOUTUBE_API_BASE}/videos`);
  url.searchParams.set('part', 'snippet,contentDetails,statistics');
  url.searchParams.set('id', videoIds.join(','));
  url.searchParams.set('key', apiKey);

  // Cache for 1 hour by default, or force fresh data if requested
  const fetchOptions: RequestInit = forceRefresh
    ? { cache: 'no-store' }
    : { next: { revalidate: 3600 } };
  const response = await fetch(url.toString(), fetchOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `YouTube API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
    );
  }

  const data: YouTubeVideoResponse = await response.json();

  const videoMap = new Map<string, YouTubeVideoResponse['items'][0]>();
  for (const item of data.items) {
    videoMap.set(item.id, item);
  }

  return videoMap;
}

interface PlaylistFetchOptions {
  playlistId: string;
  playlistName: string;
  categoryId: string;
  categoryName: string;
  apiKey: string;
  maxResults?: number;
  forceRefresh?: boolean;
}

export async function fetchPlaylistVideos(
  options: PlaylistFetchOptions
): Promise<Video[]> {
  const {
    playlistId,
    playlistName,
    categoryId,
    categoryName,
    apiKey,
    maxResults = 50,
    forceRefresh = false,
  } = options;

  const playlistItems: { videoId: string }[] = [];
  let nextPageToken: string | undefined;

  // Step 1: Fetch all video IDs from the playlist
  do {
    const url = new URL(`${YOUTUBE_API_BASE}/playlistItems`);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('playlistId', playlistId);
    url.searchParams.set('maxResults', String(Math.min(maxResults, 50)));
    url.searchParams.set('key', apiKey);
    if (nextPageToken) {
      url.searchParams.set('pageToken', nextPageToken);
    }

    // Cache for 1 hour by default, or force fresh data if requested
    const fetchOptions: RequestInit = options.forceRefresh
      ? { cache: 'no-store' }
      : { next: { revalidate: 3600 } };
    const response = await fetch(url.toString(), fetchOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `YouTube API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
      );
    }

    const data: YouTubePlaylistItemResponse = await response.json();

    for (const item of data.items) {
      // Skip deleted/private videos
      if (
        item.snippet.title === 'Deleted video' ||
        item.snippet.title === 'Private video'
      ) {
        continue;
      }

      playlistItems.push({
        videoId: item.snippet.resourceId.videoId,
      });
    }

    nextPageToken = data.nextPageToken;
  } while (nextPageToken && playlistItems.length < maxResults);

  // Step 2: Fetch video details in batches of 50
  const videos: Video[] = [];
  const videoIds = playlistItems.map((item) => item.videoId);

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const videoDetails = await fetchVideoDetails(batch, apiKey, forceRefresh);

    for (const videoId of batch) {
      const details = videoDetails.get(videoId);
      if (!details) continue;

      // Parse metadata from description
      const description = details.snippet.description;
      const parseResult = parseVideoMetadata(description);

      // Log warnings in development
      if (parseResult.warnings && parseResult.warnings.length > 0) {
        console.warn(
          `Metadata warnings for video ${videoId}:`,
          parseResult.warnings
        );
      }

      const metadata = parseResult.hasMetadata ? parseResult.metadata : undefined;
      const displayDate = getEffectiveDate(details.snippet.publishedAt, metadata);

      videos.push({
        id: videoId,
        title: details.snippet.title,
        description: details.snippet.description,
        cleanDescription: parseResult.cleanDescription,
        thumbnailUrl:
          details.snippet.thumbnails.medium?.url ||
          details.snippet.thumbnails.default.url,
        thumbnailHigh:
          details.snippet.thumbnails.maxres?.url ||
          details.snippet.thumbnails.high?.url ||
          details.snippet.thumbnails.medium?.url ||
          details.snippet.thumbnails.default.url,
        channelTitle: details.snippet.channelTitle,
        publishedAt: details.snippet.publishedAt,
        displayDate,
        playlistId: playlistId,
        playlistName: playlistName,
        categoryId: categoryId,
        categoryName: categoryName,
        viewCount: parseInt(details.statistics.viewCount || '0', 10),
        likeCount: parseInt(details.statistics.likeCount || '0', 10),
        commentCount: parseInt(details.statistics.commentCount || '0', 10),
        duration: details.contentDetails.duration,
        durationSeconds: parseDuration(details.contentDetails.duration),
        tags: details.snippet.tags || [],
        metadata,
      });
    }
  }

  return videos;
}

export async function fetchAllCategoriesVideos(
  categories: Category[],
  apiKey: string,
  forceRefresh: boolean = false,
  orsApiKey?: string
): Promise<Video[]> {
  const allVideos: Video[] = [];

  for (const category of categories) {
    for (const playlist of category.playlists) {
      try {
        const videos = await fetchPlaylistVideos({
          playlistId: playlist.id,
          playlistName: playlist.name,
          categoryId: category.id,
          categoryName: category.name,
          apiKey,
          forceRefresh,
        });
        allVideos.push(...videos);
      } catch (error) {
        console.error(
          `Error fetching playlist ${playlist.id} in category ${category.id}:`,
          error
        );
      }
    }
  }

  // Resolve ORS routes for videos with waypoints
  if (orsApiKey) {
    const videosNeedingRoutes = allVideos.filter(
      v => v.metadata?.routeWaypoints && !v.metadata?.route
    );

    await Promise.all(
      videosNeedingRoutes.map(async (video) => {
        const waypoints = video.metadata!.routeWaypoints!;
        const profile = video.metadata!.routeProfile || 'foot-hiking';
        const route = await fetchOrsRoute(waypoints, profile, orsApiKey);
        if (route) {
          video.metadata!.route = route;
          // Auto-derive coordinates if not set
          if (!video.metadata!.coordinates) {
            video.metadata!.coordinates = { lat: route[0].lat, lng: route[0].lng };
          }
        }
      })
    );
  }

  // Sort by display date (newest first) - uses metadata date if available
  return allVideos.sort(
    (a, b) =>
      new Date(b.displayDate).getTime() - new Date(a.displayDate).getTime()
  );
}
