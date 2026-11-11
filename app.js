'use strict';

const API = 'https://de.wikipedia.org/w/api.php';

// Themen = Wikipedias eigene "articletopic"-Klassifizierung.
// on:true = deine Interessen als Voreinstellung.
const TOPICS = [
  { id: 'history', label: 'Geschichte', on: true },
  { id: 'biography', label: 'Biografien', on: true },
  { id: 'women', label: 'Biografien (Frauen)', on: true },
  { id: 'society', label: 'Gesellschaft', on: true },
  { id: 'philosophy-and-religion', label: 'Philosophie & Religion', on: true },
  { id: 'politics-and-government', label: 'Staat & Politik', on: true },
  { id: 'education', label: 'Bildung', on: true },
  { id: 'biology', label: 'Biologie', on: true },
  { id: 'chemistry', label: 'Chemie', on: true },
  { id: 'computing', label: 'Computer & Internet', on: true },
  { id: 'earth-and-environment', label: 'Erde & Umwelt', on: true },
  { id: 'mathematics', label: 'Mathematik', on: true },
  { id: 'physics', label: 'Physik', on: true },
  { id: 'engineering', label: 'Technik', on: true },
  { id: 'technology', label: 'Technologie', on: true },
  { id: 'space', label: 'Weltraum', on: true },
  { id: 'medicine-and-health', label: 'Medizin & Gesundheit', on: false },
  { id: 'military-and-warfare', label: 'Krieg & Militär', on: false },
  { id: 'business-and-economics', label: 'Wirtschaft', on: false },
  { id: 'transportation', label: 'Verkehr', on: false },
  { id: 'food-and-drink', label: 'Essen & Trinken', on: false },
  { id: 'architecture', label: 'Architektur', on: false },
  { id: 'visual-arts', label: 'Kunst', on: false },
  { id: 'literature', label: 'Literatur', on: false },
  { id: 'music', label: 'Musik', on: false },
  { id: 'films', label: 'Film', on: false },
  { id: 'video-games', label: 'Videospiele', on: false },
  { id: 'sports', label: 'Sport', on: false },
];
const topicLabel = id => (TOPICS.find(t => t.id === id) || {}).label || id;

// ---------- Speicher ----------
const store = {
  get(k, d) { try { const v = localStorage.getItem('wf.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('wf.' + k, JSON.stringify(v)); } catch {} },
};
const today = () => new Date().toISOString().slice(0, 10);

const state = {
  enabled: store.get('enabled', TOPICS.filter(t => t.on).map(t => t.id)),
  weights: store.get('weights', {}),
  seen: store.get('seen', []),
  saved: store.get('saved', []),
  quality: store.get('quality', true),
  stats: store.get('stats', { day: today(), read: 0, total: 0 }),
};
const seenSet = new Set(state.seen);

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
  store.set('seen', state.seen);
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
  let pages = [];
  if (state.quality) {
    const d = await api({ ...CARD_PROPS, gsrlimit: '4',
      gsrsearch: `articletopic:${topic} incategory:Wikipedia:Exzellent|Wikipedia:Lesenswert` });
    pages = (d.query?.pages || []).map(p => ({ ...p, top: true }));
    pages = pages.filter(p => !seenSet.has(p.title));
  }
  if (pages.length < 2) {
    // Zu wenig Top-Artikel (oder Filter aus): normale Artikel, aber nur ausführliche.
    const d = await api({ ...CARD_PROPS, gsrlimit: '20',
      gsrsearch: `articletopic:${topic} -intitle:Liste` });
    const minLen = state.quality ? 9000 : 4000;
    const more = (d.query?.pages || []).filter(p => p.length >= minLen && !seenSet.has(p.title));
    pages = pages.concat(more.slice(0, 4));
  }
  return pages
    .filter(p => p.extract && p.extract.length > 80)
    .map(p => ({ title: p.title, extract: p.extract, thumb: p.thumbnail?.source || null, topic, top: !!p.top }));
}

// ---------- Feed ----------
const feedEl = document.getElementById('feed');
let loading = false;
let cardCount = 0;
let feedGen = 0;

function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

function stateCard(kind, msg) {
  feedEl.querySelector('.state-card')?.remove();
  const c = el('div', 'card state-card');
  const inner = el('div');
  if (kind === 'loading') inner.append(el('div', 'spinner'));
  inner.append(el('p', null, msg));
  if (kind === 'error') {
    const b = el('button', 'btn', 'Nochmal versuchen');
    b.onclick = () => { c.remove(); loadMore(); };
    inner.append(b);
  }
  c.append(inner);
  feedEl.append(c);
  return c;
}

async function loadMore() {
  if (loading) return;
  if (!state.enabled.length) { stateCard('empty', 'Wähle unter „Themen“ mindestens ein Thema aus.'); return; }
  loading = true;
  const gen = feedGen;
  const spinner = cardCount === 0 ? stateCard('loading', 'Suche spannende Artikel …') : null;
  try {
    // 3 verschiedene Themen pro Ladevorgang, je ~4 Artikel -> gute Mischung.
    const want = Math.min(3, state.enabled.length);
    const topics = new Set();
    for (let tries = 0; topics.size < want && tries < 30; tries++) topics.add(pickTopic());
    let items = [];
    for (const t of topics) items = items.concat(await fetchTopic(t));
    if (gen !== feedGen) return;
    const titles = new Set();
    items = shuffle(items.filter(i => !titles.has(i.title) && titles.add(i.title)));
    spinner?.remove();
    if (!items.length) { loading = false; return loadMore(); }
    items.forEach(addCard);
  } catch (e) {
    if (gen !== feedGen) return;
    spinner?.remove();
    stateCard('error', 'Konnte keine Artikel laden (' + e.message + '). Bist du online?');
  } finally {
    if (gen === feedGen) loading = false;
  }
}

const viewObs = new IntersectionObserver(entries => {
  for (const en of entries) {
    if (!en.isIntersecting) continue;
    const card = en.target;
    markSeen(card.dataset.title);
    const idx = Number(card.dataset.idx);
    if (idx >= cardCount - 3) loadMore();
  }
}, { root: feedEl, threshold: 0.6 });

function addCard(item) {
  const card = el('article', 'card');
  card.dataset.title = item.title;
  card.dataset.idx = cardCount++;

  const img = el('div', 'card-img');
  if (item.thumb) img.style.backgroundImage = `url("${item.thumb}")`;
  else { img.classList.add('placeholder'); img.textContent = item.title[0]; card.classList.add('noimg'); }

  const body = el('div', 'card-body');
  const meta = el('div', 'meta');
  meta.append(el('span', 'chip', topicLabel(item.topic)));
  if (item.top) meta.append(el('span', 'chip top', '★ Top-Artikel'));
  const h = el('h2', null, item.title);
  const p = el('p', 'extract', item.extract);
  const read = el('button', 'read-btn', 'Weiterlesen →');
  const openIt = () => openReader(item.title, item);
  read.onclick = openIt;
  h.onclick = openIt;
  p.onclick = openIt;
  body.append(meta, h, p, read);

  const actions = el('div', 'actions');
  const mk = (cls, icon, label) => { const b = el('button', 'act ' + cls); b.textContent = icon; b.setAttribute('aria-label', label); return b; };
  const bad = mk('dislike', '👎', 'Nicht interessant');
  const save = mk('save', '🔖', 'Merken');
  const good = mk('like', '👍', 'Mehr davon');
  if (isSaved(item.title)) save.classList.add('on');

  bad.onclick = () => {
    if (bad.classList.contains('on')) return;
    adjust(item.topic, 0.7);
    if (good.classList.contains('on')) { adjust(item.topic, 1 / 1.3); good.classList.remove('on'); }
    bad.classList.add('on');
    toast(`Weniger ${topicLabel(item.topic)}`);
    setTimeout(() => next(card), 350);
  };
  good.onclick = () => {
    if (good.classList.contains('on')) return;
    adjust(item.topic, 1.3);
    if (bad.classList.contains('on')) { adjust(item.topic, 1 / 0.7); bad.classList.remove('on'); }
    good.classList.add('on');
    toast(`Mehr ${topicLabel(item.topic)} 👍`);
  };
  save.onclick = () => {
    const on = toggleSaved(item);
    save.classList.toggle('on', on);
    if (on) adjust(item.topic, 1.1);
    toast(on ? 'Gemerkt' : 'Entfernt');
  };
  actions.append(bad, save, good);

  card.append(img, body, actions);
  const sc = feedEl.querySelector('.state-card');
  if (sc) sc.before(card); else feedEl.append(card);
  viewObs.observe(card);
}

function next(card) {
  const n = card.nextElementSibling;
  if (n) feedEl.scrollTo({ top: n.offsetTop, behavior: 'smooth' });
}

function resetFeed() {
  feedGen++;
  loading = false;
  cardCount = 0;
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
  store.set('saved', state.saved);
  renderSaved();
  return isSaved(item.title);
}
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
    const del = el('button', 'del', '✕');
    del.setAttribute('aria-label', 'Entfernen');
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
  document.getElementById('reader-ext').href = 'https://de.wikipedia.org/wiki/' + encodeURIComponent(title.replace(/ /g, '_'));
  document.getElementById('reader-save').classList.toggle('on', isSaved(title));
  readerBody.innerHTML = '<div class="loading"><div class="spinner"></div>Lade Artikel …</div>';
  readerScroll.scrollTop = 0;
  try {
    const d = await api({ action: 'parse', page: title, prop: 'text|displaytitle', redirects: '1', disableeditsection: '1', disabletoc: '1' });
    if (readerStack[readerStack.length - 1] !== top) return;
    if (d.error) throw new Error(d.error.info);
    const doc = new DOMParser().parseFromString(d.parse.text, 'text/html');
    doc.querySelectorAll('script, link, meta').forEach(n => n.remove());
    doc.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src');
      if (src?.startsWith('//')) img.setAttribute('src', 'https:' + src);
      const ss = img.getAttribute('srcset');
      if (ss) img.setAttribute('srcset', ss.replace(/(^|,\s*)\/\//g, '$1https://'));
      img.loading = 'lazy';
    });
    readerBody.innerHTML = '';
    const h = el('h1', 'art-title', d.parse.title);
    readerBody.append(h, ...doc.body.childNodes);
    readerScroll.scrollTop = restoreScroll;
    top.title = d.parse.title;
  } catch (e) {
    readerBody.innerHTML = '';
    readerBody.append(el('p', 'loading', 'Artikel konnte nicht geladen werden: ' + e.message));
  }
}

readerBody.addEventListener('click', e => {
  const a = e.target.closest('a');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  if (href.startsWith('/wiki/')) {
    e.preventDefault();
    const name = decodeURIComponent(href.slice(6).split('#')[0]).replace(/_/g, ' ');
    if (/^(Datei|Kategorie|Hilfe|Spezial|Wikipedia|Portal|Vorlage|File|Benutzer):/.test(name)) {
      window.open('https://de.wikipedia.org' + href, '_blank', 'noopener');
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
  reader.hidden = true;
  readerBody.innerHTML = '';
  if (readSession) {
    const secs = (Date.now() - readSession.start) / 1000;
    if (secs > 25) {
      countRead();
      if (readSession.item?.topic) adjust(readSession.item.topic, secs > 120 ? 1.25 : 1.12);
    }
    readSession = null;
  }
  if (!fromPopstate && history.state?.reader) history.back();
}
document.getElementById('reader-back').onclick = () => readerBack(false);
window.addEventListener('popstate', () => { if (!reader.hidden) readerBack(true); });
document.getElementById('reader-save').onclick = () => {
  const top = readerStack[readerStack.length - 1];
  const item = top.item || { title: top.title, extract: readerBody.querySelector('p')?.textContent?.slice(0, 300) || '', thumb: null, topic: null };
  const on = toggleSaved({ ...item, title: top.title });
  document.getElementById('reader-save').classList.toggle('on', on);
  syncSaveButtons();
  toast(on ? 'Gemerkt' : 'Entfernt');
};

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
  document.getElementById('stats').textContent = `Heute gelesen: ${readToday} · insgesamt: ${s.total || 0}`;
}
document.getElementById('quality').onchange = e => { state.quality = e.target.checked; store.set('quality', state.quality); topicsDirty = true; };
document.getElementById('reset').onclick = () => {
  if (!confirm('Alles Gelernte zurücksetzen? Deine Themenauswahl und gemerkten Artikel bleiben.')) return;
  state.weights = {}; store.set('weights', {});
  renderTopics(); topicsDirty = true;
  toast('Zurückgesetzt');
};

// ---------- Navigation ----------
document.querySelectorAll('.tabbar button').forEach(btn => {
  btn.onclick = () => {
    const v = btn.dataset.view;
    document.querySelectorAll('.tabbar button').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.view').forEach(s => s.classList.toggle('active', s.id === 'view-' + v));
    if (v === 'topics') renderTopics();
    if (v === 'saved') renderSaved();
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

// ---------- Start ----------
renderSaved();
loadMore();
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
