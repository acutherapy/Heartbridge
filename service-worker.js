const CACHE_NAME = 'hb-cache-v8';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(['/','/app.html'])));
});
self.addEventListener('fetch', e => {
  if (e.request.method === 'POST') return; // 不缓存 POST 请求
  e.respondWith(caches.match(e.request).then(resp => resp || fetch(e.request)));
});
