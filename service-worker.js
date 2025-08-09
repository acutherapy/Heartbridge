const CACHE = 'hb-cache-v4';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.add('/')));
});
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
