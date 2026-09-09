// MapLibre 6 runs tile parsing in a web worker shipped as a separate module that imports a
// sibling file by relative path. Bundlers emit hashed assets and break that import, so the
// recommended Next.js setup is to serve both files unchanged from /public/maplibre.
// See https://maplibre.org/maplibre-gl-js/docs/ (ESM > Installation > Next.js)
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const dist = path.join(path.dirname(createRequire(import.meta.url).resolve('maplibre-gl/package.json')), 'dist');
const dest = path.join(process.cwd(), 'public', 'maplibre');

mkdirSync(dest, { recursive: true });
for (const file of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
  copyFileSync(path.join(dist, file), path.join(dest, file));
}
