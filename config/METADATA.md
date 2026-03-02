# Video Metadata Format

MyTube supports custom metadata in YouTube video descriptions. This allows you to override display dates, add member information, and include additional data for filtering and organization.

## Overview

Metadata is **completely optional**. Videos without metadata work normally, using YouTube's original publish date and full description.

## Format

Add a metadata section at the end of your video description:

```
Your regular video description goes here.
It can span multiple lines.

===== Metadata =====
Date: 30.01.2025
Members: Alice, Bob, Charlie
Series: Weekly Highlights
```

### The Marker

The metadata section starts with a line containing the word "Metadata" surrounded by separator characters:

```
===== Metadata =====
```

**Recommended:** Use `=` (equals signs) because YouTube interprets `-` (hyphens) as strikethrough formatting.

- At least 3 separator characters on each side
- Supports `=`, `-`, or `#` as separators
- Case-insensitive ("Metadata", "metadata", "METADATA" all work)
- Spaces around "Metadata" are optional

### Key-Value Pairs

After the marker, each line should follow the format:

```
Key: Value
```

- One key-value pair per line
- Keys are case-insensitive (`Date`, `date`, `DATE` all work)
- Values extend to the end of the line
- Empty lines and invalid lines are ignored

## Supported Fields

### Date

Overrides the video's display date. This affects both the displayed date and the sorting order.

**Supported formats:**

| Format | Example | Description |
|--------|---------|-------------|
| `DD.MM.YYYY` | `30.01.2025` | German format |
| `YYYY-MM-DD` | `2025-01-30` | ISO format |
| `MM/DD/YYYY` | `01/30/2025` | US format |

```
Date: 30.01.2025
```

### Members

Comma-separated list of people featured in the video. This can be used for future filtering features.

```
Members: Alice, Bob, Charlie
```

### Series

Series name for grouping related videos. This can be used for future series organization features.

```
Series: Weekly Highlights
```

### Episode

Episode number for video series.

```
Episode: 42
```

### Location

Where the video was filmed.

```
Location: Berlin, Germany
```

### Coordinates

GPS coordinates for placing the video on the map.

```
Coordinates: 52.52, 13.405
```

### Route

A route/path displayed as a polyline on the map when the video's marker is clicked. The format is auto-detected:

**Raw Coordinates:**

Semicolon-separated `lat,lng` pairs:

```
Route: 52.520,13.405;52.523,13.410;52.530,13.415
```

**Encoded Polyline:**

Uses [Google's Encoded Polyline Algorithm](https://developers.google.com/maps/documentation/utilities/polylinealgorithm):

```
Route: _p~iF~ps|U_ulLnnqC_mqNvxq`@
```

**Notes:**
- A route requires at least 2 points
- If `Route` is set but `Coordinates` is not, the marker is automatically placed at the first point of the route
- If both `Route` and `RouteWaypoints` are set, `Route` takes priority

### RouteWaypoints (auto-routing via OpenRouteService)

Instead of providing a full route, you can provide just the waypoints and let [OpenRouteService](https://openrouteservice.org/) compute the actual road/trail route automatically.

Requires `OPENROUTESERVICE_API_KEY` in `.env.local` (free at [openrouteservice.org](https://openrouteservice.org/dev/#/signup)).

```
RouteWaypoints: 52.52,13.405;48.85,2.35;51.50,-0.12
```

Semicolon-separated `lat,lng` pairs representing the stops. At least 2 waypoints are required.

### RouteProfile

Travel profile for OpenRouteService routing. Used with `RouteWaypoints`.

```
RouteProfile: foot-hiking
```

**Available profiles:** `driving-car`, `cycling-regular`, `cycling-mountain`, `cycling-road`, `cycling-electric`, `foot-walking`, `foot-hiking`

Defaults to `foot-hiking` if not specified.

**Notes:**
- Routes are computed server-side and cached with video data
- If `RouteWaypoints` is set but `Coordinates` is not, the marker is placed at the first waypoint

### Custom Fields

Any other `Key: Value` pairs are stored and available for future features.

```
CustomField: Some value
AnotherField: Another value
```

## Complete Example

```
Welcome to Episode 42 of our weekly highlights!

This week we traveled to Berlin and had an amazing time exploring the city.
Don't forget to like and subscribe!

Follow us on social media:
- Twitter: @example
- Instagram: @example

===== Metadata =====
Date: 30.01.2025
Members: Alice, Bob, Charlie
Series: Weekly Highlights
Episode: 42
Location: Berlin
Coordinates: 52.52, 13.405
RouteWaypoints: 52.52,13.405;52.53,13.41;52.54,13.42
RouteProfile: foot-hiking
```

## Notes

- The metadata section should be at the **end** of your description
- Everything before the marker is shown as the "clean" description
- If a date cannot be parsed, the original YouTube publish date is used
- Videos without any metadata continue to work exactly as before
- The `Members` field accepts any comma-separated values (names, nicknames, etc.)
