// service-worker.js
const CACHE_NAME = 'sherzad-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './favicon.ico',
  './favicon.png'
];

// Install: کش ته ثابت اسټونه داخل کړه
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: زاړه کشونه پاک کړه
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: Cache-first د ثابتو فایلونو لپاره، او Network fallback
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // یوازې هم-اورجن ثابت اسټونه cache-first کړه
  if (req.method === 'GET' && url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(res => {
          // کوچني ثابت ریسورسونه کش ته واچوه
          const copy = res.clone();
          const ct = copy.headers.get('Content-Type') || '';
          if (ct.includes('text/html') || ct.includes('text/css') || ct.includes('application/javascript') || ct.includes('image/')) {
            caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(() => {});
          }
          return res;
        }).catch(() => {
          // افلاین بیکاپ: که index غوښتل شوی وي او شبکه نشته
          if (req.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
    );
  }
});
