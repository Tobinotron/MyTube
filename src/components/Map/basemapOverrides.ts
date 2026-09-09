// Paint overrides applied on top of CARTO's vector styles after they load.
// Keys are layer ids from the style JSON, values are MapLibre paint properties.
export type PaintProperty = 'fill-color' | 'line-color' | 'text-color' | 'icon-color';
export type PaintOverrides = Record<string, Partial<Record<PaintProperty, string>>>;

// CARTO's raster "dark_all" tiles were fully neutral (land #090909, water #262626,
// borders ~#3a3a3a, labels capped at #444444). The vector Dark Matter style tints water
// and labels blue and renders labels much brighter, so pull it back to the raster look.
const DARK_WATER = '#333333'; // same lightness as the vector style's #2C353C, no blue
const DARK_BORDER = '#3a3a3a';
const DARK_BORDER_MINOR = '#2e2e2e';
const DARK_LABEL = '#444444';
const DARK_LABEL_MINOR = '#3c3c3c';
const DARK_ICON = '#444444';

const label = (color: string) => ({ 'text-color': color });
const place = (color: string) => ({ 'text-color': color, 'icon-color': DARK_ICON });

export const DARK_MATTER_OVERRIDES: PaintOverrides = {
  water: { 'fill-color': DARK_WATER },
  waterway: { 'line-color': DARK_WATER },
  boundary_country_inner: { 'line-color': DARK_BORDER },
  boundary_country_outline: { 'line-color': DARK_BORDER },
  boundary_state: { 'line-color': DARK_BORDER_MINOR },

  place_continent: label(DARK_LABEL),
  place_country_1: label(DARK_LABEL),
  place_country_2: label(DARK_LABEL),
  place_state: label(DARK_LABEL),
  place_city_r6: place(DARK_LABEL),
  place_city_r5: place(DARK_LABEL),
  place_city_dot_r7: place(DARK_LABEL),
  place_city_dot_r4: place(DARK_LABEL),
  place_city_dot_r2: place(DARK_LABEL),
  place_city_dot_z7: place(DARK_LABEL),
  place_capital_dot_z7: place(DARK_LABEL),
  place_town: place(DARK_LABEL_MINOR),
  place_suburbs: place(DARK_LABEL_MINOR),
  place_villages: place(DARK_LABEL_MINOR),
  place_hamlet: place(DARK_LABEL_MINOR),

  watername_ocean: label(DARK_LABEL_MINOR),
  watername_sea: label(DARK_LABEL_MINOR),
  watername_lake: label(DARK_LABEL_MINOR),
  watername_lake_line: label(DARK_LABEL_MINOR),
  poi_park: label(DARK_LABEL_MINOR),
  poi_stadium: label(DARK_LABEL_MINOR),
};
