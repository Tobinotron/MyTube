import type { Metadata } from 'next';
import './globals.css';
import { SiteConfigProvider } from '@/contexts/SiteConfigContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { NavigationProvider } from '@/contexts/NavigationContext';
import siteConfig from '@/../config/site.json';
import { SiteConfig } from '@/types/siteConfig';

export const metadata: Metadata = {
  title: siteConfig.name,
  description: 'Your private YouTube playlist viewer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Compute CSS custom properties server-side so colors are correct on first paint
  const hex = siteConfig.primaryColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return (
    <html
      lang="en"
      className="dark"
      style={{
        '--color-primary': siteConfig.primaryColor,
        '--color-primary-rgb': `${r}, ${g}, ${b}`,
      } as React.CSSProperties}
    >
      <body className="bg-gray-100 dark:bg-yt-bg text-gray-900 dark:text-yt-text min-h-screen transition-colors">
        <SiteConfigProvider initialConfig={siteConfig as SiteConfig}>
          <SettingsProvider>
            <NavigationProvider>{children}</NavigationProvider>
          </SettingsProvider>
        </SiteConfigProvider>
      </body>
    </html>
  );
}
