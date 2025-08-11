// v12
const CACHE='hb-cache-v12';
const ASSETS=['/','/index.html','/app.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const isHTML = e.request.mode==='navigate' || (e.request.headers.get('accept')||'').includes('text/html');
  if(isHTML){
    e.respondWith(fetch(e.request).then(res=>{caches.open(CACHE).then(c=>c.put(new URL(e.request.url).pathname,res.clone()));return res;})
      .catch(()=>caches.match('/app.html')||caches.match('/index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
    if(e.request.url.startsWith(self.location.origin)) caches.open(CACHE).then(c=>c.put(e.request,res.clone()));
    return res;
  })));
});