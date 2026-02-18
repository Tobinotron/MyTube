import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { defaultSiteConfig, SiteConfig } from '@/types/siteConfig';

export async function GET() {
  try {
    const configPath = path.join(process.cwd(), 'config', 'site.json');

    if (!existsSync(configPath)) {
      return NextResponse.json(defaultSiteConfig);
    }

    const configData = readFileSync(configPath, 'utf-8');
    const config: Partial<SiteConfig> = JSON.parse(configData);

    // Merge with defaults to ensure all fields exist
    return NextResponse.json({ ...defaultSiteConfig, ...config });
  } catch (error) {
    console.error('Error loading site config:', error);
    return NextResponse.json(defaultSiteConfig);
  }
}
