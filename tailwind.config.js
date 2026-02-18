/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // YouTube-style dark mode colors
        'yt-bg': '#0f0f0f',
        'yt-surface': '#212121',
        'yt-hover': '#3f3f3f',
        'yt-text': '#f1f1f1',
        'yt-text-secondary': '#aaaaaa',
        'yt-border': '#3f3f3f',
        // Dynamic primary color using CSS variable
        'primary': 'var(--color-primary)',
      },
    },
  },
  plugins: [],
};
