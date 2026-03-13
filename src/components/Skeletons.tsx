'use client';

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-yt-surface rounded ${className}`} />
  );
}

export function VideoCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-video rounded-lg" />
      <div className="mt-2 space-y-2">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
        <Skeleton className="h-3 w-1/3 rounded" />
      </div>
    </div>
  );
}

export function VideoGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function SidebarCategorySkeleton({ isExpanded, count = 3 }: { isExpanded: boolean; count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5">
          <Skeleton className="w-6 h-6 rounded flex-shrink-0" />
          {isExpanded && <Skeleton className="h-4 w-24 rounded" />}
        </div>
      ))}
    </>
  );
}

export function MobileDrawerCategorySkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3">
          <Skeleton className="w-6 h-6 rounded flex-shrink-0" />
          <Skeleton className="h-4 w-28 rounded" />
        </div>
      ))}
    </>
  );
}
