import type { Metadata } from 'next';
import './globals.css';
import { SiteConfigProvider } from '@/contexts/SiteConfigContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { NavigationProvider } from '@/contexts/NavigationContext';

export const metadata: Metadata = {
  title: 'MyTube',
  description: 'Your private YouTube playlist viewer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-100 dark:bg-yt-bg text-gray-900 dark:text-yt-text min-h-screen transition-colors">
        <SiteConfigProvider>
          <SettingsProvider>
            <NavigationProvider>{children}</NavigationProvider>
          </SettingsProvider>
        </SiteConfigProvider>
      </body>
    </html>
  );
}
