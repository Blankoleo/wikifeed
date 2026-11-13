// Netz zuerst (damit Updates sofort ankommen), Cache als Offline-Fallback.
// Bei jeder App-Änderung die Nummer erhöhen: dann laden sich offene Apps von selbst neu.
const CACHE = 'wikifeed-v11';
const ARTICLES = 'wikifeed-articles'; // gemerkte Artikel + Bilder, von app.js befüllt – nie automatisch löschen
const FILES = ['./', 'index.html', 'style.css', 'app.js', 'thoughts.js', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => fetch(f, { cache: 'no-cache' }).then(r => { if (r.ok) return c.put(f, r); })))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const old = (await caches.keys()).filter(k => k !== CACHE && k !== ARTICLES);
    await Promise.all(old.map(k => caches.delete(k)));
    await self.clients.claim();
    // War schon eine ältere Version da, offene App-Fenster neu laden, damit die neue sofort sichtbar ist.
    // Nicht auf das Neuladen warten: es kann erst starten, wenn das Aktivieren fertig ist.
    if (old.length) {
      const wins = await self.clients.matchAll({ type: 'window' });
      for (const w of wins) w.navigate(w.url).catch(() => {});
    }
  })());
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.origin !== location.origin) {
    // Bilder gemerkter Artikel aus dem Offline-Speicher holen, falls vorhanden.
    if (e.request.destination === 'image') {
      e.respondWith(caches.open(ARTICLES).then(c => c.match(e.request.url, { ignoreVary: true })).then(r => r || fetch(e.request)));
    }
    return;
  }
  // 'no-cache' = immer beim Server nachfragen, statt bis zu 10 Minuten eine alte Kopie zu zeigen.
  e.respondWith(fetch(e.request.url, { cache: 'no-cache' }).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request.url, copy)); }
    return r;
  }).catch(() => caches.match(e.request.url, { ignoreSearch: true }).then(r => r || (e.request.mode === 'navigate' ? caches.match('./') : Response.error()))));
});
