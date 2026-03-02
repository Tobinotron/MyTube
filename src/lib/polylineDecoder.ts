import { Coordinates } from '@/types/metadata';

/**
 * Decode a Google Encoded Polyline string into an array of coordinates.
 * Algorithm: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
export function decodePolyline(encoded: string): Coordinates[] {
  const coordinates: Coordinates[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lat += (result & 1) ? ~(result >> 1) : (result >> 1);

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lng += (result & 1) ? ~(result >> 1) : (result >> 1);

    coordinates.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return coordinates;
}

/**
 * Parse raw coordinate pairs in "lat,lng;lat,lng;..." format.
 */
export function parseRawRoute(raw: string): Coordinates[] | null {
  const points = raw.split(';').map(p => p.trim()).filter(p => p.length > 0);
  if (points.length < 2) return null;

  const coordinates: Coordinates[] = [];
  for (const point of points) {
    const parts = point.split(',').map(s => s.trim());
    if (parts.length !== 2) return null;

    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);

    if (isNaN(lat) || isNaN(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

    coordinates.push({ lat, lng });
  }

  return coordinates;
}

/**
 * Auto-detect format and parse a route string.
 * Semicolons indicate raw coordinate pairs, otherwise treated as encoded polyline.
 */
export function parseRoute(value: string): Coordinates[] | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.includes(';')) {
    return parseRawRoute(trimmed);
  }

  try {
    const decoded = decodePolyline(trimmed);
    if (decoded.length >= 2) {
      return decoded;
    }
  } catch {
    // Invalid encoded polyline
  }

  return null;
}
