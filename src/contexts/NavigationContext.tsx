'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { IconName } from '@/types/category';

export interface SidebarCategory {
  id: string;
  name: string;
  icon: IconName;
}

interface NavigationContextValue {
  // Sidebar state
  isSidebarExpanded: boolean;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;

  // Mobile menu state
  isMobileMenuOpen: boolean;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;

  // Active category
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;

  // Dynamic categories from config
  categories: SidebarCategory[];
  setCategories: (categories: SidebarCategory[]) => void;

  // Series from video metadata
  availableSeries: string[];
  setAvailableSeries: (series: string[]) => void;
  activeSeries: string | null;
  setActiveSeries: (series: string | null) => void;

  // Series overview page
  showSeriesOverview: boolean;
  openSeriesOverview: () => void;
  closeSeriesOverview: () => void;

  // Map page
  showMapPage: boolean;
  openMapPage: () => void;
  closeMapPage: () => void;

  // Timeline page
  showTimelinePage: boolean;
  openTimelinePage: () => void;
  closeTimelinePage: () => void;

  // Settings modal state
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;

  // Refresh trigger for forcing video cache refresh
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(
  undefined
);

export function NavigationProvider({ children }: { children: ReactNode }) {
  // Persist sidebar expanded state
  const [isSidebarExpanded, setSidebarExpandedState] = useLocalStorage(
    'mytube-sidebar-expanded',
    true
  );

  // Mobile menu state (not persisted)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active category (not persisted - starts with null to show all)
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Dynamic categories from config
  const [categories, setCategories] = useState<SidebarCategory[]>([]);

  // Series from video metadata
  const [availableSeries, setAvailableSeries] = useState<string[]>([]);
  const [activeSeries, setActiveSeriesState] = useState<string | null>(null);

  // Series overview page
  const [showSeriesOverview, setShowSeriesOverview] = useState(false);

  // Map page
  const [showMapPage, setShowMapPage] = useState(false);

  // Timeline page
  const [showTimelinePage, setShowTimelinePage] = useState(false);

  // When setting active series, clear active category and close other pages
  const setActiveSeries = (series: string | null) => {
    setActiveSeriesState(series);
    if (series !== null) {
      setActiveCategory(null);
      setShowSeriesOverview(false);
      setShowMapPage(false);
      setShowTimelinePage(false);
    }
  };

  const setActiveCategoryWithClear = (category: string | null) => {
    setActiveCategory(category);
    setActiveSeriesState(null);
    setShowSeriesOverview(false);
    setShowMapPage(false);
    setShowTimelinePage(false);
  };

  const openSeriesOverview = () => {
    setShowSeriesOverview(true);
    setActiveCategory(null);
    setActiveSeriesState(null);
    setShowMapPage(false);
    setShowTimelinePage(false);
    closeMobileMenu();
  };

  const closeSeriesOverview = () => {
    setShowSeriesOverview(false);
  };

  const openMapPage = () => {
    setShowMapPage(true);
    setActiveCategory(null);
    setActiveSeriesState(null);
    setShowSeriesOverview(false);
    setShowTimelinePage(false);
    closeMobileMenu();
  };

  const closeMapPage = () => {
    setShowMapPage(false);
  };

  const openTimelinePage = () => {
    setShowTimelinePage(true);
    setActiveCategory(null);
    setActiveSeriesState(null);
    setShowSeriesOverview(false);
    setShowMapPage(false);
    closeMobileMenu();
  };

  const closeTimelinePage = () => {
    setShowTimelinePage(false);
  };

  const toggleSidebar = () => {
    setSidebarExpandedState((prev) => !prev);
  };

  const setSidebarExpanded = (expanded: boolean) => {
    setSidebarExpandedState(expanded);
  };

  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
    closeMobileMenu(); // Close mobile menu when opening settings
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  // Refresh trigger - incrementing this triggers a refetch in the page
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <NavigationContext.Provider
      value={{
        isSidebarExpanded,
        toggleSidebar,
        setSidebarExpanded,
        isMobileMenuOpen,
        openMobileMenu,
        closeMobileMenu,
        activeCategory,
        setActiveCategory: setActiveCategoryWithClear,
        categories,
        setCategories,
        availableSeries,
        setAvailableSeries,
        activeSeries,
        setActiveSeries,
        showSeriesOverview,
        openSeriesOverview,
        closeSeriesOverview,
        showMapPage,
        openMapPage,
        closeMapPage,
        showTimelinePage,
        openTimelinePage,
        closeTimelinePage,
        isSettingsOpen,
        openSettings,
        closeSettings,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
