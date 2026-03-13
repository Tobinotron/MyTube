'use client';

import { useNavigation } from '@/contexts/NavigationContext';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { useTranslation } from '@/i18n/useTranslation';
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const { isSidebarExpanded, toggleSidebar, openMobileMenu } = useNavigation();
  const { config } = useSiteConfig();
  const { t } = useTranslation();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-white dark:bg-yt-bg border-b border-gray-200 dark:border-yt-border">
      <div className="h-full flex items-center px-4 gap-4">
        {/* Left section: Menu/Collapse button + Logo + Title */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Mobile menu button */}
          <button
            onClick={openMobileMenu}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-yt-text-secondary
              hover:bg-gray-100 dark:hover:bg-yt-hover transition-colors"
            aria-label={t('mobile.menu')}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Desktop sidebar toggle */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex p-2 rounded-lg text-gray-600 dark:text-yt-text-secondary
              hover:bg-gray-100 dark:hover:bg-yt-hover transition-colors"
            aria-label={isSidebarExpanded ? t('nav.collapse') : t('nav.expand')}
          >
            {isSidebarExpanded ? (
              <ChevronLeft className="w-6 h-6" />
            ) : (
              <ChevronRight className="w-6 h-6" />
            )}
          </button>

          {/* Logo */}
          <img
            src={config.logoPath}
            alt={config.name}
            className="w-8 h-8 rounded-lg flex-shrink-0"
          />

          {/* Title */}
          <span className="text-xl font-bold text-gray-900 dark:text-yt-text hidden sm:block">
            {config.name}
          </span>
        </div>

        {/* Center section: Search */}
        <div className="flex-1 flex justify-center max-w-2xl mx-auto">
          <div className="w-full relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('header.search')}
              className="w-full h-10 pl-4 pr-10 rounded-full
                bg-gray-100 dark:bg-yt-surface
                border border-gray-300 dark:border-yt-border
                text-gray-900 dark:text-yt-text
                placeholder-gray-500 dark:placeholder-yt-text-secondary
                focus:outline-none focus:border-blue-500 dark:focus:border-blue-500
                transition-colors"
            />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-yt-text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Right section: Profile placeholder */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-yt-hover flex items-center justify-center">
            <svg
              className="w-5 h-5 text-gray-500 dark:text-yt-text-secondary"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
