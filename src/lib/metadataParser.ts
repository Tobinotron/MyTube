import { VideoMetadata, MetadataParseResult, Coordinates } from '@/types/metadata';
import { parseRoute, parseRawRoute } from './polylineDecoder';

// Regex pattern that matches the metadata marker
// Supports: === Metadata ===, --- Metadata ---, or mixed (at least 3 of =, -, or #)
const METADATA_MARKER_REGEX = /[=\-#]{3,}\s*Metadata\s*[=\-#]{3,}/i;

// Regex patterns for date parsing
const DATE_PATTERNS = [
  // DD.MM.YYYY (German format)
  {
    regex: /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
    parse: (m: RegExpMatchArray) =>
      new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1])),
  },
  // YYYY-MM-DD (ISO format)
  {
    regex: /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
    parse: (m: RegExpMatchArray) =>
      new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3])),
  },
  // MM/DD/YYYY (US format)
  {
    regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    parse: (m: RegExpMatchArray) =>
      new Date(parseInt(m[3]), parseInt(m[1]) - 1, parseInt(m[2])),
  },
];

/**
 * Parse a date string into a Date object.
 * Supports multiple formats: DD.MM.YYYY, YYYY-MM-DD, MM/DD/YYYY
 */
function parseDate(dateString: string): Date | null {
  const trimmed = dateString.trim();

  for (const pattern of DATE_PATTERNS) {
    const match = trimmed.match(pattern.regex);
    if (match) {
      const date = pattern.parse(match);
      // Validate the date is valid
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  return null;
}

/**
 * Parse a comma-separated list into an array of trimmed strings.
 */
function parseList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Parse coordinates from a "lat, lng" string.
 * Validates that coordinates are within valid ranges.
 */
function parseCoordinates(value: string): Coordinates | null {
  const parts = value.split(',').map((p) => p.trim());
  if (parts.length !== 2) return null;

  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);

  if (isNaN(lat) || isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  return { lat, lng };
}

/**
 * Parse a video description and extract metadata if present.
 *
 * @param description - The full video description from YouTube
 * @returns MetadataParseResult with parsed metadata and clean description
 */
export function parseVideoMetadata(description: string): MetadataParseResult {
  const markerMatch = description.match(METADATA_MARKER_REGEX);

  // No metadata section found
  if (!markerMatch || markerMatch.index === undefined) {
    return {
      hasMetadata: false,
      metadata: {},
      cleanDescription: description,
    };
  }

  // Split description at the marker
  const markerIndex = markerMatch.index;
  const markerLength = markerMatch[0].length;
  const cleanDescription = description.substring(0, markerIndex).trim();
  const metadataSection = description.substring(markerIndex + markerLength);

  // Parse metadata lines
  const metadata: VideoMetadata = {};
  const warnings: string[] = [];
  const customFields: Record<string, string> = {};

  const lines = metadataSection.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine) continue;

    // Parse key-value pair
    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex === -1) continue; // Not a valid key-value line

    const key = trimmedLine.substring(0, colonIndex).trim().toLowerCase();
    const value = trimmedLine.substring(colonIndex + 1).trim();

    if (!value) continue; // Skip empty values

    // Handle known fields
    switch (key) {
      case 'date':
        const parsedDate = parseDate(value);
        if (parsedDate) {
          metadata.date = parsedDate;
          metadata.dateRaw = value;
        } else {
          warnings.push(
            `Invalid date format: "${value}". Expected DD.MM.YYYY, YYYY-MM-DD, or MM/DD/YYYY`
          );
        }
        break;

      case 'members':
        metadata.members = parseList(value);
        break;

      case 'series':
        metadata.series = value;
        break;

      case 'episode':
        const episode = parseInt(value, 10);
        if (!isNaN(episode)) {
          metadata.episode = episode;
        } else {
          warnings.push(`Invalid episode number: "${value}"`);
        }
        break;

      case 'location':
        metadata.location = value;
        break;

      case 'tags':
        metadata.tags = parseList(value);
        break;

      case 'coordinates':
        const coords = parseCoordinates(value);
        if (coords) {
          metadata.coordinates = coords;
        } else {
          warnings.push(
            `Invalid coordinates: "${value}". Expected format: lat, lng (e.g., 52.52, 13.405)`
          );
        }
        break;

      case 'route':
        const route = parseRoute(value);
        if (route) {
          metadata.route = route;
        } else {
          warnings.push(
            `Invalid route: "${value.substring(0, 50)}${value.length > 50 ? '...' : ''}". Expected encoded polyline or "lat,lng;lat,lng;..." format`
          );
        }
        break;

      case 'routewaypoints':
        const waypoints = parseRawRoute(value);
        if (waypoints) {
          metadata.routeWaypoints = waypoints;
        } else {
          warnings.push(
            `Invalid route waypoints: "${value}". Expected "lat,lng;lat,lng;..." format with at least 2 points`
          );
        }
        break;

      case 'routeprofile':
        metadata.routeProfile = value;
        break;

      default:
        // Store unknown fields in custom
        customFields[key] = value;
        break;
    }
  }

  if (Object.keys(customFields).length > 0) {
    metadata.custom = customFields;
  }

  // Auto-derive coordinates from the first route/waypoint if not explicitly set
  if (!metadata.coordinates) {
    const firstPoint = metadata.route?.[0] || metadata.routeWaypoints?.[0];
    if (firstPoint) {
      metadata.coordinates = { lat: firstPoint.lat, lng: firstPoint.lng };
    }
  }

  return {
    hasMetadata: true,
    metadata,
    cleanDescription,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Convert a Date to ISO 8601 string for consistent storage.
 */
export function dateToISO(date: Date): string {
  return date.toISOString();
}

/**
 * Get the effective display date for a video.
 * Uses metadata date if available, otherwise falls back to publishedAt.
 */
export function getEffectiveDate(
  publishedAt: string,
  metadata?: VideoMetadata
): string {
  if (metadata?.date) {
    return dateToISO(metadata.date);
  }
  return publishedAt;
}
