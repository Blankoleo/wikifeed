'use strict';

const API = 'https://' + WIKI.host + '/w/api.php';
// Gedankenspiele in der aktiven Sprache (thoughts.js / thoughts.en.js)
const THOUGHTS = LANG === 'en' ? THOUGHTS_EN : THOUGHTS_DE;
const THINK_FIELDS = LANG === 'en' ? THINK_FIELDS_EN : THINK_FIELDS_DE;

// Themen = Wikipedias eigene "articletopic"-Klassifizierung.
// on:true = deine Interessen als Voreinstellung.
const TOPICS = [
  // Eigene Suchanfrage statt articletopic: Wikipedias Kategorien für Gedankenexperimente und Paradoxa.
  { id: 'thought', label: T('💭 Gedankenexperimente & Paradoxa', '💭 Thought experiments & paradoxes'), on: true, query: WIKI.thought, minLen: 2000 },
  { id: 'history', label: T('Geschichte', 'History'), on: true },
  { id: 'biography', label: T('Biografien', 'Biographies'), on: true },
  { id: 'women', label: T('Biografien (Frauen)', 'Biographies (women)'), on: true },
  { id: 'society', label: T('Gesellschaft', 'Society'), on: true },
  { id: 'philosophy-and-religion', label: T('Philosophie & Religion', 'Philosophy & religion'), on: true },
  { id: 'politics-and-government', label: T('Staat & Politik', 'Politics & government'), on: true },
  { id: 'education', label: T('Bildung', 'Education'), on: true },
  { id: 'biology', label: T('Biologie', 'Biology'), on: true },
  { id: 'chemistry', label: T('Chemie', 'Chemistry'), on: true },
  { id: 'computing', label: T('Computer & Internet', 'Computing & internet'), on: true },
  { id: 'earth-and-environment', label: T('Erde & Umwelt', 'Earth & environment'), on: true },
  { id: 'mathematics', label: T('Mathematik', 'Mathematics'), on: true },
  { id: 'physics', label: T('Physik', 'Physics'), on: true },
  { id: 'engineering', label: T('Technik', 'Engineering'), on: true },
  { id: 'technology', label: T('Technologie', 'Technology'), on: true },
  { id: 'space', label: T('Weltraum', 'Space'), on: true },
  { id: 'medicine-and-health', label: T('Medizin & Gesundheit', 'Medicine & health'), on: false },
  { id: 'military-and-warfare', label: T('Krieg & Militär', 'Military & warfare'), on: false },
  { id: 'business-and-economics', label: T('Wirtschaft', 'Business & economics'), on: false },
  { id: 'transportation', label: T('Verkehr', 'Transportation'), on: false },
  { id: 'food-and-drink', label: T('Essen & Trinken', 'Food & drink'), on: false },
  { id: 'architecture', label: T('Architektur', 'Architecture'), on: false },
  { id: 'visual-arts', label: T('Kunst', 'Visual arts'), on: false },
  { id: 'literature', label: T('Literatur', 'Literature'), on: false },
  { id: 'music', label: T('Musik', 'Music'), on: false },
  { id: 'films', label: T('Film', 'Film'), on: false },
  { id: 'video-games', label: T('Videospiele', 'Video games'), on: false },
  { id: 'sports', label: T('Sport', 'Sports'), on: false },
];
const topicLabel = id => (TOPICS.find(t => t.id === id) || {}).label || id;

// ---------- Speicher ----------
const store = {
  get(k, d) { try { const v = localStorage.getItem('wf.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('wf.' + k, JSON.stringify(v)); } catch {} },
};
// Je Sprache getrennt gespeichert: Gesehenes, Merkliste, Artikel des Tages, Stimme.
const lstore = {
  get: (k, d) => store.get(LANG === 'de' ? k : LANG + '.' + k, d),
  set: (k, v) => store.set(LANG === 'de' ? k : LANG + '.' + k, v),
};
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const $ = id => document.getElementById(id);

const state = {
  enabled: store.get('enabled', TOPICS.filter(t => t.on).map(t => t.id)),
  weights: store.get('weights', {}),
  seen: lstore.get('seen', []),
  saved: lstore.get('saved', []),
  quality: store.get('quality', true),
  stats: store.get('stats', { day: today(), read: 0, total: 0 }),
  seeds: lstore.get('seeds', []),   // Artikel, die dir gefallen haben -> "Mehr wie das hier"
};
const seenSet = new Set(state.seen);
state.think = store.get('think', {}); // Antworten auf Gedankenspiele: id -> { a, t, at, reveal }
// Einmalig: das neue Thema „Gedankenspiele“ einschalten und etwas höher gewichten.
if (!store.get('thinkInit', false)) {
  if (!state.enabled.includes('thought')) { state.enabled.unshift('thought'); store.set('enabled', state.enabled); }
  if (state.weights.thought == null) { state.weights.thought = 2; store.set('weights', state.weights); }
  store.set('thinkInit', true);
}
try { localStorage.removeItem('wf.pool'); } catch {} // Reste der entfernten Quiz-Funktion

// ---------- Lernen ----------
const w = id => state.weights[id] ?? 1;
function adjust(id, factor) {
  if (!id) return;
  state.weights[id] = Math.min(6, Math.max(0.1, w(id) * factor));
  store.set('weights', state.weights);
}
function pickTopic() {
  const ids = state.enabled;
  if (!ids.length) return null;
  // 15 % Entdecker-Anteil, damit abgewertete Themen nicht ganz verschwinden.
  if (Math.random() < 0.15) return ids[Math.floor(Math.random() * ids.length)];
  const total = ids.reduce((s, id) => s + w(id), 0);
  let r = Math.random() * total;
  for (const id of ids) { r -= w(id); if (r <= 0) return id; }
  return ids[ids.length - 1];
}
function markSeen(title) {
  if (seenSet.has(title)) return;
  seenSet.add(title);
  state.seen.push(title);
  if (state.seen.length > 4000) state.seen = state.seen.slice(-3000);
  lstore.set('seen', state.seen);
}
function countRead() {
  if (state.stats.day !== today()) { state.stats.day = today(); state.stats.read = 0; }
  state.stats.read++;
  state.stats.total = (state.stats.total || 0) + 1;
  store.set('stats', state.stats);
}

// ---------- Wikipedia-API ----------
async function api(params) {
  const url = new URL(API);
  const all = { action: 'query', format: 'json', formatversion: '2', origin: '*', ...params };
  for (const [k, v] of Object.entries(all)) url.searchParams.set(k, v);
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

const CARD_PROPS = {
  generator: 'search', gsrsort: 'random', gsrnamespace: '0',
  prop: 'extracts|pageimages|info', exintro: '1', explaintext: '1', exsentences: '10', exlimit: 'max',
  piprop: 'thumbnail', pithumbsize: '900', pilimit: 'max',
};

async function fetchTopic(topic) {
  const def = TOPICS.find(t => t.id === topic) || {};
  const base = def.query || `articletopic:${topic}`;
  let pages = [];
  if (state.quality) {
    const d = await api({ ...CARD_PROPS, gsrlimit: '4',
      gsrsearch: `${base} ${WIKI.top}` });
    pages = (d.query?.pages || []).map(p => ({ ...p, top: true }));
    pages = pages.filter(p => !seenSet.has(p.title));
  }
  if (pages.length < 2) {
    // Zu wenig Top-Artikel (oder Filter aus): normale Artikel, aber nur ausführliche.
    const d = await api({ ...CARD_PROPS, gsrlimit: '20',
      gsrsearch: `${base} ${WIKI.noList}` });
    const minLen = def.minLen || (state.quality ? 9000 : 4000);
    const more = (d.query?.pages || []).filter(p => p.length >= minLen && !seenSet.has(p.title));
    pages = pages.concat(more.slice(0, 4));
  }
  return pages
    .filter(p => p.extract && p.extract.length > 80)
    .map(p => ({ title: p.title, extract: p.extract, thumb: p.thumbnail?.source || null, topic, top: !!p.top }));
}

// ---------- Mehr wie das hier ----------
function addSeed(item) {
  if (!item?.title) return;
  state.seeds = [{ title: item.title, topic: item.topic || null }, ...state.seeds.filter(s => s.title !== item.title)].slice(0, 8);
  lstore.set('seeds', state.seeds);
}
function dropSeed(title) {
  state.seeds = state.seeds.filter(s => s.title !== title);
  lstore.set('seeds', state.seeds);
}
async function fetchSimilar(seed, max) {
  const d = await api({ ...CARD_PROPS, gsrsort: 'relevance', gsrlimit: '12', gsrsearch: 'morelike:' + seed.title });
  return (d.query?.pages || [])
    .sort((a, b) => a.index - b.index)
    .filter(p => p.length >= 3500 && p.extract && p.extract.length > 80 && !seenSet.has(p.title) && !feedTitles.has(p.title))
    .slice(0, max)
    .map(p => ({ title: p.title, extract: p.extract, thumb: p.thumbnail?.source || null, topic: seed.topic, top: false, seed: seed.title }));
}
async function insertSimilar(card, item) {
  if (!card || card.dataset.sim) return;
  card.dataset.sim = '1';
  const gen = feedGen;
  try {
    const sims = await fetchSimilar({ title: item.title, topic: item.topic || null }, 2);
    if (gen !== feedGen || !card.isConnected) return;
    let after = card;
    for (const s of sims) after = addCard(s, after);
  } catch {}
}

// ---------- Artikel des Tages ----------
async function fetchAotd() {
  const day = today();
  let a = lstore.get('aotd', null);
  if (!a || a.day !== day) {
    const res = await fetch(`https://${WIKI.host}/api/rest_v1/feed/featured/${day.replace(/-/g, '/')}`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const j = await res.json();
    const title = j.tfa?.titles?.normalized || j.tfa?.title?.replace(/_/g, ' ');
    if (!title) return null;
    const q = await api({ titles: title, redirects: '1', prop: 'extracts|pageimages', exintro: '1', explaintext: '1', exsentences: '10', piprop: 'thumbnail', pithumbsize: '900' });
    const p = q.query?.pages?.[0];
    a = { day, item: { title: p?.title || title, extract: p?.extract || j.tfa.extract || '', thumb: p?.thumbnail?.source || null, topic: null, top: false, aotd: true } };
    lstore.set('aotd', a);
  }
  return a.item;
}

// ---------- Feed ----------
const feedEl = document.getElementById('feed');
let loading = false;
let cardCount = 0;
let feedGen = 0;
const feedTitles = new Set();
const cardItems = new WeakMap();

function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

// ---------- Effekte: Bildfarben, Tiefe, Bewegung ----------
// Jede Karte bekommt die Farben ihres Bildes (--c1…--c4, --glow). Beim Scrollen und Neigen
// verschieben sich die Ebenen der Karte unterschiedlich stark (--p, --a, --tx, --ty in style.css).
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fxCanvas = document.createElement('canvas');
fxCanvas.width = fxCanvas.height = 8;
const fxCtx = fxCanvas.getContext('2d', { willReadFrequently: true });

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
const hsl = (h, s, l) => `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
function setPalette(card, cols, glow) {
  cols.forEach((c, i) => card.style.setProperty('--c' + (i + 1), c));
  card.style.setProperty('--glow', glow);
}
// Vorläufige Farben aus dem Titel – gelten, bis das Bild geladen ist (oder wenn es keins gibt).
function hashPalette(card, title) {
  let n = 0;
  for (let i = 0; i < title.length; i++) n = (n * 31 + title.charCodeAt(i)) >>> 0;
  const h = n % 360;
  setPalette(card, [hsl(h, .5, .27), hsl((h + 45) % 360, .5, .25), hsl((h + 290) % 360, .45, .2), hsl((h + 160) % 360, .4, .2)], hsl(h, .85, .76));
}
// Das Bild auf 8×8 Punkte verkleinern und aus den vier Ecken je eine Farbe lesen.
function imagePalette(card, im) {
  try {
    fxCtx.drawImage(im, 0, 0, 8, 8);
    const d = fxCtx.getImageData(0, 0, 8, 8).data;
    let best = null;
    const cols = [[0, 0], [4, 0], [0, 4], [4, 4]].map(([x0, y0]) => {
      let r = 0, g = 0, b = 0;
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const i = ((y0 + y) * 8 + x0 + x) * 4; r += d[i]; g += d[i + 1]; b += d[i + 2]; }
      let [h, sat, l] = rgbToHsl(r / 16, g / 16, b / 16);
      if (sat < .1) { h = 224; sat = .16; }                   // Grau bleibt kühles Grau statt bunt zu werden
      else { if (!best || sat > best[1]) best = [h, sat]; sat = clamp(sat * 1.4, .38, .82); }
      return hsl(h, sat, clamp(l * .8, .17, .36));
    });
    setPalette(card, cols, best ? hsl(best[0], clamp(best[1] * 1.5, .6, .95), .76) : hsl(224, .75, .8));
  } catch {}
}

// Scroll-Fortschritt je Karte: --p von -1 (oben raus) über 0 (vorn) bis 1 (unten), --a ist der Betrag.
const nearCards = new Set();
let fxQueued = false;
function queueFx() { if (!fxQueued) { fxQueued = true; requestAnimationFrame(feedFx); } }
function feedFx() {
  fxQueued = false;
  const h = feedEl.clientHeight;
  if (!h) return;
  const top = feedEl.scrollTop;
  for (const c of nearCards) {
    const p = clamp((c.offsetTop - top) / h, -1, 1);
    if (!reduceMotion) { c.style.setProperty('--p', p.toFixed(3)); c.style.setProperty('--a', Math.abs(p).toFixed(3)); }
    c.classList.toggle('active', Math.abs(p) < .55); // knapp über der Mitte: beim Wechsel ist nie eine Karte ohne Text zu sehen
  }
}
const nearObs = new IntersectionObserver(entries => {
  for (const en of entries) {
    if (en.isIntersecting) nearCards.add(en.target);
    else { nearCards.delete(en.target); en.target.classList.remove('active'); }
  }
  feedFx(); // sofort, nicht erst im nächsten Bild: so steht die vordere Karte sicher mit Text da
}, { root: feedEl, rootMargin: '60% 0px' });
feedEl.addEventListener('scroll', queueFx, { passive: true });
window.addEventListener('resize', queueFx);

// Neigen: Maus am Rechner, Lagesensor am Handy. Die Werte gleiten weich nach.
const tilt = { x: 0, y: 0, tx: 0, ty: 0, raf: 0 };
function tiltTo(x, y) {
  tilt.tx = clamp(x, -1, 1); tilt.ty = clamp(y, -1, 1);
  if (!tilt.raf) tilt.raf = requestAnimationFrame(tiltStep);
}
function tiltStep() {
  tilt.x += (tilt.tx - tilt.x) * .12; tilt.y += (tilt.ty - tilt.y) * .12;
  feedEl.style.setProperty('--tx', tilt.x.toFixed(3));
  feedEl.style.setProperty('--ty', tilt.y.toFixed(3));
  tilt.raf = (Math.abs(tilt.tx - tilt.x) > .003 || Math.abs(tilt.ty - tilt.y) > .003) ? requestAnimationFrame(tiltStep) : 0;
}
if (!reduceMotion) {
  feedEl.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const r = feedEl.getBoundingClientRect();
    tiltTo(((e.clientX - r.left) / r.width - .5) * 2, ((e.clientY - r.top) / r.height - .5) * 2);
  });
  feedEl.addEventListener('pointerleave', () => tiltTo(0, 0));
}
let gyroBase = null;
let gyroOn = false;
function onOrient(e) {
  if (e.gamma == null || e.beta == null || !$('view-feed').classList.contains('active')) return;
  if (!gyroBase) gyroBase = { b: e.beta, g: e.gamma };
  // Die Ruhelage wandert langsam mit, damit die Karte in jeder Handhaltung gerade steht.
  gyroBase.b += (e.beta - gyroBase.b) * .02; gyroBase.g += (e.gamma - gyroBase.g) * .02;
  tiltTo((e.gamma - gyroBase.g) / 16, (e.beta - gyroBase.b) / 16);
}
async function gyroStart() {
  if (gyroOn) return true;
  try {
    if (typeof DeviceOrientationEvent === 'undefined') return false;
    // iPhone: Der Lagesensor braucht eine Erlaubnis, und die Frage darf nur nach einem Fingertipp kommen.
    if (typeof DeviceOrientationEvent.requestPermission === 'function' && await DeviceOrientationEvent.requestPermission() !== 'granted') return false;
    window.addEventListener('deviceorientation', onOrient);
    gyroOn = true;
    return true;
  } catch { return false; }
}
function gyroStop() { window.removeEventListener('deviceorientation', onOrient); gyroOn = false; gyroBase = null; tiltTo(0, 0); }

const ICONS = {
  heart: '<path d="M12 20.3s-7.4-4.5-9.2-9.1C1.5 7.9 3.5 4.6 7 4.6c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.5 0 5.5 3.3 4.2 6.6-1.8 4.6-9.2 9.1-9.2 9.1z"/>',
  bookmark: '<path d="M6.8 3.6h10.4a1 1 0 0 1 1 1v16l-6.2-4-6.2 4v-16a1 1 0 0 1 1-1z"/>',
  less: '<circle cx="12" cy="12" r="8.4"/><path d="M8 12h8"/>',
  share: '<path d="M12 14.5V3.8M7.8 7.8 12 3.6l4.2 4.2"/><path d="M5.2 12.2v6.6a1.6 1.6 0 0 0 1.6 1.6h10.4a1.6 1.6 0 0 0 1.6-1.6v-6.6"/>',
};

// Bildnachweis: Urheber und Lizenz eines Wikimedia-Bildes, geladen erst wenn die Karte vorn ist.
const creditCache = new Map();
function fileFromThumb(url) {
  const m = url.match(/\/wikipedia\/([a-z-]+)\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/?]+)/i);
  if (!m) return null;
  const host = m[1] === 'commons' ? 'commons.wikimedia.org' : m[1] + '.wikipedia.org';
  return { host, file: decodeURIComponent(m[2]) };
}
async function imageCredit(url) {
  const f = fileFromThumb(url);
  if (!f) return null;
  const key = f.host + '|' + f.file;
  if (creditCache.has(key)) return creditCache.get(key);
  const pr = (async () => {
    const u = new URL('https://' + f.host + '/w/api.php');
    Object.entries({ action: 'query', format: 'json', formatversion: '2', origin: '*', prop: 'imageinfo', iiprop: 'extmetadata', iiextmetadatafilter: 'Artist|LicenseShortName|Credit', titles: 'File:' + f.file })
      .forEach(([k, v]) => u.searchParams.set(k, v));
    const d = await (await fetch(u)).json();
    const md = d.query?.pages?.[0]?.imageinfo?.[0]?.extmetadata || {};
    const txt = h => h ? (new DOMParser().parseFromString(h, 'text/html').body.textContent || '').replace(/\s+/g, ' ').trim() : '';
    const artist = txt(md.Artist?.value) || txt(md.Credit?.value);
    return { artist: artist.length > 60 ? artist.slice(0, 58) + '…' : artist, license: txt(md.LicenseShortName?.value),
      page: 'https://' + f.host + '/wiki/File:' + encodeURIComponent(f.file.replace(/ /g, '_')) };
  })().catch(() => null);
  creditCache.set(key, pr);
  return pr;
}
async function showCredit(card, item) {
  if (!item.thumb || card.dataset.credit) return;
  card.dataset.credit = '1';
  const c = await imageCredit(item.thumb);
  const stage = card.querySelector('.card-stage');
  if (!stage) return;
  const a = el('a', 'credit');
  a.href = c?.page || item.thumb;
  a.target = '_blank'; a.rel = 'noopener';
  a.textContent = '📷 ' + (c ? [c.artist || T('Wikimedia Commons', 'Wikimedia Commons'), c.license].filter(Boolean).join(' · ') : 'Wikimedia');
  a.title = T('Bildquelle und Lizenz', 'Image source and licence');
  a.onclick = e => e.stopPropagation();
  stage.append(a);
}

// Funken, die beim Herz und beim Merken aus dem Knopf sprühen.
function burst(btn, emojis) {
  btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop');
  if (reduceMotion || !btn.animate) return;
  const r = btn.getBoundingClientRect();
  for (let i = 0; i < 11; i++) {
    const sp = el('span', 'spark', emojis[i % emojis.length]);
    sp.style.left = (r.left + r.width / 2) + 'px';
    sp.style.top = (r.top + r.height / 2) + 'px';
    document.body.append(sp);
    const ang = -Math.PI / 2 + (Math.random() - .5) * 2.1, dist = 70 + Math.random() * 100;
    sp.animate([
      { transform: 'translate(-50%, -50%) scale(.3)', opacity: 1 },
      { transform: `translate(calc(-50% + ${Math.cos(ang) * dist}px), calc(-50% + ${Math.sin(ang) * dist}px)) scale(${.8 + Math.random() * .9}) rotate(${(Math.random() - .5) * 90}deg)`, opacity: 0 },
    ], { duration: 700 + Math.random() * 500, easing: 'cubic-bezier(.15,.8,.3,1)' }).onfinish = () => sp.remove();
  }
}

function stateCard(kind, msg) {
  feedEl.querySelector('.state-card')?.remove();
  const c = el('div', 'card state-card');
  const inner = el('div');
  if (kind === 'loading') inner.append(el('div', 'spinner'));
  inner.append(el('p', null, msg));
  if (kind === 'error') {
    const b = el('button', 'btn', T('Nochmal versuchen', 'Try again'));
    b.onclick = () => { c.remove(); loadMore(); };
    inner.append(b);
  }
  c.append(inner);
  feedEl.append(c);
  return c;
}

async function loadMore() {
  if (loading) return;
  if (!state.enabled.length) { stateCard('empty', T('Wähle unter „Themen“ mindestens ein Thema aus.', 'Pick at least one topic under “Topics”.')); return; }
  loading = true;
  const gen = feedGen;
  const first = cardCount === 0;
  const spinner = first ? stateCard('loading', T('Suche spannende Artikel …', 'Finding interesting articles …')) : null;
  try {
    // 3 verschiedene Themen pro Ladevorgang, je ~4 Artikel -> gute Mischung.
    const want = Math.min(3, state.enabled.length);
    const topics = new Set();
    for (let tries = 0; topics.size < want && tries < 30; tries++) topics.add(pickTopic());
    const aotdP = (cardCount === 0 && lstore.get('aotdSeen', '') !== today()) ? fetchAotd().catch(() => null) : null;
    let items = [];
    for (const t of topics) items = items.concat(await fetchTopic(t));
    // Dazu Artikel, die einem ähneln, der dir gefallen hat.
    if (state.seeds.length && Math.random() < 0.7) {
      const seed = state.seeds[Math.floor(Math.random() * state.seeds.length)];
      try { items = items.concat(await fetchSimilar(seed, 2)); } catch {}
    }
    const aotd = aotdP ? await aotdP : null;
    if (gen !== feedGen) return;
    const titles = new Set(feedTitles);
    if (aotd) titles.add(aotd.title);
    items = shuffle(items.filter(i => !titles.has(i.title) && titles.add(i.title)));
    if (aotd) items.unshift(aotd);
    spinner?.remove();
    if (!items.length) { loading = false; return loadMore(); }
    items.forEach(i => addCard(i));
  } catch (e) {
    if (gen !== feedGen) return;
    spinner?.remove();
    stateCard('error', navigator.onLine === false
      ? T('Du bist offline. Unter „Gemerkt“ kannst du deine gespeicherten Artikel trotzdem lesen.', 'You are offline. You can still read your saved articles under “Saved”.')
      : T('Konnte keine Artikel laden (', 'Could not load articles (') + e.message + T('). Bist du online?', '). Are you online?'));
  } finally {
    if (gen === feedGen) loading = false;
  }
}

const viewObs = new IntersectionObserver(entries => {
  for (const en of entries) {
    if (!en.isIntersecting) continue;
    const card = en.target;
    const item = cardItems.get(card);
    if (item) {
      markSeen(item.title);
      showCredit(card, item);
      if (item.aotd) lstore.set('aotdSeen', today());
    }
    let after = 0;
    for (let n = card.nextElementSibling; n && after < 3; n = n.nextElementSibling) if (n.classList.contains('card') && !n.classList.contains('state-card')) after++;
    if (after < 3) loadMore();
  }
}, { root: feedEl, threshold: 0.6 });

function placeCard(card, afterEl) {
  cardCount++;
  if (afterEl?.isConnected) { afterEl.after(card); }
  else { const sc = feedEl.querySelector('.state-card'); if (sc) sc.before(card); else feedEl.append(card); }
  viewObs.observe(card);
  nearObs.observe(card);
  queueFx();
  return card;
}

function addCard(item, afterEl) {
  const card = el('article', 'card');
  card.dataset.title = item.title;
  cardItems.set(card, item);
  feedTitles.add(item.title);

  // Ebenen: Farb-Nebel, schwebendes Bild, Glasfläche mit Text, Knöpfe.
  hashPalette(card, item.title);
  const bg = el('div', 'card-bg');
  const img = el('div', 'card-photo');
  const noImage = () => { img.textContent = ''; img.classList.add('placeholder'); img.append(el('b', null, item.title[0])); card.classList.add('noimg'); };
  if (item.thumb) {
    const im = new Image();
    im.crossOrigin = 'anonymous'; // nötig, um die Bildfarben lesen zu dürfen
    im.decoding = 'async';
    im.loading = 'lazy';
    im.alt = '';
    im.onload = () => { img.classList.add('ready'); if (im.crossOrigin) imagePalette(card, im); };
    im.onerror = () => {
      if (im.crossOrigin) { im.removeAttribute('crossorigin'); im.src = item.thumb; } // zweiter Versuch ohne Farb-Auslesen
      else noImage();
    };
    im.src = item.thumb;
    img.append(im);
  } else noImage();

  const body = el('div', 'card-body');
  const meta = el('div', 'meta');
  if (item.aotd) meta.append(el('span', 'chip top', T('⭐ Artikel des Tages', '⭐ Article of the day')));
  if (item.topic) meta.append(el('span', 'chip', topicLabel(item.topic)));
  if (item.top) meta.append(el('span', 'chip top', T('★ Top-Artikel', '★ Top article')));
  if (item.seed) meta.append(el('span', 'chip sim', T('≈ Ähnlich wie „' + item.seed + '“', '≈ Similar to “' + item.seed + '”')));
  const h = el('h2', null, item.title);
  const p = el('p', 'extract', item.extract);
  body.append(meta, h, p, el('div', 'src', T('Wikipedia · CC BY-SA 4.0', 'Wikipedia · CC BY-SA 4.0')));

  // Seitenleiste im TikTok-Stil: Herz, Merken, Weniger davon, Teilen.
  const side = el('div', 'side');
  const mk = (cls, svgPath, label) => {
    const b = el('button', 'sb ' + cls);
    b.setAttribute('aria-label', label);
    const ic = el('span', 'sb-i');
    ic.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${svgPath}</svg>`;
    b.append(ic, el('small', null, label));
    return b;
  };
  const like = mk('like', ICONS.heart, T('Gefällt mir', 'Like'));
  const save = mk('save', ICONS.bookmark, T('Merken', 'Save'));
  const less = mk('less', ICONS.less, T('Weniger', 'Less'));
  const share = mk('share', ICONS.share, T('Teilen', 'Share'));
  if (isSaved(item.title)) save.classList.add('on');

  const doLike = () => {
    if (like.classList.contains('on')) return;
    adjust(item.topic, 1.3);
    like.classList.add('on');
    burst(like, ['❤️', '✨']);
    addSeed(item);
    insertSimilar(card, item);
    toast(T('❤️ Ähnliche Artikel kommen als Nächstes', '❤️ Similar articles coming up next'));
  };
  like.onclick = () => {
    if (!like.classList.contains('on')) return doLike();
    like.classList.remove('on');           // zweites Antippen nimmt das Herz zurück
    adjust(item.topic, 1 / 1.3);
    dropSeed(item.title);
  };
  save.onclick = () => {
    const on = toggleSaved(item);
    save.classList.toggle('on', on);
    if (on) { adjust(item.topic, 1.1); burst(save, ['✨']); }
    toast(on ? T('Gemerkt · auch offline lesbar', 'Saved · readable offline') : T('Entfernt', 'Removed'));
  };
  less.onclick = () => {
    adjust(item.topic, 0.7);
    if (like.classList.contains('on')) { adjust(item.topic, 1 / 1.3); like.classList.remove('on'); }
    if (item.seed) dropSeed(item.seed);
    dropSeed(item.title);
    toast(item.topic ? T(`Weniger ${topicLabel(item.topic)}`, `Less ${topicLabel(item.topic)}`) : T('Weniger davon', 'Less of this'));
    card.classList.add('gone');
    setTimeout(() => next(card), 380);
    setTimeout(() => card.classList.remove('gone'), 1300);
  };
  share.onclick = async () => {
    const url = 'https://' + WIKI.host + '/wiki/' + encodeURIComponent(item.title.replace(/ /g, '_'));
    try {
      if (navigator.share) await navigator.share({ title: item.title, url });
      else { await navigator.clipboard.writeText(url); toast(T('Link kopiert', 'Link copied')); }
    } catch {}
  };
  side.append(like, save, less, share);

  // Antippen öffnet den Artikel, Doppeltippen aufs Bild ist ein Herz.
  const openIt = () => openReader(item.title, item);
  body.onclick = openIt;
  let tapTimer = null;
  img.onclick = e => {
    if (tapTimer) {
      clearTimeout(tapTimer); tapTimer = null;
      const r = stage.getBoundingClientRect();
      const hh = el('span', 'bigheart', '❤️');
      hh.style.left = (e.clientX - r.left) + 'px';
      hh.style.top = (e.clientY - r.top) + 'px';
      stage.append(hh);
      setTimeout(() => hh.remove(), 900);
      doLike();
      return;
    }
    tapTimer = setTimeout(() => { tapTimer = null; openIt(); }, 260);
  };

  const stage = el('div', 'card-stage');
  stage.append(img, side);
  card.append(bg, stage, body);
  return placeCard(card, afterEl);
}

function next(card) {
  const n = card.nextElementSibling;
  if (n) feedEl.scrollTo({ top: n.offsetTop, behavior: 'smooth' });
}

function resetFeed() {
  feedGen++;
  loading = false;
  cardCount = 0;
  feedTitles.clear();
  viewObs.disconnect();
  nearObs.disconnect();
  nearCards.clear();
  feedEl.innerHTML = '';
  feedEl.scrollTop = 0;
  loadMore();
}

// ---------- Gemerkt ----------
const isSaved = t => state.saved.some(s => s.title === t);
function toggleSaved(item) {
  if (isSaved(item.title)) state.saved = state.saved.filter(s => s.title !== item.title);
  else state.saved.unshift({ title: item.title, extract: item.extract || '', thumb: item.thumb || null, topic: item.topic || null });
  lstore.set('saved', state.saved);
  renderSaved();
  if (isSaved(item.title)) queueOffline(item.title); else offlineDelete(item.title);
  return isSaved(item.title);
}

// ---------- Offline lesen ----------
// Gemerkte Artikel landen samt Bildern im Cache-Speicher des Geräts.
const ART_CACHE = 'wikifeed-articles';
const canCache = 'caches' in window;
const artKey = t => 'offline-article/' + (LANG === 'de' ? '' : LANG + '/') + encodeURIComponent(t);

// Fremdes HTML entschärfen: keine Skripte, Rahmen, Formulare, Ereignis-Attribute oder javascript:-Links.
function sanitize(doc) {
  doc.querySelectorAll('script, noscript, iframe, frame, object, embed, applet, form, input, button, textarea, select, base, link, meta').forEach(n => n.remove());
  doc.querySelectorAll('*').forEach(n => {
    for (const a of [...n.attributes]) {
      const name = a.name.toLowerCase(), val = a.value.replace(/[\s\u0000-\u001f]/g, '').toLowerCase();
      if (name.startsWith('on') || name === 'formaction' || name === 'srcdoc') n.removeAttribute(a.name);
      else if (['href', 'src', 'xlink:href', 'action', 'poster', 'data'].includes(name) && /^(javascript|vbscript|data:text)/.test(val)) n.removeAttribute(a.name);
    }
  });
  return doc;
}
function cleanArticle(htmlText) {
  const doc = sanitize(new DOMParser().parseFromString(htmlText, 'text/html'));
  doc.querySelectorAll('.navbox, .mw-references-wrap, .reflist, ol.references, sup.reference, .mw-editsection, .sisterproject, #normdaten, .mw-empty-elt').forEach(n => n.remove());
  // Adressen ohne Protokoll ("//upload.wikimedia.org/…") immer als https laden – auch bei Videos und Tönen.
  doc.querySelectorAll('[src], [poster], [srcset]').forEach(n => {
    for (const a of ['src', 'poster']) { const v = n.getAttribute(a); if (v?.startsWith('//')) n.setAttribute(a, 'https:' + v); }
    const ss = n.getAttribute('srcset');
    if (ss) n.setAttribute('srcset', ss.replace(/(^|,\s*)\/\//g, '$1https://'));
  });
  doc.querySelectorAll('img').forEach(img => { img.loading = 'lazy'; });
  return doc;
}
async function fetchArticle(title) {
  const d = await api({ action: 'parse', page: title, prop: 'text|displaytitle', redirects: '1', disableeditsection: '1', disabletoc: '1' });
  if (d.error) throw new Error(d.error.info);
  return { title: d.parse.title, doc: cleanArticle(d.parse.text) };
}
async function offlineGet(title) {
  if (!canCache) return null;
  try {
    const c = await caches.open(ART_CACHE);
    const r = await c.match(artKey(title));
    return r ? await r.json() : null;
  } catch { return null; }
}
async function offlineSave(title) {
  if (!canCache || !isSaved(title)) return;
  const entry = state.saved.find(s => s.title === title);
  const { title: realTitle, doc } = await fetchArticle(title);
  const imgs = [];
  // Videos/Audio gehen ohne Netz nicht – in der Offline-Kopie weglassen.
  doc.querySelectorAll('video, audio').forEach(v => (v.closest('figure') || v).remove());
  doc.querySelectorAll('img').forEach(img => {
    img.removeAttribute('srcset');
    img.removeAttribute('loading');
    const src = img.getAttribute('src') || '';
    if (/^https:\/\//.test(src) && imgs.length < 40) imgs.push(src);
    else (img.closest('figure') || img).remove();
  });
  if (entry?.thumb) imgs.push(entry.thumb);
  const c = await caches.open(ART_CACHE);
  await c.put(artKey(title), new Response(JSON.stringify({ title: realTitle, html: doc.body.innerHTML, imgs }), { headers: { 'Content-Type': 'application/json' } }));
  for (const u of imgs) {
    try { const r = await fetch(u, { mode: 'cors' }); if (r.ok) await c.put(u, r); } catch {}
  }
  if (!isSaved(title)) return offlineDelete(title);
  if (entry) { entry.off = true; lstore.set('saved', state.saved); renderSaved(); }
}
async function offlineDelete(title) {
  if (!canCache) return;
  try {
    const off = await offlineGet(title);
    const c = await caches.open(ART_CACHE);
    for (const u of off?.imgs || []) await c.delete(u);
    await c.delete(artKey(title));
  } catch {}
}
let offChain = Promise.resolve();
function queueOffline(title) {
  if (!canCache) return;
  offChain = offChain.then(() => offlineSave(title)).catch(() => {}).then(() => new Promise(r => setTimeout(r, 700)));
}
function offlineBackfill() {
  if (navigator.onLine === false) return;
  state.saved.filter(s => !s.off).forEach(s => queueOffline(s.title));
}
window.addEventListener('online', offlineBackfill);
function renderSaved() {
  const ul = document.getElementById('saved-list');
  ul.innerHTML = '';
  document.getElementById('saved-empty').hidden = state.saved.length > 0;
  for (const s of state.saved) {
    const li = el('li');
    const th = el('div', 'thumb');
    if (s.thumb) th.style.backgroundImage = `url("${s.thumb}")`;
    const t = el('div', 't');
    t.append(el('b', null, s.title), el('small', null, s.extract));
    if (s.off) t.append(el('span', 'offbadge', T('✓ offline verfügbar', '✓ available offline')));
    const del = el('button', 'del', '✕');
    del.setAttribute('aria-label', T('Entfernen', 'Remove'));
    del.onclick = e => { e.stopPropagation(); toggleSaved(s); syncSaveButtons(); };
    li.append(th, t, del);
    li.onclick = () => openReader(s.title, s);
    ul.append(li);
  }
}
function syncSaveButtons() {
  feedEl.querySelectorAll('.card[data-title]').forEach(c => c.querySelector('.sb.save')?.classList.toggle('on', isSaved(c.dataset.title)));
}

// ---------- Leser ----------
const reader = document.getElementById('reader');
const readerBody = document.getElementById('reader-body');
const readerScroll = document.getElementById('reader-scroll');
const readerStack = [];
let readSession = null; // { item, start }

async function openReader(title, item = null) {
  if (!readerStack.length) {
    readSession = { item, start: Date.now() };
    history.pushState({ reader: true }, '');
  }
  readerStack.push({ title, item, scroll: 0 });
  if (readerStack.length > 1) readerStack[readerStack.length - 2].scroll = readerScroll.scrollTop;
  reader.hidden = false;
  await renderArticle(title);
}

async function renderArticle(title, restoreScroll = 0) {
  const top = readerStack[readerStack.length - 1];
  document.getElementById('reader-title').textContent = title;
  document.getElementById('reader-ext').href = 'https://' + WIKI.host + '/wiki/' + encodeURIComponent(title.replace(/ /g, '_'));
  document.getElementById('reader-save').classList.toggle('on', isSaved(title));
  ttsStop();
  readerBody.innerHTML = '<div class="loading"><div class="spinner"></div>' + T('Lade Artikel …', 'Loading article …') + '</div>';
  readerScroll.scrollTop = 0;
  try {
    // Gemerkte Artikel kommen sofort aus dem Offline-Speicher, alles andere aus dem Netz.
    const off = await offlineGet(title);
    let art;
    if (off) art = { title: off.title, doc: sanitize(new DOMParser().parseFromString(off.html, 'text/html')), offline: true };
    else art = await fetchArticle(title);
    if (readerStack[readerStack.length - 1] !== top) return;
    readerBody.innerHTML = '';
    readerBody.append(el('h1', 'art-title', art.title));
    if (art.offline) readerBody.append(el('div', 'offnote', T('📥 Offline gespeichert', '📥 Saved offline')));
    readerBody.append(...art.doc.body.childNodes);
    readerBody.append(sourceNote(art.title));
    readerScroll.scrollTop = restoreScroll;
    top.title = art.title;
  } catch (e) {
    if (readerStack[readerStack.length - 1] !== top) return;
    readerBody.innerHTML = '';
    readerBody.append(el('p', 'loading', navigator.onLine === false
      ? T('Du bist offline und dieser Artikel ist nicht gespeichert. Gemerkte Artikel (🔖) kannst du auch ohne Netz lesen.', 'You are offline and this article is not saved. Saved articles (🔖) can be read without a connection.')
      : T('Artikel konnte nicht geladen werden: ', 'Could not load the article: ') + e.message));
  }
}

// Lizenzhinweis unter jedem Artikel (CC BY-SA verlangt Quelle, Autoren und Lizenz).
function sourceNote(title) {
  const base = 'https://' + WIKI.host + '/wiki/' + encodeURIComponent(title.replace(/ /g, '_'));
  const box = el('p', 'art-source');
  const link = (href, text) => { const a = el('a', null, text); a.href = href; a.target = '_blank'; a.rel = 'noopener'; return a; };
  box.append(T('Quelle: Artikel „', 'Source: article “'), link(base, title), T('“ aus der Wikipedia. Text unter ', '” from Wikipedia. Text licensed under '),
    link(T('https://creativecommons.org/licenses/by-sa/4.0/deed.de', 'https://creativecommons.org/licenses/by-sa/4.0/'), 'CC BY-SA 4.0'),
    T('. Autorinnen und Autoren: ', '. Authors: '), link(base.replace('/wiki/', '/w/index.php?action=history&title='), T('Versionsgeschichte', 'version history')), '.');
  return box;
}

// ---------- Vorlesen ----------
const speakBtn = $('reader-speak');
const canSpeak = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
const tts = { on: false, token: 0, nodes: [], ni: 0, chunks: [], ci: 0, lock: null, utter: null };
if (!canSpeak) speakBtn.hidden = true;
else speechSynthesis.getVoices(); // Stimmen schon mal laden

// Stimmen nach Qualität sortieren: Premium > Erweitert > normale > Spaß-Stimmen (Eddy, Grandma …).
const NOVELTY = /^(Eddy|Flo|Grandma|Grandpa|Reed|Rocko|Sandy|Shelley|Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Fred|Junior|Kathy|Ralph)\b/i;
function voiceScore(v) {
  let sc = 0;
  if (/premium/i.test(v.name)) sc += 40;
  else if (/enhanced|erweitert|natural|neural/i.test(v.name)) sc += 30;
  if (WIKI.voiceNames.test(v.name)) sc += 10;
  if (/Google|Microsoft/i.test(v.name)) sc += 8;
  if (NOVELTY.test(v.name)) sc -= 30;
  if (WIKI.voiceBest.test(v.lang)) sc += 3;
  if (v.localService) sc += 2;
  return sc;
}
function germanVoices() {
  if (!canSpeak) return [];
  return speechSynthesis.getVoices().filter(v => WIKI.voiceRe.test(v.lang)).sort((a, b) => voiceScore(b) - voiceScore(a));
}
function germanVoice() {
  const vs = germanVoices();
  const want = lstore.get('voice', '');
  return vs.find(v => v.voiceURI === want) || vs[0] || null;
}
const ttsRate = () => Number(store.get('rate', 1)) || 1;
function renderVoices() {
  const box = $('voice-box');
  if (!canSpeak) { box.hidden = true; return; }
  const sel = $('voice-select');
  const vs = germanVoices();
  const cur = germanVoice();
  sel.innerHTML = '';
  for (const v of vs) {
    const o = el('option', null, v.name.replace(WIKI.voiceStrip, '') + (NOVELTY.test(v.name) ? T(' (Roboter)', ' (robot)') : ''));
    o.value = v.voiceURI;
    if (cur && v.voiceURI === cur.voiceURI) o.selected = true;
    sel.append(o);
  }
  if (!vs.length) sel.append(el('option', null, T('Standardstimme', 'Default voice')));
  $('rate-select').value = String(ttsRate());
}
function speakSample() {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(T('Hallo! So klinge ich, wenn ich dir einen Artikel vorlese.', 'Hello! This is how I sound when I read an article to you.'));
  u.lang = WIKI.tts;
  const v = germanVoice();
  if (v) u.voice = v;
  u.rate = ttsRate();
  tts.utter = u;
  speechSynthesis.speak(u);
}
if (canSpeak) {
  speechSynthesis.addEventListener?.('voiceschanged', renderVoices);
  $('voice-select').onchange = e => { lstore.set('voice', e.target.value); speakSample(); };
  $('rate-select').onchange = e => { store.set('rate', Number(e.target.value)); speakSample(); };
  $('voice-test').onclick = speakSample;
}
function nodeText(n) {
  const c = n.cloneNode(true);
  c.querySelectorAll('sup, style, .mw-editsection, .noprint, .offnote').forEach(x => x.remove());
  return c.textContent.replace(/\[\d+\]/g, '').replace(/\s+/g, ' ').trim();
}
function ttsNodes() {
  return [...readerBody.querySelectorAll('h1, h2, h3, p, li, blockquote, dd')].filter(n =>
    n.offsetParent !== null && !n.closest('table, figure, .thumb, .infobox') &&
    !n.parentElement.closest('li, blockquote, dd, p') && nodeText(n).length > 1);
}
function chunkText(t) {
  // Kurze Häppchen: lange Texte am Stück brechen in manchen Browsern ab.
  const parts = t.match(/[^.!?]+[.!?]*\s*/g) || [t];
  const out = [];
  let cur = '';
  for (const p of parts) {
    if (cur && (cur + p).length > 240) { out.push(cur); cur = ''; }
    cur += p;
  }
  if (cur.trim()) out.push(cur);
  return out;
}
function ttsStart() {
  const nodes = ttsNodes();
  if (!nodes.length) return;
  // Beim ersten Absatz anfangen, der gerade sichtbar ist.
  const topY = readerScroll.getBoundingClientRect().top;
  const start = Math.max(0, nodes.findIndex(n => n.getBoundingClientRect().bottom > topY + 4));
  Object.assign(tts, { on: true, token: tts.token + 1, nodes, ni: start, chunks: [], ci: 0 });
  speakBtn.textContent = '⏹';
  speakBtn.classList.add('on');
  speakBtn.setAttribute('aria-label', T('Vorlesen stoppen', 'Stop reading'));
  // Bildschirm anlassen – bei gesperrtem Handy stoppt die Stimme sonst.
  navigator.wakeLock?.request('screen').then(l => { if (tts.on) tts.lock = l; else l.release(); }).catch(() => {});
  speechSynthesis.cancel();
  ttsSpeakNode();
}
function ttsSpeakNode() {
  readerBody.querySelector('.tts-now')?.classList.remove('tts-now');
  const n = tts.nodes[tts.ni];
  if (!n || !n.isConnected) { ttsStop(); if (!n) toast(T('Fertig vorgelesen', 'Finished reading')); return; }
  n.classList.add('tts-now');
  n.scrollIntoView({ block: 'center', behavior: 'smooth' });
  tts.chunks = chunkText(nodeText(n));
  tts.ci = 0;
  ttsSpeakChunk();
}
function ttsSpeakChunk() {
  if (!tts.on) return;
  if (tts.ci >= tts.chunks.length) { tts.ni++; return ttsSpeakNode(); }
  const u = new SpeechSynthesisUtterance(tts.chunks[tts.ci++]);
  u.lang = WIKI.tts;
  const v = germanVoice();
  if (v) u.voice = v;
  u.rate = ttsRate();
  const token = tts.token;
  u.onend = () => { if (token === tts.token) ttsSpeakChunk(); };
  u.onerror = e => {
    if (token !== tts.token || e.error === 'interrupted' || e.error === 'canceled') return;
    ttsStop();
    toast(T('Vorlesen ist hier leider nicht möglich', 'Reading aloud is not available here'));
  };
  tts.utter = u; // Referenz halten, sonst verliert Safari das Ende-Signal
  speechSynthesis.speak(u);
}
function ttsStop() {
  if (!tts.on) return;
  tts.on = false;
  tts.token++;
  speechSynthesis.cancel();
  readerBody.querySelector('.tts-now')?.classList.remove('tts-now');
  speakBtn.textContent = '🔊';
  speakBtn.classList.remove('on');
  speakBtn.setAttribute('aria-label', T('Vorlesen', 'Read aloud'));
  tts.lock?.release().catch(() => {});
  tts.lock = null;
}
speakBtn.onclick = () => { if (tts.on) ttsStop(); else ttsStart(); };
window.addEventListener('pagehide', ttsStop);

readerBody.addEventListener('click', e => {
  const a = e.target.closest('a');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  if (href.startsWith('/wiki/')) {
    e.preventDefault();
    const name = decodeURIComponent(href.slice(6).split('#')[0]).replace(/_/g, ' ');
    if (WIKI.ns.test(name)) {
      window.open('https://' + WIKI.host + href, '_blank', 'noopener');
    } else {
      openReader(name);
    }
  } else if (href.startsWith('#')) {
    e.preventDefault();
    const target = readerBody.querySelector('[id="' + CSS.escape(decodeURIComponent(href.slice(1))) + '"]');
    target?.scrollIntoView({ behavior: 'smooth' });
  } else if (/^(https?:)?\/\//.test(href)) {
    a.target = '_blank';
    a.rel = 'noopener';
  } else if (href.startsWith('/w/')) {
    e.preventDefault();
  }
});

function readerBack(fromPopstate = false) {
  readerStack.pop();
  if (readerStack.length) {
    const prev = readerStack[readerStack.length - 1];
    renderArticle(prev.title, prev.scroll);
    if (fromPopstate) history.pushState({ reader: true }, '');
    return;
  }
  closeReader(fromPopstate);
}
function closeReader(fromPopstate) {
  ttsStop();
  reader.hidden = true;
  setTimeout(() => { if (reader.hidden) readerBody.innerHTML = ''; }, 380); // erst leeren, wenn das Blatt hinausgeglitten ist
  if (readSession) {
    const secs = (Date.now() - readSession.start) / 1000;
    if (secs > 25) {
      countRead();
      const it = readSession.item;
      if (it?.topic) adjust(it.topic, secs > 120 ? 1.25 : 1.12);
      // Lange gelesen = gefällt dir -> ähnliche Artikel nachschieben.
      if (it?.title && secs > 120) {
        addSeed(it);
        insertSimilar([...feedEl.querySelectorAll('.card')].find(c => c.dataset.title === it.title), it);
      }
    }
    readSession = null;
  }
  if (!fromPopstate && history.state?.reader) history.back();
}
document.getElementById('reader-back').onclick = () => readerBack(false);
window.addEventListener('popstate', e => {
  if (!reader.hidden) readerBack(true);
  else if (!thinkEl.hidden && !e.state?.think) closeThink(true);
});
document.getElementById('reader-save').onclick = () => {
  const top = readerStack[readerStack.length - 1];
  const item = top.item || { title: top.title, extract: readerBody.querySelector('p')?.textContent?.slice(0, 300) || '', thumb: null, topic: null };
  const on = toggleSaved({ ...item, title: top.title });
  document.getElementById('reader-save').classList.toggle('on', on);
  syncSaveButtons();
  toast(on ? T('Gemerkt · auch offline lesbar', 'Saved · readable offline') : T('Entfernt', 'Removed'));
};

// ---------- Suche ----------
const searchInput = $('search-input');
const searchList = $('search-list');
const searchHint = $('search-hint');
let searchTimer;
let searchSeq = 0;
const SEARCH_PROPS = { prop: 'description|pageimages|extracts', exintro: '1', explaintext: '1', exsentences: '2', exlimit: 'max', piprop: 'thumbnail', pithumbsize: '160', pilimit: 'max' };

function listItem(it, sub) {
  const li = el('li');
  const th = el('div', 'thumb');
  if (it.thumb) th.style.backgroundImage = `url("${it.thumb}")`;
  const t = el('div', 't');
  t.append(el('b', null, it.title), el('small', null, sub || ''));
  li.append(th, t);
  li.onclick = () => openReader(it.title, it);
  return li;
}
async function runSearch() {
  const q = searchInput.value.trim();
  const seq = ++searchSeq;
  if (q.length < 2) { searchList.innerHTML = ''; renderSearchHint(); return; }
  try {
    const d = await api({ ...SEARCH_PROPS, generator: 'prefixsearch', gpssearch: q, gpslimit: '10', gpsnamespace: '0' });
    let pages = (d.query?.pages || []).sort((a, b) => a.index - b.index);
    if (pages.length < 4) {
      // Kaum Treffer am Wortanfang -> zusätzlich Volltextsuche.
      const d2 = await api({ ...SEARCH_PROPS, generator: 'search', gsrsearch: q, gsrlimit: '10', gsrnamespace: '0' });
      const have = new Set(pages.map(p => p.title));
      pages = pages.concat((d2.query?.pages || []).sort((a, b) => a.index - b.index).filter(p => !have.has(p.title)));
    }
    if (seq !== searchSeq) return;
    searchList.innerHTML = '';
    searchHint.hidden = pages.length > 0;
    searchHint.textContent = T('Nichts gefunden für „' + q + '“.', 'Nothing found for “' + q + '”.');
    for (const p of pages) {
      const it = { title: p.title, extract: p.extract || p.description || '', thumb: p.thumbnail?.source || null, topic: null };
      searchList.append(listItem(it, p.description || p.extract));
    }
  } catch (e) {
    if (seq !== searchSeq) return;
    searchList.innerHTML = '';
    searchHint.hidden = false;
    searchHint.textContent = navigator.onLine === false ? T('Du bist offline – die Suche braucht Internet.', 'You are offline – search needs a connection.') : T('Suche fehlgeschlagen (', 'Search failed (') + e.message + ').';
  }
}
function renderSearchHint() {
  searchHint.hidden = false;
  searchHint.textContent = T('Tippe ein Stichwort ein, z. B. „Photosynthese“ oder „Römisches Reich“.', 'Type a keyword, e.g. “photosynthesis” or “Roman Empire”.');
  const a = lstore.get('aotd', null);
  if (a?.day === today() && a.item && !searchList.children.length) {
    searchList.append(listItem(a.item, T('⭐ Artikel des Tages', '⭐ Article of the day')));
  }
}
searchInput.oninput = () => { clearTimeout(searchTimer); searchTimer = setTimeout(runSearch, 350); };
$('search-form').onsubmit = e => { e.preventDefault(); clearTimeout(searchTimer); runSearch(); searchInput.blur(); };

// ---------- Gedankenspiele ----------
const thinkEl = $('think');
const thinkBody = $('think-body');
const thinkScroll = $('think-scroll');
let thinkCur = null;

const thinkById = id => THOUGHTS.find(t => t.id === id);
const optLabel = o => Array.isArray(o) ? o[0] : o;
const optLean = o => Array.isArray(o) ? o[1] : null;
const saveThink = () => store.set('think', state.think);
function dayStr(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function yesterday() { const d = new Date(); d.setDate(d.getDate() - 1); return dayStr(d); }
// Jeden Tag ein anderes Gedankenspiel, in fester Reihenfolge – auf jedem Gerät dasselbe.
function dailyThought(day = today()) {
  const [y, m, d] = day.split('-').map(Number);
  const n = THOUGHTS.length;
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const step = [7, 11, 13, 17, 19, 23].find(x => gcd(x, n) === 1) || 1;
  return THOUGHTS[(Math.floor(Date.UTC(y, m - 1, d) / 864e5) * step) % n];
}
// Beim Gedankenspiel des Tages gibt es die Auflösung erst am nächsten Tag (oder auf Wunsch sofort).
const thinkWaiting = t => { const r = state.think[t.id]; return !!r && dailyThought().id === t.id && r.at === today() && !r.reveal; };

function answerThink(t, i) {
  const rec = state.think[t.id];
  if (rec) { if (t.correct != null) return; rec.a = i; }
  else state.think[t.id] = { a: i, t: null, at: today(), reveal: false };
  saveThink();
  updateThinkDot();
}
// Gestern beantwortet, Auflösung noch nicht angesehen?
function pendingResolve() {
  const y = dailyThought(yesterday());
  const r = state.think[y.id];
  return (y.id !== dailyThought().id && r && r.at === yesterday() && !r.reveal) ? y : null;
}
// Punkt am Tab „Denken“, solange das heutige Gedankenspiel offen ist oder eine Auflösung wartet.
function updateThinkDot() {
  const open = typeof THOUGHTS !== 'undefined' && (!state.think[dailyThought().id] || !!pendingResolve());
  document.querySelector('.tabbar button[data-view="think"]')?.classList.toggle('dot', open);
}

function openThink(id) {
  thinkCur = thinkById(id);
  if (!thinkCur) return;
  if (thinkEl.hidden) history.pushState({ think: true }, '');
  thinkEl.hidden = false;
  // Wer die Auflösung von gestern öffnet, hat sie gesehen.
  const rec = state.think[id];
  if (rec && rec.at !== today() && !rec.reveal) { rec.reveal = true; saveThink(); updateThinkDot(); }
  renderThink();
  thinkScroll.scrollTop = 0;
}
function closeThink(fromPopstate) {
  thinkEl.hidden = true;
  thinkCur = null;
  if (!fromPopstate && history.state?.think) history.back();
  if ($('view-think').classList.contains('active')) renderDenken();
}
$('think-back').onclick = () => closeThink(false);

function optButtons(opts, chosen, correct, onPick) {
  const box = el('div', 'opts');
  const locked = correct != null && chosen != null;
  opts.forEach((o, i) => {
    const b = el('button', 'opt', optLabel(o));
    if (chosen === i) b.classList.add('chosen');
    if (locked && i === correct) b.classList.add('right');
    if (locked && i === chosen && i !== correct) b.classList.add('wrong');
    if (locked) b.disabled = true;
    else b.onclick = () => onPick(i);
    box.append(b);
  });
  return box;
}
function renderThink() {
  const t = thinkCur;
  const rec = state.think[t.id];
  const keep = thinkScroll.scrollTop;
  $('think-title').textContent = t.title;
  const b = thinkBody;
  b.innerHTML = '';
  const meta = el('div', 'meta');
  meta.append(el('span', 'chip', THINK_FIELDS[t.field].label));
  if (dailyThought().id === t.id) meta.append(el('span', 'chip top', T('💭 Gedankenspiel des Tages', '💭 Thought experiment of the day')));
  b.append(el('div', 'think-icon', t.icon), meta, el('h1', null, t.title), el('p', 'think-text', t.text), el('p', 'think-q', t.q));
  b.append(optButtons(t.opts, rec ? rec.a : null, t.correct, i => { answerThink(t, i); renderThink(); }));
  if (!rec) { b.append(el('p', 'think-note', T('Erst entscheiden – danach siehst du, was dafür und dagegen spricht.', 'Decide first – then you will see the arguments on both sides.'))); return; }

  if (thinkWaiting(t)) {
    b.append(el('p', 'think-note', T('Deine Antwort ist gespeichert. Nimm die Frage mit durch den Tag – morgen wartet hier unter „Denken“ die Auflösung.', 'Your answer is saved. Carry the question with you today – the resolution will be waiting here under “Think” tomorrow.')));
    const now = el('button', 'btn ghost2', T('Auflösung jetzt schon zeigen', 'Show the resolution now'));
    now.onclick = () => { rec.reveal = true; saveThink(); renderThink(); };
    b.append(now);
    return;
  }
  if (t.correct != null) {
    b.append(el('p', 'think-verdict ' + (rec.a === t.correct ? 'ok' : 'no'), rec.a === t.correct ? T('✓ Richtig!', '✓ Correct!') : T('✗ Nicht ganz. Richtig ist: ', '✗ Not quite. The correct answer is: ') + optLabel(t.opts[t.correct])));
  } else if (t.opts.length && t.correct == null) {
    b.append(el('p', 'think-note', T('Hier gibt es keine „richtige“ Antwort. Du kannst deine Wahl jederzeit ändern.', 'There is no “right” answer here. You can change your choice at any time.')));
  }
  b.append(el('h3', null, t.correct != null ? T('Die Erklärung', 'The explanation') : T('Was dafür und dagegen spricht', 'The arguments on both sides')));
  for (const [head, txt] of t.args) b.append(el('h4', null, head), el('p', null, txt));
  if (t.twist) {
    b.append(el('h3', null, T('Und jetzt?', 'And now?')), el('p', null, t.twist.text), el('p', 'think-q', t.twist.q));
    b.append(optButtons(t.twist.opts, rec.t, null, i => { rec.t = i; saveThink(); renderThink(); }));
    if (rec.t != null) b.append(el('p', 'think-twistnote', t.twist.note));
  }
  b.append(el('h3', null, T('Hintergrund', 'Background')), el('p', null, t.info));
  const wiki = el('button', 'btn', T('Ganzen Artikel auf Wikipedia lesen →', 'Read the full Wikipedia article →'));
  wiki.onclick = () => openReader(t.wiki);
  b.append(wiki);
  thinkScroll.scrollTop = keep;
}

// Tab „Denken“: Sammlung, heutiges Gedankenspiel und dein Standpunkt.
function thinkProfile() {
  const axes = {};
  let right = 0, total = 0;
  for (const t of THOUGHTS) {
    const rec = state.think[t.id];
    if (!rec) continue;
    if (t.correct != null) { total++; if (rec.a === t.correct) right++; }
    if (!THINK_FIELDS[t.field].axis) continue;
    const leans = [optLean(t.opts[rec.a])];
    if (t.twist && rec.t != null) leans.push(optLean(t.twist.opts[rec.t]));
    for (const l of leans) if (l != null) (axes[t.field] = axes[t.field] || []).push(l);
  }
  return { axes, right, total };
}
const FIELD_SHORT = {
  ethik: T('Ethik', 'Ethics'), geist: T('Geist', 'Mind'), ich: T('Ich', 'Self'), physik: T('Physik', 'Physics'),
  logik: T('Logik', 'Logic'), wahl: T('Entscheiden', 'Decisions'), wissen: T('Wissen', 'Knowledge'),
};
let thinkFilter = 'all';
function thinkTile(t, i) {
  const done = !!state.think[t.id];
  const b = el('button', 'ttile' + (done ? ' done' : ''));
  b.style.animationDelay = Math.min(i * .03, .3) + 's';
  b.append(el('span', 'tt-i', t.icon), el('b', null, t.title), el('small', null, done ? T('Beantwortet', 'Answered') : FIELD_SHORT[t.field]));
  b.onclick = () => openThink(t.id);
  return b;
}
function renderThinkGrid(grid) {
  grid.innerHTML = '';
  THOUGHTS.filter(t => thinkFilter === 'all' || t.field === thinkFilter).forEach((t, i) => grid.append(thinkTile(t, i)));
}
function renderDenken() {
  const box = $('think-list');
  const keep = $('view-think').scrollTop;
  box.innerHTML = '';
  if (typeof THOUGHTS === 'undefined') return;
  const done = THOUGHTS.filter(t => state.think[t.id]).length;
  $('think-stats').textContent = T(`${done} von ${THOUGHTS.length} durchdacht`, `${done} of ${THOUGHTS.length} explored`);
  const prog = el('div', 'think-prog'); const pi = el('i'); pi.style.width = (done / THOUGHTS.length * 100) + '%'; prog.append(pi);
  box.append(prog);

  // 1) Heute: das Gedankenspiel des Tages als große Karte
  const d = dailyThought();
  const rec = state.think[d.id];
  box.append(el('div', 'th-h', T('Heute', 'Today')));
  const hero = el('button', 'think-hero');
  hero.append(el('span', 'th-tag', T('💭 Gedankenspiel des Tages', '💭 Thought experiment of the day')), el('span', 'th-icon', d.icon),
    el('h3', null, d.title), el('p', null, d.q),
    el('span', 'th-cta' + (rec ? ' done' : ''), rec ? T('Deine Antwort: ', 'Your answer: ') + optLabel(d.opts[rec.a]) : T('Jetzt nachdenken →', 'Think it through →')));
  hero.onclick = () => openThink(d.id);
  box.append(hero);
  const res = pendingResolve();
  if (res) {
    const r = el('button', 'think-resolve');
    r.append(el('span', null, '💡'), el('b', null, T('Auflösung von gestern: ', 'Yesterday’s resolution: ') + res.title), el('span', null, '›'));
    r.onclick = () => openThink(res.id);
    box.append(r);
  }
  updateThinkDot();

  // 2) Spiel
  if (typeof openTrolley === 'function') {
    box.append(el('div', 'th-h', T('Spiel', 'Game')));
    const g = el('button', 'game-banner');
    const gt = el('div', 'gb-t');
    gt.append(el('b', null, T('Weichensteller', 'Pull the Lever')), el('small', null, T('Das Trolley-Spiel: Klassiker, Endlos-Modus und 46 Fälle aus der Forschung', 'The trolley game: classics, endless mode and 46 research dilemmas')));
    g.append(el('span', 'gb-i', '🚋'), gt, el('span', 'gb-go', '›'));
    g.onclick = () => openTrolley();
    box.append(g);
  }

  // 3) Wo du stehst – erst, wenn es etwas zu zeigen gibt
  const { axes, right, total } = thinkProfile();
  const rows = Object.entries(THINK_FIELDS).filter(([key, f]) => f.axis && (axes[key] || []).length >= 2);
  if (rows.length || total) {
    box.append(el('div', 'th-h', T('Wo du stehst', 'Where you stand')));
    const prof = el('div', 'profile glass');
    for (const [key, f] of rows) {
      const vals = axes[key];
      const avg = vals.reduce((a, c) => a + c, 0) / vals.length;
      const row = el('div', 'axis');
      const bar = el('div', 'axis-bar'); const dot = el('i'); dot.style.left = ((avg + 1) / 2 * 100) + '%'; bar.append(dot);
      const ends = el('div', 'axis-ends'); ends.append(el('span', null, f.axis[0]), el('span', null, f.axis[1]));
      row.append(el('div', 'axis-name', f.label), bar, ends);
      prof.append(row);
    }
    if (total) prof.append(el('p', 'axis-score', T(`Rätsel mit eindeutiger Lösung: ${right} von ${total} richtig`, `Puzzles with a definite answer: ${right} of ${total} correct`)));
    box.append(prof);
  }

  // 4) Sammlung mit Filter nach Gebiet
  const head = el('div', 'th-h', T('Alle Gedankenspiele', 'All thought experiments'));
  head.append(el('small', null, `${done}/${THOUGHTS.length}`));
  box.append(head);
  const chips = el('div', 'fchips');
  const grid = el('div', 'tgrid');
  for (const key of ['all', ...Object.keys(THINK_FIELDS)]) {
    const c = el('button', 'tchip' + (thinkFilter === key ? ' on' : ''), key === 'all' ? T('Alle', 'All') : FIELD_SHORT[key]);
    c.onclick = () => {
      thinkFilter = key;
      chips.querySelectorAll('.tchip').forEach(x => x.classList.toggle('on', x === c));
      renderThinkGrid(grid);
    };
    chips.append(c);
  }
  box.append(chips, grid);
  renderThinkGrid(grid);
  $('view-think').scrollTop = keep;
}

// ---------- Themen-Seite ----------
let topicsDirty = false;
function renderTopics() {
  const box = document.getElementById('topic-chips');
  box.innerHTML = '';
  for (const t of TOPICS) {
    const b = el('button', 'tchip' + (state.enabled.includes(t.id) ? ' on' : ''), t.label);
    b.onclick = () => {
      state.enabled = state.enabled.includes(t.id) ? state.enabled.filter(x => x !== t.id) : [...state.enabled, t.id];
      store.set('enabled', state.enabled);
      topicsDirty = true;
      renderTopics();
    };
    box.append(b);
  }
  const q = document.getElementById('quality');
  q.checked = state.quality;
  renderVoices();

  const wb = document.getElementById('weights');
  wb.innerHTML = '';
  const rows = state.enabled.map(id => [id, w(id)]).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1.5, ...rows.map(r => r[1]));
  for (const [id, val] of rows) {
    const r = el('div', 'wrow');
    const bar = el('div', 'wbar'); const fill = el('i'); fill.style.width = (val / max * 100) + '%'; bar.append(fill);
    r.append(el('span', null, topicLabel(id)), bar, el('span', null, Math.round(val * 100) + '%'));
    wb.append(r);
  }
  // Bildschirm-Messwerte, um Layout-Probleme auf dem iPhone aus der Ferne zu erkennen.
  const probe = el('div');
  probe.style.cssText = 'position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)';
  document.body.append(probe);
  const cs = getComputedStyle(probe);
  const app = navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  $('dims').textContent = `${T('Maße', 'Size')}: ${screen.height} · ${window.innerHeight} · ${document.documentElement.clientHeight} · ${parseFloat(cs.paddingTop) || 0} · ${parseFloat(cs.paddingBottom) || 0} · ${app ? 'App' : 'Browser'}`;
  probe.remove();

  const s = state.stats;
  const readToday = s.day === today() ? s.read : 0;
  document.getElementById('stats').textContent = T(`Heute gelesen: ${readToday} · insgesamt: ${s.total || 0}`, `Read today: ${readToday} · total: ${s.total || 0}`);
}
document.getElementById('quality').onchange = e => { state.quality = e.target.checked; store.set('quality', state.quality); topicsDirty = true; };
document.getElementById('reset').onclick = () => {
  if (!confirm(T('Alles Gelernte zurücksetzen? Deine Themenauswahl und gemerkten Artikel bleiben.', 'Reset everything the app has learned? Your topic selection and saved articles are kept.'))) return;
  state.weights = {}; store.set('weights', {});
  renderTopics(); topicsDirty = true;
  toast(T('Zurückgesetzt', 'Reset'));
};

// ---------- Navigation ----------
document.querySelectorAll('.tabbar button').forEach(btn => {
  btn.onclick = () => {
    const v = btn.dataset.view;
    document.querySelectorAll('.tabbar button').forEach(b => b.classList.toggle('active', b === btn));
    btn.parentElement.style.setProperty('--i', [...btn.parentElement.querySelectorAll('button')].indexOf(btn));
    document.querySelectorAll('.view').forEach(s => s.classList.toggle('active', s.id === 'view-' + v));
    if (v === 'topics') renderTopics();
    if (v === 'saved') renderSaved();
    if (v === 'think') renderDenken();
    if (v === 'search' && !searchInput.value.trim()) { searchList.innerHTML = ''; renderSearchHint(); }
    if (v === 'feed' && topicsDirty) { topicsDirty = false; resetFeed(); }
    if (v === 'feed') feedFx();
  };
});

let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1400);
}

// ---------- Farbschemata ----------
const THEMES = [
  { id: 'sand', name: T('Sand', 'Sand'), bg: '#efe6d8', sw: 'linear-gradient(135deg, #f6e9d6 30%, #eec39c 70%, #e7b3a6)' },
  { id: 'salbei', name: T('Salbei', 'Sage'), bg: '#e5eadb', sw: 'linear-gradient(135deg, #edf1e3 30%, #b9d6b0 70%, #a9cfc4)' },
  { id: 'himmel', name: T('Himmel', 'Sky'), bg: '#e4eaf3', sw: 'linear-gradient(135deg, #eef2f8 30%, #b5cdef 70%, #d5caf0)' },
  { id: 'rose', name: T('Rosé', 'Rosé'), bg: '#f3e6e4', sw: 'linear-gradient(135deg, #f8ecea 30%, #f0b9c2 70%, #f5d2b9)' },
  { id: 'nacht', name: T('Nacht', 'Night'), bg: '#07080d', sw: 'linear-gradient(135deg, #0b0d18 30%, #3448d6 70%, #7d35c9)' },
];
function applyTheme(id) {
  const th = THEMES.find(t => t.id === id) || THEMES[0];
  document.documentElement.dataset.theme = th.id;
  document.querySelector('meta[name="theme-color"]').content = th.bg;
  document.querySelectorAll('.tpick').forEach(b => b.classList.toggle('on', b.dataset.theme === th.id));
}
function renderThemePicks() {
  const box = $('theme-picks');
  box.innerHTML = '';
  for (const th of THEMES) {
    const b = el('button', 'tpick');
    b.type = 'button';
    b.dataset.theme = th.id;
    const sw = el('i'); sw.style.background = th.sw;
    b.append(sw, el('span', null, th.name));
    b.onclick = () => { store.set('theme', th.id); applyTheme(th.id); };
    box.append(b);
  }
  applyTheme(document.documentElement.dataset.theme);
}
renderThemePicks();

// ---------- Größe der Textbox (Schieberegler) ----------
const panelInput = $('panel');
const panelShow = v => { $('panel-val').textContent = Math.round(v) + ' %'; };
panelInput.value = store.get('panel', 50);
panelShow(panelInput.value);
panelInput.oninput = () => {
  document.documentElement.style.setProperty('--panel', panelInput.value);
  panelShow(panelInput.value);
  store.set('panel', Number(panelInput.value));
};

// ---------- Alle Daten auf diesem Gerät löschen ----------
$('wipe').onclick = async () => {
  if (!confirm(T('Wirklich alles löschen? Gemerkte Artikel, Antworten, Einstellungen und Gelerntes sind danach weg. Das lässt sich nicht rückgängig machen.',
    'Really delete everything? Saved articles, answers, settings and what the app has learned will be gone. This cannot be undone.'))) return;
  try { Object.keys(localStorage).filter(k => k.startsWith('wf.')).forEach(k => localStorage.removeItem(k)); } catch {}
  try { if ('caches' in window) await caches.delete(ART_CACHE); } catch {}
  location.reload();
};

// ---------- Leser: Lesefortschritt ----------
readerScroll.addEventListener('scroll', () => {
  const max = readerScroll.scrollHeight - readerScroll.clientHeight;
  $('reader-progress').style.transform = `scaleX(${max > 0 ? clamp(readerScroll.scrollTop / max, 0, 1) : 0})`;
}, { passive: true });

// ---------- 3D-Effekt beim Neigen (Einstellung) ----------
const tiltBox = $('tilt');
tiltBox.checked = store.get('tilt', false);
tiltBox.onchange = async () => {
  if (!tiltBox.checked) { store.set('tilt', false); gyroStop(); return; }
  const ok = await gyroStart();
  store.set('tilt', ok);
  tiltBox.checked = ok;
  toast(ok ? T('3D-Effekt an – neig das Handy im Feed', '3D effect on – tilt your phone in the feed') : T('Lagesensor nicht verfügbar oder nicht erlaubt', 'Motion sensor unavailable or not allowed'));
};
// War der Effekt an, braucht das iPhone nach jedem Start einen Fingertipp, bevor der Sensor wieder liefern darf.
if (tiltBox.checked && !reduceMotion) {
  const arm = () => { document.removeEventListener('click', arm, true); gyroStart(); };
  document.addEventListener('click', arm, true);
}

// ---------- Sprache ----------
// Englische Fassung der festen Texte aus index.html (data-en, data-en-ph, data-en-aria).
if (LANG === 'en') {
  document.documentElement.lang = 'en';
  document.querySelectorAll('[data-en]').forEach(n => { n.textContent = n.dataset.en; });
  document.querySelectorAll('[data-en-ph]').forEach(n => { n.placeholder = n.dataset.enPh; });
  document.querySelectorAll('[data-en-aria]').forEach(n => { n.setAttribute('aria-label', n.dataset.enAria); });
}
$('lang-select').value = LANG;
$('lang-select').onchange = e => { store.set('lang', e.target.value); location.reload(); };

// ---------- Start ----------
renderSaved();
updateThinkDot();
loadMore();
setTimeout(offlineBackfill, 4000);
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').then(reg => {
    // Jedes Mal, wenn die App wieder nach vorne kommt, nach einer neuen Version schauen.
    // Gibt es eine, lädt der Service Worker die App von selbst neu.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && reader.hidden) reg.update().catch(() => {});
    });
  }).catch(() => {});
}
