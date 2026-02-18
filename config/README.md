# Categories Configuration

Configuration file for MyTube categories and playlists.

## Usage

Add categories with YouTube playlist IDs. Each category appears in the sidebar.

## Category Fields

| Field | Description |
|-------|-------------|
| `id` | Unique identifier (used internally for filtering) |
| `name` | Display name shown in the sidebar |
| `icon` | One of the available icons listed below |
| `playlists` | Array of YouTube playlists to include in this category |

## Playlist Fields

| Field | Description |
|-------|-------------|
| `id` | YouTube playlist ID (from the playlist URL) |
| `name` | Display name for the playlist |

## Available Icons

- `video-camera` - Video camera (for vlogs)
- `game-controller` - Game controller (for gaming)
- `film` - Film reel (for movies)
- `music` - Music notes
- `book` - Book
- `star` - Star
- `heart` - Heart
- `folder` - Folder
- `smartphone` - Smartphone (for YouTube Shorts)
- `zap` - Lightning bolt (for quick/short content)

## Example

```json
{
  "categories": [
    {
      "id": "vlogs",
      "name": "VLOGs",
      "icon": "video-camera",
      "playlists": [
        {
          "id": "PLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
          "name": "My Playlist"
        }
      ]
    }
  ]
}
```

## Finding YouTube Playlist IDs

1. Go to the YouTube playlist
2. Copy the URL (e.g., `https://www.youtube.com/playlist?list=PLxxxxxxxxxx`)
3. The playlist ID is the value after `list=` (e.g., `PLxxxxxxxxxx`)

## See Also

- [METADATA.md](./METADATA.md) - Video description metadata format for overriding dates, adding members, etc.
