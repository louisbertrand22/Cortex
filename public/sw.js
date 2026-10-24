// Service worker de Cortex : rend le site installable et consultable hors ligne.
// Pages : réseau d'abord (contenu toujours frais), cache en secours.
// Fichiers versionnés (/_astro/, polices, icônes) : cache d'abord.
const CACHE = 'cortex-v1';
const PRECACHE = ['/', '/cours/', '/manifest.webmanifest', '/favicon.svg', '/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const put = (req, res) => {
  if (res.ok) caches.open(CACHE).then((c) => c.put(req, res));
};

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => { put(req, res.clone()); return res; })
        .catch(async () => (await caches.match(req)) || (await caches.match('/')) || Response.error()),
    );
    return;
  }

  if (url.pathname.startsWith('/_astro/') || /\.(woff2?|png|svg|webmanifest)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => { put(req, res.clone()); return res; })),
    );
    return;
  }

  // Le reste (index Pagefind…) : réseau, cache en secours
  event.respondWith(
    fetch(req)
      .then((res) => { put(req, res.clone()); return res; })
      .catch(() => caches.match(req).then((hit) => hit || Response.error())),
  );
});
