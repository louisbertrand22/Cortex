// Régénère les icônes PWA et l'image de partage Open Graph dans public/.
//   npm run assets
// À relancer après un changement du logo, de l'accroche ou des couleurs de marque.
import { launch, root } from './lib.mjs';
import { readFileSync } from 'node:fs';
const font = (f) => `url(data:font/woff2;base64,${readFileSync(f).toString('base64')})`;
const pub = `${root}/public`;
const fonts = `${root}/node_modules`;

const glyph = `<path d="M9 21 16 11l7 10M9 21h14" stroke="#ff6a3d" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="11" r="3" fill="#ecebe6"/><circle cx="9" cy="21" r="2.5" fill="#3fd0c5"/><circle cx="23" cy="21" r="2.5" fill="#3fd0c5"/>`;
// Glyphe centré (bbox ≈ 6.5–25.5 × 8–23.5) et mis à l'échelle autour du centre
const centered = (s) => `<g transform="translate(16 16) scale(${s}) translate(-16 -15.75)">${glyph}</g>`;
const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="100%" height="100%">${body}</svg>`;

const icons = [
  // Icône « any » : carré arrondi comme le favicon
  { file: 'icon-192.png', size: 192, body: `<rect width="32" height="32" rx="7" fill="#16161a"/>${centered(1.05)}` },
  { file: 'icon-512.png', size: 512, body: `<rect width="32" height="32" rx="7" fill="#16161a"/>${centered(1.05)}` },
  // Maskable : fond plein, glyphe dans la zone sûre (cercle de 80 %)
  { file: 'icon-maskable-512.png', size: 512, body: `<rect width="32" height="32" fill="#16161a"/>${centered(0.8)}` },
  // iOS arrondit lui-même : fond plein
  { file: 'apple-touch-icon.png', size: 180, body: `<rect width="32" height="32" fill="#16161a"/>${centered(1)}` },
];

const b = await launch();
for (const { file, size, body } of icons) {
  const p = await b.newPage({ viewport: { width: size, height: size } });
  await p.setContent(`<html><body style="margin:0;background:transparent">${svg(body)}</body></html>`);
  await p.screenshot({ path: `${pub}/${file}`, omitBackground: true });
  await p.close();
  console.log(file);
}

// Image de partage 1200×630, thème sombre du site
const dots = Array.from({ length: 70 }, (_, i) => {
  const x = 640 + ((i * 137) % 560), y = 30 + ((i * 89) % 570), r = 1.5 + (i % 3);
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 7 === 0 ? '#ff6a3d' : i % 5 === 0 ? '#3fd0c5' : '#33373e'}"/>`;
}).join('');
const og = `<!doctype html><html><head><style>
@font-face { font-family: Geist; src: ${font(`${fonts}/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2`)}; font-weight: 100 900; }
@font-face { font-family: Serif; src: ${font(`${fonts}/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2`)}; }
@font-face { font-family: Serif; font-style: italic; src: ${font(`${fonts}/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2`)}; }
body { margin: 0; width: 1200px; height: 630px; background: radial-gradient(ellipse at 80% 30%, #1b1e23, #0d0e11 65%); color: #ecebe6; font-family: Geist; position: relative; overflow: hidden; }
.bg { position: absolute; inset: 0; mask-image: radial-gradient(ellipse at 85% 40%, black 10%, transparent 70%); }
.wrap { position: absolute; inset: 0; padding: 72px 80px; display: flex; flex-direction: column; }
.brand { display: flex; align-items: center; gap: 18px; font-family: Serif; font-size: 52px; }
.brand svg { width: 64px; height: 64px; }
h1 { margin: auto 0 0; font-size: 92px; line-height: .95; font-weight: 600; letter-spacing: -0.045em; max-width: 900px; }
h1 em { font-family: Serif; font-weight: 400; letter-spacing: -0.02em; color: #ff6a3d; }
p { margin: 32px 0 0; font-size: 30px; color: #a9a8ad; }
.url { position: absolute; right: 80px; top: 92px; font-family: Geist; font-size: 22px; letter-spacing: .12em; color: #6f6e75; text-transform: uppercase; }
</style></head><body>
<svg class="bg" viewBox="0 0 1200 630">${dots}</svg>
<div class="wrap">
  <div class="brand"><svg viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#16161a"/>${glyph}</svg>Cortex</div>
  <h1>Muscler le cortex, <em>un cours à la fois.</em></h1>
  <p>Des révisions visuelles et interactives : schémas, quiz, approfondissements.</p>
</div>
<div class="url">cortex.louis-bertrand.fr</div>
</body></html>`;
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(og, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: `${pub}/og.png` });
console.log('og.png');
await b.close();
