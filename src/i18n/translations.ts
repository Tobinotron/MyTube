export const translations = {
  en: {
    // Navigation
    'nav.vlogs': 'VLOGs',
    'nav.gaming': 'Gaming',
    'nav.films': 'Films',
    'nav.settings': 'Settings',
    'nav.collapse': 'Collapse sidebar',
    'nav.expand': 'Expand sidebar',
    'nav.series': 'Series',
    'nav.map': 'Map',
    'nav.timeline': 'Timeline',

    // Header
    'header.subtitle': 'Your private playlist collection',
    'header.search': 'Search',

    // Settings Modal
    'settings.title': 'Settings',
    'settings.theme': 'Theme',
    'settings.theme.dark': 'Dark',
    'settings.theme.light': 'Light',
    'settings.language': 'Language',
    'settings.language.en': 'English',
    'settings.language.de': 'Deutsch',
    'settings.close': 'Close',
    'settings.data': 'Data',
    'settings.refresh': 'Refresh Videos',
    'settings.refresh.description': 'Fetch latest video data from YouTube',

    // Video Grid
    'videos.empty': 'No videos found. Add some playlists to config/playlists.json',
    'videos.loading': 'Loading videos...',
    'videos.error': 'Error loading videos',
    'videos.all': 'All Videos',

    // Video Card
    'video.views': 'views',
    'video.from_playlist': 'From playlist',
    'video.members': 'Featuring',

    // Errors
    'error.api_key': 'Make sure you have configured your YouTube API key in .env.local',

    // Mobile
    'mobile.menu': 'Menu',
    'mobile.close': 'Close menu',

    // Series
    'series.title': 'Series',
    'series.videos': 'videos',
    'series.play_all': 'Play all',
    'series.empty': 'No series found',
    'series.empty_hint': 'Add Series metadata to video descriptions to create series',
    'series.back': 'Back to Series',

    // Map
    'map.title': 'Video Map',
    'map.empty': 'No geotagged videos found',
    'map.empty_hint': 'Add Coordinates metadata to video descriptions to show them on the map',

    // Timeline
    'timeline.title': 'Video Timeline',
  },
  de: {
    // Navigation
    'nav.vlogs': 'VLOGs',
    'nav.gaming': 'Gaming',
    'nav.films': 'Filme',
    'nav.settings': 'Einstellungen',
    'nav.collapse': 'Seitenleiste einklappen',
    'nav.expand': 'Seitenleiste ausklappen',
    'nav.series': 'Serien',
    'nav.map': 'Karte',
    'nav.timeline': 'Zeitstrahl',

    // Header
    'header.subtitle': 'Deine private Playlist-Sammlung',
    'header.search': 'Suchen',

    // Settings Modal
    'settings.title': 'Einstellungen',
    'settings.theme': 'Design',
    'settings.theme.dark': 'Dunkel',
    'settings.theme.light': 'Hell',
    'settings.language': 'Sprache',
    'settings.language.en': 'English',
    'settings.language.de': 'Deutsch',
    'settings.close': 'Schliessen',
    'settings.data': 'Daten',
    'settings.refresh': 'Videos aktualisieren',
    'settings.refresh.description': 'Neueste Videodaten von YouTube abrufen',

    // Video Grid
    'videos.empty': 'Keine Videos gefunden. Fuege Playlists zu config/playlists.json hinzu',
    'videos.loading': 'Videos werden geladen...',
    'videos.error': 'Fehler beim Laden der Videos',
    'videos.all': 'Alle Videos',

    // Video Card
    'video.views': 'Aufrufe',
    'video.from_playlist': 'Aus Playlist',
    'video.members': 'Mit',

    // Errors
    'error.api_key': 'Stelle sicher, dass du deinen YouTube API-Schluessel in .env.local konfiguriert hast',

    // Mobile
    'mobile.menu': 'Menue',
    'mobile.close': 'Menue schliessen',

    // Series
    'series.title': 'Serien',
    'series.videos': 'Videos',
    'series.play_all': 'Alle abspielen',
    'series.empty': 'Keine Serien gefunden',
    'series.empty_hint': 'Fuege Series-Metadaten zu Videobeschreibungen hinzu, um Serien zu erstellen',
    'series.back': 'Zurueck zu Serien',

    // Map
    'map.title': 'Video-Karte',
    'map.empty': 'Keine Videos mit Standort gefunden',
    'map.empty_hint': 'Fuege Koordinaten-Metadaten zu Videobeschreibungen hinzu, um sie auf der Karte anzuzeigen',

    // Timeline
    'timeline.title': 'Video-Zeitstrahl',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
export type Language = keyof typeof translations;
