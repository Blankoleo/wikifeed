'use strict';

const API = 'https://' + WIKI.host + '/w/api.php';
// Gedankenspiele in der aktiven Sprache (thoughts.js / thoughts.en.js)
// (i18n.js lädt nur die Datei der aktiven Sprache; fehlt sie, bleibt der Bereich leer statt die App anzuhalten)
const THOUGHTS = (LANG === 'en' ? typeof THOUGHTS_EN !== 'undefined' && THOUGHTS_EN : typeof THOUGHTS_DE !== 'undefined' && THOUGHTS_DE) || [];

// Themen = Wikipedias eigene "articletopic"-Klassifizierung.
// on:true = deine Interessen als Voreinstellung.
const TOPICS = [
  // Eigene Suchanfrage statt articletopic: Wikipedias Kategorien für Gedankenexperimente und Paradoxa.
  { id: 'thought', label: T('Gedankenexperimente & Paradoxa', 'Thought experiments & paradoxes'), on: true, query: WIKI.thought, minLen: 2000 },
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
// Einmalige Sicherung der Denken-Antworten aus der Zeit vor 2.4 (wird nie überschrieben, nur „Alle Daten löschen“ entfernt sie).
try { if (localStorage.getItem('wf.think.v1') === null) localStorage.setItem('wf.think.v1', localStorage.getItem('wf.think') ?? '{}'); } catch {}
state.think = store.get('think', {}); // Antworten im Bereich „Denken“: id -> { a, t, at, reveal } (reveal wird seit 2.4 nicht mehr gebraucht)
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
// Höchstens drei Anfragen gleichzeitig – bei mehr drosselt Wikipedia (HTTP 429). Weitere warten in einer
// kleinen Schlange; was der Nutzer gerade sehen will (Artikel, Suche), stellt sich vorne an.
// Jede Anfrage wird nach 12 s abgebrochen; auf 429 folgt nach kurzer Pause genau ein zweiter Versuch.
const API_MAX = 3, API_TIMEOUT = 12000;
let apiActive = 0;
const apiQueue = [];
const sleep = ms => new Promise(r => setTimeout(r, ms));
function apiSlot(urgent) {
  if (apiActive < API_MAX) { apiActive++; return Promise.resolve(); }
  return new Promise(go => { if (urgent) apiQueue.unshift(go); else apiQueue.push(go); });
}
function apiFree() {
  const go = apiQueue.shift();
  if (go) go(); else apiActive--; // der Platz geht direkt an die nächste wartende Anfrage
}
async function wikiFetch(url, urgent = false) {
  for (let attempt = 0; ; attempt++) {
    await apiSlot(urgent);
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), API_TIMEOUT);
    let res;
    try {
      res = await fetch(url, { signal: ctl.signal });
      if (res.status !== 429) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return await res.json();
      }
      if (attempt) throw new Error(T('Wikipedia ist gerade überlastet', 'Wikipedia is busy right now'));
    } catch (e) {
      if (e.name === 'AbortError') throw new Error(T('Wikipedia antwortet gerade nicht', 'Wikipedia is not responding'));
      throw e;
    } finally {
      clearTimeout(timer);
      apiFree();
    }
    // Gedrosselt: kurz warten (ohne einen Platz zu belegen), dann noch einmal.
    const after = Number(res.headers.get('Retry-After'));
    await sleep(after > 0 ? Math.min(after * 1000, 3000) : 1000 + Math.random() * 600);
  }
}
function api(params, urgent = false) {
  const url = new URL(API);
  const all = { action: 'query', format: 'json', formatversion: '2', origin: '*', ...params };
  for (const [k, v] of Object.entries(all)) url.searchParams.set(k, v);
  return wikiFetch(url, urgent);
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
    const j = await wikiFetch(`https://${WIKI.host}/api/rest_v1/feed/featured/${day.replace(/-/g, '/')}`);
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
let loadBlocked = false; // nach einem Fehler oder drei leeren Runden: erst auf Knopfdruck weiter
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
    const c = en.target, im = c.querySelector('.card-photo img');
    if (en.isIntersecting) {
      nearCards.add(c);
      c.classList.add('near');
      if (im && !im.getAttribute('src') && im.dataset.src) im.src = im.dataset.src;
    } else {
      nearCards.delete(c);
      c.classList.remove('active', 'near');
      // Bild freigeben, damit der Speicher nicht mit jeder Karte wächst
      if (im && im.getAttribute('src')) { im.dataset.src = im.getAttribute('src'); im.removeAttribute('src'); c.querySelector('.card-photo')?.classList.remove('ready'); }
    }
  }
  feedFx(); // sofort, nicht erst im nächsten Bild: so steht die vordere Karte sicher mit Text da
}, { root: feedEl, rootMargin: '120% 0px' });

// Höchstens 60 Karten behalten: sehr weit zurückliegende werden entfernt (die Scrollstelle bleibt dabei gleich).
const MAX_CARDS = 60;
function trimFeed() {
  const cards = [...feedEl.querySelectorAll('.card')].filter(c => cardItems.has(c));
  if (cards.length <= MAX_CARDS) return;
  const h = feedEl.clientHeight || 1;
  const cur = Math.round(feedEl.scrollTop / h);
  const drop = Math.min(cards.length - MAX_CARDS, cur - 20);
  if (drop <= 0) return;
  let shift = 0;
  for (const c of cards.slice(0, drop)) { shift += c.offsetHeight; viewObs.unobserve(c); nearObs.unobserve(c); nearCards.delete(c); c.remove(); }
  feedEl.scrollTop -= shift;
}
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
    const d = await wikiFetch(u);
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
  a.textContent = T('Bild: ', 'Image: ') + (c ? [c.artist || 'Wikimedia Commons', c.license].filter(Boolean).join(' · ') : 'Wikimedia');
  a.title = T('Bildquelle und Lizenz', 'Image source and licence');
  a.onclick = e => e.stopPropagation();
  stage.append(a);
}

// Funken (kleine farbige Punkte), die beim Herz und beim Merken aus dem Knopf sprühen.
function burst(btn, colors) {
  btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop');
  if (reduceMotion || !btn.animate) return;
  const r = btn.getBoundingClientRect();
  for (let i = 0; i < 11; i++) {
    const sp = el('span', 'spark');
    sp.style.background = colors[i % colors.length];
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
  if (kind === 'loading') {
    // Platzhalter in Kartenform statt eines Lade-Kringels
    c.classList.add('skel');
    const box = el('div', 'sk-box');
    for (let i = 0; i < 5; i++) box.append(el('i'));
    box.append(el('p', null, msg));
    c.append(el('div', 'sk-photo'), box);
    feedEl.append(c);
    return c;
  }
  const inner = el('div');
  inner.append(el('p', null, msg));
  if (kind === 'error') {
    const b = el('button', 'btn', T('Nochmal versuchen', 'Try again'));
    b.onclick = () => { c.remove(); loadBlocked = false; loadMore(); };
    inner.append(b);
  }
  c.append(inner);
  feedEl.append(c);
  return c;
}

async function loadMore() {
  if (loading || loadBlocked) return;
  if (!state.enabled.length) { stateCard('empty', T('Wähle unter „Einstellungen“ mindestens ein Thema aus.', 'Pick at least one topic under “Settings”.')); return; }
  loading = true;
  const gen = feedGen;
  const first = cardCount === 0;
  const spinner = first ? stateCard('loading', T('Suche spannende Artikel …', 'Finding interesting articles …')) : null;
  try {
    // Höchstens drei Runden, falls nichts Neues kommt – danach entscheidet der Nutzer (Knopf „Nochmal versuchen“).
    for (let round = 0; round < 3; round++) {
      const aotdP = (round === 0 && cardCount === 0 && lstore.get('aotdSeen', '') !== today()) ? fetchAotd().catch(() => null) : null;
      // 3 verschiedene Themen pro Runde, je ~4 Artikel -> gute Mischung. Alle gleichzeitig angefragt
      // (die Schlange in api() lässt höchstens drei auf einmal los); fällt eins aus, zählen die übrigen.
      const want = Math.min(3, state.enabled.length);
      const topics = new Set();
      for (let tries = 0; topics.size < want && tries < 30; tries++) topics.add(pickTopic());
      const jobs = [...topics].map(t => fetchTopic(t));
      // Dazu Artikel, die einem ähneln, der dir gefallen hat.
      if (state.seeds.length && Math.random() < 0.7) jobs.push(fetchSimilar(state.seeds[Math.floor(Math.random() * state.seeds.length)], 2));
      const [results, aotd] = await Promise.all([Promise.allSettled(jobs), aotdP]);
      if (gen !== feedGen) return;
      const got = results.filter(r => r.status === 'fulfilled');
      if (!got.length && !aotd) throw results[0].reason; // alles gescheitert: Fehler zeigen statt weiterzufragen
      const titles = new Set(feedTitles);
      if (aotd) titles.add(aotd.title);
      const items = shuffle(got.flatMap(r => r.value).filter(i => !titles.has(i.title) && titles.add(i.title)));
      if (aotd) items.unshift(aotd);
      if (!items.length) continue;
      spinner?.remove();
      items.forEach(i => addCard(i));
      return;
    }
    spinner?.remove();
    loadBlocked = true;
    stateCard('error', T('Gerade kommen keine neuen Artikel. Versuche es gleich noch einmal oder wähle unter „Einstellungen“ weitere Themen.', 'No new articles right now. Try again in a moment or pick more topics under “Settings”.'));
  } catch (e) {
    if (gen !== feedGen) return;
    spinner?.remove();
    loadBlocked = true;
    stateCard('error', navigator.onLine === false
      ? T('Du bist offline. Unter „Gemerkt“ kannst du deine gespeicherten Artikel trotzdem lesen.', 'You are offline. You can still read your saved articles under “Saved”.')
      : T('Konnte keine Artikel laden (', 'Could not load articles (') + e.message + (e instanceof TypeError // Netzfehler
        ? T('). Bist du online?', '). Are you online?')
        : T('). Versuche es gleich noch einmal.', '). Please try again in a moment.')));
  } finally {
    if (gen === feedGen) loading = false;
  }
}
// Wieder online: von selbst weiterladen, statt auf den Knopf zu warten.
window.addEventListener('online', () => {
  if (!loadBlocked) return;
  loadBlocked = false;
  feedEl.querySelector('.state-card')?.remove();
  loadMore();
});

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
    setTimeout(trimFeed, 800);
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
    im.dataset.src = item.thumb; // geladen wird erst, wenn die Karte in die Nähe kommt (nearObs)
    img.append(im);
  } else noImage();

  const body = el('div', 'card-body');
  const meta = el('div', 'meta');
  if (item.aotd) meta.append(el('span', 'chip top', T('Artikel des Tages', 'Article of the day')));
  if (item.topic) meta.append(el('span', 'chip', topicLabel(item.topic)));
  if (item.top) meta.append(el('span', 'chip top', T('Top-Artikel', 'Top article')));
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
    burst(like, ['#ff3b5c', '#ff9db0', '#ffd36b']);
    addSeed(item);
    insertSimilar(card, item);
    toast(T('Ähnliche Artikel kommen als Nächstes', 'Similar articles coming up next'));
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
    if (on) { adjust(item.topic, 1.1); burst(save, ['#ffc94a', '#fff0b8']); }
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
  const openIt = () => openReader(item.title, item, 0, img);
  body.onclick = openIt;
  let tapTimer = null;
  img.onclick = e => {
    if (tapTimer) {
      clearTimeout(tapTimer); tapTimer = null;
      const r = stage.getBoundingClientRect();
      const hh = el('span', 'bigheart');
      hh.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS.heart}</svg>`;
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
  loadBlocked = false;
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
// Zuletzt gelesene Artikel bleiben im Speicher: Zurückgehen oder erneutes Öffnen lädt nichts nach.
const articleMem = new Map();
async function fetchArticle(title, urgent = true) {
  let a = articleMem.get(title);
  if (!a) {
    const d = await api({ action: 'parse', page: title, prop: 'text|displaytitle', redirects: '1', disableeditsection: '1', disabletoc: '1' }, urgent);
    if (d.error) throw new Error(d.error.code === 'missingtitle' ? T('Diesen Artikel gibt es (noch) nicht.', 'This article does not exist (yet).') : d.error.info);
    a = { title: d.parse.title, html: d.parse.text };
    articleMem.set(title, a);
    articleMem.set(a.title, a);
    while (articleMem.size > 40) articleMem.delete(articleMem.keys().next().value);
  }
  return { title: a.title, doc: cleanArticle(a.html) };
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
  const { title: realTitle, doc } = await fetchArticle(title, false); // im Hintergrund: hinten anstellen
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
// Suchen und Sortieren unter „Gemerkt“. Die gespeicherte Reihenfolge (neueste zuerst) bleibt dabei unangetastet,
// sortiert wird nur eine Kopie für die Anzeige.
const savedSearch = $('saved-search'), savedSort = $('saved-sort');
const SAVED_SORTS = ['newest', 'oldest', 'az', 'za'];
savedSort.value = SAVED_SORTS.includes(store.get('savedSort', 'newest')) ? store.get('savedSort', 'newest') : 'newest';
const fold = s => (s || '').normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase(LANG); // „godel“ findet „Gödel“
function savedView(query) {
  const q = fold(query.trim());
  const list = q ? state.saved.filter(s => [s.title, s.extract, s.topic && topicLabel(s.topic)].some(x => fold(x).includes(q))) : state.saved.slice();
  const sort = savedSort.value;
  if (sort === 'oldest') list.reverse();
  else if (sort === 'az' || sort === 'za') {
    const coll = new Intl.Collator(LANG, { sensitivity: 'base', numeric: true });
    list.sort((a, b) => coll.compare(a.title, b.title) * (sort === 'za' ? -1 : 1));
  }
  return list;
}
let savedTimer = null;
savedSearch.addEventListener('input', () => { clearTimeout(savedTimer); savedTimer = setTimeout(() => renderSaved(true), 120); });
savedSort.addEventListener('change', () => { store.set('savedSort', savedSort.value); renderSaved(true); });
$('saved-tools').onsubmit = e => { e.preventDefault(); clearTimeout(savedTimer); renderSaved(true); savedSearch.blur(); };

function renderSaved(calm = false) {
  const ul = document.getElementById('saved-list');
  ul.innerHTML = '';
  ul.classList.toggle('calm', calm === true); // beim Tippen und Umsortieren nicht jedes Mal neu einschweben lassen
  const total = state.saved.length;
  document.getElementById('saved-empty').hidden = total > 0;
  // Suche und Sortierung erst ab zwei Artikeln
  const tools = total > 1;
  $('saved-tools').hidden = !tools;
  const query = tools ? savedSearch.value.trim() : '';
  const items = tools ? savedView(query) : state.saved;
  const status = $('saved-status'), none = $('saved-none');
  status.hidden = !query || !items.length;
  status.textContent = T(`${items.length} von ${total} gemerkten Artikeln`, `${items.length} of ${total} saved articles`);
  none.hidden = !query || items.length > 0;
  none.textContent = T(`Nichts gefunden für „${query}“. Gesucht wird in Titel, Text und Thema.`, `Nothing found for “${query}”. Search looks at title, text and topic.`);
  for (const s of items) {
    const li = el('li');
    const th = el('div', 'thumb');
    if (s.thumb) th.style.backgroundImage = `url("${s.thumb}")`;
    const t = el('div', 't');
    t.append(el('b', null, s.title), el('small', null, s.extract));
    if (s.off) { const ob = el('span', 'offbadge'); ob.append(symEl('check', 'in'), T('offline verfügbar', 'available offline')); t.append(ob); }
    const del = el('button', 'del');
    del.append(symEl('cross'));
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

// Wenn der Leser gerade geschlossen wurde, läuft history.back() noch – erst danach neu öffnen,
// sonst landet der neue Eintrag im Verlauf durcheinander und der Leser schließt sich sofort wieder.
let popPending = null, popResolve = null;
function waitPop() {
  popPending = new Promise(res => { popResolve = res; setTimeout(res, 600); }).then(() => { popPending = null; popResolve = null; });
}
async function openReader(title, item = null, restoreScroll = 0, origin = null) {
  if (popPending) await popPending;
  if (!readerStack.length) {
    readSession = { item, start: Date.now() };
    history.pushState({ reader: true }, '');
  } else {
    // aktuellen Artikel samt Scrollstelle aufheben, damit „Zurück“ sofort wieder da ist
    const cur = readerStack[readerStack.length - 1];
    cur.scroll = readerScroll.scrollTop;
    if (cur.loaded) { cur.frag = document.createDocumentFragment(); cur.frag.append(...readerBody.childNodes); }
  }
  readerStack.push({ title, item, scroll: 0 });
  readerStack.slice(0, -5).forEach(e => { e.frag = null; }); // nur die letzten Artikel im Speicher halten
  if (readerStack.length === 1) {
    // Aus einer Karte geöffnet: Das Kartenbild wächst zum Titelbild des Artikels.
    const r = origin && !reduceMotion && reader.animate ? visibleRect(origin) : null;
    reader.classList.toggle('hero-open', !!r);
    heroEl.style.height = r ? Math.min(Math.round(r.bottom + 6), Math.round(innerHeight * .62)) + 'px' : '';
    reader.hidden = false;
    if (r) reader.animate([{ clipPath: insetOf(r) }, { clipPath: 'inset(0px 0px 0px 0px round 0px)' }], { duration: 480, easing: 'cubic-bezier(.2, .85, .2, 1)' });
  }
  heroFor(readerStack[readerStack.length - 1]);
  saveSnapSoon();
  await renderArticle(title, restoreScroll);
}
function setReaderHead(title) {
  $('reader-title').textContent = title;
  $('reader-ext').href = 'https://' + WIKI.host + '/wiki/' + encodeURIComponent(title.replace(/ /g, '_'));
  $('reader-save').classList.toggle('on', isSaved(title));
}

async function renderArticle(title, restoreScroll = 0) {
  const top = readerStack[readerStack.length - 1];
  setReaderHead(title);
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
    if (art.offline) readerBody.append(el('div', 'offnote', T('Offline gespeichert', 'Saved offline')));
    readerBody.append(...art.doc.body.childNodes);
    readerBody.append(sourceNote(art.title));
    readerScroll.scrollTop = restoreScroll;
    readerChrome();
    top.title = art.title;
    top.loaded = true;
    setReaderHead(art.title);
  } catch (e) {
    if (readerStack[readerStack.length - 1] !== top) return;
    readerBody.innerHTML = '';
    readerBody.append(el('p', 'loading', navigator.onLine === false
      ? T('Du bist offline und dieser Artikel ist nicht gespeichert. Gemerkte Artikel (unter „Gemerkt“) kannst du auch ohne Netz lesen.', 'You are offline and this article is not saved. Saved articles (under “Saved”) can be read without a connection.')
      : T('Artikel konnte nicht geladen werden: ', 'Could not load the article: ') + e.message));
  }
}

// ---------- Leser: Titelbild ----------
const heroEl = $('reader-hero'), heroImg = $('reader-hero-img'), heroCredit = $('reader-credit');
let heroH = 0;
const leadCache = new Map();
const bigEnough = u => { const m = u && u.match(/\/(\d+)px-/); return !!u && (!m || Number(m[1]) >= 400); };
async function leadImage(title) {
  if (leadCache.size > 60) leadCache.clear();
  if (!leadCache.has(title)) leadCache.set(title, api({ titles: title, redirects: '1', prop: 'pageimages', piprop: 'thumbnail', pithumbsize: '900' }, true)
    .then(d => d.query?.pages?.[0]?.thumbnail?.source || null).catch(() => null));
  return leadCache.get(title);
}
function setHero(thumb) {
  const on = !!thumb;
  reader.classList.toggle('has-hero', on);
  heroEl.hidden = !on;
  heroCredit.hidden = true;
  heroImg.style.transform = '';
  if (on) {
    if (heroImg.getAttribute('src') !== thumb) heroImg.src = thumb;
    heroH = heroEl.offsetHeight;
    imageCredit(thumb).then(c => {
      if (!c || heroImg.getAttribute('src') !== thumb) return;
      heroCredit.textContent = T('Bild: ', 'Image: ') + [c.artist || 'Wikimedia Commons', c.license].filter(Boolean).join(' · ');
      heroCredit.href = c.page;
      heroCredit.hidden = false;
    });
  } else { heroImg.removeAttribute('src'); heroH = 0; }
  readerChrome();
}
// Titelbild für einen Artikel: das Bild der Karte, sonst das Hauptbild des Artikels (einmal nachgefragt).
function heroFor(entry) {
  const t = entry.thumb || (bigEnough(entry.item?.thumb) ? entry.item.thumb : null);
  if (t) { entry.thumb = t; setHero(t); return; }
  setHero(null);
  if (entry.thumb === null) return;
  leadImage(entry.title).then(u => {
    entry.thumb = u || null;
    if (u && readerStack[readerStack.length - 1] === entry && !reader.hidden && readerScroll.scrollTop < 10) setHero(u);
  });
}
// Kopfleiste: über dem Titelbild durchsichtig, darunter als Glasleiste mit Titel. Das Bild wandert langsamer mit.
function readerChrome() {
  const y = readerScroll.scrollTop;
  reader.classList.toggle('solid', !heroH || y > heroH - 64);
  if (heroH && y < heroH && !reduceMotion) heroImg.style.transform = `translate3d(0, ${(y * .35).toFixed(1)}px, 0)`;
}
function visibleRect(elm) {
  const r = elm.getBoundingClientRect();
  return r.width > 40 && r.bottom > 40 && r.top < innerHeight - 40 ? r : null;
}
const insetOf = r => `inset(${r.top.toFixed(1)}px ${(innerWidth - r.right).toFixed(1)}px ${(innerHeight - r.bottom).toFixed(1)}px ${r.left.toFixed(1)}px round 28px)`;
// Schließen: Steht der Artikel noch am Anfang und liegt seine Karte dahinter, schrumpft er zurück in das Kartenbild.
function closeReaderSmart(fromPopstate) {
  const title = readSession?.item?.title;
  const card = title && $('view-feed').classList.contains('active') && [...nearCards].find(c => c.classList.contains('active') && c.dataset.title === title);
  const ph = card && card.querySelector('.card-photo');
  if (!ph || reduceMotion || !reader.animate || !reader.classList.contains('has-hero') || readerScroll.scrollTop > 60) return closeReader(fromPopstate);
  // Die Ansicht dahinter ist gerade verkleinert – das Ziel ist das Kartenbild in voller Größe.
  const v = $('view-feed').getBoundingClientRect(), k = v.width / innerWidth || 1, pr = ph.getBoundingClientRect();
  const r = { top: (pr.top - v.top) / k, left: (pr.left - v.left) / k, right: (pr.right - v.left) / k, bottom: (pr.bottom - v.top) / k };
  reader.classList.add('closing');
  closeReader(fromPopstate);
  const a = reader.animate([{ clipPath: 'inset(0px 0px 0px 0px round 0px)', opacity: 1 }, { clipPath: insetOf(r), opacity: 1, offset: .8 }, { clipPath: insetOf(r), opacity: 0 }],
    { duration: 430, easing: 'cubic-bezier(.3, .7, .2, 1)' });
  a.onfinish = a.oncancel = () => reader.classList.remove('closing');
}
function closeReaderAll() { readerStack.length = 0; closeReader(false); }

// ---------- Blätter mit dem Finger nach unten wegziehen ----------
// Am Kopf des Blatts oder wenn der Inhalt ganz oben steht: Das Blatt folgt dem Finger, die Ansicht dahinter kommt näher.
function sheetDrag(sheet, scroller, close) {
  let st = null;
  sheet.addEventListener('touchstart', e => {
    if (e.touches.length !== 1 || sheet.hidden) return;
    const t = e.touches[0];
    const inHead = !scroller.contains(e.target);
    if ((!inHead && scroller.scrollTop > 0) || e.target.closest('input, select, table')) return;
    st = { x: t.clientX, y: t.clientY, d: 0, dir: null, vy: 0, ly: t.clientY, lt: performance.now(), inHead, behind: document.querySelector('.view.active'), armed: false };
  }, { passive: true });
  sheet.addEventListener('touchmove', e => {
    if (!st) return;
    const t = e.touches[0], dx = t.clientX - st.x, dy = t.clientY - st.y;
    if (!st.dir) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (dy <= 0 || Math.abs(dy) < Math.abs(dx) * 1.2 || (!st.inHead && scroller.scrollTop > 0)) { st = null; return; }
      st.dir = 'down';
      st.y = t.clientY; // ab hier zählen, damit nichts springt
      sheet.classList.add('dragging');
      st.behind?.classList.add('pulling');
    }
    const now = performance.now();
    if (now > st.lt) st.vy = st.vy * .4 + (t.clientY - st.ly) / (now - st.lt) * .6;
    st.ly = t.clientY; st.lt = now;
    const d = Math.max(0, t.clientY - st.y);
    st.d = d;
    sheet.style.transform = `translate3d(0, ${d}px, 0) scale(${(1 - Math.min(1, d / innerHeight) * .1).toFixed(4)})`;
    sheet.style.borderRadius = Math.min(40, d / 2.5) + 'px';
    st.behind?.style.setProperty('--pull', Math.min(1, d / 340).toFixed(3));
    if (!st.armed && d > 130) { st.armed = true; haptic(); } else if (st.armed && d < 110) st.armed = false;
  }, { passive: true });
  const end = () => {
    if (!st) return;
    const s = st; st = null;
    if (s.dir !== 'down') return;
    sheet.classList.remove('dragging');
    const reset = () => { s.behind?.classList.remove('pulling'); s.behind?.style.removeProperty('--pull'); };
    if (s.d > 130 || (s.vy > .55 && s.d > 36)) {
      sheet.style.transition = 'transform .26s cubic-bezier(.4, 0, .8, .3)';
      sheet.style.transform = `translate3d(0, ${innerHeight}px, 0)`;
      setTimeout(() => {
        sheet.style.transition = 'none';
        close();
        reset();
        requestAnimationFrame(() => requestAnimationFrame(() => { sheet.style.transition = ''; sheet.style.transform = ''; sheet.style.borderRadius = ''; }));
      }, 250);
    } else {
      sheet.style.transition = 'transform .45s cubic-bezier(.3, 1.3, .5, 1), border-radius .3s';
      sheet.style.transform = ''; sheet.style.borderRadius = '';
      s.behind?.classList.remove('pulling');
      s.behind?.style.setProperty('--pull', 0);
      setTimeout(() => { sheet.style.transition = ''; reset(); }, 460);
    }
  };
  sheet.addEventListener('touchend', end, { passive: true });
  sheet.addEventListener('touchcancel', end, { passive: true });
}

// Leichtes Tipp-Feedback. iPhone: über einen unsichtbaren System-Schalter (ab iOS 17.4), Android: kurze Vibration.
function haptic() {
  try {
    if (navigator.vibrate) { navigator.vibrate(8); return; }
    const label = document.createElement('label');
    label.style.display = 'none';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    label.append(input);
    document.head.append(label);
    label.click();
    label.remove();
  } catch {}
}
document.addEventListener('click', e => {
  if (e.target.closest?.('.sb, .seg button, .tpick, .opt, .switch, .tchip, .gchoice .btn, .tabbar button, #reader-save, #reader-speak')) haptic();
}, true);

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
    if (prev.frag) {
      // aufgehobenen Artikel einfach wieder einsetzen – kein Laden, keine Fehlermeldung
      ttsStop();
      setReaderHead(prev.title);
      readerBody.innerHTML = '';
      readerBody.append(prev.frag);
      prev.frag = null;
      heroFor(prev);
      readerScroll.scrollTop = prev.scroll;
      requestAnimationFrame(() => { readerScroll.scrollTop = prev.scroll; readerChrome(); });
    } else { heroFor(prev); renderArticle(prev.title, prev.scroll); }
    if (fromPopstate) history.pushState({ reader: true }, '');
    saveSnapSoon();
    return;
  }
  closeReaderSmart(fromPopstate);
}
function closeReader(fromPopstate) {
  ttsStop();
  reader.hidden = true;
  setTimeout(() => { if (reader.hidden) { readerBody.innerHTML = ''; heroImg.removeAttribute('src'); } }, 480); // erst leeren, wenn das Blatt verschwunden ist
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
  if (!fromPopstate && history.state?.reader) { waitPop(); history.back(); }
  saveSnapSoon();
}
document.getElementById('reader-back').onclick = () => readerBack(false);
window.addEventListener('popstate', e => {
  if (popResolve) { popResolve(); return; } // das war unser eigenes history.back() beim Schließen
  if (!reader.hidden) { readerBack(true); return; }
  for (const L of levelSheets) if (L.onPop(e)) return; // Denken-Blatt und Trolley-Spiel: eine Ebene zurück
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
    const d = await api({ ...SEARCH_PROPS, generator: 'prefixsearch', gpssearch: q, gpslimit: '10', gpsnamespace: '0' }, true);
    let pages = (d.query?.pages || []).sort((a, b) => a.index - b.index);
    if (pages.length < 4) {
      // Kaum Treffer am Wortanfang -> zusätzlich Volltextsuche.
      const d2 = await api({ ...SEARCH_PROPS, generator: 'search', gsrsearch: q, gsrlimit: '10', gsrnamespace: '0' }, true);
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
    searchList.append(listItem(a.item, T('Artikel des Tages', 'Article of the day')));
  }
}
searchInput.oninput = () => { clearTimeout(searchTimer); searchTimer = setTimeout(runSearch, 350); };
$('search-form').onsubmit = e => { e.preventDefault(); clearTimeout(searchTimer); runSearch(); searchInput.blur(); };

// ---------- Denken ----------
// Drei Ebenen, nie mehr: Übersicht (der Tab) → Sammlung → Frage. Sammlung und Frage liegen in einem Blatt
// mit eigenem Verlauf (levelSheet): Pfeil und Zurück-Geste gehen eine Ebene zurück, Wegziehen schließt alles.
const thinkEl = $('think');
const thinkBody = $('think-body');
const thinkScroll = $('think-scroll');

// Gezeichnete Linien-Symbole (24er-Raster, Strich 1,8, runde Enden) – ein Satz für alles, keine Emojis.
const SYM = {
  puzzle: '<path d="M3.5 9.5a2 2 0 0 1 2-2h2.95A2.3 2.3 0 1 1 11.55 7.5H14.5a2 2 0 0 1 2 2v2.95A2.3 2.3 0 1 1 16.5 15.55V18.5a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2z"/>',
  book: '<path d="M12 7c-1.8-1.6-4.5-2.2-8-2v13c3.5-.2 6.2.4 8 2 1.8-1.6 4.5-2.2 8-2V5c-3.5-.2-6.2.4-8 2zM12 7v13"/>',
  tram: '<path d="M9 3h6M12 3v3"/><rect x="5.5" y="6" width="13" height="12" rx="3"/><path d="M5.5 11.5h13M9 14.8h.01M15 14.8h.01M8.5 18L7 21M15.5 18L17 21"/>',
  axis: '<path d="M3.5 12h17M3.5 8.5v7M20.5 8.5v7"/><circle cx="14.5" cy="12" r="2.8" fill="currentColor" stroke="none"/>',
  key: '<circle cx="8" cy="15.5" r="4"/><path d="M10.9 12.6L19 4.5M15.6 7.9l2.5 2.5M13.3 10.2l1.8 1.8"/>',
  loop: '<path d="M12 12c-1.9-2.6-3.6-4-5.6-4a4 4 0 0 0 0 8c2 0 3.7-1.4 5.6-4zm0 0c1.9 2.6 3.6 4 5.6 4a4 4 0 0 0 0-8c-2 0-3.7 1.4-5.6 4z"/>',
  dice: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="8.6" cy="8.6" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="15.4" cy="15.4" r="1.3" fill="currentColor" stroke="none"/>',
  scale: '<path d="M12 4v16M8.5 20h7M4.5 7h15M4.5 7L2 13.5M4.5 7L7 13.5M19.5 7L17 13.5M19.5 7L22 13.5"/><path d="M2 13.5h5a2.5 2.5 0 0 1-5 0zM17 13.5h5a2.5 2.5 0 0 1-5 0z"/>',
  eye: '<path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  self: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.9-3.9 3.6-6 7-6s6.1 2.1 7 6"/>',
  cube: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
  atom: '<circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(-60 12 12)"/>',
  stack: '<path d="M12 3.5l8.5 4.5-8.5 4.5L3.5 8z"/><path d="M3.5 12l8.5 4.5 8.5-4.5M3.5 16l8.5 4.5 8.5-4.5"/>',
  chart: '<path d="M4 20h16M7 16.5V11M12 16.5V6.5M17 16.5v-8"/>',
  flag: '<path d="M5.5 21V4M5.5 4.5h11l-2.2 4 2.2 4h-11"/>',
  check: '<path d="M5.5 12.5l4 4 9-9.5"/>',
  cross: '<path d="M7 7l10 10M17 7L7 17"/>',
  checkc: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.2l2.4 2.4 4.6-5"/>',
  crossc: '<circle cx="12" cy="12" r="8.5"/><path d="M9.4 9.4l5.2 5.2M14.6 9.4l-5.2 5.2"/>',
};
function symEl(name, cls) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('class', 'sym' + (cls ? ' ' + cls : ''));
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = SYM[name] || SYM.book;
  return s;
}
// Symbol im ruhigen, zart getönten Behälter (40 px)
function icBox(name, cls) {
  const b = el('span', 'th-ic' + (cls ? ' ' + cls : ''));
  b.setAttribute('aria-hidden', 'true');
  b.append(symEl(name));
  return b;
}
const chevEl = () => { const c = el('span', 'th-chev', '›'); c.setAttribute('aria-hidden', 'true'); return c; };

// Arten (Etikett und Farbe auf der Karte, Konzept 3.1)
const KINDS = {
  raetsel: { label: T('Rätsel · hat eine Lösung', 'Puzzle · has an answer'), short: T('Rätsel', 'Puzzle'), c: 'var(--k-blue)' },
  paradox: { label: T('Paradox · offen', 'Paradox · open'), short: T('Paradox', 'Paradox'), c: 'var(--k-violet)' },
  wahl: { label: T('Entscheidung', 'Decision'), short: T('Entscheidung', 'Decision'), c: 'var(--k-indigo)' },
  klassik: { label: T('Klassiker', 'Classic'), short: T('Klassiker', 'Classic'), c: 'var(--k-rose)' },
};
// Sammlungen mit Zwischenüberschriften (Konzept 3.10). Weitere Sammlungen erscheinen erst, wenn es Inhalte für sie gibt.
const COLLECTIONS = [
  { id: 'raetsel', sym: 'puzzle', title: T('Rätsel & Paradoxien', 'Puzzles & paradoxes'), sub: T('Knobeln, abstimmen, auflösen', 'Puzzle, decide, resolve'),
    desc: T('Manche haben eine Lösung, manche nicht – bei allen entscheidest du erst und siehst dann die Auflösung.', 'Some have an answer, some do not – with all of them you decide first and then see the resolution.'),
    groups: [
      { kind: 'raetsel', title: T('Mit Lösung', 'With an answer'), ids: ['ziege', 'geburtstag', 'hilbert', 'achilles', 'affen', 'galilei', 'aufzug', 'zwillinge', 'olbers', 'maxwell', 'molyneux'] },
      { kind: 'paradox', title: T('Offene Paradoxien', 'Open paradoxes'), ids: ['haufen', 'theseus', 'luegner', 'hinrichtung', 'dornroeschen', 'grossvater', 'fermi'] },
      { kind: 'wahl', title: T('Entscheiden & Spiele', 'Decisions & games'), ids: ['newcomb', 'gefangene', 'buridan', 'pascal', 'allmende', 'ultimatum', 'petersburg'] },
    ] },
  { id: 'klassik', sym: 'book', title: T('Klassische Gedankenexperimente', 'Classic thought experiments'), sub: T('Die berühmten Fälle der Philosophie', 'The famous cases of philosophy'),
    desc: T('Moral, Bewusstsein, das Ich und das Wissen – die Fälle, über die Philosophinnen und Philosophen bis heute streiten.', 'Morality, consciousness, the self and knowledge – the cases philosophers still argue about.'),
    groups: [
      { kind: 'klassik', title: T('Moral', 'Morality'), ids: ['trolley', 'teich', 'schleier', 'gyges', 'karneades', 'omelas', 'luege'] },
      { kind: 'klassik', title: T('Bewusstsein', 'Consciousness'), ids: ['mary', 'china', 'zombie', 'fledermaus', 'spektrum', 'turing'] },
      { kind: 'klassik', title: T('Ich & Identität', 'Self & identity'), ids: ['teleporter', 'sumpfmann'] },
      { kind: 'klassik', title: T('Wissen & Wirklichkeit', 'Knowledge & reality'), ids: ['tank', 'hoehle', 'simulation', 'erlebnis', 'gettier', 'teekanne'] },
      { kind: 'klassik', title: T('Physik zum Staunen', 'Physics to marvel at'), ids: ['katze', 'laplace'] },
    ] },
];
const thinkById = id => THOUGHTS.find(t => t.id === id);
const THINK_META = {}; // id -> { coll, group }
for (const c of COLLECTIONS) for (const g of c.groups) {
  g.ids = g.ids.filter(id => thinkById(id));
  for (const id of g.ids) THINK_META[id] = { coll: c, group: g };
}
// Sicherheitsnetz: Eine Frage ohne Platz in einer Sammlung landet bei den Klassikern, damit nichts verschwindet.
for (const t of THOUGHTS) if (!THINK_META[t.id]) { const g = COLLECTIONS[1].groups[COLLECTIONS[1].groups.length - 1]; g.ids.push(t.id); THINK_META[t.id] = { coll: COLLECTIONS[1], group: g }; }
const collById = id => COLLECTIONS.find(c => c.id === id);
const collCards = c => c.groups.flatMap(g => g.ids).map(thinkById);
const optLabel = o => Array.isArray(o) ? o[0] : o;
const optLean = o => Array.isArray(o) ? o[1] : null;
const saveThink = () => store.set('think', state.think);

// Jeden Tag eine andere Frage, in fester Reihenfolge – auf jedem Gerät dieselbe.
function dailyThought(day = today()) {
  const [y, m, d] = day.split('-').map(Number);
  const n = THOUGHTS.length;
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const step = [7, 11, 13, 17, 19, 23].find(x => gcd(x, n) === 1) || 1;
  return THOUGHTS[(Math.floor(Date.UTC(y, m - 1, d) / 864e5) * step) % n];
}
// Antwort speichern. Rätsel mit Lösung bleiben nach der ersten Antwort fest, alles andere lässt sich ändern.
// Bestehende Einträge werden nur ergänzt, nie neu angelegt – so bleiben auch unbekannte Felder erhalten.
function answerThink(t, i) {
  const rec = state.think[t.id];
  if (rec) { if (t.correct != null) return false; rec.a = i; }
  else state.think[t.id] = { a: i, t: null, at: today(), reveal: true };
  saveThink();
  updateThinkDot();
  return true;
}
// Roter Punkt am Tab „Denken“: nur, solange die Frage des Tages neu ist. Er verschwindet, sobald der Tab offen war.
function updateThinkDot() {
  const d = THOUGHTS.length ? dailyThought() : null;
  const on = !!d && !state.think[d.id] && store.get('thinkDot', '') !== today();
  document.querySelector('.tabbar button[data-view="think"]')?.classList.toggle('dot', on);
}
function thinkTabSeen() {
  if (store.get('thinkDot', '') !== today()) store.set('thinkDot', today());
  updateThinkDot();
}

// ---------- Blätter mit Ebenen (Denken und Trolley-Spiel) ----------
// Jede Ebene legt einen Eintrag im Verlauf an ({ think: 2 } = zweite Ebene). Im Stapel liegen nur kleine
// Beschreibungen ({ t: 'card', id }), kein fertiger Inhalt; beim Schließen wird das Blatt geleert.
const levelSheets = [];
function levelSheet(sheet, scroller, key, render, onClose) {
  const L = { stack: [] };
  let pend = null, pendRes = null; // läuft gerade unser eigenes history.go() nach dem Schließen?
  const depth = st => { const v = st && st[key]; return typeof v === 'number' ? v : 0; };
  const show = () => render(L.stack[L.stack.length - 1], L);
  const finish = () => {
    sheet.hidden = true;
    setTimeout(() => { if (sheet.hidden) sheet.querySelector('article').innerHTML = ''; }, 480); // erst leeren, wenn das Blatt verschwunden ist
    if (onClose) onClose();
  };
  L.top = () => L.stack[L.stack.length - 1];
  L.prev = () => L.stack[L.stack.length - 2];
  L.open = async entry => {
    if (pend) await pend;
    if (popPending) await popPending;
    if (sheet.hidden) L.stack.length = 0;
    L.push(entry);
  };
  L.push = (entry, saveScroll = true) => {
    const cur = L.top();
    if (cur && saveScroll) cur.scroll = scroller.scrollTop;
    L.stack.push(entry);
    history.pushState({ [key]: L.stack.length }, '');
    if (sheet.hidden) { sheet.style.transition = sheet.style.transform = sheet.style.borderRadius = ''; } // Reste vom Wegziehen sicher entfernen
    sheet.hidden = false;
    show();
    scroller.scrollTop = 0;
  };
  L.replace = (entry, draw = true) => {
    L.stack[L.stack.length - 1] = entry;
    history.replaceState({ [key]: L.stack.length }, '');
    if (draw) { show(); scroller.scrollTop = 0; }
  };
  L.restore = () => { show(); scroller.scrollTop = L.top().scroll || 0; };
  // Pfeil oben links: eine Ebene zurück (über den Verlauf, damit Zurück-Geste und Pfeil dasselbe tun)
  L.back = () => {
    if (L.stack.length <= 1) return L.closeAll();
    if (depth(history.state) === L.stack.length) { history.back(); return; }
    L.stack.pop();
    history.replaceState({ [key]: L.stack.length }, '');
    L.restore();
  };
  // Wegziehen: alles schließen und alle Ebenen aus dem Verlauf nehmen
  L.closeAll = () => {
    const d = depth(history.state);
    L.stack.length = 0;
    finish();
    if (d > 0) {
      pend = new Promise(res => { pendRes = res; setTimeout(res, 600); }).then(() => { pend = pendRes = null; });
      history.go(-d);
    }
  };
  L.onPop = e => {
    if (pendRes) { pendRes(); return true; }
    if (sheet.hidden) return false;
    const d = depth(e.state);
    if (d >= L.stack.length) return true; // vorwärts im Verlauf: nichts zu tun
    L.stack.length = d;
    if (!d) finish(); else L.restore();
    return true;
  };
  levelSheets.push(L);
  return L;
}

const thinkL = levelSheet(thinkEl, thinkScroll, 'think', renderThinkEntry, () => { if ($('view-think').classList.contains('active')) renderDenken(); });
$('think-back').onclick = () => thinkL.back();
// Kleiner Titel in der Kopfleiste, sobald der große Titel weggescrollt ist
const thinkHead = () => $('think-title').classList.toggle('on', thinkScroll.scrollTop > 90);
thinkScroll.addEventListener('scroll', thinkHead, { passive: true });

function renderThinkEntry(e, L) {
  if (e.t === 'coll') renderCollection(collById(e.id));
  else renderCard(thinkById(e.id));
  $('think-back').setAttribute('aria-label', L.prev() ? T('Zurück zur Sammlung', 'Back to the collection') : T('Zurück zur Übersicht', 'Back to the overview'));
  requestAnimationFrame(thinkHead);
}

function collProgress(c) {
  const cards = collCards(c);
  const puz = cards.filter(t => t.correct != null), pdone = puz.filter(t => state.think[t.id]);
  return { n: cards.length, done: cards.filter(t => state.think[t.id]).length, puz: puz.length, pdone: pdone.length, right: pdone.filter(t => state.think[t.id].a === t.correct).length };
}
function collStats(c) {
  const p = collProgress(c);
  if (!p.done) return T(`${p.n} Fragen`, `${p.n} questions`);
  const parts = [];
  if (p.pdone) parts.push(T(`${p.right} von ${p.puz} Rätseln gelöst`, `${p.right} of ${p.puz} puzzles solved`));
  parts.push(T(`${p.done} von ${p.n} beantwortet`, `${p.done} of ${p.n} answered`));
  return parts.join(' · ');
}

// Ebene 2: eine Sammlung als ruhige Liste – man liest die Frage, bevor man tippt.
function renderCollection(c) {
  $('think-title').textContent = c.title;
  const b = thinkBody;
  b.innerHTML = '';
  const head = el('header', 'tc-head');
  head.append(icBox(c.sym, 'big'), el('h1', null, c.title), el('p', 'tc-desc', c.desc), el('p', 'tc-stats', collStats(c)));
  b.append(head);
  for (const g of c.groups) {
    b.append(el('h2', 'tc-sec', g.title));
    const box = el('div', 'th-group');
    for (const id of g.ids) box.append(cardRow(thinkById(id)));
    b.append(box);
  }
}
function cardRow(t) {
  const rec = state.think[t.id];
  const r = el('button', 'th-row');
  r.type = 'button';
  const rt = el('span', 'th-rt');
  rt.append(el('b', null, t.title), el('span', 'th-q', t.q));
  let st;
  if (!rec) st = chevEl();
  else {
    const puzzle = t.correct != null, ok = !puzzle || rec.a === t.correct;
    st = el('span', 'th-state' + (puzzle ? (ok ? ' ok' : ' no') : ''));
    st.append(symEl(ok ? 'checkc' : 'crossc'), el('span', 'vh', puzzle ? (ok ? T('richtig beantwortet', 'answered correctly') : T('beantwortet, nicht richtig', 'answered, not correct')) : T('beantwortet', 'answered')));
  }
  r.append(icBox(t.icon), rt, st);
  r.onclick = () => thinkL.push({ t: 'card', id: t.id });
  return r;
}

function optButtons(opts, chosen, correct, onPick) {
  const box = el('div', 'opts' + (chosen != null ? ' picked' : ''));
  // Rätsel mit Lösung: nach der Antwort gesperrt und eingefärbt – die Auflösung steht direkt darunter.
  const locked = correct != null && chosen != null;
  opts.forEach((o, i) => {
    const b = el('button', 'opt');
    b.type = 'button';
    const right = locked && i === correct, wrong = locked && i === chosen && i !== correct;
    if (chosen === i) { b.classList.add('chosen'); b.setAttribute('aria-pressed', 'true'); b.append(el('span', 'yours', T('Deine Wahl', 'Your choice'))); }
    b.append(el('span', 'txt', optLabel(o)));
    if (right) b.classList.add('right');
    if (wrong) b.classList.add('wrong');
    if (chosen === i || right) { const tk = el('span', 'tick'); tk.setAttribute('aria-hidden', 'true'); tk.append(symEl(wrong ? 'cross' : 'check')); b.append(tk); }
    if (locked) b.disabled = true;
    else b.onclick = () => onPick(i);
    box.append(b);
  });
  return box;
}
// Nächste offene Frage derselben Sammlung (null, wenn alle beantwortet sind)
function nextThinkId(t) {
  const ids = collCards(THINK_META[t.id].coll).map(x => x.id);
  const i = ids.indexOf(t.id);
  for (let k = 1; k < ids.length; k++) { const id = ids[(i + k) % ids.length]; if (!state.think[id]) return id; }
  return null;
}
// „Nächste Frage“ ersetzt die Frage – Zurück führt dann zur Sammlung, nicht durch alle gelesenen Fragen.
function thinkGoto(id) {
  const c = THINK_META[id].coll, prev = thinkL.prev();
  if (prev && prev.t === 'coll' && prev.id === c.id) thinkL.replace({ t: 'card', id });
  else { thinkL.replace({ t: 'coll', id: c.id, scroll: 0 }, false); thinkL.push({ t: 'card', id }, false); }
}
function thinkToColl(c) {
  const prev = thinkL.prev();
  if (prev && prev.t === 'coll' && prev.id === c.id) thinkL.back();
  else thinkL.replace({ t: 'coll', id: c.id });
}

// Ebene 3: die Frage. Aufbau: Kopf · Lage · Frage · Antworten · Auflösung · Und wenn …? · Hintergrund · Weiter
function renderCard(t, fresh = false) {
  const rec = state.think[t.id];
  const meta = THINK_META[t.id], kind = KINDS[meta.group.kind];
  $('think-title').textContent = t.title;
  const b = thinkBody;
  b.innerHTML = '';
  const k = el('span', 'th-kind');
  k.style.setProperty('--kc', kind.c);
  k.append(symEl(t.icon, 'in'), el('span', null, (dailyThought().id === t.id ? T('Frage des Tages · ', 'Question of the day · ') : '') + kind.label));
  b.append(k, el('h1', null, t.title), el('p', 'think-text', t.text), el('h2', 'think-q', t.q));
  b.append(optButtons(t.opts, rec ? rec.a : null, t.correct, i => {
    const first = !state.think[t.id];
    if (!answerThink(t, i)) return;
    const y = thinkScroll.scrollTop;
    renderCard(t, first);
    thinkScroll.scrollTop = y;
    if (first) b.querySelector('.think-res > :first-child')?.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  }));
  if (!rec) { b.append(el('p', 'think-note', T('Erst entscheiden – dann kommt die Auflösung.', 'Decide first – then the resolution follows.'))); return; }

  const res = el('div', 'think-res' + (fresh ? ' fresh' : ''));
  if (t.correct != null) {
    const ok = rec.a === t.correct;
    const v = el('p', 'think-verdict ' + (ok ? 'ok' : 'no'));
    v.append(symEl(ok ? 'checkc' : 'crossc', 'in'), el('span', null, ok ? T('Richtig!', 'Correct!') : T('Nicht ganz – richtig ist: ', 'Not quite – the answer is: ') + optLabel(t.opts[t.correct])));
    res.append(v);
  } else {
    res.append(el('p', 'think-note', T('Hier gibt es keine „richtige“ Antwort. Du kannst deine Wahl jederzeit ändern.', 'There is no “right” answer here. You can change your choice at any time.')));
  }
  res.append(el('h3', null, T('Auflösung', 'Resolution')));
  for (const [head, txt] of t.args) res.append(el('h4', null, head), el('p', null, txt));
  if (t.twist) {
    res.append(el('h3', null, T('Und wenn …?', 'And what if …?')), el('p', null, t.twist.text), el('p', 'think-q2', t.twist.q));
    res.append(optButtons(t.twist.opts, rec.t, null, i => {
      rec.t = i; saveThink();
      const y = thinkScroll.scrollTop;
      renderCard(t);
      thinkScroll.scrollTop = y;
    }));
    if (rec.t != null) res.append(el('p', 'think-twistnote', t.twist.note));
  }
  res.append(el('h3', null, T('Hintergrund', 'Background')), el('p', null, t.info));
  const wiki = el('button', 'btn ghost2', T('Ganzen Artikel auf Wikipedia lesen', 'Read the full Wikipedia article'));
  wiki.type = 'button';
  wiki.onclick = () => openReader(t.wiki);
  const nid = nextThinkId(t);
  const next = el('button', 'btn', nid ? T('Nächste Frage →', 'Next question →') : T('Alle beantwortet – zur Sammlung', 'All answered – to the collection'));
  next.type = 'button';
  next.onclick = () => nid ? thinkGoto(nid) : thinkToColl(meta.coll);
  res.append(wiki, next);
  b.append(res);
}

// „Deine Standpunkte“ (vorläufig, bis das Denkprofil kommt): die bisherigen Achsen, verständlich benannt und mit Anzahl.
const AXES = {
  ethik: { name: T('Moral', 'Morality'), ends: [T('Das Ergebnis zählt', 'The outcome counts'), T('Grundsätze zählen', 'Principles count')], ids: ['trolley', 'teich', 'schleier', 'gyges', 'karneades', 'omelas', 'luege'] },
  geist: { name: T('Bewusstsein', 'Consciousness'), ends: [T('Gehirn genügt', 'The brain is enough'), T('Da ist mehr', 'There is more')], ids: ['mary', 'china', 'zombie', 'fledermaus', 'spektrum', 'turing'] },
  ich: { name: T('Was dich ausmacht', 'What makes you you'), ends: [T('Stoff & Herkunft', 'Matter & origin'), T('Muster & Erinnerung', 'Pattern & memory')], ids: ['theseus', 'teleporter', 'sumpfmann'] },
};
const AXIS_MIN = 3; // ab so vielen Antworten erscheint eine Achse
function thinkAxes() {
  const out = [];
  for (const [key, ax] of Object.entries(AXES)) {
    const vals = [];
    for (const id of ax.ids) {
      const t = thinkById(id), rec = state.think[id];
      if (!t || !rec) continue;
      const ls = [optLean(t.opts[rec.a])];
      if (t.twist && rec.t != null) ls.push(optLean(t.twist.opts[rec.t]));
      for (const l of ls) if (typeof l === 'number') vals.push(l);
    }
    out.push({ key, ax, vals });
  }
  return out;
}
function renderStandpoints(box) {
  box.innerHTML = '';
  const head = el('div', 'th-row th-static');
  const rt = el('span', 'th-rt');
  rt.append(el('b', null, T('Deine Standpunkte', 'Your positions')), el('span', 'th-q', T('Wohin deine Antworten bisher neigen', 'Where your answers lean so far')));
  head.append(icBox('axis'), rt);
  box.append(head);
  const shown = thinkAxes().filter(a => a.vals.length >= AXIS_MIN);
  if (!shown.length) {
    box.append(el('p', 'th-hint', T(`Ab ${AXIS_MIN} Antworten zu Moral, Bewusstsein oder dem Ich siehst du hier, wohin du neigst. Die Fragen dazu stehen unter „Klassische Gedankenexperimente“.`,
      `After ${AXIS_MIN} answers on morality, consciousness or the self you will see here where you lean. You will find these questions under “Classic thought experiments”.`)));
    return;
  }
  const wrap = el('div', 'th-axes');
  for (const { ax, vals } of shown) {
    const avg = vals.reduce((a, c) => a + c, 0) / vals.length;
    const row = el('div', 'th-axis');
    const top = el('div', 'th-axis-top');
    top.append(el('b', null, ax.name), el('span', null, T(`aus ${vals.length} Antworten`, `from ${vals.length} answers`)));
    const bar = el('div', 'th-axis-bar');
    const dot = el('i'); dot.style.left = ((avg + 1) / 2 * 100) + '%';
    bar.append(dot);
    bar.setAttribute('role', 'img');
    bar.setAttribute('aria-label', ax.name + ': ' + (avg < -.34 ? T('eher ', 'leaning to ') + ax.ends[0] : avg > .34 ? T('eher ', 'leaning to ') + ax.ends[1] : T('ausgewogen', 'balanced')));
    const ends = el('div', 'th-axis-ends');
    ends.append(el('span', null, ax.ends[0]), el('span', null, ax.ends[1]));
    row.append(top, bar, ends);
    wrap.append(row);
  }
  wrap.append(el('p', 'th-foot', T('Der Punkt zeigt, wohin deine bisherigen Antworten neigen. In der Mitte heißt: mal so, mal so.', 'The dot shows where your answers so far lean. The middle means: sometimes one way, sometimes the other.')));
  box.append(wrap);
}

// Ebene 1: die Übersicht im Tab. Sie wird einmal aufgebaut, danach werden nur Zahlen und Texte aktualisiert.
const dk = { built: false };
function renderDenken() {
  if (!THOUGHTS.length) return;
  if (!dk.built) buildDenken();
  updateDenken();
}
function buildDenken() {
  const box = $('think-list');
  box.innerHTML = '';
  dk.daily = el('section', 'th-daily');
  dk.daily.onclick = () => thinkL.open({ t: 'card', id: dailyThought().id });
  box.append(dk.daily, el('h2', 'th-sec', T('Entdecken', 'Discover')));
  const g = el('div', 'th-group');
  dk.rows = [];
  for (const c of COLLECTIONS) {
    const r = el('button', 'th-row');
    r.type = 'button';
    const rt = el('span', 'th-rt'), meta = el('span', 'th-meta'), mini = el('span', 'th-mini'), fill = el('i'), txt = el('span');
    mini.append(fill);
    meta.append(mini, txt);
    rt.append(el('b', null, c.title), el('span', 'th-q', c.sub), meta);
    r.append(icBox(c.sym), rt, chevEl());
    r.onclick = () => thinkL.open({ t: 'coll', id: c.id });
    g.append(r);
    dk.rows.push({ c, mini, fill, txt });
  }
  box.append(g);
  if (typeof openTrolley === 'function') {
    box.append(el('h2', 'th-sec', T('Spielen', 'Play')));
    const tb = el('button', 'th-trolley');
    tb.type = 'button';
    const rt = el('span', 'th-rt');
    rt.append(el('b', null, T('Das Trolley-Spiel', 'The Trolley Game')),
      el('span', 'th-q', T(`Weiche, Brücke & Co.: ${TROLLEY_CLASSICS.length} Klassiker, Zufallsrunden und ${TROLLEY_STACK.length} Fälle aus der Forschung`, `Switch, footbridge & co.: ${TROLLEY_CLASSICS.length} classics, random rounds and ${TROLLEY_STACK.length} cases from research`)));
    tb.append(icBox('tram'), rt, chevEl());
    tb.onclick = () => openTrolley();
    box.append(tb);
  }
  box.append(el('h2', 'th-sec', T('Du', 'You')));
  dk.you = el('div', 'th-group');
  box.append(dk.you);
  dk.built = true;
}
function updateDenken() {
  // Frage des Tages
  const d = dailyThought(), rec = state.think[d.id], kind = KINDS[THINK_META[d.id].group.kind];
  const s = dk.daily;
  s.innerHTML = '';
  s.style.setProperty('--kc', kind.c);
  const k = el('span', 'th-kind');
  k.append(el('span', 'caps', T('Frage des Tages', 'Question of the day')), document.createTextNode('· ' + kind.short));
  s.append(k, icBox(d.icon), el('h3', null, d.title));
  if (!rec) {
    s.append(el('p', 'th-dtext', d.text), el('p', 'th-dq', d.q));
    const go = el('button', 'btn th-wide', T('Jetzt entscheiden ›', 'Decide now ›'));
    go.type = 'button';
    s.append(go);
  } else {
    const ch = el('p', 'th-dq');
    ch.append(T('Deine Wahl: ', 'Your choice: '), el('b', null, optLabel(d.opts[rec.a])));
    const go = el('button', 'btn ghost2 th-wide', T('Auflösung ansehen ›', 'See the resolution ›'));
    go.type = 'button';
    s.append(el('p', 'th-dtext', d.q), ch, go, el('p', 'th-later', T('Morgen gibt es eine neue Frage.', 'Tomorrow there will be a new question.')));
  }
  // Sammlungen: Fortschritt je Zeile
  for (const r of dk.rows) {
    const p = collProgress(r.c);
    r.mini.hidden = !p.done;
    r.fill.style.width = (p.done / p.n * 100) + '%';
    r.txt.textContent = p.done ? T(`${p.done} von ${p.n} beantwortet`, `${p.done} of ${p.n} answered`) : T(`${p.n} Fragen`, `${p.n} questions`);
  }
  renderStandpoints(dk.you);
  updateThinkDot();
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
const TAB_ORDER = [...document.querySelectorAll('.tabbar button')].map(b => b.dataset.view);
const tabbarEl = document.querySelector('.tabbar');
// Inhalt eines Bereichs aufbauen (auch schon, während er beim Wischen hereingleitet)
function renderView(v) {
  if (v === 'topics') renderTopics();
  if (v === 'saved') renderSaved();
  if (v === 'think') renderDenken();
  if (v === 'search' && !searchInput.value.trim()) { searchList.innerHTML = ''; renderSearchHint(); }
}
function activateView(v, { anim = true, rendered = false } = {}) {
  document.querySelectorAll('.tabbar button').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  tabbarEl.style.setProperty('--i', TAB_ORDER.indexOf(v));
  document.querySelectorAll('.view').forEach(x => {
    x.classList.toggle('active', x.id === 'view-' + v);
    x.classList.toggle('no-anim', !anim);
  });
  if (!rendered) renderView(v);
  if (v === 'think') thinkTabSeen();
  if (v === 'feed' && topicsDirty) { topicsDirty = false; resetFeed(); }
  if (v === 'feed') feedFx();
}
document.querySelectorAll('.tabbar button').forEach(btn => {
  btn.onclick = () => {
    // Den schon aktiven Tab antippen = zurück nach oben (wie in iOS)
    if (btn.classList.contains('active')) { (btn.dataset.view === 'feed' ? feedEl : $('view-' + btn.dataset.view)).scrollTo({ top: 0, behavior: 'smooth' }); return; }
    activateView(btn.dataset.view);
  };
});

// ---------- Seitlich wischen zwischen den Bereichen ----------
// Die Seite folgt dem Finger 1:1, die Nachbarseite gleitet daneben herein, die Leuchtmarke unten wandert mit.
// Nicht, solange ein Artikel, Gedankenspiel oder das Spiel offen ist, und nicht auf Elementen,
// die selbst seitlich bewegt werden (Schieberegler, Filterleiste, Auswahllisten) oder am Bildschirmrand.
const sheetOpen = () => !reader.hidden || !thinkEl.hidden || !$('game').hidden;
const swipe = { on: false, busy: false };
const SWIPE_EASE = 'transform .34s cubic-bezier(.22, .9, .25, 1)';
function setX(el, x, ease) {
  el.style.transition = ease || 'none';
  el.style.transform = x == null ? '' : `translate3d(${x}px, 0, 0)`;
}
function clearPeek() {
  document.querySelectorAll('.view.peek').forEach(p => { p.classList.remove('peek'); setX(p, null); p.style.transition = ''; });
}
document.addEventListener('touchstart', e => {
  const tch = e.touches[0];
  if (swipe.busy || e.touches.length !== 1 || sheetOpen()) return;
  if (tch.clientX < 24 || tch.clientX > innerWidth - 24) return;
  if (e.target.closest('input, select, textarea, .fchips, .tabbar')) return;
  const cur = document.querySelector('.view.active');
  if (!cur) return;
  Object.assign(swipe, { on: true, x: tch.clientX, y: tch.clientY, dx: 0, dir: null, cur, idx: TAB_ORDER.indexOf(cur.id.replace('view-', '')),
    nb: null, nbIdx: -1, w: innerWidth, vx: 0, lx: tch.clientX, lt: performance.now() });
}, { passive: true });
document.addEventListener('touchmove', e => {
  if (!swipe.on) return;
  const tch = e.touches[0], dx = tch.clientX - swipe.x, dy = tch.clientY - swipe.y;
  if (!swipe.dir) {
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
    swipe.dir = Math.abs(dx) > Math.abs(dy) * 1.2 ? 'x' : 'y';
    if (swipe.dir === 'y') { swipe.on = false; return; }
    swipe.cur.style.willChange = 'transform';
    tabbarEl.classList.add('dragging');
  }
  // Geschwindigkeit aus den letzten Bewegungen (für einen schnellen „Schubs“)
  const now = performance.now();
  if (now > swipe.lt) { swipe.vx = swipe.vx * .4 + (tch.clientX - swipe.lx) / (now - swipe.lt) * .6; }
  swipe.lx = tch.clientX; swipe.lt = now;
  swipe.dx = dx;
  const nbIdx = swipe.idx + (dx < 0 ? 1 : -1);
  const valid = nbIdx >= 0 && nbIdx < TAB_ORDER.length;
  if (nbIdx !== swipe.nbIdx) {                       // Richtung gewechselt: andere Nachbarseite zeigen
    clearPeek();
    swipe.nbIdx = nbIdx;
    swipe.nb = valid ? $('view-' + TAB_ORDER[nbIdx]) : null;
    if (swipe.nb) { renderView(TAB_ORDER[nbIdx]); swipe.nb.classList.add('peek'); swipe.nb.style.willChange = 'transform'; }
  }
  if (swipe.nb) {
    setX(swipe.cur, dx);
    setX(swipe.nb, dx + (dx < 0 ? swipe.w : -swipe.w));
    tabbarEl.style.setProperty('--i', swipe.idx - dx / swipe.w);
  } else setX(swipe.cur, dx * .22);                 // am Ende nur leicht nachgeben
}, { passive: true });
function swipeEnd() {
  if (!swipe.on) return;
  swipe.on = false;
  const { cur, nb, dx, w, idx, nbIdx } = swipe;
  tabbarEl.classList.remove('dragging');
  if (swipe.dir !== 'x') return;
  const commit = nb && (Math.abs(dx) > w * .28 || (Math.abs(swipe.vx) > .35 && Math.sign(swipe.vx) === Math.sign(dx)));
  swipe.busy = true;
  const done = () => {
    cur.style.willChange = ''; setX(cur, null); cur.style.transition = '';
    if (commit) activateView(TAB_ORDER[nbIdx], { anim: false, rendered: true });
    clearPeek();
    if (nb) nb.style.willChange = '';
    swipe.busy = false;
  };
  if (commit) {
    setX(cur, dx < 0 ? -w : w, SWIPE_EASE);
    setX(nb, 0, SWIPE_EASE);
    tabbarEl.style.setProperty('--i', nbIdx);
  } else {
    setX(cur, 0, SWIPE_EASE);
    if (nb) setX(nb, dx < 0 ? w : -w, SWIPE_EASE);
    tabbarEl.style.setProperty('--i', idx);
  }
  setTimeout(done, 350);
}
document.addEventListener('touchend', swipeEnd, { passive: true });
document.addEventListener('touchcancel', swipeEnd, { passive: true });

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

// ---------- Größe der Textbox (Klein / Mittel / Groß) ----------
const PANEL_STEPS = [38, 50, 64];
const snapPanel = v => PANEL_STEPS.reduce((best, x) => Math.abs(x - v) < Math.abs(best - v) ? x : best, 50);
function setPanel(v) {
  document.documentElement.style.setProperty('--panel', v);
  document.querySelectorAll('#panel-seg button').forEach(b => {
    const on = Number(b.dataset.v) === v;
    b.classList.toggle('on', on);
    b.setAttribute('aria-checked', on);
  });
}
setPanel(snapPanel(Number(store.get('panel', 50))));
document.querySelectorAll('#panel-seg button').forEach(b => {
  b.setAttribute('role', 'radio');
  b.onclick = () => { const v = Number(b.dataset.v); store.set('panel', v); setPanel(v); };
});

// ---------- Größe der Leiste unten (Schieberegler) ----------
const tabInput = $('tabscale');
tabInput.value = store.get('tabscale', 100);
const tabShow = () => { $('tabscale-val').textContent = tabInput.value + ' %'; };
tabShow();
tabInput.oninput = () => {
  document.documentElement.style.setProperty('--tab-scale', tabInput.value / 100);
  tabShow();
  store.set('tabscale', Number(tabInput.value));
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
  readerChrome();
}, { passive: true });
readerBody.lang = LANG; // für saubere Silbentrennung

// ---------- Blätter wegziehen, große Titel, Schriftgröße ----------
sheetDrag(reader, readerScroll, closeReaderAll);
sheetDrag(thinkEl, thinkScroll, () => thinkL.closeAll());
sheetDrag($('game'), $('game-scroll'), () => closeTrolley());
// Große Titel: Beim Scrollen erscheint oben eine Glasleiste mit dem Titel in klein.
document.querySelectorAll('.view').forEach(v => {
  const label = v.querySelector('.navbar span');
  if (!label) return;
  v.addEventListener('scroll', () => {
    if (!label.textContent) label.textContent = v.querySelector('.page-head h1').textContent;
    v.classList.toggle('scrolled', v.scrollTop > 52);
  }, { passive: true });
});
function setRsize(v) {
  document.documentElement.style.setProperty('--reader-size', v + 'px');
  document.querySelectorAll('#rsize-seg button').forEach(b => { const on = Number(b.dataset.v) === v; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
}
setRsize([16, 18, 21].includes(store.get('rsize', 18)) ? store.get('rsize', 18) : 18);
document.querySelectorAll('#rsize-seg button').forEach(b => {
  b.setAttribute('role', 'radio');
  b.onclick = () => { const v = Number(b.dataset.v); store.set('rsize', v); setRsize(v); };
});

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

// ---------- Feed-Zustand über ein Neuladen hinweg behalten ----------
// Lädt sich die App neu (Update, iPhone hat sie im Hintergrund beendet), geht es an derselben Karte weiter –
// mit den Karten davor und danach, und ein offener Artikel öffnet sich wieder an derselben Stelle.
const SNAP_KEY = 'wf.snap';
let snapTimer = null;
function saveSnap() {
  clearTimeout(snapTimer);
  try {
    const cards = [...feedEl.querySelectorAll('.card')].filter(c => cardItems.has(c));
    if (!cards.length) return;
    const h = feedEl.clientHeight || 1;
    let idx = cards.findIndex(c => c.offsetTop + h / 2 > feedEl.scrollTop);
    if (idx < 0) idx = cards.length - 1;
    const from = Math.max(0, idx - 15);
    const top = readerStack[readerStack.length - 1];
    sessionStorage.setItem(SNAP_KEY, JSON.stringify({
      t: Date.now(), lang: LANG, idx: idx - from,
      items: cards.slice(from, idx + 10).map(c => cardItems.get(c)),
      reader: !reader.hidden && top?.loaded ? { title: top.title, scroll: readerScroll.scrollTop } : null, // nur Artikel, die wirklich geladen sind
    }));
  } catch {}
}
function saveSnapSoon() { clearTimeout(snapTimer); snapTimer = setTimeout(saveSnap, 500); }
// Startet die Seite kurz hintereinander mehrmals neu, ist sie vermutlich abgestürzt (z. B. Speicher voll).
// Dann nicht wieder dorthin springen, wo es passiert ist: erst den Artikel weglassen, beim nächsten Mal alles.
const bootCount = Number(sessionStorage.getItem('wf.boot') || 0);
sessionStorage.setItem('wf.boot', bootCount + 1);
setTimeout(() => sessionStorage.removeItem('wf.boot'), 20000);
function restoreSnap() {
  let s;
  try { s = JSON.parse(sessionStorage.getItem(SNAP_KEY)); } catch {}
  if (bootCount >= 2) { sessionStorage.removeItem(SNAP_KEY); return false; }
  if (s && bootCount >= 1) s.reader = null;
  if (!s || s.lang !== LANG || !s.items?.length || Date.now() - s.t > 6 * 3600e3) return false;
  s.items.forEach(it => addCard(it));
  const card = [...feedEl.querySelectorAll('.card')][Math.min(s.idx, s.items.length - 1)];
  if (card) feedEl.scrollTop = card.offsetTop;
  feedFx();
  if (s.reader?.title) openReader(s.reader.title, null, s.reader.scroll || 0);
  return true;
}
feedEl.addEventListener('scroll', saveSnapSoon, { passive: true });
readerScroll.addEventListener('scroll', saveSnapSoon, { passive: true });
window.addEventListener('pagehide', saveSnap);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveSnap(); });

// ---------- Start ----------
renderSaved();
updateThinkDot();
// Nach Mitternacht: neue Frage des Tages, roter Punkt neu berechnen
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if ($('view-think').classList.contains('active')) { thinkTabSeen(); renderDenken(); } else updateThinkDot();
});
if (!restoreSnap()) loadMore();
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
