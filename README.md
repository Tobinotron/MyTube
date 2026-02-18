# MyTube

A self-hosted YouTube playlist viewer. Organize your playlists into categories, browse them in a clean UI, and get some extra features YouTube doesn't give you — like a timeline view, a map view for geotagged videos, and series grouping.

Built with Next.js, React, TypeScript, and Tailwind CSS. Uses Leaflet for maps.

<!-- TODO: Add a screenshot here -->

## Features

- **Categories** — Group your YouTube playlists however you want
- **Search** — Search across all your videos (titles, descriptions, members)
- **Series** — Tag videos with series/episode metadata and browse them as a collection
- **Timeline** — See all your videos laid out chronologically
- **Map** — Videos with GPS coordinates show up on an interactive map
- **Metadata** — Add custom dates, members, locations, and more via video descriptions
- **Dark / Light mode**
- **English & German** UI

## Getting Started

You'll need Node.js (v20+) and a YouTube Data API key.

**1. Clone and install**

```bash
git clone https://github.com/Tobinotron/MyTube.git
cd MyTube
npm install
```

**2. Set up your API key**

```bash
cp .env.example .env.local
```

Open `.env.local` and paste your YouTube API key. If you don't have one yet:
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a project
- Enable the **YouTube Data API v3**
- Create an API key under Credentials

**3. Add your playlists**

Edit `config/categories.json` to add your YouTube playlists. Grab the playlist ID from the URL (`youtube.com/playlist?list=PLxxxxxxx`) and set it up like this:

```json
{
  "categories": [
    {
      "id": "travel",
      "name": "Travel",
      "icon": "video-camera",
      "playlists": [
        {
          "id": "PLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
          "name": "Europe Trip 2024"
        }
      ]
    }
  ]
}
```

See [config/README.md](config/README.md) for all available icons and options.

**4. Run it**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

All config lives in the `config/` folder:

| File | What it does |
|------|-------------|
| `categories.json` | Your playlists, grouped into categories |
| `site.json` | Site name, logo, which features to enable, primary color, color scheme |
| [METADATA.md](config/METADATA.md) | How to add metadata (dates, members, series, locations) to video descriptions |

### site.json

```json
{
  "name": "MyTube",
  "logoPath": "/icon.png",
  "enableSeries": true,
  "enableTimeline": true,
  "enableMap": true,
  "primaryColor": "#dc2626",
  "defaultColorScheme": "dark"
}
```

Toggle features on/off, change the accent color, set a default theme — pretty straightforward.

## Production

```bash
npm run build
npm run start
```

Deploys anywhere that runs Node.js. Vercel is the easiest option since it's a Next.js app.
