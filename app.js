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
  prop: 'extracts|pageimages|info', exintro: '1', explaintext: '1', exsentences: '6', exlimit: 'max',
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
    const q = await api({ titles: title, redirects: '1', prop: 'extracts|pageimages', exintro: '1', explaintext: '1', exsentences: '6', piprop: 'thumbnail', pithumbsize: '900' });
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
  return card;
}

function addCard(item, afterEl) {
  const card = el('article', 'card');
  card.dataset.title = item.title;
  cardItems.set(card, item);
  feedTitles.add(item.title);

  const img = el('div', 'card-img');
  if (item.thumb) img.style.backgroundImage = `url("${item.thumb}")`;
  else { img.classList.add('placeholder'); img.textContent = item.title[0]; card.classList.add('noimg'); }

  const body = el('div', 'card-body');
  const meta = el('div', 'meta');
  if (item.aotd) meta.append(el('span', 'chip top', T('⭐ Artikel des Tages', '⭐ Article of the day')));
  if (item.topic) meta.append(el('span', 'chip', topicLabel(item.topic)));
  if (item.top) meta.append(el('span', 'chip top', T('★ Top-Artikel', '★ Top article')));
  if (item.seed) meta.append(el('span', 'chip sim', T('≈ Ähnlich wie „' + item.seed + '“', '≈ Similar to “' + item.seed + '”')));
  const h = el('h2', null, item.title);
  const p = el('p', 'extract', item.extract);
  const read = el('button', 'read-btn', T('Weiterlesen →', 'Read more →'));
  const openIt = () => openReader(item.title, item);
  read.onclick = openIt;
  h.onclick = openIt;
  p.onclick = openIt;
  body.append(meta, h, p, read);

  const actions = el('div', 'actions');
  const mk = (cls, icon, label) => { const b = el('button', 'act ' + cls); b.textContent = icon; b.setAttribute('aria-label', label); return b; };
  const bad = mk('dislike', '👎', T('Nicht interessant', 'Not interested'));
  const save = mk('save', '🔖', T('Merken', 'Save'));
  const good = mk('like', '👍', T('Mehr davon', 'More like this'));
  if (isSaved(item.title)) save.classList.add('on');

  bad.onclick = () => {
    if (bad.classList.contains('on')) return;
    adjust(item.topic, 0.7);
    if (good.classList.contains('on')) { adjust(item.topic, 1 / 1.3); good.classList.remove('on'); }
    bad.classList.add('on');
    if (item.seed) dropSeed(item.seed);
    dropSeed(item.title);
    toast(item.topic ? T(`Weniger ${topicLabel(item.topic)}`, `Less ${topicLabel(item.topic)}`) : T('Weniger davon', 'Less of this'));
    setTimeout(() => next(card), 350);
  };
  good.onclick = () => {
    if (good.classList.contains('on')) return;
    adjust(item.topic, 1.3);
    if (bad.classList.contains('on')) { adjust(item.topic, 1 / 0.7); bad.classList.remove('on'); }
    good.classList.add('on');
    addSeed(item);
    insertSimilar(card, item);
    toast(T('👍 Ähnliche Artikel kommen als Nächstes', '👍 Similar articles coming up next'));
  };
  save.onclick = () => {
    const on = toggleSaved(item);
    save.classList.toggle('on', on);
    if (on) adjust(item.topic, 1.1);
    toast(on ? T('Gemerkt · auch offline lesbar', 'Saved · readable offline') : T('Entfernt', 'Removed'));
  };
  actions.append(bad, save, good);

  card.append(img, body, actions);
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

function cleanArticle(htmlText) {
  const doc = new DOMParser().parseFromString(htmlText, 'text/html');
  doc.querySelectorAll('script, link, meta, .navbox, .mw-references-wrap, .reflist, ol.references, sup.reference, .mw-editsection, .sisterproject, #normdaten, .mw-empty-elt').forEach(n => n.remove());
  doc.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src');
    if (src?.startsWith('//')) img.setAttribute('src', 'https:' + src);
    const ss = img.getAttribute('srcset');
    if (ss) img.setAttribute('srcset', ss.replace(/(^|,\s*)\/\//g, '$1https://'));
    img.loading = 'lazy';
  });
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
  feedEl.querySelectorAll('.card[data-title]').forEach(c => c.querySelector('.act.save')?.classList.toggle('on', isSaved(c.dataset.title)));
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
    if (off) art = { title: off.title, doc: new DOMParser().parseFromString(off.html, 'text/html'), offline: true };
    else art = await fetchArticle(title);
    if (readerStack[readerStack.length - 1] !== top) return;
    readerBody.innerHTML = '';
    readerBody.append(el('h1', 'art-title', art.title));
    if (art.offline) readerBody.append(el('div', 'offnote', T('📥 Offline gespeichert', '📥 Saved offline')));
    readerBody.append(...art.doc.body.childNodes);
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
  readerBody.innerHTML = '';
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
function thinkRow(t, sub) {
  const li = el('li');
  const rec = state.think[t.id];
  const tx = el('div', 't');
  tx.append(el('b', null, t.title), el('small', null, sub || (rec ? T('Deine Antwort: ', 'Your answer: ') + optLabel(t.opts[rec.a]) : t.q)));
  li.append(el('div', 'thumb think-thumb', t.icon), tx);
  if (rec) li.append(el('span', 'done', '✓'));
  li.onclick = () => openThink(t.id);
  return li;
}
function renderDenken() {
  const box = $('think-list');
  box.innerHTML = '';
  if (typeof THOUGHTS === 'undefined') return;
  const done = THOUGHTS.filter(t => state.think[t.id]).length;
  $('think-stats').textContent = T(`${done} von ${THOUGHTS.length} durchdacht`, `${done} of ${THOUGHTS.length} explored`);

  // Einstieg ins Trolley-Spiel (trolley.js)
  if (typeof openTrolley === 'function') {
    const g = el('button', 'game-banner');
    const gt = el('div', 'gb-t');
    gt.append(el('b', null, T('Weichensteller', 'Pull the Lever')), el('small', null, T('Das Trolley-Spiel: Klassiker, Endlos-Modus und 46 Fälle aus der Forschung', 'The trolley game: classics, endless mode and 46 research dilemmas')));
    g.append(el('span', 'gb-i', '🚋'), gt, el('span', 'gb-go', '›'));
    g.onclick = () => openTrolley();
    box.append(g);
  }

  const d = dailyThought();
  const today1 = el('ul', 'list');
  today1.append(thinkRow(d, state.think[d.id] ? null : T('Heute: ', 'Today: ') + d.q));
  box.append(el('h2', null, T('Gedankenspiel des Tages', 'Thought experiment of the day')), today1);
  const res = pendingResolve();
  if (res) {
    const ul = el('ul', 'list');
    ul.append(thinkRow(res, T('💡 Die Auflösung ist da – tippen zum Ansehen', '💡 The resolution is here – tap to view')));
    box.append(el('h2', null, T('Auflösung von gestern', 'Yesterday’s resolution')), ul);
  }
  updateThinkDot();

  const { axes, right, total } = thinkProfile();
  box.append(el('h2', null, T('Wo du stehst', 'Where you stand')));
  const prof = el('div', 'profile');
  for (const [key, f] of Object.entries(THINK_FIELDS)) {
    if (!f.axis) continue;
    const vals = axes[key] || [];
    const row = el('div', 'axis');
    row.append(el('div', 'axis-name', f.label));
    if (vals.length < 2) {
      row.append(el('div', 'axis-empty', T(`Noch zu wenig Antworten (${vals.length} von 2)`, `Not enough answers yet (${vals.length} of 2)`)));
    } else {
      const avg = vals.reduce((a, c) => a + c, 0) / vals.length;
      const bar = el('div', 'axis-bar');
      const dot = el('i');
      dot.style.left = ((avg + 1) / 2 * 100) + '%';
      bar.append(dot);
      const ends = el('div', 'axis-ends');
      ends.append(el('span', null, f.axis[0]), el('span', null, f.axis[1]));
      row.append(bar, ends);
    }
    prof.append(row);
  }
  if (total) prof.append(el('p', 'axis-score', T(`Rätsel mit eindeutiger Lösung: ${right} von ${total} richtig`, `Puzzles with a definite answer: ${right} of ${total} correct`)));
  box.append(prof);

  for (const [key, f] of Object.entries(THINK_FIELDS)) {
    const items = THOUGHTS.filter(t => t.field === key);
    if (!items.length) continue;
    const ul = el('ul', 'list');
    items.forEach(t => ul.append(thinkRow(t)));
    box.append(el('h2', null, `${f.label} · ${items.filter(t => state.think[t.id]).length}/${items.length}`), ul);
  }
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
    document.querySelectorAll('.view').forEach(s => s.classList.toggle('active', s.id === 'view-' + v));
    if (v === 'topics') renderTopics();
    if (v === 'saved') renderSaved();
    if (v === 'think') renderDenken();
    if (v === 'search' && !searchInput.value.trim()) { searchList.innerHTML = ''; renderSearchHint(); }
    if (v === 'feed' && topicsDirty) { topicsDirty = false; resetFeed(); }
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
