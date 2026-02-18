export type ColorScheme = 'dark' | 'light';

export interface SiteConfig {
  name: string;
  logoPath: string;
  enableSeries: boolean;
  enableTimeline: boolean;
  enableMap: boolean;
  primaryColor: string;
  defaultColorScheme: ColorScheme;
}

export const defaultSiteConfig: SiteConfig = {
  name: 'MyTube',
  logoPath: '/icon.png',
  enableSeries: true,
  enableTimeline: true,
  enableMap: true,
  primaryColor: '#dc2626',
  defaultColorScheme: 'dark',
};
