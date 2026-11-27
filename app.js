'use strict';

const API = 'https://' + WIKI.host + '/w/api.php';
// Gedankenspiele in der aktiven Sprache (thoughts.js / thoughts.en.js / thoughts.fr.js; fr fällt auf en zurück)
// (i18n.js lädt nur die Datei der aktiven Sprache; fehlt sie, bleibt der Bereich leer statt die App anzuhalten)
const THOUGHTS = (LANG === 'fr' ? (typeof THOUGHTS_FR !== 'undefined' && THOUGHTS_FR) || (typeof THOUGHTS_EN !== 'undefined' && THOUGHTS_EN) : LANG === 'en' ? typeof THOUGHTS_EN !== 'undefined' && THOUGHTS_EN : typeof THOUGHTS_DE !== 'undefined' && THOUGHTS_DE) || [];
// Seit 2.6: Alltagsdilemmata und Philosophen-Karten (denken.js / denken.en.js), gleiche Kennungen in beiden Sprachen
const DENKEN = (LANG === 'fr' ? (typeof DENKEN_FR !== 'undefined' && DENKEN_FR) || (typeof DENKEN_EN !== 'undefined' && DENKEN_EN) : LANG === 'en' ? typeof DENKEN_EN !== 'undefined' && DENKEN_EN : typeof DENKEN_DE !== 'undefined' && DENKEN_DE) || { people: {}, alltag: [], philo: [] };
const THINK_ALL = THOUGHTS.concat(DENKEN.alltag || [], DENKEN.philo || []);
// Fundstücke in der aktiven Sprache (fundstuecke.de.js / fundstuecke.en.js), nur vollständige Einträge
const FUND = ((LANG === 'fr' ? (typeof FUNDSTUECKE_FR !== 'undefined' && FUNDSTUECKE_FR) || (typeof FUNDSTUECKE_EN !== 'undefined' && FUNDSTUECKE_EN) : LANG === 'en' ? typeof FUNDSTUECKE_EN !== 'undefined' && FUNDSTUECKE_EN : typeof FUNDSTUECKE_DE !== 'undefined' && FUNDSTUECKE_DE) || [])
  .filter(f => f && f.id && f.object && Array.isArray(f.steps) && f.steps.length >= 2 && f.steps.every(s => s && s.title));

// Themen = Wikipedias eigene "articletopic"-Klassifizierung.
// on:true = deine Interessen als Voreinstellung.
const TOPICS = [
  // Eigene Suchanfrage statt articletopic: Wikipedias Kategorien für Gedankenexperimente und Paradoxa.
  { id: 'thought', label: T('Gedankenexperimente & Paradoxien', 'Thought experiments & paradoxes'), on: true, query: WIKI.thought, minLen: 2000 },
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
  { id: 'engineering', label: T('Ingenieurwesen', 'Engineering'), on: true },
  { id: 'technology', label: T('Technik & Geräte', 'Technology'), on: true },
  { id: 'space', label: T('Weltraum', 'Space'), on: true },
  { id: 'medicine-and-health', label: T('Medizin & Gesundheit', 'Medicine & health'), on: false },
  { id: 'military-and-warfare', label: T('Krieg & Militär', 'Military & warfare'), on: false },
  { id: 'business-and-economics', label: T('Wirtschaft', 'Business & economics'), on: false },
  { id: 'transportation', label: T('Verkehr', 'Transportation'), on: false },
  { id: 'food-and-drink', label: T('Essen & Trinken', 'Food & drink'), on: false },
  { id: 'architecture', label: T('Architektur', 'Architecture'), on: false },
  { id: 'visual-arts', label: T('Bildende Kunst', 'Visual arts'), on: false },
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
// Fehler mit einem Satz für Menschen (friendly): Nur solche Texte zeigt die App an, nie HTTP-Codes oder API-Rohtext.
function niceError(msg) { const e = new Error(msg); e.friendly = true; return e; }
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
      if (attempt) throw niceError(T('Wikipedia ist gerade überlastet. Versuche es in einem Moment noch einmal.', 'Wikipedia is busy right now. Try again in a moment.'));
    } catch (e) {
      if (e.name === 'AbortError') throw niceError(T('Wikipedia antwortet gerade nicht. Versuche es in einem Moment noch einmal.', 'Wikipedia isn’t responding right now. Try again in a moment.'));
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
// Der Tages-Feed der Wikipedia (Artikel des Tages, „Schon gewusst?“) wird je Tag höchstens einmal geholt.
const featuredMem = new Map();
function featuredFeed(day) {
  if (!featuredMem.has(day)) {
    featuredMem.clear();
    featuredMem.set(day, wikiFetch(`https://${WIKI.host}/api/rest_v1/feed/featured/${day.replace(/-/g, '/')}`)
      .then(j => { storeDyk(day, j); return j; })
      .catch(e => { featuredMem.delete(day); throw e; }));
  }
  return featuredMem.get(day);
}
async function fetchAotd() {
  const day = today();
  let a = lstore.get('aotd', null);
  if (!a || a.day !== day) {
    const j = await featuredFeed(day);
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
    const artist = (txt(md.Artist?.value) || txt(md.Credit?.value)).replace(/^(.{4,}?)\s*\1$/, '$1'); // „Unknown authorUnknown author“ -> einmal
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
    const b = el('button', 'btn', T('Noch einmal versuchen', 'Try again'));
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
  const spinner = first ? stateCard('loading', T('Artikel werden geladen …', 'Loading articles…')) : null;
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
      ? T('Du bist offline. Unter „Gemerkt“ kannst du deine gemerkten Artikel trotzdem lesen.', 'You’re offline. You can still read your saved articles under “Saved”.')
      : e?.friendly ? e.message
      : T('Gerade lassen sich keine Artikel laden. Prüfe deine Internetverbindung und versuche es noch einmal.', 'Articles can’t be loaded right now. Check your internet connection and try again.'));
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
  if (item.top) meta.append(el('span', 'chip top', T('Ausgezeichnet', 'Featured')));
  if (item.seed) meta.append(el('span', 'chip sim', T(`≈ Ähnlich wie „${item.seed}“`, `≈ Similar to “${item.seed}”`)));
  const h = el('h2', null, item.title);
  const p = el('p', 'extract', item.extract);
  body.append(meta, h, p, el('div', 'src', T('Wikipedia · CC BY-SA 4.0', 'Wikipedia · CC BY-SA 4.0')));
  // Tastatur und VoiceOver: die Textfläche ist der Knopf zum Artikel (Enter und Leertaste über den gemeinsamen keydown-Handler)
  body.setAttribute('role', 'button');
  body.tabIndex = 0;
  body.setAttribute('aria-label', T(`${item.title}. Artikel öffnen`, `${item.title}. Open article`));

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
  const less = mk('less', ICONS.less, T('Weniger', 'Show less'));
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
    toast(on ? T('Gemerkt · offline verfügbar', 'Saved · available offline') : T('Nicht mehr gemerkt', 'Removed from Saved'));
  };
  less.onclick = () => {
    adjust(item.topic, 0.7);
    if (like.classList.contains('on')) { adjust(item.topic, 1 / 1.3); like.classList.remove('on'); }
    if (item.seed) dropSeed(item.seed);
    dropSeed(item.title);
    toast(item.topic ? T(`Weniger aus „${topicLabel(item.topic)}“`, `Fewer from “${topicLabel(item.topic)}”`) : T('Weniger davon', 'Fewer like this'));
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
  doc.querySelectorAll('.navbox, .mw-references-wrap, .reflist, ol.references, sup.reference, .mw-editsection, .sisterproject, #normdaten, .mw-empty-elt, #bandeau-portail').forEach(n => n.remove());
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
    if (d.error) throw niceError(d.error.code === 'missingtitle' ? T('Diesen Artikel gibt es (noch) nicht.', 'This article doesn’t exist (yet).') : T('Dieser Artikel lässt sich gerade nicht laden. Versuche es gleich noch einmal.', 'This article can’t be loaded right now. Try again in a moment.'));
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
  none.textContent = T(`Nichts gefunden für „${query}“. Gesucht wird in Titel, Text und Thema.`, `Nothing found for “${query}”. Search looks at the title, text and topic.`);
  for (const s of items) {
    const li = el('li');
    const th = el('div', 'thumb');
    if (s.thumb) th.style.backgroundImage = `url("${s.thumb}")`;
    const t = el('div', 't');
    t.append(el('b', null, s.title), el('small', null, s.extract));
    a11yOpen(t, s.title);
    if (s.off) { const ob = el('span', 'offbadge'); ob.append(symEl('check', 'in'), T('offline verfügbar', 'available offline')); t.append(ob); }
    const del = el('button', 'del');
    del.append(symEl('cross'));
    del.setAttribute('aria-label', T(`„${s.title}“ entfernen`, `Remove “${s.title}”`));
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
// opts.thread = { id, i }: der Artikel ist Schritt i des Fundstücks id.
const READER_MAX = 30; // so viele Artikel merkt sich der Leser für „Zurück“ und die Spur, ältere fallen weg
async function openReader(title, item = null, restoreScroll = 0, origin = null, opts = null) {
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
  readerStack.push({ title, item, scroll: 0, ...opts });
  if (readerStack.length > READER_MAX) readerStack.splice(0, readerStack.length - READER_MAX);
  readerStack.slice(0, -5).forEach(e => { e.frag = null; }); // nur die letzten Artikel im Speicher halten
  if (readerStack.length === 1) {
    // Aus einer Karte geöffnet: Das Kartenbild wächst zum Titelbild des Artikels.
    const r = origin && !reduceMotion && reader.animate ? visibleRect(origin) : null;
    reader.classList.toggle('hero-open', !!r);
    heroEl.style.height = r ? Math.min(Math.round(r.bottom + 6), Math.round(innerHeight * .62)) + 'px' : '';
    reader.hidden = false;
    sheetShown(reader);
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
  readerBody.innerHTML = '<div class="loading"><div class="spinner"></div>' + T('Artikel wird geladen …', 'Loading article…') + '</div>';
  readerScroll.scrollTop = 0;
  try {
    // Gemerkte Artikel kommen sofort aus dem Offline-Speicher, alles andere aus dem Netz.
    const off = await offlineGet(title);
    let art;
    if (off) art = { title: off.title, doc: sanitize(new DOMParser().parseFromString(off.html, 'text/html')), offline: true };
    else art = await fetchArticle(title);
    if (readerStack[readerStack.length - 1] !== top) return;
    readerBody.innerHTML = '';
    top.title = art.title;
    const fs = top.thread && fundStep(top.thread);
    if (fs) readerBody.append(fundKicker(fs));
    readerBody.append(el('h1', 'art-title', art.title));
    if (fs?.step.link) readerBody.append(el('div', 'fd-why wf-x', fs.step.link));
    if (art.offline) readerBody.append(el('div', 'offnote', T('Offline verfügbar', 'Available offline')));
    tidyArticle(art.doc.body);
    readerBody.append(...art.doc.body.childNodes);
    dedupeHero();
    // Am Ende: im Fundstück Weiter/Zurück, dann drei Abzweigungen und die Spur, zuletzt der Lizenzhinweis
    if (fs) readerBody.append(fundNav(fs));
    readerBody.append(holeBox(art.title));
    if (readerStack.length > 1) readerBody.append(trailBox());
    readerBody.append(sourceNote(art.title));
    readerScroll.scrollTop = restoreScroll;
    readerChrome();
    top.loaded = true;
    setReaderHead(art.title);
    armReaderEnd();
    refocusSheet();
  } catch (e) {
    if (readerStack[readerStack.length - 1] !== top) return;
    readerBody.innerHTML = '';
    // Nur verständliche Sätze zeigen, nie HTTP-Codes oder „Failed to fetch“
    readerBody.append(el('p', 'loading', navigator.onLine === false
      ? T('Du bist offline, und dieser Artikel ist nicht gemerkt. Gemerkte Artikel (unter „Gemerkt“) kannst du auch ohne Internet lesen.', 'You’re offline, and this article isn’t saved. Saved articles (under “Saved”) are available offline.')
      : e?.friendly ? e.message
      : T('Dieser Artikel lässt sich gerade nicht laden. Prüfe deine Internetverbindung und versuche es noch einmal.', 'This article can’t be loaded right now. Check your internet connection and try again.')));
    if (navigator.onLine !== false) {
      const again = el('button', 'btn reader-retry', T('Noch einmal versuchen', 'Try again'));
      again.type = 'button';
      again.onclick = () => renderArticle(title, restoreScroll);
      readerBody.append(again);
    }
    refocusSheet();
  }
}

// ---------- Leser: Artikel aufräumen ----------
// Wie die mobile Wikipedia: der erste Absatz vor Infokasten und Bildern, leere Abschnitte („Einzelnachweise“ ohne
// sichtbaren Inhalt) fallen weg. Läuft einmal pro geöffnetem Artikel auf dem frischen Dokument, ohne Beobachter.
const ART_HIDDEN = '.mw-editsection, .navbox, .noprint, .metadata, sup.reference, .mw-empty-elt, .sisterproject, #normdaten, .hatnote, .Vorlage_Begriffsklaerungshinweis, .mw-references-wrap, .reflist, ol.references, .navigation-not-searchable, #bandeau-portail, style, link, meta';
function headLevel(n) {
  if (n.nodeType !== 1) return 0;
  const h = n.matches('.mw-heading') ? n.querySelector('h2, h3, h4, h5, h6') : n;
  const m = h && h.tagName.match(/^H([2-6])$/);
  return m ? Number(m[1]) : 0;
}
function hasContent(n) {
  if (n.nodeType === 3) return /\S/.test(n.nodeValue);
  if (n.nodeType !== 1 || n.matches(ART_HIDDEN)) return false;
  const c = n.cloneNode(true);
  c.querySelectorAll(ART_HIDDEN).forEach(x => x.remove());
  return /\S/.test(c.textContent) || !!c.querySelector('img, video, audio, svg, math');
}
function tidyArticle(body) {
  const root = body.querySelector('.mw-parser-output') || body;
  for (let changed = true, guard = 0; changed && guard < 8; guard++) {
    changed = false;
    const kids = [...root.childNodes];
    for (let i = 0; i < kids.length; i++) {
      const lv = headLevel(kids[i]);
      if (!lv || !kids[i].isConnected) continue;
      let j = i + 1, content = false;
      for (; j < kids.length; j++) {
        if (!kids[j].isConnected) continue;
        if (headLevel(kids[j])) break;
        if (hasContent(kids[j])) { content = true; break; }
      }
      if (content) continue;
      const next = j < kids.length ? headLevel(kids[j]) : 0;
      if (!next || next <= lv) { kids[i].remove(); changed = true; }
    }
  }
  const top = [...root.children];
  const lead = top.find(n => n.tagName === 'P' && n.textContent.trim().length > 40);
  if (!lead) return;
  const box = top.slice(0, top.indexOf(lead)).find(n => n.matches('table, figure, .thumb, .infobox, .float-right, .tright'));
  if (box) box.before(lead);
}
// Dasselbe Bild nicht zweimal: Steht das Titelbild auch im Artikel (meist im Infokasten), wird es dort ausgeblendet.
function dedupeHero() {
  const src = !heroEl.hidden && heroImg.getAttribute('src');
  const f = src && fileFromThumb(src);
  if (!f) return;
  for (const img of readerBody.querySelectorAll('img')) {
    const g = fileFromThumb(img.getAttribute('src') || '');
    if (!g || g.file !== f.file) continue;
    const fig = img.closest('figure, .thumb, .gallerybox'), row = img.closest('tr');
    let target = fig || img.closest('a') || img;
    if (!fig && row && row.querySelectorAll('img').length === 1 && row.textContent.trim().length < 200) target = row;
    target.classList.add('wf-dup');
    break;
  }
}

// ---------- Blätter als Dialoge: Fokus, inert, Escape ----------
// Ein offenes Blatt (Leser, Denken, Trolley-Spiel) ist ein modaler Dialog: Der Fokus springt hinein, bleibt darin und
// kehrt beim Schließen zum Auslöser zurück. Alles dahinter ist inert. Ein einziger keydown-Handler für die ganze App.
const sheetStack = []; // { sheet, opener }
function topSheet() {
  if (!reader.hidden) return reader;
  for (let i = sheetStack.length - 1; i >= 0; i--) if (!sheetStack[i].sheet.hidden) return sheetStack[i].sheet;
  return null;
}
function syncInert() {
  const top = topSheet();
  document.querySelectorAll('.view, .tabbar').forEach(n => { n.inert = !!top; });
  for (const s of [thinkEl, $('game'), reader]) s.inert = !!top && s !== top;
}
const focusSheet = s => s.querySelector('header button')?.focus({ preventScroll: true });
function sheetShown(s) {
  if (!sheetStack.some(e => e.sheet === s)) sheetStack.push({ sheet: s, opener: document.activeElement });
  syncInert();
  if (topSheet() === s && !s.contains(document.activeElement)) focusSheet(s);
}
function sheetHidden(s) {
  const i = sheetStack.findIndex(e => e.sheet === s);
  const op = i >= 0 ? sheetStack.splice(i, 1)[0].opener : null;
  syncInert();
  const top = topSheet();
  if (op && op.isConnected && op !== document.body && !op.closest('[inert], [hidden]') && (!top || top.contains(op))) op.focus({ preventScroll: true });
  else if (top) focusSheet(top);
}
// Nach dem Neuzeichnen (neuer Artikel, nächste Frage) den Fokus im obersten Blatt halten
function refocusSheet() { const t = topSheet(); if (t && !t.contains(document.activeElement)) focusSheet(t); }
// Listeneinträge (Suche, Gemerkt): die Textfläche ist per Tab erreichbar und öffnet den Artikel
function a11yOpen(node, title) {
  node.setAttribute('role', 'button');
  node.tabIndex = 0;
  node.setAttribute('aria-label', T(`${title}. Artikel öffnen`, `${title}. Open article`));
}
// Eine einzige versteckte Live-Region für kurze Ansagen (z. B. nach einer Antwort)
function say(msg) {
  const r = $('sr-live');
  if (!r) return;
  r.textContent = '';
  setTimeout(() => { r.textContent = msg; }, 60);
}
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])';
document.addEventListener('keydown', e => {
  const top = topSheet();
  if (e.key === 'Escape' && top) {
    if (e.target.closest?.('select')) return;
    e.preventDefault();
    focusSheet(top);
    top.querySelector('header button')?.click(); // wie der Zurück-Knopf: eine Ebene zurück, auf der obersten Ebene schließen
    return;
  }
  if (e.key === 'Tab' && top) {
    const f = [...top.querySelectorAll(FOCUSABLE)].filter(n => n.getClientRects().length);
    if (!f.length) return;
    const a = document.activeElement, first = f[0], last = f[f.length - 1];
    if (!top.contains(a)) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
    else if (e.shiftKey && a === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
    return;
  }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('[role="button"]:not(button)')) {
    e.preventDefault();
    e.target.click();
    return;
  }
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
  if (step && e.target.matches?.('[role="radio"], [role="tab"]')) {
    const group = e.target.closest('[role="radiogroup"], [role="tablist"]');
    if (!group) return;
    const items = [...group.querySelectorAll('[role="radio"], [role="tab"]')];
    const n = items[(items.indexOf(e.target) + step + items.length) % items.length];
    e.preventDefault();
    n.focus();
    n.click();
  }
});

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
    dedupeHero();
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
  if (e.target.closest?.('.sb, .seg button, .tpick, .opt, .switch, .tchip, .gchoice .btn, .tabbar button, #reader-save, #reader-speak, .fd-nav .btn')) haptic();
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
  c.querySelectorAll('sup, style, .mw-editsection, .noprint, .offnote, .wf-x').forEach(x => x.remove());
  return c.textContent.replace(/\[\d+\]/g, '').replace(/\s+/g, ' ').trim();
}
function ttsNodes() {
  return [...readerBody.querySelectorAll('h1, h2, h3, p, li, blockquote, dd')].filter(n =>
    n.offsetParent !== null && !n.closest('table, figure, .thumb, .infobox, .wf-x') &&
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
  speakBtn.setAttribute('aria-label', T('Vorlesen stoppen', 'Stop reading aloud'));
  // Bildschirm anlassen – bei gesperrtem Handy stoppt die Stimme sonst.
  navigator.wakeLock?.request('screen').then(l => { if (tts.on) tts.lock = l; else l.release(); }).catch(() => {});
  speechSynthesis.cancel();
  ttsSpeakNode();
}
function ttsSpeakNode() {
  readerBody.querySelector('.tts-now')?.classList.remove('tts-now');
  const n = tts.nodes[tts.ni];
  if (!n || !n.isConnected) { ttsStop(); if (!n) toast(T('Fertig vorgelesen', 'Finished reading aloud')); return; }
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
    toast(T('Dieser Browser kann nicht vorlesen.', 'This browser can’t read aloud.'));
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
      armReaderEnd();
      refocusSheet();
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
  sheetHidden(reader);
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
  // Fortschritt der Fundstücke sofort zeigen: im offenen Fundstück-Blatt und in der Übersicht
  if (!thinkEl.hidden && thinkL.top()?.t === 'fund') thinkL.redraw();
  if ($('view-think').classList.contains('active')) renderDenken();
}
document.getElementById('reader-back').onclick = () => readerBack(false);
window.addEventListener('popstate', e => {
  if (popResolve) { popResolve(); return; } // das war unser eigenes history.back() beim Schließen
  if (!reader.hidden) { readerBack(true); return; }
  for (const L of levelSheets) if (L.onPop(e)) return; // Denken-Blatt und Trolley-Spiel: eine Ebene zurück
});
document.getElementById('reader-save').onclick = () => {
  const top = readerStack[readerStack.length - 1];
  const item = top.item || { title: top.title, extract: [...readerBody.querySelectorAll('p')].find(p => !p.closest('.wf-x'))?.textContent?.slice(0, 300) || '', thumb: null, topic: null };
  const on = toggleSaved({ ...item, title: top.title });
  document.getElementById('reader-save').classList.toggle('on', on);
  syncSaveButtons();
  toast(on ? T('Gemerkt · offline verfügbar', 'Saved · available offline') : T('Nicht mehr gemerkt', 'Removed from Saved'));
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
  a11yOpen(t, it.title);
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
    searchHint.textContent = T(`Nichts gefunden für „${q}“. Prüfe die Schreibweise oder versuche ein anderes Wort.`, `Nothing found for “${q}”. Check the spelling or try another word.`);
    for (const p of pages) {
      const it = { title: p.title, extract: p.extract || p.description || '', thumb: p.thumbnail?.source || null, topic: null };
      searchList.append(listItem(it, p.description || p.extract));
    }
  } catch (e) {
    if (seq !== searchSeq) return;
    searchList.innerHTML = '';
    searchHint.hidden = false;
    searchHint.textContent = navigator.onLine === false
      ? T('Du bist offline. Die Suche braucht eine Internetverbindung.', 'You’re offline. Search needs an internet connection.')
      : T('Die Suche hat nicht geklappt. Versuche es gleich noch einmal.', 'Search didn’t work. Try again in a moment.');
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
  spark: '<path d="M11 3.5c.7 4.6 2.4 6.3 7 7-4.6.7-6.3 2.4-7 7-.7-4.6-2.4-6.3-7-7 4.6-.7 6.3-2.4 7-7z"/><path d="M18.5 15v5M16 17.5h5"/>',
  trail: '<circle cx="6" cy="18" r="2.3"/><circle cx="18" cy="6" r="2.3"/><path d="M8 16.5c3-2 .5-5.5 4-6.5s4.5.5 4.5-2.6"/>',
  share: '<path d="M12 14.5V3.8M7.8 7.8 12 3.6l4.2 4.2"/><path d="M5.2 12.2v6.6a1.6 1.6 0 0 0 1.6 1.6h10.4a1.6 1.6 0 0 0 1.6-1.6v-6.6"/>',
  cross: '<path d="M7 7l10 10M17 7L7 17"/>',
  checkc: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.2l2.4 2.4 4.6-5"/>',
  crossc: '<circle cx="12" cy="12" r="8.5"/><path d="M9.4 9.4l5.2 5.2M14.6 9.4l-5.2 5.2"/>',
  // seit 2.6: Alltag & Philosophen
  pillar: '<path d="M4 9h16l-8-4.5z"/><path d="M6.5 11.5v6M10.17 11.5v6M13.83 11.5v6M17.5 11.5v6M4.5 20h15"/>',
  home: '<path d="M4 11l8-6.5 8 6.5"/><path d="M6 9.5v10h12v-10"/><path d="M10 19.5v-5h4v5"/>',
  coin: '<circle cx="12" cy="12" r="8.5"/><path d="M14.6 9.3A3 3 0 0 0 12 8c-1.6 0-2.7.8-2.7 2 0 2.8 5.6 1.4 5.6 4.1 0 1.2-1.2 2-2.9 2a3.2 3.2 0 0 1-2.8-1.4M12 6.4V8M12 16.1v1.5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  cart: '<path d="M3 4.5h2.5l2.2 10.5h10.1l2-7.5H6.4"/><circle cx="9" cy="19" r="1.5"/><circle cx="16.5" cy="19" r="1.5"/>',
  car: '<path d="M4 15.5v-3.2L6.2 7h11.6l2.2 5.3v3.2z"/><path d="M4 12.3h16"/><circle cx="7.8" cy="17.6" r="1.8"/><circle cx="16.2" cy="17.6" r="1.8"/>',
  wifi: '<path d="M3.5 9.5a12 12 0 0 1 17 0M6.5 12.7a7.6 7.6 0 0 1 11 0M9.5 15.8a3.4 3.4 0 0 1 5 0"/><circle cx="12" cy="18.8" r="1" fill="currentColor" stroke="none"/>',
  seat: '<path d="M7.5 3.5v10h8.5l1.5 7M7.5 13.5L6 20.5M7.5 9.5h6.5"/>',
  doc: '<path d="M6.5 3.5h7.5l4 4v13h-11.5z"/><path d="M14 3.5v4h4M9.5 12h5M9.5 15.5h5"/>',
  chat: '<path d="M4.5 5.5h15v10h-8l-4 3.5v-3.5h-3z"/>',
  star: '<path d="M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.7l-5.1 2.7 1-5.6-4.1-4 5.7-.8z"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="2"/><path d="M3 9h18M12 9v11M12 9C10.5 5.5 6.5 4.5 6.5 7.2 6.5 9 12 9 12 9zm0 0c1.5-3.5 5.5-4.5 5.5-1.8C17.5 9 12 9 12 9z"/>',
  music: '<path d="M9 18V5.5l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="15.5" r="2.5"/>',
  users: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.6-3.3 2.7-5 5.5-5s4.9 1.7 5.5 5"/><circle cx="16.5" cy="9.5" r="2.4"/><path d="M15.5 14.2c2.6-.3 4.5 1.3 5 4.3"/>',
  heart: '<path d="M12 19.5s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7.5 2.5c0 5.4-7.5 10-7.5 10z"/>',
  paw: '<circle cx="6.8" cy="10.5" r="1.8"/><circle cx="10.2" cy="6.6" r="1.8"/><circle cx="13.8" cy="6.6" r="1.8"/><circle cx="17.2" cy="10.5" r="1.8"/><path d="M12 12c-2.6 0-5 3-5 5.3 0 1.6 1.3 2.4 2.8 2.1 1-.2 1.5-.6 2.2-.6s1.2.4 2.2.6c1.5.3 2.8-.5 2.8-2.1 0-2.3-2.4-5.3-5-5.3z"/>',
  mountain: '<path d="M3 19.5l6.5-11 3.5 5.5 2.5-3.5 5.5 9z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
  own: '<path d="M7 3.5v17"/><path d="M7 14a5 5 0 0 1 5-5h6"/><path d="M15 6l3 3-3 3"/>',
  dash: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12h7"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8h.01"/>',
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
  alltag: { label: T('Alltag', 'Everyday'), short: T('Alltag', 'Everyday'), c: 'var(--k-green)' },
  philo: { label: T('Philosophen fragen', 'Ask the philosophers'), short: T('Philosophen', 'Philosophers'), c: 'var(--k-gold)' },
};
// Sammlungen mit Zwischenüberschriften (Konzept 3.10). Weitere Sammlungen erscheinen erst, wenn es Inhalte für sie gibt.
const COLLECTIONS = [
  { id: 'raetsel', sym: 'puzzle', title: T('Rätsel & Paradoxien', 'Puzzles & paradoxes'), sub: T('Knobeln, entscheiden, nachlesen', 'Think it through, decide, find out'),
    desc: T('Manche haben eine Lösung, manche nicht. Bei allen entscheidest du erst und siehst dann die Auflösung.', 'Some have an answer, some don’t. Either way, you decide first, then see the explanation.'),
    groups: [
      { kind: 'raetsel', title: T('Mit Lösung', 'With an answer'), ids: ['ziege', 'geburtstag', 'hilbert', 'achilles', 'affen', 'galilei', 'aufzug', 'zwillinge', 'olbers', 'maxwell', 'molyneux'] },
      { kind: 'paradox', title: T('Offene Paradoxien', 'Open paradoxes'), ids: ['haufen', 'theseus', 'luegner', 'hinrichtung', 'dornroeschen', 'grossvater', 'fermi'] },
      { kind: 'wahl', title: T('Entscheiden & Spiele', 'Decisions & games'), ids: ['newcomb', 'gefangene', 'buridan', 'pascal', 'allmende', 'ultimatum', 'petersburg'] },
    ] },
  { id: 'alltag', sym: 'home', fresh: true, title: T('Alltagsdilemmata', 'Everyday dilemmas'), sub: T('Was tust du, wenn …?', 'What would you do if…?'),
    desc: T('Fragen aus dem echten Leben. Nach deiner Antwort siehst du dieselbe Frage aus drei Blickwinkeln: Ergebnis, Grundsätze und Haltung.', 'Questions from real life. After you answer, you see the same question from three angles: outcome, principles and character.'),
    groups: [
      { kind: 'alltag', title: T('Geld, Arbeit & Einkauf', 'Money, work & shopping'), ids: ['a-wechselgeld', 'a-stempeluhr', 'a-butter'] },
      { kind: 'alltag', title: T('Nachbarn & unterwegs', 'Neighbours & out and about'), ids: ['a-kratzer', 'a-wlan', 'a-sitzplatz'] },
      { kind: 'alltag', title: T('Schule & Internet', 'School & online'), ids: ['a-pruefung', 'a-hausarbeit', 'a-foto', 'a-sterne'] },
      { kind: 'alltag', title: T('Freundschaft & Familie', 'Friends & family'), ids: ['a-geschenk', 'a-konzert', 'a-erbe', 'a-gesehen', 'a-diagnose'] },
    ] },
  { id: 'philo', sym: 'pillar', fresh: true, title: T('Philosophen fragen', 'Ask the philosophers'), sub: T('Eine Frage, vier große Denker', 'One question, four great thinkers'),
    desc: T('Kant, Mill, Aristoteles und Nietzsche antworten, oft mit einem Gast. Sinngemäß zusammengefasst, mit Fundstelle zum Nachlesen.', 'Kant, Mill, Aristotle and Nietzsche answer, often joined by a guest. Summarised in plain words, with a reference to look it up.'),
    groups: [
      { kind: 'philo', title: T('Richtig handeln', 'Doing right'), ids: ['p-absicht', 'p-versprechen', 'p-strafe', 'p-gefuehl'] },
      { kind: 'philo', title: T('Ich und die anderen', 'Me and others'), ids: ['p-familie', 'p-mitleid', 'p-neid', 'p-tiere'] },
      { kind: 'philo', title: T('Mein Leben', 'My life'), ids: ['p-selbstschaden', 'p-selbstliebe', 'p-gutesleben', 'p-freierwille'] },
    ] },
  { id: 'klassik', sym: 'book', title: T('Klassische Gedankenexperimente', 'Classic thought experiments'), sub: T('Die berühmten Fälle der Philosophie', 'Philosophy’s most famous cases'),
    desc: T('Moral, Bewusstsein, das Ich und das Wissen – die Fälle, über die Philosophinnen und Philosophen bis heute streiten.', 'Morality, consciousness, the self and knowledge – the cases philosophers still argue about.'),
    groups: [
      { kind: 'klassik', title: T('Moral', 'Morality'), ids: ['trolley', 'teich', 'schleier', 'gyges', 'karneades', 'omelas', 'luege'] },
      { kind: 'klassik', title: T('Bewusstsein', 'Consciousness'), ids: ['mary', 'china', 'zombie', 'fledermaus', 'spektrum', 'turing'] },
      { kind: 'klassik', title: T('Ich & Identität', 'Self & identity'), ids: ['teleporter', 'sumpfmann'] },
      { kind: 'klassik', title: T('Wissen & Wirklichkeit', 'Knowledge & reality'), ids: ['tank', 'hoehle', 'simulation', 'erlebnis', 'gettier', 'teekanne'] },
      { kind: 'klassik', title: T('Physik, die verblüfft', 'Physics to marvel at'), ids: ['katze', 'laplace'] },
    ] },
];
const THINK_BY_ID = new Map(THINK_ALL.map(t => [t.id, t]));
const thinkById = id => THINK_BY_ID.get(id);
const THINK_META = {}; // id -> { coll, group }
for (const c of COLLECTIONS) for (const g of c.groups) {
  g.ids = g.ids.filter(id => thinkById(id));
  for (const id of g.ids) THINK_META[id] = { coll: c, group: g };
}
const collById = id => COLLECTIONS.find(c => c.id === id);
// Sicherheitsnetz: Eine Frage ohne Platz in einer Sammlung landet bei den Klassikern, damit nichts verschwindet.
{ const kc = collById('klassik'), g = kc.groups[kc.groups.length - 1];
  for (const t of THINK_ALL) if (!THINK_META[t.id]) { g.ids.push(t.id); THINK_META[t.id] = { coll: kc, group: g }; } }
const collCards = c => c.groups.flatMap(g => g.ids).map(thinkById);
// Antworten: Text, [Text, Neigung] (für „Deine Standpunkte“) oder seit 2.6 { t: Text, l: Blickwinkel }
const optLabel = o => Array.isArray(o) ? o[0] : (o && typeof o === 'object' ? o.t : o);
const optLean = o => Array.isArray(o) ? o[1] : null;
const saveThink = () => store.set('think', state.think);
// Paare verwandter Fälle für den späteren Widerspruchs-Finder (Konzept 6, Version 2.7). Noch ohne Anzeige.
const THINK_PAIRS = [...new Set(THINK_ALL.flatMap(t => (t.pair || []).map(b => [t.id, b].sort().join(' '))))].map(k => k.split(' '));

// Jeden Tag eine andere Frage, in fester Reihenfolge – auf jedem Gerät dieselbe. Fragen mit heiklem Thema (care)
// kommen nie als Frage des Tages: Sie sollen niemanden ungefragt auf der Übersicht erwarten.
const DAILY_POOL = THINK_ALL.filter(t => !t.care);
function dailyThought(day = today()) {
  const [y, m, d] = day.split('-').map(Number);
  const n = DAILY_POOL.length;
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const step = [7, 11, 13, 17, 19, 23].find(x => gcd(x, n) === 1) || 1;
  return DAILY_POOL[(Math.floor(Date.UTC(y, m - 1, d) / 864e5) * step) % n];
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
  const d = DAILY_POOL.length ? dailyThought() : null;
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
  const show = () => { render(L.stack[L.stack.length - 1], L); if (!sheet.hidden) sheetShown(sheet); };
  const finish = () => {
    sheet.hidden = true;
    sheetHidden(sheet);
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
  L.redraw = () => { const y = scroller.scrollTop; show(); scroller.scrollTop = y; }; // neu zeichnen, Stelle behalten
  // Pfeil oben links: eine Ebene zurück (über den Verlauf, damit Zurück-Geste und Pfeil dasselbe tun)
  L.back = () => {
    if (L.stack.length <= 1) return L.closeAll();
    if (depth(history.state) === L.stack.length) { history.back(); return; }
    L.stack.pop();
    history.replaceState({ [key]: L.stack.length }, '');
    L.restore();
  };
  // Wegziehen: alles schließen und alle Ebenen aus dem Verlauf nehmen.
  // after: läuft gerade noch ein anderes Zurück im Verlauf (Leser darüber), erst danach die Ebenen entfernen.
  L.closeAll = async after => {
    L.stack.length = 0;
    finish();
    if (after) await after;
    const d = depth(history.state);
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
  else if (e.t === 'dyk') renderDykSheet();
  else if (e.t === 'fund') renderFundSheet(fundById(e.id) || FUND[0]);
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
const careLabel = t => t.care ? T('Thema: ', 'Topic: ') + t.care : (t.hint || '');
function cardRow(t) {
  const rec = state.think[t.id];
  const r = el('button', 'th-row');
  r.type = 'button';
  const rt = el('span', 'th-rt');
  rt.append(el('b', null, t.title), el('span', 'th-q', t.q));
  const topic = careLabel(t);
  if (topic) rt.append(el('span', 'th-care', topic));
  let st;
  if (!rec) st = chevEl();
  else {
    const puzzle = t.correct != null, ok = !puzzle || rec.a === t.correct;
    st = el('span', 'th-state' + (puzzle ? (ok ? ' ok' : ' no') : ''));
    st.append(symEl(ok ? 'checkc' : 'crossc'), el('span', 'vh', puzzle ? (ok ? T('richtig beantwortet', 'answered correctly') : T('beantwortet, nicht richtig', 'answered incorrectly')) : T('beantwortet', 'answered')));
  }
  r.append(icBox(t.icon), rt, st);
  r.onclick = () => thinkL.push({ t: 'card', id: t.id });
  return r;
}

function optButtons(opts, chosen, correct, onPick, mine = T('Deine Antwort', 'Your answer')) {
  const box = el('div', 'opts' + (chosen != null ? ' picked' : ''));
  // Rätsel mit Lösung: nach der Antwort gesperrt und eingefärbt – die Auflösung steht direkt darunter.
  const locked = correct != null && chosen != null;
  opts.forEach((o, i) => {
    const b = el('button', 'opt');
    b.type = 'button';
    const right = locked && i === correct, wrong = locked && i === chosen && i !== correct;
    b.setAttribute('aria-pressed', chosen === i ? 'true' : 'false');
    if (chosen === i) { b.classList.add('chosen'); b.append(el('span', 'yours', mine)); }
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
// Alltag: nach der Antwort „Was gibt den Ausschlag?“, danach drei Blickwinkel. Philosophen: die Stimmen und „Wem stimmst du zu?“.
function renderCard(t, fresh = false) {
  const rec = state.think[t.id];
  const meta = THINK_META[t.id], kind = KINDS[meta.group.kind];
  const entry = thinkL.top();
  $('think-title').textContent = t.title;
  const b = thinkBody;
  b.innerHTML = '';
  const k = el('span', 'th-kind');
  k.style.setProperty('--kc', kind.c);
  k.append(symEl(t.icon, 'in'), el('span', null, (dailyThought().id === t.id ? T('Frage des Tages · ', 'Question of the day · ') : '') + kind.label));
  b.append(k, el('h1', null, t.title));
  // Heikles Thema: zuerst nur der Hinweis. Die Frage erscheint erst auf Wunsch, Überspringen zählt nirgends.
  if (t.care && !rec && !(entry && entry.careOk)) {
    const box = el('section', 'think-care');
    const show = el('button', 'btn', T('Frage zeigen', 'Show question'));
    show.type = 'button';
    show.onclick = () => { if (entry) entry.careOk = true; renderCard(t); };
    box.append(icBox('info'), el('h2', null, careLabel(t)),
      el('p', null, T('Diese Frage berührt ein persönliches Thema. Lies nur weiter, wenn es für dich gerade passt. Wer überspringt, verpasst nichts, und nichts zählt dagegen.',
        'This question touches on a personal topic. Only read on if it feels right for you right now. Skipping it costs you nothing, and nothing counts against you.')),
      show, skipButton(t, meta));
    b.append(box);
    return;
  }
  if (t.hint) { const h = el('p', 'think-hint'); h.append(symEl('info', 'in'), el('span', null, t.hint)); b.append(h); }
  b.append(el('p', 'think-text', t.text), el('h2', 'think-q', t.q));
  const redraw = () => { const y = thinkScroll.scrollTop; renderCard(t); thinkScroll.scrollTop = y; };
  b.append(optButtons(t.opts, rec ? rec.a : null, t.correct, i => {
    const first = !state.think[t.id];
    if (!answerThink(t, i)) return;
    const y = thinkScroll.scrollTop;
    renderCard(t, first);
    thinkScroll.scrollTop = y;
    say(t.correct != null ? (i === t.correct ? T('Richtig!', 'Correct!') : T('Nicht ganz. Richtig ist: ', 'Not quite. The answer is: ') + optLabel(t.opts[t.correct]))
      : T('Deine Antwort: ', 'Your answer: ') + optLabel(t.opts[i]));
    // Nach der Antwort sanft zum neuen Abschnitt, damit die Rückmeldung sichtbar wird
    if (first) b.querySelector('.think-res > :first-child')?.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
  }));
  if (!rec) {
    b.append(el('p', 'think-note', T('Erst entscheiden, dann kommt die Auflösung.', 'Decide first, then see the explanation.')));
    if (t.care) b.append(skipButton(t, meta, 'link'));
    return;
  }

  const res = el('div', 'think-res' + (fresh ? ' fresh' : ''));
  b.append(res);
  if (t.correct != null) {
    const ok = rec.a === t.correct;
    const v = el('p', 'think-verdict ' + (ok ? 'ok' : 'no'));
    v.append(symEl(ok ? 'checkc' : 'crossc', 'in'), el('span', null, ok ? T('Richtig!', 'Correct!') : T('Nicht ganz. Richtig ist: ', 'Not quite. The answer is: ') + optLabel(t.opts[t.correct])));
    res.append(v);
  } else if (t.calm) {
    res.append(el('p', 'think-note', T('Du kannst deine Antwort jederzeit ändern.', 'You can change your answer at any time.'))); // „keine falsche Antwort“ sagt calm
  } else {
    res.append(el('p', 'think-note', T('Hier gibt es keine „richtige“ Antwort. Du kannst deine Antwort jederzeit ändern.', 'There’s no “right” answer here. You can change your answer at any time.')));
  }
  if (t.kind === 'alltag') { if (!renderAlltagRes(t, rec, res, redraw)) return; }
  else if (t.kind === 'philo') renderPhiloRes(t, rec, res, redraw);
  else {
    res.append(el('h3', null, T('Auflösung', 'Explanation')));
    for (const [head, txt] of t.args) res.append(el('h4', null, head), el('p', null, txt));
  }
  if (t.twist) {
    res.append(el('h3', null, T('Und wenn …?', 'What if…?')), el('p', null, t.twist.text), el('p', 'think-q2', t.twist.q));
    res.append(optButtons(t.twist.opts, rec.t, null, i => { rec.t = i; saveThink(); redraw(); }));
    if (rec.t != null) res.append(el('p', 'think-twistnote', t.twist.note));
  }
  if (t.info) res.append(el('h3', null, T('Hintergrund', 'Background')), el('p', null, t.info));
  if (t.wiki) {
    const wiki = el('button', 'btn ghost2', t.info ? T('Ganzen Artikel auf Wikipedia lesen', 'Read the full Wikipedia article') : T('Mehr dazu auf Wikipedia', 'More on Wikipedia'));
    wiki.type = 'button';
    wiki.onclick = () => openReader(t.wiki);
    res.append(wiki);
  }
  if (canShareFiles()) {
    const sh = el('button', 'btn ghost2 think-share');
    sh.type = 'button';
    sh.append(symEl('share', 'in'), el('span', null, T('Frage als Bild teilen', 'Share the question as an image')));
    sh.onclick = () => shareCardImage(t, kind);
    res.append(sh);
  }
  const nid = nextThinkId(t);
  if (!nid) res.append(el('p', 'think-note', T('Alle Fragen dieser Sammlung sind beantwortet.', 'All done: you’ve answered every question in this collection.')));
  const next = el('button', 'btn', nid ? T('Nächste Frage ›', 'Next question ›') : T('Zurück zur Sammlung', 'Back to the collection'));
  next.type = 'button';
  next.onclick = () => nid ? thinkGoto(nid) : thinkToColl(meta.coll);
  res.append(next);
}
// „Überspringen“: zur nächsten offenen Frage der Sammlung, ohne etwas zu speichern
function skipButton(t, meta, style) {
  const s = el('button', style === 'link' ? 'think-skip' : 'btn ghost2', T('Überspringen', 'Skip'));
  s.type = 'button';
  s.onclick = () => { const nid = nextThinkId(t); if (nid) thinkGoto(nid); else thinkToColl(meta.coll); };
  return s;
}

// Die drei Blickwinkel (Konzept 5.1). Die Namen sind dieselben wie später im Denkprofil.
const LENSES = {
  F: { name: T('Ergebnis', 'Outcome'), sub: T('was am Ende herauskommt', 'what comes out in the end'), c: 'var(--l-f)' },
  R: { name: T('Grundsätze', 'Principles'), sub: T('feste Regeln und Rechte', 'firm rules and rights'), c: 'var(--l-r)' },
  C: { name: T('Haltung', 'Character'), sub: T('was für ein Mensch du sein willst', 'what kind of person you want to be'), c: 'var(--l-c)' },
};
// Gründe in wechselnder, aber für jede Frage fester Reihenfolge (sonst springen die Knöpfe beim Neuzeichnen)
function reasonOrder(id) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return [['F', 'R', 'C'], ['R', 'C', 'F'], ['C', 'F', 'R'], ['F', 'C', 'R'], ['R', 'F', 'C'], ['C', 'R', 'F']][h % 6];
}
// Alltag: Schritt „Was gibt den Ausschlag?“ (gespeichert als w: 'F' | 'R' | 'C', '' = übersprungen), danach die Auflösung.
// Gibt false zurück, solange der Grund noch offen ist: Dann folgt darunter noch nichts.
function renderAlltagRes(t, rec, res, redraw) {
  const order = reasonOrder(t.id);
  res.append(el('h3', null, T('Was gibt für dich den Ausschlag?', 'What tips the balance for you?')));
  res.append(el('p', 'think-lead', T('Wähle den Grund, der für dich am meisten zählt.', 'Pick the reason that matters most to you.')));
  const picked = rec.w ? order.indexOf(rec.w) : null;
  res.append(optButtons(order.map(key => t.why[key]), picked, null, i => { rec.w = order[i]; saveThink(); redraw(); }, T('Dein Grund', 'Your reason')));
  if (rec.w == null) {
    const skip = el('button', 'think-skip', T('Überspringen', 'Skip'));
    skip.type = 'button';
    skip.onclick = () => { rec.w = ''; saveThink(); redraw(); };
    res.append(skip);
    return false;
  }
  res.append(el('h3', null, T('Drei Blickwinkel', 'Three angles')));
  if (t.calm) res.append(el('p', 'think-calm', t.calm));
  res.append(el('p', 'think-lead', T('Dieselbe Antwort kann man aus ganz verschiedenen Gründen geben. So sieht die Frage aus jedem Blickwinkel aus.',
    'You can give the same answer for quite different reasons. This is how the question looks from each angle.')));
  const near = (t.opts[rec.a] || {}).l;
  const wrap = el('div', 'lenses');
  for (const key of ['F', 'R', 'C']) {
    const L = LENSES[key];
    const box = el('section', 'lens' + (rec.w === key ? ' mine' : ''));
    box.style.setProperty('--lc', L.c);
    const head = el('div', 'lens-head');
    head.append(el('b', null, L.name), el('small', null, L.sub));
    box.append(head);
    const tags = el('div', 'lens-tags');
    if (near === key) tags.append(el('span', 'lens-tag', T('Nahe an deiner Antwort', 'Close to your answer')));
    if (rec.w === key) tags.append(el('span', 'lens-tag strong', T('Dein Grund', 'Your reason')));
    if (tags.childNodes.length) box.append(tags);
    box.append(el('p', null, t.lenses[key]));
    wrap.append(box);
  }
  res.append(wrap);
  if (rec.w && near && rec.w !== near) res.append(el('p', 'think-note', T(
    `Deine Antwort liegt nahe am Blickwinkel „${LENSES[near].name}“, dein Grund beim Blickwinkel „${LENSES[rec.w].name}“. Das ist kein Widerspruch: Was man tut und warum man es tut, gehört nicht immer zur selben Denkweise.`,
    `Your answer is close to the “${LENSES[near].name}” angle, your reason to “${LENSES[rec.w].name}”. That isn’t a contradiction: what you do and why you do it don’t always belong to the same way of thinking.`)));
  if (t.fact) res.append(el('h3', null, T('Gut zu wissen', 'Good to know')), el('p', null, t.fact));
  if (t.help) { const h = el('p', 'think-help'); h.append(symEl('info', 'in'), el('span', null, t.help)); res.append(h); }
  return true;
}

// Philosophen: Steckbriefe aus denken.js. Kurzname = letztes Wort des Namens (Kant, Mill, Beauvoir …).
const person = who => DENKEN.people[who] || { name: who, years: '', looks: '', idea: '' };
const personShort = who => person(who).name.split(' ').pop();
const FOUR = ['kant', 'mill', 'aristoteles', 'nietzsche'];
const SHE = new Set(['arendt', 'beauvoir']);
const quoteOpt = o => T('„', '“') + optLabel(o) + T('“', '”');
function renderPhiloRes(t, rec, res, redraw) {
  const near = t.voices.filter(v => v.fit.includes(rec.a)).map(v => personShort(v.who));
  res.append(el('h3', null, T('Was die Philosophen wohl sagen würden', 'What the philosophers would probably say')));
  res.append(el('p', 'think-lead', T('Sinngemäß zusammengefasst, keine wörtlichen Zitate. Viele dieser Fragen haben sich die Denker so nie gestellt: Hier werden ihre Grundgedanken übertragen.',
    'Summarised in plain words, not quoted. Many of these questions were never put to the thinkers in this form: their basic ideas are applied here.')));
  const sum = el('p', 'think-lead');
  if (near.length) sum.append(T('Deiner Antwort am nächsten: ', 'Closest to your answer: '), el('b', null, near.join(', ')));
  else sum.textContent = T('Keiner der Denker wählt genau deine Antwort. Auch das kommt vor.', 'None of the thinkers picks exactly your answer. That happens too.');
  res.append(sum);
  const list = el('div', 'voices');
  for (const v of t.voices) {
    const p = person(v.who), fits = v.fit.includes(rec.a), guest = !FOUR.includes(v.who), she = SHE.has(v.who);
    const box = el('section', 'voice' + (fits ? ' near' : ''));
    if (rec.p === v.who) box.append(el('span', 'badge', T('Deine Wahl', 'Your pick')));
    const vh = el('button', 'voice-head');
    vh.type = 'button';
    vh.setAttribute('aria-label', T(`${p.name}: mehr auf Wikipedia`, `${p.name}: more on Wikipedia`));
    vh.onclick = () => openReader(p.wiki);
    const mono = el('span', 'mono', personShort(v.who)[0]);
    mono.setAttribute('aria-hidden', 'true');
    const nm = el('span', 'vh-name');
    nm.append(el('b', null, p.name), el('small', null, [p.years, p.looks, guest ? T('Gast', 'guest') : ''].filter(Boolean).join(' · ')));
    vh.append(mono, nm, chevEl());
    const idea = el('p', 'idea');
    idea.append(el('em', null, T('Leitidee: ', 'Key idea: ')), p.idea);
    const say = el('p', 'say');
    say.append(el('b', null, she ? T('So sähe sie es wohl: ', 'How she would probably see it: ') : T('So sähe er es wohl: ', 'How he would probably see it: ')), v.says);
    box.append(vh, idea, say);
    if (v.dispute) { const d = el('p', 'dispute'); d.append(el('b', null, T('Zur Einordnung: ', 'For context: ')), v.dispute); box.append(d); }
    box.append(el('p', 'src', T('Fundstelle: ', 'Source: ') + v.read));
    const fit = el('div', 'fit' + (fits ? ' yes' : ''));
    if (fits) fit.append(symEl('checkc', 'in'), el('span', null, T('Passt zu deiner Antwort', 'Fits your answer')));
    else if (!v.fit.length) fit.append(symEl('own', 'in'), el('span', null, T('Geht einen eigenen Weg', she ? 'Goes her own way' : 'Goes his own way')));
    else fit.append(symEl('dash', 'in'), el('span', null, T('Würde eher wählen: ', 'Would rather pick: ') + v.fit.map(i => quoteOpt(t.opts[i])).join(T(' oder ', ' or '))));
    box.append(fit);
    list.append(box);
  }
  res.append(list);
  res.append(el('h3', null, T('Wem stimmst du am ehesten zu?', 'Who do you agree with most?')));
  const who = el('div', 'who');
  for (const v of t.voices) {
    const c = el('button', 'tchip' + (rec.p === v.who ? ' on' : ''), personShort(v.who));
    c.type = 'button';
    c.setAttribute('aria-pressed', rec.p === v.who ? 'true' : 'false');
    c.onclick = () => { rec.p = v.who; saveThink(); redraw(); };
    who.append(c);
  }
  res.append(who);
  // Philosophen-Barometer: wie oft du bisher wem zugestimmt hast (nur Philosophen-Karten)
  const count = {};
  for (const id of collById('philo').groups.flatMap(g => g.ids)) { const r = state.think[id]; if (r && r.p) count[r.p] = (count[r.p] || 0) + 1; }
  const top = Object.entries(count).sort((a, b) => b[1] - a[1]);
  if (top.length) {
    const baro = el('p', 'baro');
    baro.append(T('Dein Philosophen-Barometer bisher: ', 'Who you’ve agreed with so far: '), el('b', null, top.map(([w, n]) => personShort(w) + ' ' + n).join(' · ')));
    res.append(baro);
  }
  if (t.stats) res.append(el('h3', null, T('So sehen es Fachleute', 'What experts think')), el('p', null, t.stats.txt), el('p', 'src', T('Quelle: ', 'Source: ') + t.stats.src));
}

// ---------- Frage als Bild teilen ----------
// Die Zeichenfläche entsteht erst beim Tippen und wird gleich nach dem Umwandeln wieder freigegeben (Breite/Höhe 0).
// Aufs Bild kommen nur Art, Titel, Lage und Frage, nie die eigene Antwort. Ohne Teilen von Dateien gibt es den Knopf nicht.
let shareFilesOk = null;
function canShareFiles() {
  if (shareFilesOk == null) {
    try { shareFilesOk = !!(navigator.canShare && navigator.canShare({ files: [new File([new Blob(['x'])], 'x.png', { type: 'image/png' })] })); }
    catch { shareFilesOk = false; }
  }
  return shareFilesOk;
}
function cssColor(value) {
  const probe = el('span');
  probe.style.color = value;
  thinkBody.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}
function wrapLines(g, text, width, max) {
  const words = String(text).split(/\s+/), lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (g.measureText(test).width > width && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  if (lines.length > max) { lines.length = max; lines[max - 1] = lines[max - 1].replace(/\s*\S*$/, '') + ' …'; }
  return lines;
}
async function shareCardImage(t, kind) {
  const W = 1080, H = 1350, P = 96, CW = W - 2 * P;
  const col = { bg: cssColor('var(--bg)'), text: cssColor('var(--text)'), muted: cssColor('var(--muted)'), kind: cssColor(kind.c), accent: cssColor('var(--accent)') };
  const serif = getComputedStyle(document.documentElement).getPropertyValue('--serif').trim() || 'Georgia, serif';
  const sans = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  let cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.fillStyle = col.bg; g.fillRect(0, 0, W, H);
  g.globalAlpha = .16; g.fillStyle = col.kind;
  g.beginPath(); g.arc(W - 60, 80, 420, 0, Math.PI * 2); g.fill();
  g.globalAlpha = 1; g.textBaseline = 'top';
  // Erst umbrechen und messen, dann den Block senkrecht mittig setzen
  const fTitle = `800 84px ${serif}`, fText = `400 40px ${sans}`, fQ = `700 50px ${sans}`;
  g.font = fTitle; const lt = wrapLines(g, t.title, CW, 3);
  g.font = fText; const lx = wrapLines(g, t.text, CW, 7);
  g.font = fQ; const lq = wrapLines(g, t.q, CW, 3);
  const total = 80 + lt.length * 96 + 30 + lx.length * 58 + 40 + lq.length * 66;
  let y = Math.max(P + 20, Math.round((H - total) / 2) - 40);
  g.font = `700 34px ${sans}`; g.fillStyle = col.kind;
  g.fillText(kind.label.toUpperCase(), P, y); y += 80;
  g.font = fTitle; g.fillStyle = col.text;
  for (const l of lt) { g.fillText(l, P, y); y += 96; }
  y += 30;
  g.font = fText; g.fillStyle = col.muted;
  for (const l of lx) { g.fillText(l, P, y); y += 58; }
  y += 40;
  g.font = fQ; g.fillStyle = col.text;
  for (const l of lq) { g.fillText(l, P, y); y += 66; }
  g.font = `600 32px ${sans}`; g.fillStyle = col.accent;
  g.fillText(T('WikiFeed · Was meinst du?', 'WikiFeed · What do you think?'), P, H - P - 32);
  const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
  cv.width = cv.height = 0; cv = null; // Speicher sofort freigeben
  if (!blob) { toast(T('Das Bild ließ sich nicht erzeugen. Versuche es noch einmal.', 'The image couldn’t be created. Try again.')); return; }
  const file = new File([blob], `wikifeed-${t.id}.png`, { type: 'image/png' });
  try { await navigator.share({ files: [file], title: t.title }); }
  catch (e) { if (e && e.name !== 'AbortError') toast(T('Teilen hat nicht geklappt. Versuche es noch einmal.', 'Couldn’t share. Try again.')); }
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
    box.append(el('p', 'th-hint', T(`Ab ${AXIS_MIN} Antworten zu Moral, Bewusstsein oder dazu, was dich ausmacht, siehst du hier, wohin du neigst. Die Fragen dazu stehen unter „Klassische Gedankenexperimente“, eine auch unter „Rätsel & Paradoxien“.`,
      `After ${AXIS_MIN} answers on morality, consciousness or what makes you you, you’ll see here where you lean. You’ll find these questions under “Classic thought experiments”, and one under “Puzzles & paradoxes”.`)));
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
    bar.setAttribute('aria-label', ax.name + T(': ', ': ') + (avg < -.34 ? T('eher ', 'leaning to ') + ax.ends[0] : avg > .34 ? T('eher ', 'leaning to ') + ax.ends[1] : T('ausgewogen', 'balanced')));
    const ends = el('div', 'th-axis-ends');
    ends.append(el('span', null, ax.ends[0]), el('span', null, ax.ends[1]));
    row.append(top, bar, ends);
    wrap.append(row);
  }
  wrap.append(el('p', 'th-foot', T('Der Punkt zeigt, wohin deine bisherigen Antworten neigen. In der Mitte heißt: mal so, mal so.', 'The dot shows where your answers so far lean. The middle means: sometimes one way, sometimes the other.')));
  box.append(wrap);
}

// Ebene 1: die Übersicht im Tab, zweigeteilt in „Entscheiden“ und „Staunen“ (Umschalter oben, die Wahl bleibt).
// Jeder Teil wird einmal aufgebaut, danach werden nur Zahlen und Texte aktualisiert.
const THINK_PARTS = {
  decide: [T('Fragen ohne einfache Antwort.', 'Questions without easy answers.'), T('Entscheide dich – dann vergleiche.', 'Decide – then compare.')],
  wonder: [T('Jeden Tag neue Fakten.', 'New facts every day.'), T('Und Dinge, hinter denen mehr steckt.', 'And everyday things with a story behind them.')],
};
let thinkPart = store.get('thinkPart', 'decide') === 'wonder' ? 'wonder' : 'decide';
function setThinkPart(part, save = true, draw = true) {
  thinkPart = part;
  if (save) store.set('thinkPart', part);
  document.querySelectorAll('#think-seg button').forEach(b => {
    const on = b.dataset.part === part;
    b.classList.toggle('on', on);
    b.setAttribute('aria-selected', on);
    b.tabIndex = on ? 0 : -1;
  });
  $('think-decide').hidden = part !== 'decide';
  $('think-wonder').hidden = part !== 'wonder';
  const sub = $('think-sub');
  sub.textContent = '';
  for (const line of THINK_PARTS[part]) sub.append(el('span', null, line));
  if (draw) renderDenken();
}
document.querySelectorAll('#think-seg button').forEach(b => {
  b.onclick = () => { if (b.dataset.part !== thinkPart) setThinkPart(b.dataset.part); };
});
const dk = { built: false };
function renderDenken() {
  if (thinkPart === 'wonder') return renderStaunen();
  if (!THINK_ALL.length) return;
  if (!dk.built) buildDenken();
  updateDenken();
}
function buildDenken() {
  const box = $('think-decide');
  box.innerHTML = '';
  dk.daily = el('section', 'th-daily');
  dk.daily.setAttribute('aria-label', T('Frage des Tages', 'Question of the day'));
  dk.daily.onclick = () => thinkL.open({ t: 'card', id: dailyThought().id });
  box.append(dk.daily, el('h2', 'th-sec', T('Entdecken', 'Discover')));
  const g = el('div', 'th-group');
  dk.rows = [];
  for (const c of COLLECTIONS) {
    if (!collCards(c).length) continue; // Inhaltsdatei fehlt: Sammlung nicht zeigen
    const r = el('button', 'th-row');
    r.type = 'button';
    const rt = el('span', 'th-rt'), meta = el('span', 'th-meta'), mini = el('span', 'th-mini'), fill = el('i'), txt = el('span');
    const nw = el('span', 'th-new', T('Neu', 'New'));
    mini.append(fill);
    meta.append(mini, txt);
    if (c.fresh) meta.append(nw);
    rt.append(el('b', null, c.title), el('span', 'th-q', c.sub), meta);
    r.append(icBox(c.sym), rt, chevEl());
    r.onclick = () => thinkL.open({ t: 'coll', id: c.id });
    g.append(r);
    dk.rows.push({ c, mini, fill, txt, nw });
  }
  box.append(g);
  if (typeof openTrolley === 'function') {
    box.append(el('h2', 'th-sec', T('Spielen', 'Play')));
    const tb = el('button', 'th-trolley');
    tb.type = 'button';
    const rt = el('span', 'th-rt');
    rt.append(el('b', null, T('Das Trolley-Spiel', 'The trolley game')),
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
  s.append(k, icBox(d.icon), el('h2', null, d.title));
  if (!rec) {
    s.append(el('p', 'th-dtext', d.text), el('p', 'th-dq', d.q));
    const go = el('button', 'btn th-wide', T('Jetzt entscheiden ›', 'Decide now ›'));
    go.type = 'button';
    s.append(go);
  } else {
    const ch = el('p', 'th-dq');
    ch.append(T('Deine Antwort: ', 'Your answer: '), el('b', null, optLabel(d.opts[rec.a])));
    const go = el('button', 'btn ghost2 th-wide', T('Auflösung ansehen ›', 'See the explanation ›'));
    go.type = 'button';
    s.append(el('p', 'th-dtext', d.q), ch, go, el('p', 'th-later', T('Morgen gibt es eine neue Frage.', 'A new question tomorrow.')));
  }
  // Sammlungen: Fortschritt je Zeile
  for (const r of dk.rows) {
    const p = collProgress(r.c);
    r.mini.hidden = !p.done;
    r.nw.hidden = !!p.done; // „Neu“, bis die erste Frage der Sammlung beantwortet ist
    r.fill.style.width = (p.done / p.n * 100) + '%';
    r.txt.textContent = p.done ? T(`${p.done} von ${p.n} beantwortet`, `${p.done} of ${p.n} answered`) : T(`${p.n} Fragen`, `${p.n} questions`);
  }
  renderStandpoints(dk.you);
  updateThinkDot();
}

// ---------- Staunen: „Schon gewusst?“ ----------
// Kurze Fakten aus dem Tages-Feed der Wikipedia (Feld „dyk“). Den Feed gibt es nur für den laufenden Tag,
// deshalb hebt die App die Fakten der letzten 7 Tage auf (je Sprache getrennt, nur Text und Link-Ziele).
const DYK_DAYS = 7;
const dayNum = d => { const [y, m, dd] = d.split('-').map(Number); return Math.floor(Date.UTC(y, m - 1, dd) / 864e5); };
function dykDays() {
  const st = lstore.get('dyk', null), now = dayNum(today());
  return (st && Array.isArray(st.days) ? st.days : [])
    .filter(d => d && typeof d.day === 'string' && Array.isArray(d.items) && d.items.length && dayNum(d.day) <= now && dayNum(d.day) > now - DYK_DAYS)
    .sort((a, b) => dayNum(b.day) - dayNum(a.day));
}
// Link-Ziel aus einem Wikipedia-Link („https://de.wikipedia.org/wiki/Titel“ oder „./Titel“), sonst null
function wikiTitleOf(href) {
  try {
    const u = new URL(href || '', 'https://' + WIKI.host + '/wiki/');
    if (u.hostname !== WIKI.host || !u.pathname.startsWith('/wiki/')) return null;
    const t = decodeURIComponent(u.pathname.slice(6)).replace(/_/g, ' ').trim();
    return t && !WIKI.ns.test(t) ? t : null;
  } catch { return null; }
}
// Ein Fakt als Folge von Textstücken: { t: Text, a: Link-Ziel, i: kursiv }. Kein HTML wird gespeichert.
function dykParse(html) {
  const doc = sanitize(new DOMParser().parseFromString(html, 'text/html'));
  const parts = [];
  let main = null, first = null;
  const add = (t, a, i) => {
    if (!t) return;
    const last = parts[parts.length - 1];
    if (last && !last.a && !a && !!last.i === !!i) last.t += t;
    else parts.push({ t, ...(a ? { a } : {}), ...(i ? { i: 1 } : {}) });
  };
  const walk = (n, i, b) => {
    for (const c of n.childNodes) {
      if (c.nodeType === 3) add(c.nodeValue, null, i);
      else if (c.nodeType !== 1 || /^(STYLE|SUP|SCRIPT)$/.test(c.tagName)) continue;
      else if (c.tagName === 'A') {
        const t = wikiTitleOf(c.getAttribute('href'));
        add(c.textContent, t, i);
        if (t) { if (b && !main) main = t; if (!first) first = t; }
      } else walk(c, i || /^(I|EM)$/.test(c.tagName), b || /^(B|STRONG)$/.test(c.tagName));
    }
  };
  walk(doc.body, false, false);
  if (!first) return null;
  // Lesbar machen, ohne am Inhalt etwas zu ändern: Leerraum, Bildhinweise („pictured“ – das Bild zeigt die App
  // nicht) und die englische Teaser-Form „... that …?“ wird zum Aussagesatz.
  let teaser = false;
  for (const p of parts) {
    p.t = p.t.replace(/[ \t\r\n]+/g, ' ');
    if (!p.a) p.t = p.t.replace(/\s*\((?:[^()]*\s)?pictured\)/gi, '').replace(/\s*\((?:im |auf dem )?Bild(?: links| rechts| oben| unten| Mitte)?\)/g, '');
  }
  if (parts[0] && !parts[0].a) {
    const t = parts[0].t.replace(/^\s*(?:\.\.\.|…)\s*(?:that|dass),?\s*/i, '');
    if (t !== parts[0].t) { teaser = true; parts[0].t = t; }
  }
  const ps = parts.filter(p => p.t);
  for (let k = 1; k < ps.length; k++) {
    if (/\s$/.test(ps[k - 1].t) || /[(„“"']$/.test(ps[k - 1].t)) ps[k].t = ps[k].t.replace(/^\s+/, '');
    ps[k].t = ps[k].t.replace(/^\s+(?=[,.;:!?)])/, '');
  }
  if (!ps.length) return null;
  ps[0].t = ps[0].t.replace(/^\s+/, '').replace(/^\p{Ll}/u, c => c.toLocaleUpperCase(LANG));
  const last = ps[ps.length - 1];
  last.t = last.t.replace(/\s+$/, '');
  if (teaser && !last.a) last.t = last.t.replace(/\?$/, '.');
  return { p: ps, m: main || first };
}
function dykItems(list) {
  const out = [], seen = new Set();
  for (const x of Array.isArray(list) ? list : []) {
    let it = null;
    try { it = dykParse(String(x?.html || '')); } catch {}
    const key = it && it.p.map(p => p.t).join('');
    if (!it || seen.has(key)) continue; // die deutsche Liste enthält manche Fakten doppelt
    seen.add(key);
    out.push(it);
    if (out.length >= 20) break;
  }
  return out;
}
// Neue Fakten eines Tages zu den schon gespeicherten dazulegen (die englische Liste wechselt manchmal mittags).
function storeDyk(day, j) {
  const items = dykItems(j?.dyk);
  if (!items.length || day !== today()) return;
  const days = dykDays();
  const cur = days.find(d => d.day === day);
  if (cur) {
    const have = new Set(cur.items.map(it => it.p.map(p => p.t).join('')));
    const add = items.filter(it => !have.has(it.p.map(p => p.t).join('')));
    if (!add.length) return;
    cur.items = add.concat(cur.items).slice(0, 20);
  } else days.unshift({ day, items });
  lstore.set('dyk', { days: days.slice(0, DYK_DAYS) });
}
// Heutige Fakten holen, falls noch nicht da. Fehlen sie (offline, kurz nach Mitternacht), frühestens nach 15 Minuten wieder.
let dykTry = 0;
async function loadDyk() {
  const day = today();
  if (dykDays().some(d => d.day === day) || Date.now() - dykTry < 15 * 60e3 || navigator.onLine === false) return false;
  dykTry = Date.now();
  featuredMem.delete(day);
  try { await featuredFeed(day); } catch { return false; }
  return dykDays().some(d => d.day === day);
}
// Fakt als Text; Links sind farbig. Antippen öffnet den angetippten Link, sonst den Hauptartikel.
function dykButton(it) {
  const b = el('button', 'dyk-fact');
  b.type = 'button';
  const txt = el('span', 'dyk-txt');
  for (const p of it.p) {
    const node = p.a ? el('span', 'dyk-a', p.i ? null : p.t) : (p.i ? el('i') : document.createTextNode(p.t));
    if (p.a) { node.dataset.t = p.a; if (p.i) node.append(el('i', null, p.t)); }
    else if (p.i) node.textContent = p.t;
    txt.append(node);
  }
  b.append(txt, chevEl());
  b.onclick = e => { const a = e.target.closest('.dyk-a'); openReader(a ? a.dataset.t : it.m); };
  return b;
}
function dayLabel(day) {
  const diff = dayNum(today()) - dayNum(day);
  if (diff === 0) return T('Heute', 'Today');
  if (diff === 1) return T('Gestern', 'Yesterday');
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(LANG === 'en' ? 'en-GB' : LANG === 'fr' ? 'fr-FR' : 'de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
}
// Ebene 2: alle aufgehobenen Fakten, nach Tagen
function renderDykSheet() {
  $('think-title').textContent = T('Schon gewusst?', 'Did you know?');
  const b = thinkBody;
  b.innerHTML = '';
  const head = el('header', 'tc-head');
  head.append(icBox('spark', 'big'), el('h1', null, T('Schon gewusst?', 'Did you know?')),
    el('p', 'tc-desc', T('Kurze Fakten von der Hauptseite der Wikipedia, jeden Tag andere, meist aus neuen Artikeln. Antippen öffnet den Artikel.',
      'Short facts from the Wikipedia main page, new every day and mostly from new articles. Tap one to open the article.')),
    el('p', 'tc-stats', T('Fakten von Tagen, an denen du die App geöffnet hast, bleiben eine Woche hier.', 'Facts from days you opened the app stay here for a week.')));
  b.append(head);
  const days = dykDays();
  if (!days.length) b.append(el('p', 'think-note', T('Noch keine Fakten da. Sie kommen, sobald du online bist.', 'No facts yet. They’ll appear once you’re online.')));
  for (const d of days) {
    b.append(el('h2', 'tc-sec', dayLabel(d.day)));
    const g = el('div', 'th-group');
    for (const it of d.items) g.append(dykButton(it));
    b.append(g);
  }
  b.append(el('p', 'th-foot dyk-src', T('Quelle: Rubrik „Schon gewusst?“ der Wikipedia-Hauptseite, Text unter CC BY-SA 4.0.', 'Source: the “Did you know” section of the Wikipedia main page, text under CC BY-SA 4.0.')));
}

// ---------- Staunen: Fundstücke ----------
// Ein Alltagsding als Einstieg, dann 4–6 Wikipedia-Artikel in fester Reihenfolge. Fortschritt je Fundstück:
// lstore 'fund' = { id: { r: [gelesene Schritte], c: zuletzt geöffneter Schritt } }.
const fundById = id => FUND.find(f => f.id === id);
function fundStep(th) {
  const f = th && fundById(th.id), step = f?.steps[th.i];
  return step ? { f, i: th.i, n: f.steps.length, step } : null;
}
function fundProg(f) {
  const p = lstore.get('fund', {})[f.id] || {};
  const n = f.steps.length;
  const read = new Set((Array.isArray(p.r) ? p.r : []).filter(i => Number.isInteger(i) && i >= 0 && i < n));
  const c = Number.isInteger(p.c) && p.c >= 0 && p.c < n ? p.c : null;
  // Hier geht es weiter: beim zuletzt geöffneten Schritt, falls noch ungelesen, sonst beim nächsten ungelesenen
  let next = 0;
  if (read.size < n) for (let k = 0; k < n; k++) { const i = ((c ?? 0) + k) % n; if (!read.has(i)) { next = i; break; } }
  return { read, c, n, next, done: read.size === n };
}
function fundSave(id, fn) {
  const all = lstore.get('fund', {});
  const p = all[id] && typeof all[id] === 'object' ? all[id] : {};
  if (fn(p) === false) return;
  all[id] = p;
  lstore.set('fund', all);
}
const fundSeen = (id, i) => fundSave(id, p => { if (p.c === i) return false; p.c = i; });
const fundRead = (id, i) => fundSave(id, p => { const r = Array.isArray(p.r) ? p.r : []; if (r.includes(i)) return false; p.r = [...r, i].sort((a, b) => a - b); });
function fundOpen(f, i) {
  fundSeen(f.id, i);
  openReader(f.steps[i].title, null, 0, null, { thread: { id: f.id, i } });
}
const stepsLabel = f => T(`${f.steps.length} Schritte`, `${f.steps.length} steps`);
const progLabel = p => p.read.size ? T(`${p.read.size} von ${p.n} gelesen`, `${p.read.size} of ${p.n} read`) : null;
function fundGoLabel(p) {
  if (p.done) return T('Neu beginnen', 'Start over');
  if (!p.read.size && !p.next) return T('Mit Schritt 1 beginnen', 'Start with step 1');
  return T(`Weiterlesen bei Schritt ${p.next + 1}`, `Continue with step ${p.next + 1}`);
}
// Das Einstiegsbild: Hauptbild des Artikels, mit Bildnachweis. Ohne Bild bleibt der Platz leer (kein Rahmen).
const imgMem = new Map();
function pageImage(title, size, urgent = false) {
  const key = size + '|' + title;
  if (imgMem.size > 60) imgMem.clear();
  if (!imgMem.has(key)) imgMem.set(key, api({ titles: title, redirects: '1', prop: 'pageimages', piprop: 'thumbnail', pithumbsize: String(size) }, urgent)
    .then(d => d.query?.pages?.[0]?.thumbnail?.source || null).catch(() => { imgMem.delete(key); return null; }));
  return imgMem.get(key);
}
function fundFigure(f, size) {
  const fig = el('div', 'fd-fig');
  fig.hidden = true;
  const img = el('img');
  img.alt = '';
  img.decoding = 'async';
  const cr = el('a', 'fd-credit');
  cr.target = '_blank'; cr.rel = 'noopener'; cr.hidden = true;
  cr.onclick = e => e.stopPropagation();
  fig.append(img, cr);
  pageImage(f.image || f.steps[0].title, size).then(u => {
    if (!u || !fig.isConnected) return;
    img.onload = () => { fig.hidden = false; };
    img.src = u;
    imageCredit(u).then(c => {
      if (!c) return;
      cr.textContent = T('Bild: ', 'Image: ') + [c.artist || 'Wikimedia Commons', c.license].filter(Boolean).join(' · ');
      cr.href = c.page;
      cr.hidden = false;
    });
  });
  return fig;
}
// Ebene 2: das Fundstück – Bild, Frage, Knopf und die Schritte (gelesene mit Haken)
function renderFundSheet(f) {
  if (!f) return;
  $('think-title').textContent = f.object;
  const b = thinkBody;
  b.innerHTML = '';
  const p = fundProg(f);
  const k = el('span', 'th-kind');
  k.append(el('span', 'caps', T('Fundstück', 'Curiosity')), document.createTextNode('· ' + (progLabel(p) || stepsLabel(f))));
  b.append(fundFigure(f, 900), k, el('h1', null, f.object), el('h2', 'think-q', f.q || T('Was steckt dahinter?', 'What’s behind it?')));
  if (f.teaser) b.append(el('p', 'think-text fd-teaser', f.teaser));
  const go = el('button', 'btn', fundGoLabel(p));
  go.type = 'button';
  go.onclick = () => fundOpen(f, p.next);
  b.append(go, el('h3', null, T('Die Schritte', 'The steps')));
  const g = el('div', 'th-group');
  f.steps.forEach((s, i) => {
    const r = el('button', 'th-row fd-row');
    r.type = 'button';
    const num = el('span', 'fd-num' + (p.read.has(i) ? ' done' : ''));
    if (p.read.has(i)) num.append(symEl('check'), el('span', 'vh', T(`Schritt ${i + 1}, gelesen`, `Step ${i + 1}, read`)));
    else num.textContent = i + 1;
    const rt = el('span', 'th-rt');
    rt.append(el('b', null, s.title));
    r.append(num, rt, chevEl());
    r.onclick = () => fundOpen(f, i);
    g.append(r);
  });
  b.append(g, el('p', 'th-foot fd-foot', T('Jeder Schritt ist ein Wikipedia-Artikel. Unten im Artikel geht es zum nächsten.', 'Each step is a Wikipedia article. At the end of each one, you can go on to the next.')));
}
// Im Leser: oben „Der Bleistift · Schritt 2 von 5“, unter dem Titel der Verbindungssatz, unten Weiter und Zurück
function fundKicker(fs) {
  return el('div', 'fd-kick wf-x', `${fs.f.object} · ` + T(`Schritt ${fs.i + 1} von ${fs.n}`, `Step ${fs.i + 1} of ${fs.n}`));
}
function fundNav(fs) {
  const { f, i, n } = fs;
  const box = el('div', 'fd-nav wf-x');
  box.dataset.id = f.id;
  box.dataset.i = i;
  const dots = el('span', 'fd-dots');
  dots.setAttribute('aria-hidden', 'true');
  for (let k = 0; k < n; k++) dots.append(el('i', k <= i ? 'on' : null));
  box.append(dots, el('p', 'fd-step', T(`Schritt ${i + 1} von ${n}`, `Step ${i + 1} of ${n}`)));
  if (i < n - 1) {
    const nx = el('button', 'btn fd-next');
    nx.type = 'button';
    nx.append(el('span', null, T('Weiter', 'Next')), el('small', null, f.steps[i + 1].title));
    nx.onclick = () => { fundRead(f.id, i); fundSeen(f.id, i + 1); openReader(f.steps[i + 1].title, null, 0, null, { thread: { id: f.id, i: i + 1 } }); };
    box.append(nx);
  } else {
    const done = el('button', 'btn fd-next', T('Fertig', 'Done'));
    done.type = 'button';
    done.onclick = () => { fundRead(f.id, i); closeReaderAll(); if (fundProg(f).done) toast(T('Alle Schritte gelesen', 'All steps read')); };
    box.append(done);
  }
  if (i > 0) {
    const bk = el('button', 'btn ghost2 fd-prev', T(`Zurück zu Schritt ${i}`, `Back to step ${i}`));
    bk.type = 'button';
    bk.onclick = () => {
      const prev = readerStack[readerStack.length - 2];
      fundSeen(f.id, i - 1);
      if (prev?.thread?.id === f.id && prev.thread.i === i - 1) readerBack(false);
      else readerReplace(f.steps[i - 1].title, { thread: { id: f.id, i: i - 1 } });
    };
    box.append(bk);
  }
  return box;
}
// Den obersten Artikel durch einen anderen ersetzen (Zurück im Fundstück, wenn der vorige Schritt nicht im Stapel liegt)
function readerReplace(title, opts) {
  const e = { title, item: null, scroll: 0, ...opts };
  readerStack[readerStack.length - 1] = e;
  heroFor(e);
  saveSnapSoon();
  renderArticle(title);
}
// Wegziehen im Fundstück: Leser und Fundstück-Blatt schließen; die Ebenen des Blatts erst nach dem Zurück des Lesers entfernen
function closeFundAll() {
  closeReaderAll();
  if (!thinkEl.hidden) thinkL.closeAll(popPending);
}
// Jeden Tag ein anderes Fundstück, in fester Reihenfolge (wie die Frage des Tages)
function dailyFund(day = today()) {
  const n = FUND.length, gcd = (a, b) => b ? gcd(b, a % b) : a;
  if (!n) return null;
  const step = [7, 11, 13, 17].find(x => gcd(x, n) === 1) || 1;
  return FUND[(dayNum(day) * step) % n];
}

// Ebene 1, Teil „Staunen“: Karte „Heute“ (ein Fakt + das Fundstück des Tages), „Schon gewusst?“, alle Fundstücke
const sn = { built: false };
function renderStaunen() {
  if (!sn.built) buildStaunen();
  updateStaunen();
  loadDyk().then(ok => { if (ok && thinkPart === 'wonder') updateStaunen(); });
}
function buildStaunen() {
  const box = $('think-wonder');
  box.innerHTML = '';
  sn.today = el('section', 'th-daily st-today');
  sn.today.setAttribute('aria-label', T('Heute', 'Today'));
  sn.dyk = el('div');
  box.append(sn.today, sn.dyk);
  sn.rows = [];
  if (FUND.length) {
    box.append(el('h2', 'th-sec', T('Fundstücke', 'Curiosities')));
    const g = el('div', 'th-group');
    for (const f of FUND) {
      const r = el('button', 'th-row');
      r.type = 'button';
      const rt = el('span', 'th-rt'), meta = el('span', 'th-meta'), mini = el('span', 'th-mini'), fill = el('i'), txt = el('span'), state = el('span', 'st-state');
      mini.append(fill);
      meta.append(mini, txt);
      rt.append(el('b', null, f.object), el('span', 'th-q', f.teaser || f.q || ''), meta);
      r.append(icBox('trail'), rt, state);
      r.onclick = () => thinkL.open({ t: 'fund', id: f.id });
      g.append(r);
      sn.rows.push({ f, mini, fill, txt, state });
    }
    box.append(g);
  }
  sn.fig = null;
  sn.built = true;
}
function updateStaunen() {
  const days = dykDays(), d0 = days[0]?.day === today() ? days[0] : null;
  const f = dailyFund();
  // Karte „Heute“ – was fehlt, wird ausgeblendet, nie leer gezeigt
  const s = sn.today;
  s.textContent = '';
  s.hidden = !d0 && !f;
  const k = el('span', 'th-kind');
  k.append(el('span', 'caps', T('Heute', 'Today')));
  s.append(k);
  // Auf der Karte der kürzeste Fakt des Tages: am schnellsten gelesen, die übrigen stehen unter „Alle Fakten“
  const len = it => it.p.reduce((a, p) => a + p.t.length, 0);
  if (d0) s.append(el('p', 'st-label', T('Schon gewusst?', 'Did you know?')), dykButton(d0.items.reduce((a, b) => len(b) < len(a) ? b : a)));
  if (f) {
    const p = fundProg(f);
    // Das Bild nur einmal laden, solange es dasselbe Fundstück ist
    if (!sn.fig || sn.figFor !== f.id) { sn.fig = fundFigure(f, 640); sn.figFor = f.id; }
    const part = el('div', 'st-fund' + (d0 ? ' sep' : ''));
    part.append(el('p', 'st-label', T('Fundstück', 'Curiosity')), el('h2', null, f.object), el('p', 'th-dtext', f.teaser || f.q || T('Was steckt dahinter?', 'What’s behind it?')));
    const go = el('button', 'btn th-wide', p.read.size ? fundGoLabel(p) + ' ›' : T('Ansehen ›', 'Explore ›'));
    go.type = 'button';
    go.onclick = () => thinkL.open({ t: 'fund', id: f.id });
    part.append(go);
    if (progLabel(p)) part.append(el('p', 'th-later', progLabel(p)));
    s.append(sn.fig, part);
  }
  // „Schon gewusst?“: ein Eintrag für alle aufgehobenen Tage
  sn.dyk.textContent = '';
  if (days.length) {
    const n = days.reduce((a, d) => a + d.items.length, 0);
    sn.dyk.append(el('h2', 'th-sec', T('Schon gewusst?', 'Did you know?')));
    const g = el('div', 'th-group');
    const r = el('button', 'th-row');
    r.type = 'button';
    const rt = el('span', 'th-rt'), meta = el('span', 'th-meta');
    meta.append(el('span', null, d0 && n > d0.items.length ? T(`${d0.items.length} von heute · ${n} insgesamt`, `${d0.items.length} from today · ${n} total`) : T(`${n} Fakten`, `${n} facts`)));
    rt.append(el('b', null, T('Alle Fakten', 'All facts')), el('span', 'th-q', days.length > 2 ? T(`Von heute und ${days.length - 1} Tagen davor`, `From today and ${days.length - 1} earlier days`) : days.length === 2 ? T('Von heute und einem Tag davor', 'From today and one earlier day') : T('Von heute', 'From today')), meta);
    if (!d0) rt.querySelector('.th-q').textContent = T('Aus den letzten Tagen', 'From the last few days');
    r.append(icBox('spark'), rt, chevEl());
    r.onclick = () => thinkL.open({ t: 'dyk' });
    g.append(r);
    sn.dyk.append(g);
  }
  // Fundstücke: Fortschritt je Zeile
  for (const r of sn.rows) {
    const p = fundProg(r.f);
    r.mini.hidden = !p.read.size;
    r.fill.style.width = (p.read.size / p.n * 100) + '%';
    r.txt.textContent = progLabel(p) || stepsLabel(r.f);
    r.state.textContent = '';
    if (p.done) { r.state.className = 'th-state ok'; r.state.append(symEl('checkc'), el('span', 'vh', T('alle Schritte gelesen', 'all steps read'))); }
    else { r.state.className = 'st-state'; r.state.append(chevEl()); }
  }
}

// ---------- Kaninchenbau: drei Abzweigungen am Ende jedes Artikels ----------
// Erst wenn das Ende des Artikels in die Nähe kommt, werden zwei Anfragen gestellt (über die Warteschlange in api()):
// die Links aus dem Text und „morelike:“. Gefiltert werden Jahreszahlen, Daten, Länder und Orte, sehr allgemeine
// Begriffe, Listen und Begriffsklärungen; ausgezeichnete und ausführliche Artikel werden bevorzugt.
const HOLE_PROPS = { prop: 'info|pageprops|description|pageimages|categories', ppprop: 'disambiguation', piprop: 'thumbnail', pithumbsize: '160', pilimit: 'max',
  clcategories: WIKI.topCats, cllimit: 'max', redirects: '1' };
const MONTHS = 'Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember|January|February|March|May|June|July|October|December|janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre';
const HOLE_BAD_TITLE = new RegExp(`^(\\d{1,4}(er)?( Jahre)?|\\d{1,4}s|\\d{1,4} (v\\. Chr\\.|n\\. Chr\\.|BC|BCE|AD|CE)|\\d{1,2}(\\.|er)? (${MONTHS})( \\d{1,4})?|(${MONTHS})( \\d{1,2})?(, \\d{1,4})?|(${MONTHS}) \\d{4})$`
  + '|(Jahrhundert|Jahrtausend|century|millennium|siècle|millénaire)\\b|^((Années|Décennie) \\d{1,4}|\\d{1,4} av\\. J\\.-C\\.)$|^(Liste|Listen|List|Lists|Index|Outline|Timeline|Glossary|Chronologie|Zeittafel|Glossaire) |\\((Begriffsklärung|disambiguation|homonymie)\\)', 'i');
const HOLE_BAD_DESC = /\b(country|sovereign state|constituent country|state of the United States|state (?:of|in) (?:Germany|Austria|Australia|India|Brazil|Mexico|Nigeria|Malaysia)|U\.S\. state|federal state|federated state|province|region of|city in|city of|capital city|town in|village in|municipality|commune in|district of|county|human settlement|continent|ocean|academic discipline|branch of|field of study|religion|ethnic group|nationality|calendar year|decade|century|month of|day of the year|Wikimedia|unit of|Staat|Land in|Bundesland|Bundesstaat|Provinz|Region in|Stadt|Großstadt|Kleinstadt|Hauptstadt|Kreisstadt|Gemeinde|Ortschaft|Ort in|Dorf|Landkreis|Bezirk|Kanton|Kontinent|Ozean|Wissenschaft|Fachgebiet|Teilgebiet|Religion|Volk|Ethnie|Jahr|Jahrzehnt|Jahrhundert|Monat|Maßeinheit|pays|souverain|ville|commune|capitale|village|municipalité|département|région|province|canton|arrondissement|continent|océan|discipline|branche de|domaine d'étude|religion|peuple|ethnie|nationalité|année|décennie|siècle|mois|jour de l'année|unité de|page d'homonymie)\b/i;
const HOLE_LANG = /\b(language|Sprache|langue)\b/i;
const HOLE_REALM = /\b(Reich|Kaiserreich|Königreich|Republik|empire|kingdom|republic|dynasty|Dynastie|royaume|république|dynastie)\b/i; // Staaten der Geschichte
const HOLE_GENERAL = new Set(('Mensch|Wasser|Erde|Sonne|Mond|Leben|Tod|Gott|Zeit|Liebe|Geld|Krieg|Frieden|Kunst|Musik|Wissenschaft|Physik|Chemie|Biologie|Mathematik|Geschichte|Philosophie|Religion|Christentum|Islam|Judentum|Europa|Asien|Afrika|Amerika|Nordamerika|Südamerika|Australien|Antarktis|Internet|Computer|Tier|Pflanze|Pflanzen|Lebewesen|Latein|Deutschland|Vereinigte Staaten|Frankreich|Vereinigtes Königreich|Römisches Reich|Antike|Mittelalter|Neuzeit|Zweiter Weltkrieg|Erster Weltkrieg'
  + '|Human|Humans|Homo sapiens|Water|Earth|Sun|Moon|Life|Death|God|Time|Love|Money|War|Peace|Art|Music|Science|Physics|Chemistry|Biology|Mathematics|History|Philosophy|Christianity|Judaism|Europe|Asia|Africa|Americas|North America|South America|Australia|Antarctica|Animal|Plant|Organism|Latin|Germany|United States|France|United Kingdom|Roman Empire|Classical antiquity|Middle Ages|World War II|World War I'
  + '|Être humain|Homo sapiens|Eau|Terre|Soleil|Lune|Vie|Mort|Dieu|Temps|Amour|Argent|Guerre|Paix|Art|Musique|Science|Physique|Chimie|Biologie|Mathématiques|Histoire|Philosophie|Christianisme|Islam|Judaïsme|Europe|Asie|Afrique|Amérique|Amérique du Nord|Amérique du Sud|Australie|Antarctique|Internet|Ordinateur|Animal|Plante|Être vivant|Latin|Allemagne|États-Unis|France|Royaume-Uni|Empire romain|Antiquité|Moyen Âge|Seconde Guerre mondiale|Première Guerre mondiale').split('|'));
const holeMem = new Map();
function holeOk(p, skip) {
  if (!p || p.missing || p.invalid || p.ns !== 0 || skip.has(p.title)) return false;
  if (p.pageprops && 'disambiguation' in p.pageprops) return false;
  if ((p.length || 0) < 3000 || HOLE_BAD_TITLE.test(p.title) || WIKI.ns.test(p.title) || HOLE_GENERAL.has(p.title)) return false;
  const d = p.description || '';
  return !HOLE_BAD_DESC.test(d) && !HOLE_REALM.test(d) && !HOLE_REALM.test(p.title) && !(HOLE_LANG.test(d) && !/programming|Programmier|programmation/i.test(d));
}
// Links aus dem Fließtext (ohne Infokästen, Tabellen, Bildunterschriften), höchstens 50, gleichmäßig über den Artikel verteilt
function holeLinks(root) {
  const out = [], seen = new Set();
  const blocks = [...root.querySelectorAll('p, li, dd')].filter(n => !n.closest('table, .infobox, .navbox, figure, .thumb, .wf-x, .hatnote, .reflist, ol.references'));
  blocks.forEach((n, bi) => n.querySelectorAll('a[href^="/wiki/"]').forEach(a => {
    const t = wikiTitleOf(a.getAttribute('href').split('#')[0]);
    if (t && !seen.has(t)) { seen.add(t); out.push({ t, lead: bi === 0 }); }
  }));
  if (out.length <= 50) return out;
  return Array.from({ length: 50 }, (_, k) => out[Math.floor(k * out.length / 50)]);
}
function holeFor(title, links) {
  if (holeMem.has(title)) return holeMem.get(title);
  const pr = (async () => {
    const jobs = [api({ ...HOLE_PROPS, generator: 'search', gsrsearch: 'morelike:' + title, gsrlimit: '20', gsrnamespace: '0' })];
    if (links.length) jobs.push(api({ ...HOLE_PROPS, titles: links.map(l => l.t).join('|') }));
    const [like, linked] = await Promise.allSettled(jobs);
    if (like.status !== 'fulfilled' && linked?.status !== 'fulfilled') throw like.reason;
    const skip = new Set([title, ...readerStack.map(e => e.title)]);
    const cand = new Map();
    const lead = new Map(links.map(l => [l.t, l.lead]));
    if (linked?.status === 'fulfilled') {
      const q = linked.value.query || {};
      for (const r of q.redirects || []) if (lead.has(r.from)) lead.set(r.to, lead.get(r.from));
      for (const n of q.normalized || []) if (lead.has(n.from)) lead.set(n.to, lead.get(n.from));
      for (const p of q.pages || []) if (holeOk(p, skip)) cand.set(p.title, { p, linked: true, lead: !!lead.get(p.title), like: null });
    }
    if (like.status === 'fulfilled') {
      (like.value.query?.pages || []).sort((a, b) => a.index - b.index).forEach((p, k) => {
        if (!holeOk(p, skip)) return;
        const c = cand.get(p.title);
        if (c) c.like = k; else cand.set(p.title, { p, linked: false, lead: false, like: k });
      });
    }
    const score = c => {
      const cats = (c.p.categories || []).map(x => x.title).join('|');
      return (/Exzellent|Featured/.test(cats) ? 3 : cats ? 2 : 0) + (c.p.length >= 20000 ? 1.5 : c.p.length >= 8000 ? 1 : 0)
        + (c.p.thumbnail ? 1 : 0) + (c.linked && c.like != null ? 1.5 : 0) + (c.lead ? -1.5 : 0) + (c.like != null ? .5 - c.like * .03 : 0);
    };
    const picks = [], descs = new Set(), firsts = new Set();
    for (const c of [...cand.values()].sort((a, b) => score(b) - score(a))) {
      const d = (c.p.description || '').toLowerCase(), w1 = c.p.title.split(/[\s(,]/)[0].toLowerCase();
      if ((d && descs.has(d)) || (w1.length > 4 && firsts.has(w1))) continue; // drei verschiedene Richtungen statt dreimal dasselbe
      picks.push(c); if (d) descs.add(d); firsts.add(w1);
      if (picks.length === 3) break;
    }
    const out = picks.map(c => ({ title: c.p.title, desc: c.p.description || '', thumb: c.p.thumbnail?.source || null }));
    // Ohne Kurzbeschreibung: der erste Satz des Artikels
    const need = out.filter(o => !o.desc);
    if (need.length) {
      try {
        const d = await api({ titles: need.map(o => o.title).join('|'), prop: 'extracts', exintro: '1', explaintext: '1', exsentences: '1', exlimit: 'max' });
        for (const p of d.query?.pages || []) { const o = need.find(x => x.title === p.title); if (o && p.extract) o.desc = p.extract; }
      } catch {}
    }
    return out;
  })();
  holeMem.set(title, pr);
  pr.catch(() => holeMem.delete(title));
  while (holeMem.size > 40) holeMem.delete(holeMem.keys().next().value);
  return pr;
}
function holeBox(title) {
  const s = el('section', 'rh wf-x');
  s.dataset.t = title;
  return s;
}

async function fillHole(sec) {
  let res = null;
  try { res = await holeFor(sec.dataset.t, holeLinks(readerBody)); } catch {}
  if (!res?.length) { sec.remove(); return; }
  sec.append(el('h2', 'rh-h', T('Weiterlesen', 'Read next')), el('p', 'rh-sub', T('Verwandte Artikel aus der Wikipedia.', 'Related Wikipedia articles.')));
  const list = el('div', 'rh-list');
  for (const r of res) {
    const b = el('button', 'rh-item');
    b.type = 'button';
    const th = el('span', 'rh-th');
    th.setAttribute('aria-hidden', 'true');
    if (r.thumb && /^https:\/\/[a-z0-9.-]+\.wikimedia\.org\//.test(r.thumb)) th.style.backgroundImage = `url("${r.thumb.replace(/["\\]/g, encodeURIComponent)}")`;
    else th.textContent = r.title[0];
    const t = el('span', 'rh-t');
    t.append(el('b', null, r.title));
    if (r.desc) t.append(el('small', null, r.desc));
    b.append(th, t, chevEl());
    b.onclick = () => openReader(r.title, { title: r.title, extract: r.desc, thumb: null, topic: null });
    list.append(b);
  }
  sec.append(list);
}
// „Wie du hierher gekommen bist“: die letzten Artikel im Leser, antippen springt zurück
function trailBox() {
  const box = el('div', 'rtrail wf-x');
  box.append(el('h3', 'rt-h', T('Wie du hierhergekommen bist', 'How you got here')));
  const path = el('div', 'rt-path');
  const list = readerStack.slice(), shown = list.slice(-6);
  const sep = () => { const x = el('span', 'rt-sep', '›'); x.setAttribute('aria-hidden', 'true'); return x; };
  if (list.length > shown.length) path.append(el('span', 'rt-more', '…'), sep());
  shown.forEach((e, k) => {
    if (k) path.append(sep());
    if (k === shown.length - 1) { const c = el('span', 'rt-cur', e.title); c.setAttribute('aria-current', 'page'); path.append(c); }
    else {
      const b = el('button', 'rt-step', e.title);
      b.type = 'button';
      b.setAttribute('aria-label', T('Zurück zu ', 'Back to ') + e.title);
      b.onclick = () => readerJump(e);
      path.append(b);
    }
  });
  const share = el('button', 'rt-share');
  share.type = 'button';
  share.append(symEl('share'), el('span', null, T('Spur teilen', 'Share your path')));
  share.onclick = () => shareTrail(list.map(e => e.title));
  box.append(path, share);
  return box;
}
function readerJump(e) {
  const i = readerStack.indexOf(e);
  if (i < 0) { openReader(e.title, e.item, 0, null, e.thread ? { thread: e.thread } : null); return; }
  if (i >= readerStack.length - 1) return;
  readerStack.length = i + 2;
  readerBack(false);
}
async function shareTrail(titles) {
  const url = t => 'https://' + WIKI.host + '/wiki/' + encodeURIComponent(t.replace(/ /g, '_'));
  const text = titles.join(' › ') + '\n\n' + titles.map(t => t + '\n' + url(t)).join('\n\n');
  if (navigator.share) {
    try { await navigator.share({ title: T('Meine Spur durch die Wikipedia', 'My path through Wikipedia'), text }); return; }
    catch (e) { if (e?.name === 'AbortError') return; }
  }
  try { await navigator.clipboard.writeText(text); toast(T('Spur kopiert', 'Path copied')); }
  catch { toast(T('Teilen hat nicht geklappt. Versuche es noch einmal.', 'Couldn’t share. Try again.')); }
}
// Beobachter am Ende des Artikels: Abzweigungen kurz vorher laden, einen Fundstück-Schritt als gelesen zählen, wenn das Ende sichtbar ist
let holeObs = null, readEndObs = null;
function armReaderEnd() {
  if (!('IntersectionObserver' in window)) return;
  holeObs ||= new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    holeObs.unobserve(en.target);
    en.target.classList.add('rh-done');
    fillHole(en.target);
  }), { root: readerScroll, rootMargin: '0px 0px 600px 0px' });
  readEndObs ||= new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    readEndObs.unobserve(en.target);
    fundRead(en.target.dataset.id, Number(en.target.dataset.i));
  }), { root: readerScroll });
  holeObs.disconnect();
  readEndObs.disconnect();
  const h = readerBody.querySelector('.rh:not(.rh-done)');
  if (h) holeObs.observe(h);
  const nav = readerBody.querySelector('.fd-nav');
  if (nav) readEndObs.observe(nav);
}

// ---------- Themen-Seite ----------
let topicsDirty = false;
function renderTopics() {
  const box = document.getElementById('topic-chips');
  box.innerHTML = '';
  for (const t of TOPICS) {
    const b = el('button', 'tchip' + (state.enabled.includes(t.id) ? ' on' : ''), t.label);
    b.type = 'button';
    b.setAttribute('aria-pressed', state.enabled.includes(t.id) ? 'true' : 'false');
    b.onclick = () => {
      state.enabled = state.enabled.includes(t.id) ? state.enabled.filter(x => x !== t.id) : [...state.enabled, t.id];
      store.set('enabled', state.enabled);
      topicsDirty = true;
      renderTopics();
      box.querySelectorAll('.tchip')[TOPICS.indexOf(t)]?.focus({ preventScroll: true }); // Fokus bleibt auf dem Chip
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
  const s = state.stats;
  const readToday = s.day === today() ? s.read : 0;
  document.getElementById('stats').textContent = T(`Heute gelesen: ${readToday} · Insgesamt: ${s.total || 0}`, `Read today: ${readToday} · Total: ${s.total || 0}`);
}
document.getElementById('quality').onchange = e => { state.quality = e.target.checked; store.set('quality', state.quality); topicsDirty = true; };
document.getElementById('reset').onclick = () => {
  if (!confirm(T('Gelerntes zurücksetzen? Deine Themenauswahl und deine gemerkten Artikel bleiben.', 'Reset what the app has learned? Your topic selection and saved articles are kept.'))) return;
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
  toastTimer = setTimeout(() => t.classList.remove('show'), Math.min(5000, 1400 + Math.max(0, msg.length - 30) * 45));
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
  document.querySelectorAll('.tpick').forEach(b => {
    const on = b.dataset.theme === th.id;
    b.classList.toggle('on', on);
    b.setAttribute('aria-checked', on);
    b.tabIndex = on ? 0 : -1; // ein Tab-Stopp pro Gruppe, Pfeiltasten wechseln
  });
}
function renderThemePicks() {
  const box = $('theme-picks');
  box.innerHTML = '';
  for (const th of THEMES) {
    const b = el('button', 'tpick');
    b.type = 'button';
    b.setAttribute('role', 'radio');
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
    b.tabIndex = on ? 0 : -1;
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
  if (!confirm(T('Alle Daten löschen? Gemerkte Artikel, Antworten, Einstellungen und Gelerntes sind danach weg. Das lässt sich nicht rückgängig machen.',
    'Delete all data? Saved articles, answers, settings and what the app has learned will be gone. This can’t be undone.'))) return;
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
// Im Fundstück schließt Wegziehen alles: den Artikel und das Fundstück-Blatt dahinter.
sheetDrag(reader, readerScroll, () => readerStack.some(e => e.thread) ? closeFundAll() : closeReaderAll());
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
  document.querySelectorAll('#rsize-seg button').forEach(b => { const on = Number(b.dataset.v) === v; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1; });
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
  toast(ok ? T('3D-Effekt an. Neig das Handy im Feed.', '3D effect on. Tilt your phone in the feed.') : T('Der 3D-Effekt braucht Zugriff auf den Bewegungssensor. Erlaube ihn, wenn das Gerät danach fragt.', 'The 3D effect needs access to the motion sensor. Allow it when your device asks.'));
};
// War der Effekt an, braucht das iPhone nach jedem Start einen Fingertipp, bevor der Sensor wieder liefern darf.
if (tiltBox.checked && !reduceMotion) {
  const arm = () => { document.removeEventListener('click', arm, true); gyroStart(); };
  document.addEventListener('click', arm, true);
}

// ---------- Sprache ----------
// Englische bzw. französische Fassung der festen Texte aus index.html (data-en, data-en-ph, data-en-aria).
// Französisch kommt über T() aus dem Wörterbuch in i18n.fr.js (Schlüssel: der englische Text).
if (LANG !== 'de') {
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-en]').forEach(n => { n.textContent = T(n.textContent, n.dataset.en); });
  document.querySelectorAll('[data-en-ph]').forEach(n => { n.placeholder = T(n.placeholder, n.dataset.enPh); });
  document.querySelectorAll('[data-en-aria]').forEach(n => { n.setAttribute('aria-label', T(n.getAttribute('aria-label') || '', n.dataset.enAria)); });
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
      reader: !reader.hidden && top?.loaded ? { title: top.title, scroll: readerScroll.scrollTop, thread: top.thread || null } : null, // nur Artikel, die wirklich geladen sind
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
  if (s.reader?.title) openReader(s.reader.title, null, s.reader.scroll || 0, null, s.reader.thread && fundStep(s.reader.thread) ? { thread: s.reader.thread } : null);
  return true;
}
feedEl.addEventListener('scroll', saveSnapSoon, { passive: true });
readerScroll.addEventListener('scroll', saveSnapSoon, { passive: true });
window.addEventListener('pagehide', saveSnap);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveSnap(); });

// ---------- Start ----------
renderSaved();
setThinkPart(thinkPart, false, false);
updateThinkDot();
// Einmal am Tag die Fakten für „Schon gewusst?“ holen, damit man sie später nachlesen kann (leise im Hintergrund)
setTimeout(() => loadDyk().catch(() => {}), 6000);
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
