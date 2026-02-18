'use client';

import { useEffect, useMemo } from 'react';
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

export default function MapContainer({ videos, onVideoClick }: MapContainerProps) {
  const { settings } = useSettings();

  // Dynamic tile URL based on theme
  const tileUrl = settings.theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

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
    <LeafletMapContainer
      center={[center.lat, center.lng]}
      zoom={5}
      maxZoom={15}
      className="h-[calc(100vh-180px)] min-h-[400px] w-full rounded-lg z-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution={tileAttribution}
        url={tileUrl}
      />
      <FitBounds videos={videos} />

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
    </LeafletMapContainer>
  );
}
