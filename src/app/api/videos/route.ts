import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';
import { fetchAllCategoriesVideos } from '@/lib/youtube';
import { CategoriesConfig } from '@/types/category';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'YouTube API key not configured. Add YOUTUBE_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    // Read category config from JSON file
    const configPath = path.join(process.cwd(), 'config', 'categories.json');
    const configData = readFileSync(configPath, 'utf-8');
    const config: CategoriesConfig = JSON.parse(configData);

    if (!config.categories || config.categories.length === 0) {
      return NextResponse.json(
        { error: 'No categories configured in config/categories.json' },
        { status: 400 }
      );
    }

    // Check if any category has playlists
    const hasPlaylists = config.categories.some(
      (cat) => cat.playlists && cat.playlists.length > 0
    );

    if (!hasPlaylists) {
      return NextResponse.json(
        { error: 'No playlists configured in any category' },
        { status: 400 }
      );
    }

    const videos = await fetchAllCategoriesVideos(config.categories, apiKey, forceRefresh);

    return NextResponse.json({
      videos,
      categories: config.categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        playlistCount: cat.playlists.length,
      })),
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
