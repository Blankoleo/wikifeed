// Netz zuerst (damit Updates sofort ankommen), Cache als Offline-Fallback.
const CACHE = 'wikifeed-v2';
const ARTICLES = 'wikifeed-articles'; // gemerkte Artikel + Bilder, von app.js befüllt – nie automatisch löschen
const FILES = ['./', 'index.html', 'style.css', 'app.js', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== ARTICLES).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) {
    // Bilder gemerkter Artikel aus dem Offline-Speicher holen, falls vorhanden.
    if (e.request.method === 'GET' && e.request.destination === 'image') {
      e.respondWith(caches.open(ARTICLES).then(c => c.match(e.request.url, { ignoreVary: true })).then(r => r || fetch(e.request)));
    }
    return;
  }
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy));
    return r;
  }).catch(() => caches.match(e.request)));
});
