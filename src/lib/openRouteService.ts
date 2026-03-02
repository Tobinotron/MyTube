import { Coordinates } from '@/types/metadata';

const ORS_API_BASE = 'https://api.openrouteservice.org/v2';

const VALID_PROFILES = [
  'driving-car',
  'driving-hgv',
  'cycling-regular',
  'cycling-mountain',
  'cycling-road',
  'cycling-electric',
  'foot-walking',
  'foot-hiking',
];

interface OrsGeoJsonResponse {
  features?: Array<{
    geometry?: {
      coordinates?: number[][];
    };
  }>;
}

/**
 * Fetch a route from OpenRouteService Directions API.
 * Returns the full route as an array of coordinates, or null on failure.
 */
export async function fetchOrsRoute(
  waypoints: Coordinates[],
  profile: string,
  apiKey: string
): Promise<Coordinates[] | null> {
  if (waypoints.length < 2) return null;

  const resolvedProfile = VALID_PROFILES.includes(profile) ? profile : 'foot-hiking';

  // ORS expects coordinates as [[lng, lat], ...] (note: lng first!)
  const coordinates = waypoints.map(w => [w.lng, w.lat]);

  try {
    const response = await fetch(`${ORS_API_BASE}/directions/${resolvedProfile}/geojson`, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ coordinates }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.warn(
        `OpenRouteService API error (${response.status}): ${errorText.substring(0, 200)}`
      );
      return null;
    }

    const data: OrsGeoJsonResponse = await response.json();

    const coords = data.features?.[0]?.geometry?.coordinates;
    if (!coords || coords.length < 2) {
      console.warn('OpenRouteService returned no route coordinates');
      return null;
    }

    // ORS returns [lng, lat] — convert to our {lat, lng} format
    return coords.map(([lng, lat]) => ({ lat, lng }));
  } catch (error) {
    console.warn('OpenRouteService request failed:', error);
    return null;
  }
}
