'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import { Video } from '@/types/video';
import { useSettings } from '@/contexts/SettingsContext';

// Import Leaflet and MarkerCluster CSS
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/styles';

// Create a thumbnail pin marker icon for a video (16:9 aspect ratio)
const createThumbnailIcon = (thumbnailUrl: string) => {
  const width = 56;
  const height = 44; // 32px head (56*9/16 ≈ 31.5) + 12px tail
  return L.divIcon({
    html: `
      <div class="thumbnail-pin-marker">
        <div class="thumbnail-pin-head">
          <img src="${thumbnailUrl}" alt="" />
        </div>
        <div class="thumbnail-pin-tail"></div>
      </div>
    `,
    className: 'thumbnail-pin-container',
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, 0],
  });
};

// Create custom cluster icon (must be regular function for Leaflet context)
function createClusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount();
  const size = count < 10 ? 40 : count < 100 ? 50 : 60;

  return L.divIcon({
    html: `<div class="cluster-count">${count}</div>`,
    className: 'cluster-icon',
    iconSize: L.point(size, size),
  });
}

interface MapContainerProps {
  videos: Video[];
  onVideoClick: (video: Video) => void;
}

// Clear polylines when clicking the map background (not markers/popups)
function MapClickHandler({ polylinesRef, showAllRoutes }: { polylinesRef: React.MutableRefObject<L.Polyline[]>; showAllRoutes: boolean }) {
  const map = useMap();

  useEffect(() => {
    const onClick = () => {
      if (showAllRoutes) return; // Don't clear when "show all" is active
      polylinesRef.current.forEach(p => p.remove());
      polylinesRef.current = [];
    };
    map.on('click', onClick);
    return () => { map.off('click', onClick); };
  }, [map, polylinesRef, showAllRoutes]);

  return null;
}

// Component to fit map bounds to markers
function FitBounds({ videos }: { videos: Video[] }) {
  const map = useMap();

  useEffect(() => {
    if (videos.length === 0) return;

    const bounds = L.latLngBounds(
      videos
        .filter((v) => v.metadata?.coordinates)
        .map((v) => [v.metadata!.coordinates!.lat, v.metadata!.coordinates!.lng] as L.LatLngTuple)
    );

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [map, videos]);

  return null;
}

// Manages "Show All Routes" polylines via native Leaflet API
function AllRoutesManager({
  videos,
  showAllRoutes,
  allRoutesRef,
  activePolylinesRef,
}: {
  videos: Video[];
  showAllRoutes: boolean;
  allRoutesRef: React.MutableRefObject<L.Polyline[]>;
  activePolylinesRef: React.MutableRefObject<L.Polyline[]>;
}) {
  const map = useMap();

  useEffect(() => {
    if (showAllRoutes) {
      // Clear per-click routes first
      activePolylinesRef.current.forEach(p => p.remove());
      activePolylinesRef.current = [];

      const color = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#dc2626';

      for (const video of videos) {
        if (video.metadata?.route && video.metadata.route.length >= 2) {
          const positions = video.metadata.route.map(c => [c.lat, c.lng] as [number, number]);
          allRoutesRef.current.push(
            L.polyline(positions, {
              color,
              weight: 3,
              opacity: 0.7,
              lineCap: 'round',
              lineJoin: 'round',
            }).addTo(map)
          );
        }
      }
    } else {
      allRoutesRef.current.forEach(p => p.remove());
      allRoutesRef.current = [];
    }

    return () => {
      allRoutesRef.current.forEach(p => p.remove());
      allRoutesRef.current = [];
    };
  }, [showAllRoutes, videos, map, allRoutesRef, activePolylinesRef]);

  return null;
}

// Syncs max zoom when map style changes
function MaxZoomUpdater({ maxZoom }: { maxZoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setMaxZoom(maxZoom);
  }, [map, maxZoom]);
  return null;
}

// Toggle button component for map controls
function MapControlButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={title}
      className={`
        p-2 rounded-lg shadow-md border transition-colors
        ${active
          ? 'bg-primary text-white border-primary'
          : 'bg-white dark:bg-yt-surface text-gray-600 dark:text-yt-text-secondary border-gray-200 dark:border-yt-border hover:bg-gray-50 dark:hover:bg-yt-hover'
        }
      `}
    >
      {children}
    </button>
  );
}

type MapStyle = 'styled' | 'satellite';

const TILE_CONFIGS: Record<string, { url: string; attribution: string; maxZoom: number }> = {
  'styled-light': {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
  },
  'styled-dark': {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Sources: Esri, Maxar, Earthstar Geographics',
    maxZoom: 19,
  },
};

export default function MapContainer({ videos, onVideoClick }: MapContainerProps) {
  const { settings } = useSettings();
  const activePolylinesRef = useRef<L.Polyline[]>([]);
  const allRoutesRef = useRef<L.Polyline[]>([]);
  const [markersHidden, setMarkersHidden] = useState(false);
  const [showAllRoutes, setShowAllRoutes] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyle>('styled');

  const hasAnyRoutes = useMemo(() => videos.some(v => v.metadata?.route && v.metadata.route.length >= 2), [videos]);

  const tileKey = mapStyle === 'styled' ? `styled-${settings.theme}` : mapStyle;
  const tileConfig = TILE_CONFIGS[tileKey];

  const toggleMapStyle = () => {
    setMapStyle(s => s === 'styled' ? 'satellite' : 'styled');
  };

  // Calculate center from videos or default to Europe
  const center = useMemo(() => {
    const videosWithCoords = videos.filter((v) => v.metadata?.coordinates);
    if (videosWithCoords.length === 0) {
      return { lat: 50, lng: 10 }; // Default to central Europe
    }

    const sumLat = videosWithCoords.reduce((sum, v) => sum + v.metadata!.coordinates!.lat, 0);
    const sumLng = videosWithCoords.reduce((sum, v) => sum + v.metadata!.coordinates!.lng, 0);

    return {
      lat: sumLat / videosWithCoords.length,
      lng: sumLng / videosWithCoords.length,
    };
  }, [videos]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(settings.language === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="relative">
      {/* Map control buttons */}
      <div className="absolute top-2 right-2 z-[1000] flex gap-1.5">
        {hasAnyRoutes && (
          <>
            <MapControlButton
              active={markersHidden}
              onClick={() => setMarkersHidden(h => !h)}
              title={markersHidden ? 'Show markers' : 'Hide markers'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                {markersHidden ? (
                  <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.092 1.092a4 4 0 00-5.558-5.558z" clipRule="evenodd" />
                ) : (
                  <>
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </>
                )}
              </svg>
            </MapControlButton>
            <MapControlButton
              active={showAllRoutes}
              onClick={() => setShowAllRoutes(s => !s)}
              title={showAllRoutes ? 'Hide all routes' : 'Show all routes'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M8.157 2.176a1.5 1.5 0 0 0-1.147 0l-4.084 1.69A1.5 1.5 0 0 0 2 5.25v10.877a1.5 1.5 0 0 0 2.074 1.386l3.51-1.452 4.26 1.762a1.5 1.5 0 0 0 1.146 0l4.083-1.69A1.5 1.5 0 0 0 18 14.75V3.872a1.5 1.5 0 0 0-2.073-1.386l-3.51 1.452-4.26-1.762ZM7.58 5a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5A.75.75 0 0 1 7.58 5Zm5.59 2.75a.75.75 0 0 0-1.5 0v6.5a.75.75 0 0 0 1.5 0v-6.5Z" clipRule="evenodd" />
              </svg>
            </MapControlButton>
          </>
        )}
        <MapControlButton
          active={mapStyle !== 'styled'}
          onClick={toggleMapStyle}
          title={mapStyle === 'styled' ? 'Switch to satellite' : 'Switch to styled'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            {mapStyle === 'satellite' ? (
              // Mountain (satellite active)
              <path fillRule="evenodd" d="M1 18L7 4l4 6 3-3 5 11H1Z" clipRule="evenodd" />
            ) : (
              // Grid/squares icon (styled active) — Heroicons squares-2x2
              <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h2.5A2.25 2.25 0 0 0 9 6.75v-2.5A2.25 2.25 0 0 0 6.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 2 13.25v2.5A2.25 2.25 0 0 0 4.25 18h2.5A2.25 2.25 0 0 0 9 15.75v-2.5A2.25 2.25 0 0 0 6.75 11h-2.5Zm9-9A2.25 2.25 0 0 0 11 4.25v2.5A2.25 2.25 0 0 0 13.25 9h2.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 11 13.25v2.5A2.25 2.25 0 0 0 13.25 18h2.5A2.25 2.25 0 0 0 18 15.75v-2.5A2.25 2.25 0 0 0 15.75 11h-2.5Z" clipRule="evenodd" />
            )}
          </svg>
        </MapControlButton>
      </div>

      <LeafletMapContainer
        center={[center.lat, center.lng]}
        zoom={5}
        maxZoom={20}
        className="h-[calc(100vh-180px)] min-h-[400px] w-full rounded-lg z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          key={tileKey}
          attribution={tileConfig.attribution}
          url={tileConfig.url}
          maxZoom={tileConfig.maxZoom}
        />
        <MaxZoomUpdater maxZoom={tileConfig.maxZoom} />
        <FitBounds videos={videos} />
        <MapClickHandler polylinesRef={activePolylinesRef} showAllRoutes={showAllRoutes} />
        <AllRoutesManager
          videos={videos}
          showAllRoutes={showAllRoutes}
          allRoutesRef={allRoutesRef}
          activePolylinesRef={activePolylinesRef}
        />

        {!markersHidden && (
          <MarkerClusterGroup
            iconCreateFunction={createClusterIcon}
            maxClusterRadius={80}
            showCoverageOnHover={false}
            spiderfyOnMaxZoom={true}
            zoomToBoundsOnClick={false}
            eventHandlers={{
              clusterclick: (e: L.LeafletMouseEvent) => {
                const cluster = e.layer;
                const map = e.target._map;
                const maxZoom = 15;
                const bounds = cluster.getBounds();

                // Check if markers are at the same location (inseparable)
                const isInseparable = bounds.getNorthEast().equals(bounds.getSouthWest());

                if (map.getZoom() >= maxZoom) {
                  // Already at max zoom, spiderfy
                  cluster.spiderfy();
                } else if (isInseparable) {
                  // Same location - zoom to max and spiderfy
                  map.setView(cluster.getLatLng(), maxZoom);
                } else {
                  // Normal cluster - zoom to fit bounds
                  map.fitBounds(bounds, { padding: [50, 50] });
                }
              },
            }}
          >
            {videos.map((video) => {
              const coords = video.metadata?.coordinates;
              if (!coords) return null;

              const thumbnailIcon = createThumbnailIcon(video.thumbnailUrl);

              return (
                <Marker
                  key={video.id}
                  position={[coords.lat, coords.lng]}
                  icon={thumbnailIcon}
                  eventHandlers={{
                    popupopen: (e) => {
                      const container = e.target.getElement();
                      if (container) container.style.opacity = '0';

                      // Skip per-click route drawing when "show all routes" is active
                      if (showAllRoutes) return;

                      // Clear any previous polylines
                      activePolylinesRef.current.forEach(p => p.remove());
                      activePolylinesRef.current = [];

                      const map = e.target._map;
                      const color = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#dc2626';

                      // If video belongs to a series, draw sibling routes first (dimmed)
                      if (video.metadata?.series) {
                        const siblings = videos.filter(
                          v => v.id !== video.id
                            && v.metadata?.series === video.metadata!.series
                            && v.metadata?.route && v.metadata.route.length >= 2
                        );
                        for (const sibling of siblings) {
                          const positions = sibling.metadata!.route!.map(c => [c.lat, c.lng] as [number, number]);
                          activePolylinesRef.current.push(
                            L.polyline(positions, {
                              color,
                              weight: 3,
                              opacity: 0.35,
                              lineCap: 'round',
                              lineJoin: 'round',
                            }).addTo(map)
                          );
                        }
                      }

                      // Draw current video's route on top (highlighted)
                      if (video.metadata?.route && video.metadata.route.length >= 2) {
                        const positions = video.metadata.route.map(c => [c.lat, c.lng] as [number, number]);
                        activePolylinesRef.current.push(
                          L.polyline(positions, {
                            color,
                            weight: 4,
                            opacity: 0.85,
                            lineCap: 'round',
                            lineJoin: 'round',
                          }).addTo(map)
                        );
                      }
                    },
                    popupclose: (e) => {
                      const container = e.target.getElement();
                      if (container) container.style.opacity = '1';
                    },
                  }}
                >
                  <Popup>
                    <div
                      className="cursor-pointer w-[200px]"
                      onClick={() => onVideoClick(video)}
                    >
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full rounded-lg mb-2 mx-auto block"
                      />
                      <h3 className="font-medium text-sm line-clamp-2 text-gray-900 dark:text-yt-text hover:text-primary">
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-yt-text-secondary mt-1">
                        {video.metadata?.location || formatDate(video.displayDate)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        )}
      </LeafletMapContainer>
    </div>
  );
}
