export type Theme = 'dark' | 'light';
export type Language = 'de' | 'en';

export interface Settings {
  theme: Theme;
  language: Language;
}

export const defaultSettings: Settings = {
  theme: 'dark',
  language: 'en',
};
