// HeartBridge SW v3 — HTML: network-first, assets: cache-first
const CACHE = 'heartbridge-cache-v3';
const PRELOAD = [
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png',
  '/favicon.ico',
  '/apple-touch-icon-180.png'
];

// 安装：预缓存关键资源
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRELOAD)));
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 获取：HTML 走网络优先，其它 GET 走缓存优先
self.addEventListener('fetch', (e) => {
  const req = e.request;

  // 只处理 GET
  if (req.method !== 'GET') return;

  // HTML / 导航请求：network-first
  const isHTML =
    req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 其它静态资源：cache-first
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        if (req.url.startsWith(self.location.origin)) {
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
