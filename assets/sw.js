const CACHE_NAME = 'yuji-static-v2';
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.webmanifest',
  './assets/favicon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/apple-touch-icon.png'
];
const CORE_ASSET_PATHS = new Set(CORE_ASSETS.map(asset => new URL(asset, self.location.origin).pathname));
const NETWORK_FIRST_DESTINATIONS = new Set(['document', 'script', 'style', 'manifest']);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).catch(() => Promise.resolve())
  );
  self.skipWaiting();
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isNavigationRequest = event.request.mode === 'navigate' || event.request.destination === 'document';
  const isCriticalAsset = isNavigationRequest
    || NETWORK_FIRST_DESTINATIONS.has(event.request.destination)
    || CORE_ASSET_PATHS.has(url.pathname);

  if (isCriticalAsset) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() =>
        caches.match(event.request).then(cached => {
          if (cached) return cached;
          if (isNavigationRequest) return caches.match('./index.html');
          return new Response('', { status: 504, statusText: 'Offline' });
        })
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
