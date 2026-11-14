// CaterLog Service Worker - Hardened Offline Engine (v1.1.0)
const CACHE_VERSION = 'v1.1.0';
const CACHE_NAME = `caterlog-${CACHE_VERSION}`;

// Tier 1: Core local shell assets required for app launch
const CORE_LOCAL_ASSETS = [
  './',
  './index.html',
  './app.js',
  './js/db.js',
  './manifest.json',
  './icons/icon.svg',
  './icon.svg'
];

// Tier 2: Remote CDN resources (pre-cached best effort)
const REMOTE_CDN_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] Pre-caching core local assets (v' + CACHE_VERSION + ')');
      await cache.addAll(CORE_LOCAL_ASSETS);

      console.log('[SW] Pre-caching remote assets with fallback tolerance');
      await Promise.allSettled(
        REMOTE_CDN_ASSETS.map((url) =>
          fetch(url, { mode: 'cors' })
            .then((res) => {
              if (res.ok) {
                return cache.put(url, res);
              }
            })
            .catch((err) => {
              console.warn('[SW] Remote pre-cache skipped for:', url, err);
            })
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith('caterlog-') && key !== CACHE_NAME)
          .map((key) => {
            console.log('[SW] Evicting deprecated cache:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Bypass cloud sync / Firebase traffic
  if (
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('googleapis.com')
  ) {
    return;
  }

  // Handle navigation requests with fallback to index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            return cached || caches.match('./index.html') || caches.match('./');
          });
        })
    );
    return;
  }

  // Handle static assets with Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            (networkResponse.status === 200 || networkResponse.type === 'opaque')
          ) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
