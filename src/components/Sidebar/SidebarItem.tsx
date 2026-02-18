'use client';

import { ReactNode } from 'react';

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  isExpanded: boolean;
  onClick?: () => void;
}

export default function SidebarItem({
  icon,
  label,
  isActive = false,
  isExpanded,
  onClick,
}: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
        transition-colors duration-150
        ${
          isActive
            ? 'bg-gray-200 dark:bg-yt-hover text-primary'
            : 'text-gray-700 dark:text-yt-text-secondary hover:bg-gray-100 dark:hover:bg-yt-hover'
        }
      `}
      title={!isExpanded ? label : undefined}
    >
      <span className="w-6 h-6 flex-shrink-0">{icon}</span>
      <span
        className={`
          sidebar-label-transition whitespace-nowrap overflow-hidden
          ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
        `}
      >
        {label}
      </span>
    </button>
  );
}
