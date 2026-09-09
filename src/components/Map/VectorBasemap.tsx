'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { setWorkerUrl } from 'maplibre-gl';
import '@maplibre/maplibre-gl-leaflet';
import 'maplibre-gl/dist/maplibre-gl.css';

// MapLibre 6 ships its worker as a separate module and locates it via import.meta.url,
// which bundlers rewrite to a file path, so the worker never starts and no tiles load.
// scripts/copy-maplibre-worker.mjs (run before dev/build) serves it from /public instead.
setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');

const CARTO_HOST = /(^|\.)basemaps\.cartocdn\.com$/;

// CARTO does not propagate the API key from the style URL into the tile, sprite and
// glyph URLs inside the style, so we append it to every request going to CARTO ourselves.
export function withCartoKey(url: string, apiKey?: string): string {
  if (!apiKey) return url;
  try {
    const parsed = new URL(url);
    if (!CARTO_HOST.test(parsed.hostname) || parsed.searchParams.has('key')) return url;
    parsed.searchParams.set('key', apiKey);
    return parsed.toString();
  } catch {
    return url;
  }
}

export function isWebGLAvailable(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

interface VectorBasemapProps {
  styleUrl: string;
  attribution: string;
  apiKey?: string;
}

// Renders a MapLibre vector basemap as a Leaflet layer in the tile pane, so markers,
// clusters and polylines drawn by Leaflet stay on top of it.
export default function VectorBasemap({ styleUrl, attribution, apiKey }: VectorBasemapProps) {
  const map = useMap();

  useEffect(() => {
    const layer = L.maplibreGL({
      style: withCartoKey(styleUrl, apiKey),
      attributionControl: { customAttribution: attribution },
      transformRequest: (url) => ({ url: withCartoKey(url, apiKey) }),
    });
    layer.addTo(map);

    return () => {
      layer.remove();
    };
  }, [map, styleUrl, attribution, apiKey]);

  return null;
}
