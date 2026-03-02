/**
 * GPS coordinates for map placement.
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Parsed metadata from a video description.
 * All fields are optional since metadata itself is optional.
 */
export interface VideoMetadata {
  /** Custom release date (overrides YouTube's publishedAt) */
  date?: Date;

  /** Original date string from the description for display purposes */
  dateRaw?: string;

  /** List of people/members featured in the video */
  members?: string[];

  /** Series name (for future series/playlist features) */
  series?: string;

  /** Episode number if part of a series */
  episode?: number;

  /** Recording location (display name) */
  location?: string;

  /** GPS coordinates for map placement */
  coordinates?: Coordinates;

  /** Route for drawing polylines on map (manual or computed from ORS) */
  route?: Coordinates[];

  /** Waypoints for auto-generating a route via OpenRouteService */
  routeWaypoints?: Coordinates[];

  /** ORS travel profile (e.g., driving-car, foot-hiking, cycling-regular) */
  routeProfile?: string;

  /** Custom tags for categorization/search */
  tags?: string[];

  /** Any additional custom fields as key-value pairs */
  custom?: Record<string, string>;
}

/**
 * Result of parsing a video description for metadata.
 */
export interface MetadataParseResult {
  /** Whether a metadata section was found */
  hasMetadata: boolean;

  /** The parsed metadata (empty object if no metadata found) */
  metadata: VideoMetadata;

  /** The description text before the metadata marker (for clean display) */
  cleanDescription: string;

  /** Any parsing warnings (e.g., invalid date format) */
  warnings?: string[];
}
