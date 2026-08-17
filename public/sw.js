// Minimal service worker: enables PWA installability and offline shell caching.
const CACHE = 'loo-look-v2';
const APP_SHELL = ['/', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

// Only cache-first content-hashed production assets and static icons. Never the
// dev bundle (stable URL under /node_modules) — caching that would serve stale JS.
function isCacheableAsset(url) {
  if (url.pathname.startsWith('/_expo/')) return true;
  return /\.(png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf)$/.test(url.pathname);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // don't touch map tiles / cross-origin

  // Network-first for navigations so fresh HTML/JS wins; fall back to cache offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put('/', copy)).catch(() => undefined);
          return response;
        })
        .catch(() => caches.match('/').then((cached) => cached || caches.match(request))),
    );
    return;
  }

  if (!isCacheableAsset(url)) return; // let the network handle everything else

  // Cache-first for content-hashed assets and icons.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
          return response;
        }),
    ),
  );
});
