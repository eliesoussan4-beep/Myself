// Service worker de la partie « Courses » — ne touche qu'aux caches qui commencent par « courses- »
const CACHE = 'courses-v24';          // à changer à chaque mise à jour importante
const CDN_CACHE = 'courses-cdn-v1';  // lecture des tickets (~5 Mo), gardée d'une version à l'autre
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith('courses-') && k !== CACHE && k !== CDN_CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  // Page : réseau d'abord, cache si hors ligne
  if(req.mode === 'navigate'){
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put('./index.html', c)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  // Polices et moteur de lecture : cache d'abord
  if(/^(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(url.hostname)){
    e.respondWith(caches.open(CDN_CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { if(r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }))));
    return;
  }
  // Fichiers de la partie
  if(url.origin === location.origin && url.pathname.startsWith(new URL('./', self.registration.scope).pathname)){
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if(r.ok){ const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; })));
  }
});
