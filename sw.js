/* Service worker unique de « Mon quotidien » : il couvre tout Myself/ (coquille + toutes les apps).
   - pages et scripts : réseau d'abord (les mises à jour arrivent tout de suite), cache si hors ligne ;
   - images : cache d'abord, mise à jour en arrière-plan ;
   - polices et modèle de détourage : téléchargés une fois, gardés ;
   - météo, recherche de ville, agendas .ics : jamais mis en cache.
   La version vient de apps.js (VERSION_QUOTIDIEN). */
importScripts('apps.js');

const CACHE = 'quotidien-coquille-v' + self.VERSION_QUOTIDIEN;
const IA_CACHE = 'quotidien-ia-1';          // modèle du détourage de la garde-robe : gardé tel quel
const POLICES = 'quotidien-polices-1';
const GARDER = [CACHE, IA_CACHE, POLICES];
const BASE = new URL('./', self.registration.scope).pathname;   // « /Myself/ »

const ESSENTIEL = ['./', './index.html', './apps.js', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png',
  ...self.APPS.map(a => './' + a.dossier)];

self.addEventListener('install', e => {
  // Chaque fichier est mis en cache séparément : un fichier absent ne bloque pas l'installation.
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(ESSENTIEL.map(u =>
    fetch(new Request(u, { cache: 'reload' })).then(r => { if (r.ok) return c.put(u, r); }).catch(() => {})
  ))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  // Ménage : uniquement les anciens caches connus de Mon quotidien (jamais le modèle de détourage).
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k =>
    !GARDER.includes(k) && (k.startsWith('quotidien-') || k.startsWith('courses-') || k.startsWith('organisation-'))
  ).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

function cacheDabord(nomCache, req) {
  return caches.open(nomCache).then(c => c.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok || r.type === 'opaque') c.put(req, r.clone());
    return r;
  })));
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.hostname === 'staticimgly.com') { e.respondWith(cacheDabord(IA_CACHE, req)); return; }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') { e.respondWith(cacheDabord(POLICES, req)); return; }
  if (url.origin !== location.origin || !url.pathname.startsWith(BASE)) return;   // météo, GitHub, autres sites : réseau direct
  if (url.pathname.includes('/agendas/') || url.pathname.endsWith('.ics')) return; // agendas : toujours frais

  // Images : cache d'abord, rafraîchies en arrière-plan
  if (/\.(png|jpe?g|gif|webp|svg|ico|woff2?)$/i.test(url.pathname)) {
    e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => {
      const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    })));
    return;
  }

  // Pages et scripts : réseau d'abord, sans cache du navigateur ; cache si hors ligne
  const cle = url.origin + url.pathname;   // « ?a=new » et « #courses » ne créent pas de doublon
  e.respondWith(fetch(req.mode === 'navigate' ? url.href : req, { cache: 'no-store' }).then(r => {
    if (r.ok) { const copie = r.clone(); caches.open(CACHE).then(c => c.put(cle, copie)); }
    return r;
  }).catch(() => caches.match(cle).then(hit => {
    if (hit) return hit;
    if (req.mode === 'navigate') {
      const dossier = url.pathname.endsWith('/') ? url.pathname : url.pathname.replace(/[^/]*$/, '');
      return caches.match(url.origin + dossier).then(h => h || caches.match(url.origin + BASE));
    }
    return Response.error();
  })));
});
