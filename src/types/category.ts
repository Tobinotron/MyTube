export interface Playlist {
  id: string;
  name: string;
}

export type IconName = 'video-camera' | 'game-controller' | 'film' | 'music' | 'book' | 'star' | 'heart' | 'folder' | 'smartphone' | 'zap';

export interface Category {
  id: string;
  name: string;
  icon: IconName;
  playlists: Playlist[];
}

export interface CategoriesConfig {
  categories: Category[];
}
