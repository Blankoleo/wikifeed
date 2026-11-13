'use strict';
// „Weichensteller“ – das Trolley-Spiel im Tab „Denken“.
// Drei Teile: Klassiker (berühmte Fälle mit echten Umfragezahlen), Endlos (gewürfelte Fälle)
// und der Dilemma-Stapel (46 Fälle aus der Forschung, siehe trolley-data.js).
// Nutzt el(), $, store und toast() aus app.js.

const tg = store.get('trolley', { classics: {}, stack: {}, order: null, endless: { n: 0, sw: 0, dims: {} } });
const saveTg = () => store.set('trolley', tg);
const gameEl = $('game');
const gameBody = $('game-body');
const gameScroll = $('game-scroll');
let gameMode = null; // null = Menü

// Zahlen: Awad u. a. (2020), PNAS – 70 000 Menschen in 42 Ländern, Durchschnitt über die Länder.
const STAT_SOURCE = 'Studie mit 70 000 Menschen in 42 Ländern (Awad u. a., PNAS 2020)';

const TROLLEY_CLASSICS = [
  { id: 'weiche', title: 'Die Weiche', scene: 'switch', main: ['👷', 5], side: ['👷', 1], stat: 81,
    text: 'Eine führerlose Straßenbahn rast auf fünf Gleisarbeiter zu. Du stehst an der Weiche. Legst du sie um, fährt die Bahn aufs Nebengleis und tötet dort einen einzelnen Arbeiter.',
    q: 'Legst du die Weiche um?', yes: 'Weiche umlegen', no: 'Nichts tun',
    note: 'Der Ausgangsfall, 1967 von Philippa Foot erdacht. Die meisten halten das Umlegen für erlaubt: Der Tod des einen ist eine vorhergesehene, aber nicht beabsichtigte Nebenfolge.' },
  { id: 'bruecke', title: 'Die Brücke', scene: 'bridge', main: ['👷', 5], side: ['🧍', 1], stat: 51,
    text: 'Diesmal gibt es keine Weiche. Du stehst auf einer Brücke über dem Gleis, neben dir ein sehr schwerer Mann. Stößt du ihn hinunter, stoppt sein Körper die Bahn. Er stirbt, die fünf überleben.',
    q: 'Stößt du den Mann hinunter?', yes: 'Hinunterstoßen', no: 'Nichts tun',
    note: 'Judith Jarvis Thomsons berühmte Variante. Die Rechnung ist dieselbe wie bei der Weiche. Aber hier benutzt du einen Menschen als Mittel und legst selbst Hand an – das macht für viele den Unterschied.' },
  { id: 'schleife', title: 'Die Schleife', scene: 'loop', main: ['👷', 5], side: ['🧍', 1], stat: 72,
    text: 'Wieder eine Weiche. Aber das Nebengleis führt in einer Schleife zurück aufs Hauptgleis. Auf der Schleife steht ein schwerer Mann. Nur weil sein Körper die Bahn aufhält, erreicht sie die fünf nicht mehr.',
    q: 'Legst du die Weiche um?', yes: 'Weiche umlegen', no: 'Nichts tun',
    note: 'Thomsons „Loop“ von 1985. Das Tückische: Wie auf der Brücke brauchst du den Körper des Mannes als Bremsklotz. Trotzdem stimmen viel mehr Menschen zu als beim Stoßen. Es geht also wohl weniger um „Mittel zum Zweck“ als darum, ob man selbst Hand anlegt.' },
  { id: 'falltuer', title: 'Die Falltür', scene: 'bridge', main: ['👷', 5], side: ['🧍', 1],
    text: 'Wieder steht ein schwerer Mann auf der Brücke. Diesmal musst du ihn nicht anfassen: Er steht auf einer Falltür, und du hast aus sicherer Entfernung einen Hebel dafür. Öffnest du sie, fällt er aufs Gleis und stoppt die Bahn.',
    q: 'Öffnest du die Falltür?', yes: 'Falltür öffnen', no: 'Nichts tun',
    note: 'In Experimenten des Psychologen Joshua Greene stimmen hier deutlich mehr Menschen zu als beim Stoßen mit den eigenen Händen. Körperliche Nähe und eigene Muskelkraft lassen eine Tat schlimmer wirken, obwohl das Ergebnis gleich ist.' },
  { id: 'saboteur', title: 'Der Saboteur', scene: 'bridge', main: ['👷', 5], side: ['🦹', 1],
    text: 'Der Mann auf der Brücke ist kein Unbeteiligter: Er hat die Bremsen der Bahn absichtlich zerstört, um die fünf zu töten. Stößt du ihn hinunter, stoppt sein Körper die Bahn.',
    q: 'Stößt du den Saboteur hinunter?', yes: 'Hinunterstoßen', no: 'Nichts tun',
    note: 'In der Fachliteratur heißt der Fall „Fat Villain“. Viele, die beim Unschuldigen zögern, stoßen hier. Schuld verändert, was wir jemandem zumuten dürfen – ähnlich wie bei der Notwehr.' },
  { id: 'chirurg', title: 'Der Chirurg', scene: 'icon', main: ['🛌', 5], side: ['🧍', 1],
    text: 'Du bist Chirurgin. Fünf deiner Patienten sterben heute, wenn sie kein Spenderorgan bekommen. Im Wartezimmer sitzt ein kerngesunder Besucher, dessen Organe zu allen fünf passen. Niemand würde je davon erfahren.',
    q: 'Opferst du den Besucher für die fünf?', yes: 'Ja, die fünf retten', no: 'Nein',
    note: 'Wieder fünf gegen einen, und doch sagen hier fast alle Nein. Philippa Foot und Judith Thomson zeigten damit: Es ist etwas anderes, eine vorhandene Gefahr umzulenken, als für einen Unbeteiligten eine neue zu schaffen.' },
  { id: 'garten', title: 'Der Mann im Garten', scene: 'switch', main: ['👷', 5], side: ['😴', 1],
    text: 'Du kannst die Bahn nur aufhalten, indem du sie mit der Weiche entgleisen lässt. Sie stürzt dann einen Hang hinunter in einen Garten, in dem ein Mann in seiner Hängematte schläft. Mit dem Gleis hat er nichts zu tun.',
    q: 'Lässt du die Bahn entgleisen?', yes: 'Entgleisen lassen', no: 'Nichts tun',
    note: 'Der Fall stammt vom Philosophen Peter Unger. Ein Gleisarbeiter kennt das Risiko seines Berufs, der Mann im Garten ist bei sich zu Hause. Manche finden: Wer sich nicht in Gefahr begeben hat, hat ein stärkeres Recht, verschont zu werden.' },
  { id: 'selbst', title: 'Du selbst', scene: 'switch', main: ['👷', 5], side: ['🫵', 1],
    text: 'Auf dem Nebengleis steht diesmal kein Fremder. Du selbst steckst dort mit dem Fuß fest, den Weichenhebel in Reichweite. Legst du um, trifft die Bahn dich statt der fünf.',
    q: 'Lenkst du die Bahn auf dich selbst?', yes: 'Auf mich lenken', no: 'Nichts tun',
    note: 'Judith Thomson stellte diese Frage 2008 und änderte damit ihre eigene Meinung: Wer nicht bereit wäre, sich selbst zu opfern, darf dieses Opfer auch keinem Fremden aufzwingen. Danach wäre sogar das Umlegen im Ausgangsfall nicht erlaubt.' },
  { id: 'liebe', title: 'Der geliebte Mensch', scene: 'switch', main: ['❤️', 1], side: ['👷', 5],
    text: 'Auf dem Hauptgleis steht diesmal nur eine Person: der Mensch, der dir am nächsten steht. Auf dem Nebengleis arbeiten fünf Fremde. Tust du nichts, stirbt dein Mensch. Legst du um, sterben die fünf.',
    q: 'Legst du um, um deinen Menschen zu retten?', yes: 'Umlegen', no: 'Nichts tun',
    note: 'Strenge Utilitaristen sagen: Jedes Leben zählt gleich, also nein. Der Philosoph Bernard Williams hielt dagegen: Wer in so einem Moment erst nachrechnet, ob er den eigenen Partner retten darf, hat „einen Gedanken zu viel“.' },
  { id: 'auto', title: 'Das selbstfahrende Auto', scene: 'icon', main: ['🚶', 5], side: ['🚗', 1],
    text: 'Du sitzt allein in einem selbstfahrenden Auto. Plötzlich laufen fünf Menschen auf die Straße, bremsen geht nicht mehr. Das Auto kann geradeaus fahren und die fünf töten oder gegen eine Betonwand ausweichen, was dich tötet. Du legst vorher fest, wie es programmiert wird.',
    q: 'Soll dein Auto ausweichen und dich opfern?', yes: 'Ja, ausweichen', no: 'Nein, mich schützen',
    note: 'Eine Studie in „Science“ (2016) fand genau hier ein Dilemma: Die meisten finden Autos richtig, die möglichst viele Leben retten – würden selbst aber lieber eines kaufen, das die Insassen schützt.' },
];

// ---------- Gleis-Ansicht ----------
const SVGNS = 'http://www.w3.org/2000/svg';
function svg(tag, attrs, text) {
  const n = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs || {})) n.setAttribute(k, v);
  if (text != null) n.textContent = text;
  return n;
}
const expand = g => Array.isArray(g) && typeof g[1] === 'number' ? Array(g[1]).fill(g[0]) : g;
const PATHS = {
  main: 'M0,150 L360,150',
  side: 'M105,150 C160,150 170,66 225,66 L360,66',
  loop: 'M70,150 C105,150 110,66 150,66 L185,66 C225,66 230,150 262,150',
};
function track(d) {
  const g = svg('g');
  g.append(svg('path', { d, class: 'tr-bed' }), svg('path', { d, class: 'tr-ties' }));
  return g;
}
function figures(list, x0, x1, y) {
  const g = svg('g', { class: 'figs' });
  const n = list.length;
  const step = n > 1 ? Math.min(24, (x1 - x0) / (n - 1)) : 0;
  const start = (x0 + x1) / 2 - step * (n - 1) / 2;
  list.forEach((e, i) => g.append(svg('text', { x: start + i * step, y, class: 'fig', 'text-anchor': 'middle' }, e)));
  g.dataset.cx = (x0 + x1) / 2;
  g.dataset.cy = y;
  return g;
}
function moveAlong(node, d, ms, host) {
  return new Promise(res => {
    const p = svg('path', { d, fill: 'none' });
    host.append(p);
    const len = p.getTotalLength();
    const t0 = performance.now();
    const tick = now => {
      const k = Math.min(1, (now - t0) / ms);
      const pt = p.getPointAtLength(len * k * k * (3 - 2 * k)); // weich anfahren und bremsen
      node.setAttribute('x', pt.x);
      node.setAttribute('y', pt.y - 4);
      if (k < 1) requestAnimationFrame(tick); else { p.remove(); res(); }
    };
    requestAnimationFrame(tick);
  });
}
const wait = ms => new Promise(r => setTimeout(r, ms));

// Baut die Szene. play(true) = eingreifen, play(false) = nichts tun.
function makeScene(cfg) {
  const kind = cfg.scene;
  const root = svg('svg', { viewBox: '0 0 360 190', class: 'scene', role: 'img', 'aria-label': 'Gleis-Ansicht' });
  const main = expand(cfg.main), side = expand(cfg.side);
  let gMain, gSide, tram;
  const hit = g => {
    g.classList.add('hit');
    root.append(svg('text', { x: g.dataset.cx, y: Number(g.dataset.cy) - 2, class: 'boom', 'text-anchor': 'middle' }, '💥'));
  };

  if (kind === 'icon') {
    gMain = figures(main, 30, 150, 105);
    gSide = figures(side, 250, 320, 105);
    root.append(svg('text', { x: 200, y: 104, class: 'vs', 'text-anchor': 'middle' }, 'oder'), gMain, gSide);
    return { el: root, play: async yes => { await wait(250); hit(yes ? gSide : gMain); (yes ? gMain : gSide).classList.add('safe'); await wait(500); } };
  }

  root.append(track(PATHS.main));
  if (kind === 'switch') {
    root.append(track(PATHS.side));
    gMain = figures(main, 262, 345, 146);
    gSide = figures(side, 262, 345, 62);
  } else if (kind === 'loop') {
    root.append(track(PATHS.loop));
    gMain = figures(main, 285, 350, 146);
    gSide = figures(side, 168, 168, 62);
  } else { // bridge
    root.append(svg('rect', { x: 150, y: 74, width: 70, height: 7, rx: 2, class: 'bridge' }),
      svg('rect', { x: 153, y: 81, width: 5, height: 62, class: 'bridge' }), svg('rect', { x: 212, y: 81, width: 5, height: 62, class: 'bridge' }));
    gMain = figures(main, 262, 345, 146);
    gSide = figures(side, 185, 185, 72);
  }
  if (kind !== 'bridge') root.append(svg('circle', { cx: kind === 'loop' ? 70 : 105, cy: 150, r: 5, class: 'switch-dot' }));
  tram = svg('text', { x: 24, y: 146, class: 'tram', 'text-anchor': 'middle' }, '🚋');
  root.append(gMain, gSide, tram);

  const play = async yes => {
    if (kind === 'bridge') {
      if (yes) {
        const man = gSide.firstChild;
        man.style.transition = 'transform .35s ease-in';
        man.style.transform = 'translateY(74px)';
        gSide.dataset.cy = 146;
        await moveAlong(tram, 'M24,150 L160,150', 900, root);
        hit(gSide);
        gMain.classList.add('safe');
      } else {
        await moveAlong(tram, 'M24,150 L262,150', 1100, root);
        hit(gMain);
      }
    } else if (kind === 'loop') {
      if (yes) { await moveAlong(tram, 'M24,150 L70,150 C105,150 110,66 146,66', 1000, root); hit(gSide); gMain.classList.add('safe'); }
      else { await moveAlong(tram, 'M24,150 L282,150', 1100, root); hit(gMain); gSide.classList.add('safe'); }
    } else {
      if (yes) { await moveAlong(tram, 'M24,150 L105,150 C160,150 170,66 225,66 L258,66', 1200, root); hit(gSide); gMain.classList.add('safe'); }
      else { await moveAlong(tram, 'M24,150 L258,150', 1100, root); hit(gMain); gSide.classList.add('safe'); }
    }
    await wait(450);
  };
  return { el: root, play };
}

// ---------- Rahmen: öffnen, schließen, Menü ----------
function openTrolley() {
  if (gameEl.hidden) history.pushState({ trolley: true }, '');
  gameEl.hidden = false;
  renderGameMenu();
}
function closeTrolley(fromPopstate) {
  gameEl.hidden = true;
  gameMode = null;
  gameBody.innerHTML = '';
  if (!fromPopstate && history.state?.trolley) history.back();
  if ($('view-think').classList.contains('active') && typeof renderDenken === 'function') renderDenken();
}
$('game-back').onclick = () => { if (gameMode) renderGameMenu(); else closeTrolley(false); };
window.addEventListener('popstate', e => { if (!gameEl.hidden && !e.state?.trolley) closeTrolley(true); });

function screen(title) {
  $('game-title').textContent = title;
  gameBody.innerHTML = '';
  gameScroll.scrollTop = 0;
  return gameBody;
}
function pct(k, n) { return n ? Math.round(k / n * 100) : 0; }
function bar(label, value, hint) {
  const row = el('div', 'gbar');
  const top = el('div', 'gbar-top');
  top.append(el('span', null, label), el('b', null, value + ' %'));
  const line = el('div', 'gbar-line');
  const fill = el('i');
  fill.style.width = value + '%';
  line.append(fill);
  row.append(top, line);
  if (hint) row.append(el('small', null, hint));
  return row;
}
function choiceButtons(yes, no, onPick) {
  const box = el('div', 'gchoice');
  const a = el('button', 'btn gyes', yes), b = el('button', 'btn gno', no);
  a.onclick = () => { a.disabled = b.disabled = true; a.classList.add('picked'); onPick(true); };
  b.onclick = () => { a.disabled = b.disabled = true; b.classList.add('picked'); onPick(false); };
  box.append(a, b);
  return box;
}

function renderGameMenu() {
  gameMode = null;
  const b = screen('Weichensteller');
  b.append(el('div', 'ghero', '🚋'), el('h1', null, 'Weichensteller'),
    el('p', 'gintro', 'Eine Bahn rast heran, und du stehst am Hebel. Jede Entscheidung kostet jemanden das Leben – auch die, nichts zu tun.'));
  const cDone = TROLLEY_CLASSICS.filter(c => tg.classics[c.id] != null).length;
  const sDone = TROLLEY_STACK.filter(d => tg.stack[d.n] != null).length;
  const modes = [
    ['🚋', 'Klassiker', 'Zehn berühmte Fälle der Philosophie – mit den Zahlen, wie andere entschieden haben.', `${cDone} von ${TROLLEY_CLASSICS.length}`, startClassics],
    ['♾️', 'Endlos', 'Immer neue, gewürfelte Fälle. Nach zehn Runden siehst du dein Muster.', `${tg.endless.n} Runden`, startEndless],
    ['📚', 'Dilemma-Stapel', '46 Fälle aus der psychologischen Forschung. Härter, und ganz ohne Gleise.', `${sDone} von ${TROLLEY_STACK.length}`, startStack],
  ];
  for (const [icon, name, text, prog, fn] of modes) {
    const c = el('button', 'gmode');
    const t = el('div', 'gmode-t');
    t.append(el('b', null, name), el('small', null, text), el('span', 'gmode-p', prog));
    c.append(el('span', 'gmode-i', icon), t, el('span', 'gmode-go', '›'));
    c.onclick = fn;
    b.append(c);
  }
  const pat = patternBlock();
  if (pat) b.append(el('h3', null, 'Dein Muster'), pat);
  b.append(el('p', 'gsource', 'Zahlen der Klassiker: ' + STAT_SOURCE + '. Dilemma-Stapel: Christensen u. a. (2014), Frontiers in Psychology 5:607, CC BY.'));
}

// ---------- Auswertung ----------
const DIM_LABEL = {
  anzahl: ['Viele vor wenigen', 'So oft hast du die größere Gruppe gerettet.'],
  alter: ['Jung vor alt', 'So oft hast du die Jüngeren gerettet.'],
  art: ['Mensch vor Tier', 'So oft hast du Menschen statt Tiere gerettet.'],
  status: ['Ärztin vor Bankräuber', 'So oft zählte für dich, wer jemand ist.'],
  regel: ['Wer sich an Regeln hält', 'So oft hast du die verschont, die nichts falsch gemacht haben.'],
};
function patternBlock() {
  const box = el('div', 'gpattern');
  const e = tg.endless;
  if (e.n >= 5) {
    box.append(bar('Du greifst ein', pct(e.sw, e.n), `In ${e.sw} von ${e.n} Endlos-Runden hast du die Weiche umgelegt.`));
    for (const [key, [label, hint]] of Object.entries(DIM_LABEL)) {
      const d = e.dims[key];
      if (d && d[1] >= 3) box.append(bar(label, pct(d[0], d[1]), `${hint} (${d[0]} von ${d[1]})`));
    }
    box.append(el('p', 'gnote', 'Zum Vergleich: In der weltweiten „Moral Machine“-Studie des MIT (2018) waren die drei stärksten Vorlieben Menschen vor Tieren, viele vor wenigen und Junge vor Alten.'));
  }
  const st = { p: [0, 0], d: [0, 0], i: [0, 0], a: [0, 0] };
  for (const dl of TROLLEY_STACK) {
    const v = tg.stack[dl.n];
    if (v == null) continue;
    const a = dl.p ? st.p : st.d; a[1]++; a[0] += v;
    const c = dl.i ? st.i : st.a; c[1]++; c[0] += v;
  }
  if (st.p[1] >= 4 && st.d[1] >= 4) {
    box.append(el('h4', null, 'Dilemma-Stapel: Wann sagst du Ja?'),
      bar('Eigenhändig töten', pct(st.p[0], st.p[1]), `Ja in ${st.p[0]} von ${st.p[1]} Fällen`),
      bar('Aus der Distanz', pct(st.d[0], st.d[1]), `Ja in ${st.d[0]} von ${st.d[1]} Fällen`));
    if (st.i[1] >= 4 && st.a[1] >= 4) box.append(
      bar('Tod als Mittel zum Zweck', pct(st.i[0], st.i[1]), `Ja in ${st.i[0]} von ${st.i[1]} Fällen`),
      bar('Tod als Nebenfolge', pct(st.a[0], st.a[1]), `Ja in ${st.a[0]} von ${st.a[1]} Fällen`));
    box.append(el('p', 'gnote', 'In der Forschung sagen Menschen seltener Ja, wenn sie selbst Hand anlegen müssten und wenn der Tod das Mittel ist statt eine Nebenfolge.'));
  }
  return box.children.length ? box : null;
}

// ---------- Klassiker ----------
function startClassics() {
  gameMode = 'classics';
  let i = TROLLEY_CLASSICS.findIndex(c => tg.classics[c.id] == null);
  if (i < 0) i = 0; // alles gespielt: von vorn
  showClassic(i);
}
function showClassic(i) {
  const c = TROLLEY_CLASSICS[i];
  const b = screen('Klassiker');
  const sc = makeScene(c);
  b.append(el('p', 'gstep', `Fall ${i + 1} von ${TROLLEY_CLASSICS.length}`), el('h2', null, c.title), sc.el, el('p', null, c.text), el('p', 'gq', c.q));
  b.append(choiceButtons(c.yes, c.no, async yes => {
    tg.classics[c.id] = yes ? 1 : 0;
    saveTg();
    await sc.play(yes);
    const r = el('div', 'gresult');
    if (c.stat != null) r.append(bar('So viele würden hier eingreifen', c.stat, STAT_SOURCE));
    r.append(el('p', null, c.note));
    const last = i === TROLLEY_CLASSICS.length - 1;
    const next = el('button', 'btn gnext', last ? 'Fertig – zum Menü' : 'Nächster Fall →');
    next.onclick = () => last ? renderGameMenu() : showClassic(i + 1);
    r.append(next);
    b.append(r);
    r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }));
}

// ---------- Endlos ----------
const WHO = {
  // Einzahl, Mehrzahl, Symbol, Artikel
  kind: ['Kind', 'Kinder', '🧒', 'ein'], frau: ['Frau', 'Frauen', '👩', 'eine'], mann: ['Mann', 'Männer', '👨', 'ein'],
  opa: ['Rentner', 'Rentner', '👴', 'ein'], oma: ['Rentnerin', 'Rentnerinnen', '👵', 'eine'],
  arzt: ['Ärztin', 'Ärztinnen', '👩‍⚕️', 'eine'], dieb: ['Bankräuber', 'Bankräuber', '🦹', 'ein'],
  hund: ['Hund', 'Hunde', '🐕', 'ein'], katze: ['Katze', 'Katzen', '🐈', 'eine'],
};
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const grp = (type, n) => ({ type, n });
const grpText = g => `${g.n === 1 ? WHO[g.type][3] : g.n} ${WHO[g.type][g.n === 1 ? 0 : 1]}`;
const grpEmoji = g => Array(g.n).fill(WHO[g.type][2]);

// Würfelt einen Fall. a und b sind die beiden Gruppen; prefer sagt je Merkmal, welche Seite die „übliche“ Wahl wäre.
function rollCase() {
  const adult = () => pick(['frau', 'mann']);
  const kinds = ['anzahl', 'anzahl', 'alter', 'art', 'status', 'regel', 'gleich', 'mixalter', 'mixtier'];
  const k = pick(kinds);
  let a, b, prefer = {}, noteB = false;
  if (k === 'anzahl') { const t = adult(); const n = rnd(1, 2); a = grp(t, n); b = grp(t, rnd(n + 1, 5)); prefer.anzahl = 'b'; }
  else if (k === 'alter') { const n = rnd(1, 3); a = grp('kind', n); b = grp(pick(['opa', 'oma']), n); prefer.alter = 'a'; }
  else if (k === 'art') { a = grp(adult(), rnd(1, 2)); b = grp(pick(['hund', 'katze']), rnd(1, 5)); prefer.art = 'a'; }
  else if (k === 'status') { const n = rnd(1, 2); a = grp('arzt', n); b = grp('dieb', n); prefer.status = 'a'; }
  else if (k === 'regel') { const t = adult(); const n = rnd(1, 3); a = grp(t, n); b = grp(t, n); noteB = true; prefer.regel = 'a'; }
  else if (k === 'gleich') { const t = adult(); a = grp(t, 1); b = grp(t, 1); }
  else if (k === 'mixalter') { a = grp('kind', 1); b = grp(pick(['opa', 'oma']), rnd(2, 4)); prefer.alter = 'a'; prefer.anzahl = 'b'; }
  else { a = grp('dieb', 1); b = grp('hund', rnd(2, 5)); prefer.art = 'a'; }
  // Zufällig verteilen, wer auf dem Hauptgleis steht.
  const flip = Math.random() < 0.5;
  const note = g => g.n === 1 ? 'hat die Absperrung ignoriert' : 'haben die Absperrung ignoriert';
  return { main: flip ? b : a, side: flip ? a : b, mainKey: flip ? 'b' : 'a', noteMain: flip && noteB ? note(b) : '', noteSide: !flip && noteB ? note(b) : '', prefer };
}
let endlessRun = 0;
function startEndless() { gameMode = 'endless'; endlessRun = 0; showEndless(); }
function showEndless() {
  const cs = rollCase();
  const b = screen('Endlos');
  const sc = makeScene({ scene: 'switch', main: grpEmoji(cs.main), side: grpEmoji(cs.side) });
  const line = (label, g, note) => { const p = el('p', 'gline'); p.append(el('b', null, label + ': '), grpText(g) + (note ? ` (${note})` : '')); return p; };
  b.append(el('p', 'gstep', `Runde ${endlessRun + 1} von 10`), sc.el, line('Hauptgleis', cs.main, cs.noteMain), line('Nebengleis', cs.side, cs.noteSide), el('p', 'gq', 'Tust du nichts, trifft die Bahn das Hauptgleis.'));
  b.append(choiceButtons('Weiche umlegen', 'Nichts tun', async yes => {
    const e = tg.endless;
    e.n++; if (yes) e.sw++;
    const savedKey = yes ? cs.mainKey : (cs.mainKey === 'a' ? 'b' : 'a'); // umlegen rettet das Hauptgleis
    for (const [dim, side] of Object.entries(cs.prefer)) {
      const d = e.dims[dim] = e.dims[dim] || [0, 0];
      d[1]++; if (side === savedKey) d[0]++;
    }
    saveTg();
    endlessRun++;
    await sc.play(yes);
    const r = el('div', 'gresult');
    const dead = yes ? cs.side : cs.main, alive = yes ? cs.main : cs.side;
    r.append(el('p', null, `Gerettet: ${grpText(alive)}. Gestorben: ${grpText(dead)}.`));
    const next = el('button', 'btn gnext', endlessRun >= 10 ? 'Auswertung ansehen →' : 'Nächste Runde →');
    next.onclick = () => endlessRun >= 10 ? showEndlessSummary() : showEndless();
    r.append(next);
    b.append(r);
    r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }));
}
function showEndlessSummary() {
  const b = screen('Endlos');
  b.append(el('div', 'ghero', '📊'), el('h2', null, 'Dein Muster'), el('p', 'gintro', `Ausgewertet sind alle ${tg.endless.n} Runden, die du bisher gespielt hast.`));
  const pat = patternBlock();
  if (pat) b.append(pat);
  const more = el('button', 'btn gnext', 'Noch zehn Runden →');
  more.onclick = startEndless;
  const menu = el('button', 'btn ghost2 gnext', 'Zum Menü');
  menu.onclick = renderGameMenu;
  b.append(more, menu);
}

// ---------- Dilemma-Stapel ----------
function stackOrder() {
  if (!tg.order || tg.order.length !== TROLLEY_STACK.length) {
    // Erst von jedem Szenario eine zufällige Variante, dann die jeweils andere – so liegen die Paare weit auseinander.
    const byS = {};
    TROLLEY_STACK.forEach(d => (byS[d.s] = byS[d.s] || []).push(d.n));
    const sc = Object.keys(byS).sort(() => Math.random() - 0.5);
    const first = [], second = [];
    for (const s of sc) { const [x, y] = byS[s].sort(() => Math.random() - 0.5); first.push(x); if (y != null) second.push(y); }
    tg.order = first.concat(second); // gleiche Reihenfolge: zwischen den zwei Varianten liegen immer 22 andere Fälle
    saveTg();
  }
  return tg.order;
}
function startStack() {
  gameMode = 'stack';
  const done = TROLLEY_STACK.filter(d => tg.stack[d.n] != null).length;
  if (done > 0 && done < TROLLEY_STACK.length) return showStack();
  const b = screen('Dilemma-Stapel');
  b.append(el('div', 'ghero', '📚'), el('h2', null, 'Dilemma-Stapel'),
    el('p', null, 'Diese 46 Fälle stammen aus der psychologischen Forschung. Jedes Szenario kommt zweimal vor, in zwei Varianten, die sich in einem entscheidenden Detail unterscheiden.'),
    el('p', null, 'Sie sind bewusst hart: Es geht immer um Leben und Tod, manchmal um Kinder. Du kannst jederzeit aufhören, dein Stand bleibt gespeichert.'));
  if (done === TROLLEY_STACK.length) b.append(el('p', 'gnote', 'Du hast alle 46 Fälle beantwortet. Wenn du neu startest, werden deine Antworten gelöscht.'));
  const go = el('button', 'btn gnext', done === TROLLEY_STACK.length ? 'Von vorn beginnen' : 'Starten →');
  go.onclick = () => { if (done === TROLLEY_STACK.length) { tg.stack = {}; tg.order = null; saveTg(); } showStack(); };
  b.append(go, el('p', 'gsource', 'Quelle: Christensen, Flexas, Calabrese, Gut & Gomila (2014): „Moral judgment reloaded: a moral dilemma validation study“. Frontiers in Psychology 5:607. Lizenz CC BY. Deutsche Fassung der Autoren.'));
}
function showStack() {
  const order = stackOrder();
  const n = order.find(x => tg.stack[x] == null);
  if (n == null) return showStackEnd();
  const d = TROLLEY_STACK.find(x => x.n === n);
  const [icon, title] = TROLLEY_STACK_TITLES[d.s];
  const done = order.filter(x => tg.stack[x] != null).length;
  const b = screen('Dilemma-Stapel');
  b.append(el('p', 'gstep', `Fall ${done + 1} von ${order.length}`), el('div', 'ghero small', icon), el('h2', null, title), el('p', null, d.text), el('p', null, d.act), el('p', 'gq', d.q));
  b.append(choiceButtons('Ja', 'Nein', yes => {
    tg.stack[d.n] = yes ? 1 : 0;
    saveTg();
    const r = el('div', 'gresult');
    const chips = el('div', 'meta');
    chips.append(el('span', 'chip', d.p ? '✋ Eigenhändig' : '🎛️ Aus der Distanz'), el('span', 'chip', d.i ? '🎯 Tod als Mittel' : '↪️ Tod als Nebenfolge'));
    r.append(chips, el('p', 'gnote', (d.p ? 'Hier müsstest du selbst Hand anlegen. ' : 'Hier löst du den Tod nur aus der Ferne aus. ') + (d.i ? 'Der Tod des Opfers ist das Mittel, das die anderen rettet.' : 'Der Tod des Opfers ist eine Nebenfolge der Rettung.')));
    const next = el('button', 'btn gnext', 'Weiter →');
    next.onclick = showStack;
    r.append(next);
    b.append(r);
    r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }));
}
function showStackEnd() {
  const b = screen('Dilemma-Stapel');
  b.append(el('div', 'ghero', '🏁'), el('h2', null, 'Alle 46 Fälle beantwortet'));
  const pat = patternBlock();
  if (pat) b.append(pat);
  const menu = el('button', 'btn gnext', 'Zum Menü');
  menu.onclick = renderGameMenu;
  b.append(menu);
}
