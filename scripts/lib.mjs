// Outils communs aux scripts de vérification : Chromium, serveur de preview, pages du site.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { homedir } from 'node:os';
import { extname, join, normalize, resolve } from 'node:path';
import { chromium } from 'playwright-core';

export const root = resolve(import.meta.dirname, '..');
export const PORT = Number(process.env.PREVIEW_PORT ?? 4329);
export const BASE = `http://localhost:${PORT}`;

/** Dossier de sortie des captures (ignoré par git). */
export function outDir(name = '') {
  const dir = join(root, '.shots', name);
  mkdirSync(dir, { recursive: true });
  return dir;
}

/** Chromium : $CHROME_PATH, sinon celui de playwright, sinon le plus récent de ~/.cache/ms-playwright, sinon le système. */
function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  try {
    const p = chromium.executablePath();
    if (existsSync(p)) return p;
  } catch {}
  const cache = join(homedir(), '.cache/ms-playwright');
  if (existsSync(cache)) {
    const found = readdirSync(cache)
      .filter((d) => /^chromium-\d+$/.test(d))
      .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))
      .map((d) => join(cache, d, 'chrome-linux64/chrome'))
      .find(existsSync);
    if (found) return found;
  }
  const system = ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(existsSync);
  if (system) return system;
  throw new Error('Chromium introuvable : `npx playwright install chromium`, ou définir CHROME_PATH.');
}

export const launch = () => chromium.launch({ executablePath: findChrome() });

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.wasm': 'application/wasm', '.txt': 'text/plain; charset=utf-8',
};

/**
 * Exécute `fn` avec dist/ servi sur PORT : réutilise un serveur qui répond déjà (npm run preview…),
 * sinon démarre un serveur statique le temps du script. (`astro preview` n'est pas utilisé : depuis Astro 7
 * c'est un démon détaché, unique par projet, qui survit au script.)
 */
export async function withPreview(fn) {
  const up = await fetch(BASE).then((r) => r.ok, () => false);
  let server;
  if (!up) {
    const dist = join(root, 'dist');
    if (!existsSync(join(dist, 'index.html'))) throw new Error('dist/ absent : lancer `npm run build` d\'abord.');
    server = createServer(async (req, res) => {
      const path = decodeURIComponent(new URL(req.url, BASE).pathname);
      let file = normalize(join(dist, path));
      if (!file.startsWith(dist)) return res.writeHead(403).end();
      if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
      else if (!existsSync(file) && existsSync(`${file}.html`)) file = `${file}.html`;
      const found = existsSync(file);
      if (!found) file = join(dist, '404.html');
      res.writeHead(found ? 200 : 404, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
      res.end(await readFile(file));
    });
    await new Promise((ok, ko) => server.once('error', ko).listen(PORT, '127.0.0.1', ok));
  }
  try {
    return await fn();
  } finally {
    await new Promise((ok) => (server ? server.close(ok) : ok()));
  }
}

/** Chemins de toutes les pages publiées, d'après le sitemap du build. */
export function sitePaths() {
  const xml = readFileSync(join(root, 'dist/sitemap-0.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}

/** Chemins demandés en argument (« /cours/aiad/ », « aiad », « aiad/01 »…), sinon toutes les leçons. */
export function pathsFromArgs(args) {
  const all = sitePaths();
  const lessons = all.filter((p) => p.split('/').filter(Boolean).length === 3);
  if (args.length === 0) return lessons;
  return args.flatMap((a) => {
    if (a.startsWith('/')) return [a];
    const hits = all.filter((p) => p.includes(`/${a}`));
    if (hits.length === 0) console.warn(`⚠ aucune page ne correspond à « ${a} »`);
    // « aiad » → les leçons de la matière (et non la page de la matière seule)
    const sub = hits.filter((p) => lessons.includes(p));
    return sub.length ? sub : hits;
  });
}

/** Ouvre une page dans un thème donné, en collectant les erreurs JS. */
export async function openPage(browser, path, { width, scheme, height = 900 }) {
  const page = await browser.newPage({ viewport: { width, height }, colorScheme: scheme });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  // Les ressources en échec sont signalées par leur URL (le message console ne la donne pas) ;
  // le statut du document lui-même ne compte pas (une 404 voulue reste une page valide).
  page.on('console', (m) => m.type() === 'error' && !m.text().startsWith('Failed to load resource') && errors.push(m.text()));
  page.on('response', (r) => r.status() >= 400 && r.url() !== BASE + path && errors.push(`${r.status()} sur ${r.url()}`));
  await page.addInitScript((s) => { try { localStorage.setItem('theme', s); } catch {} }, scheme);
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  return { page, errors };
}

/** Fait défiler toute la page pour déclencher îlots `client:visible`, Mermaid et révélations. */
export async function scrollThrough(page) {
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 600) {
    await page.evaluate((y) => scrollTo(0, y), y);
    await page.waitForTimeout(100);
  }
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(1200);
}

export const slugOf = (path) => path.split('/').filter(Boolean).join('_') || 'accueil';
