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
const STAT_SOURCE = T('Studie mit 70 000 Menschen in 42 Ländern (Awad u. a., PNAS 2020)', 'Study with 70,000 people in 42 countries (Awad et al., PNAS 2020)');

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

// English texts for the classics (same ids as above).
const TROLLEY_CLASSICS_EN = {
  weiche: { title: 'The Switch', q: 'Do you pull the lever?', yes: 'Pull the lever', no: 'Do nothing',
    text: 'A runaway tram is hurtling towards five track workers. You are standing at the switch. If you pull the lever, the tram turns onto the side track and kills a single worker there.',
    note: 'The original case, devised by Philippa Foot in 1967. Most people consider pulling the lever permissible: the death of the one is a foreseen but unintended side effect.' },
  bruecke: { title: 'The Footbridge', q: 'Do you push the man off?', yes: 'Push him', no: 'Do nothing',
    text: 'This time there is no switch. You are standing on a footbridge over the track, next to a very heavy man. If you push him off, his body stops the tram. He dies, the five survive.',
    note: 'Judith Jarvis Thomson’s famous variant. The sum is the same as with the switch. But here you use a person as a means and do it with your own hands – for many that makes the difference.' },
  schleife: { title: 'The Loop', q: 'Do you pull the lever?', yes: 'Pull the lever', no: 'Do nothing',
    text: 'A switch again. But the side track loops back onto the main track. A heavy man is standing on the loop. Only because his body stops the tram does it no longer reach the five.',
    note: 'Thomson’s “Loop” from 1985. The tricky part: as on the footbridge, you need the man’s body as a brake. Yet far more people agree than with pushing. So it seems to be less about “means to an end” than about whether you lay hands on someone yourself.' },
  falltuer: { title: 'The Trapdoor', q: 'Do you open the trapdoor?', yes: 'Open the trapdoor', no: 'Do nothing',
    text: 'Again a heavy man is standing on the footbridge. This time you do not have to touch him: he is standing on a trapdoor, and you have a lever for it at a safe distance. If you open it, he falls onto the track and stops the tram.',
    note: 'In experiments by the psychologist Joshua Greene, clearly more people agree here than with pushing by hand. Physical closeness and your own muscle power make an act seem worse, although the result is the same.' },
  saboteur: { title: 'The Saboteur', q: 'Do you push the saboteur off?', yes: 'Push him', no: 'Do nothing',
    text: 'The man on the footbridge is no bystander: he deliberately destroyed the tram’s brakes in order to kill the five. If you push him off, his body stops the tram.',
    note: 'In the literature the case is called the “Fat Villain”. Many who hesitate with an innocent man push here. Guilt changes what we may impose on someone – much as in self-defence.' },
  chirurg: { title: 'The Surgeon', q: 'Do you sacrifice the visitor for the five?', yes: 'Yes, save the five', no: 'No',
    text: 'You are a surgeon. Five of your patients will die today unless they receive a donor organ. In the waiting room sits a perfectly healthy visitor whose organs match all five. Nobody would ever find out.',
    note: 'Five against one again, and yet almost everyone says no here. Philippa Foot and Judith Thomson used this to show: redirecting an existing danger is different from creating a new one for a bystander.' },
  garten: { title: 'The Man in the Yard', q: 'Do you derail the tram?', yes: 'Derail it', no: 'Do nothing',
    text: 'You can only stop the tram by derailing it with the switch. It will then plunge down a slope into a garden where a man is asleep in his hammock. He has nothing to do with the track.',
    note: 'The case comes from the philosopher Peter Unger. A track worker knows the risks of his job; the man in the garden is at home. Some think: whoever has not put himself in danger has a stronger right to be spared.' },
  selbst: { title: 'You Yourself', q: 'Do you turn the tram onto yourself?', yes: 'Turn it onto me', no: 'Do nothing',
    text: 'This time no stranger is standing on the side track. You yourself are stuck there by the foot, with the lever within reach. If you pull it, the tram hits you instead of the five.',
    note: 'Judith Thomson asked this question in 2008 and changed her own mind with it: whoever would not be willing to sacrifice himself may not force that sacrifice on a stranger either. On that view even pulling the lever in the original case would not be permitted.' },
  liebe: { title: 'The One You Love', q: 'Do you pull the lever to save your person?', yes: 'Pull the lever', no: 'Do nothing',
    text: 'This time only one person is on the main track: the person closest to you. Five strangers are working on the side track. If you do nothing, your person dies. If you pull the lever, the five die.',
    note: 'Strict utilitarians say: every life counts the same, so no. The philosopher Bernard Williams objected: anyone who first calculates, in such a moment, whether he may save his own partner has “one thought too many”.' },
  auto: { title: 'The Self-Driving Car', q: 'Should your car swerve and sacrifice you?', yes: 'Yes, swerve', no: 'No, protect me',
    text: 'You are alone in a self-driving car. Suddenly five people run into the road; braking is no longer possible. The car can go straight on and kill the five, or swerve into a concrete wall, which kills you. You decide beforehand how it is programmed.',
    note: 'A study in “Science” (2016) found a dilemma right here: most people approve of cars that save as many lives as possible – but would rather buy one that protects its passengers.' },
};
if (LANG === 'en') TROLLEY_CLASSICS.forEach(c => Object.assign(c, TROLLEY_CLASSICS_EN[c.id]));

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
  const root = svg('svg', { viewBox: '0 0 360 190', class: 'scene', role: 'img', 'aria-label': T('Gleis-Ansicht', 'Track view') });
  const main = expand(cfg.main), side = expand(cfg.side);
  let gMain, gSide, tram;
  const hit = g => {
    g.classList.add('hit');
    root.append(svg('text', { x: g.dataset.cx, y: Number(g.dataset.cy) - 2, class: 'boom', 'text-anchor': 'middle' }, '💥'));
  };

  if (kind === 'icon') {
    gMain = figures(main, 30, 150, 105);
    gSide = figures(side, 250, 320, 105);
    root.append(svg('text', { x: 200, y: 104, class: 'vs', 'text-anchor': 'middle' }, T('oder', 'or')), gMain, gSide);
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
  setTimeout(() => { if (gameEl.hidden) gameBody.innerHTML = ''; }, 380); // erst leeren, wenn das Blatt hinausgeglitten ist
  if (!fromPopstate && history.state?.trolley) history.back();
  if ($('view-think').classList.contains('active') && typeof renderDenken === 'function') renderDenken();
}
$('game-back').onclick = () => { if (gameMode) renderGameMenu(); else closeTrolley(false); };
window.addEventListener('popstate', e => { if (!gameEl.hidden && !e.state?.trolley) closeTrolley(true); });

function gameScreen(title) {
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
  const b = gameScreen(T('Weichensteller', 'Pull the Lever'));
  b.append(el('div', 'ghero', '🚋'), el('h1', null, T('Weichensteller', 'Pull the Lever')),
    el('p', 'gintro', T('Eine Bahn rast heran, und du stehst am Hebel. Jede Entscheidung kostet jemanden das Leben – auch die, nichts zu tun.', 'A tram is hurtling closer, and you are at the lever. Every decision costs someone their life – including the decision to do nothing.')));
  const cDone = TROLLEY_CLASSICS.filter(c => tg.classics[c.id] != null).length;
  const sDone = TROLLEY_STACK.filter(d => tg.stack[d.n] != null).length;
  const modes = [
    ['🚋', T('Klassiker', 'Classics'), T('Zehn berühmte Fälle der Philosophie – mit den Zahlen, wie andere entschieden haben.', 'Ten famous cases from philosophy – with figures on how others decided.'), `${cDone} ${T('von', 'of')} ${TROLLEY_CLASSICS.length}`, startClassics],
    ['♾️', T('Endlos', 'Endless'), T('Immer neue, gewürfelte Fälle. Nach zehn Runden siehst du dein Muster.', 'Ever new, randomly rolled cases. After ten rounds you see your pattern.'), `${tg.endless.n} ${T('Runden', 'rounds')}`, startEndless],
    ['📚', T('Dilemma-Stapel', 'Dilemma stack'), T('46 Fälle aus der psychologischen Forschung. Härter, und ganz ohne Gleise.', '46 cases from psychological research. Tougher, and without any tracks.'), `${sDone} ${T('von', 'of')} ${TROLLEY_STACK.length}`, startStack],
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
  if (pat) b.append(el('h3', null, T('Dein Muster', 'Your pattern')), pat);
  b.append(el('p', 'gsource', T('Zahlen der Klassiker: ', 'Figures for the classics: ') + STAT_SOURCE + T('. Dilemma-Stapel: Christensen u. a. (2014), Frontiers in Psychology 5:607, CC BY.', '. Dilemma stack: Christensen et al. (2014), Frontiers in Psychology 5:607, CC BY.')));
}

// ---------- Auswertung ----------
const DIM_LABEL = {
  anzahl: [T('Viele vor wenigen', 'Many before few'), T('So oft hast du die größere Gruppe gerettet.', 'How often you saved the larger group.')],
  alter: [T('Jung vor alt', 'Young before old'), T('So oft hast du die Jüngeren gerettet.', 'How often you saved the younger ones.')],
  art: [T('Mensch vor Tier', 'Humans before animals'), T('So oft hast du Menschen statt Tiere gerettet.', 'How often you saved humans rather than animals.')],
  status: [T('Ärztin vor Bankräuber', 'Doctor before bank robber'), T('So oft zählte für dich, wer jemand ist.', 'How often it mattered to you who someone is.')],
  regel: [T('Wer sich an Regeln hält', 'Those who follow the rules'), T('So oft hast du die verschont, die nichts falsch gemacht haben.', 'How often you spared those who had done nothing wrong.')],
};
function patternBlock() {
  const box = el('div', 'gpattern');
  const e = tg.endless;
  if (e.n >= 5) {
    box.append(bar(T('Du greifst ein', 'You intervene'), pct(e.sw, e.n), T(`In ${e.sw} von ${e.n} Endlos-Runden hast du die Weiche umgelegt.`, `You pulled the lever in ${e.sw} of ${e.n} endless rounds.`)));
    for (const [key, [label, hint]] of Object.entries(DIM_LABEL)) {
      const d = e.dims[key];
      if (d && d[1] >= 3) box.append(bar(label, pct(d[0], d[1]), `${hint} (${d[0]} ${T('von', 'of')} ${d[1]})`));
    }
    box.append(el('p', 'gnote', T('Zum Vergleich: In der weltweiten „Moral Machine“-Studie des MIT (2018) waren die drei stärksten Vorlieben Menschen vor Tieren, viele vor wenigen und Junge vor Alten.', 'For comparison: in MIT’s worldwide “Moral Machine” study (2018) the three strongest preferences were humans over animals, many over few and the young over the old.')));
  }
  const st = { p: [0, 0], d: [0, 0], i: [0, 0], a: [0, 0] };
  for (const dl of TROLLEY_STACK) {
    const v = tg.stack[dl.n];
    if (v == null) continue;
    const a = dl.p ? st.p : st.d; a[1]++; a[0] += v;
    const c = dl.i ? st.i : st.a; c[1]++; c[0] += v;
  }
  if (st.p[1] >= 4 && st.d[1] >= 4) {
    box.append(el('h4', null, T('Dilemma-Stapel: Wann sagst du Ja?', 'Dilemma stack: when do you say yes?')),
      bar(T('Eigenhändig töten', 'Killing with your own hands'), pct(st.p[0], st.p[1]), T(`Ja in ${st.p[0]} von ${st.p[1]} Fällen`, `Yes in ${st.p[0]} of ${st.p[1]} cases`)),
      bar(T('Aus der Distanz', 'From a distance'), pct(st.d[0], st.d[1]), T(`Ja in ${st.d[0]} von ${st.d[1]} Fällen`, `Yes in ${st.d[0]} of ${st.d[1]} cases`)));
    if (st.i[1] >= 4 && st.a[1] >= 4) box.append(
      bar(T('Tod als Mittel zum Zweck', 'Death as a means to an end'), pct(st.i[0], st.i[1]), T(`Ja in ${st.i[0]} von ${st.i[1]} Fällen`, `Yes in ${st.i[0]} of ${st.i[1]} cases`)),
      bar(T('Tod als Nebenfolge', 'Death as a side effect'), pct(st.a[0], st.a[1]), T(`Ja in ${st.a[0]} von ${st.a[1]} Fällen`, `Yes in ${st.a[0]} of ${st.a[1]} cases`)));
    box.append(el('p', 'gnote', T('In der Forschung sagen Menschen seltener Ja, wenn sie selbst Hand anlegen müssten und wenn der Tod das Mittel ist statt eine Nebenfolge.', 'In research, people say yes less often when they would have to do it with their own hands and when the death is the means rather than a side effect.')));
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
  const b = gameScreen(T('Klassiker', 'Classics'));
  const sc = makeScene(c);
  b.append(el('p', 'gstep', T(`Fall ${i + 1} von ${TROLLEY_CLASSICS.length}`, `Case ${i + 1} of ${TROLLEY_CLASSICS.length}`)), el('h2', null, c.title), sc.el, el('p', null, c.text), el('p', 'gq', c.q));
  b.append(choiceButtons(c.yes, c.no, async yes => {
    tg.classics[c.id] = yes ? 1 : 0;
    saveTg();
    await sc.play(yes);
    const r = el('div', 'gresult');
    if (c.stat != null) r.append(bar(T('So viele würden hier eingreifen', 'Share who would intervene here'), c.stat, STAT_SOURCE));
    r.append(el('p', null, c.note));
    const last = i === TROLLEY_CLASSICS.length - 1;
    const next = el('button', 'btn gnext', last ? T('Fertig – zum Menü', 'Done – back to the menu') : T('Nächster Fall →', 'Next case →'));
    next.onclick = () => last ? renderGameMenu() : showClassic(i + 1);
    r.append(next);
    b.append(r);
    r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }));
}

// ---------- Endlos ----------
const WHO = LANG === 'en' ? {
  // singular, plural, symbol, article
  kind: ['child', 'children', '🧒', 'a'], frau: ['woman', 'women', '👩', 'a'], mann: ['man', 'men', '👨', 'a'],
  opa: ['elderly man', 'elderly men', '👴', 'an'], oma: ['elderly woman', 'elderly women', '👵', 'an'],
  arzt: ['doctor', 'doctors', '👩‍⚕️', 'a'], dieb: ['bank robber', 'bank robbers', '🦹', 'a'],
  hund: ['dog', 'dogs', '🐕', 'a'], katze: ['cat', 'cats', '🐈', 'a'],
} : {
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
  const note = g => g.n === 1 ? T('hat die Absperrung ignoriert', 'ignored the barrier') : T('haben die Absperrung ignoriert', 'ignored the barrier');
  return { main: flip ? b : a, side: flip ? a : b, mainKey: flip ? 'b' : 'a', noteMain: flip && noteB ? note(b) : '', noteSide: !flip && noteB ? note(b) : '', prefer };
}
let endlessRun = 0;
function startEndless() { gameMode = 'endless'; endlessRun = 0; showEndless(); }
function showEndless() {
  const cs = rollCase();
  const b = gameScreen(T('Endlos', 'Endless'));
  const sc = makeScene({ scene: 'switch', main: grpEmoji(cs.main), side: grpEmoji(cs.side) });
  const line = (label, g, note) => { const p = el('p', 'gline'); p.append(el('b', null, label + ': '), grpText(g) + (note ? ` (${note})` : '')); return p; };
  b.append(el('p', 'gstep', T(`Runde ${endlessRun + 1} von 10`, `Round ${endlessRun + 1} of 10`)), sc.el, line(T('Hauptgleis', 'Main track'), cs.main, cs.noteMain), line(T('Nebengleis', 'Side track'), cs.side, cs.noteSide), el('p', 'gq', T('Tust du nichts, trifft die Bahn das Hauptgleis.', 'If you do nothing, the tram hits the main track.')));
  b.append(choiceButtons(T('Weiche umlegen', 'Pull the lever'), T('Nichts tun', 'Do nothing'), async yes => {
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
    r.append(el('p', null, T(`Gerettet: ${grpText(alive)}. Gestorben: ${grpText(dead)}.`, `Saved: ${grpText(alive)}. Died: ${grpText(dead)}.`)));
    const next = el('button', 'btn gnext', endlessRun >= 10 ? T('Auswertung ansehen →', 'See the results →') : T('Nächste Runde →', 'Next round →'));
    next.onclick = () => endlessRun >= 10 ? showEndlessSummary() : showEndless();
    r.append(next);
    b.append(r);
    r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }));
}
function showEndlessSummary() {
  const b = gameScreen(T('Endlos', 'Endless'));
  b.append(el('div', 'ghero', '📊'), el('h2', null, T('Dein Muster', 'Your pattern')), el('p', 'gintro', T(`Ausgewertet sind alle ${tg.endless.n} Runden, die du bisher gespielt hast.`, `This covers all ${tg.endless.n} rounds you have played so far.`)));
  const pat = patternBlock();
  if (pat) b.append(pat);
  const more = el('button', 'btn gnext', T('Noch zehn Runden →', 'Ten more rounds →'));
  more.onclick = startEndless;
  const menu = el('button', 'btn ghost2 gnext', T('Zum Menü', 'Back to the menu'));
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
  const b = gameScreen(T('Dilemma-Stapel', 'Dilemma stack'));
  b.append(el('div', 'ghero', '📚'), el('h2', null, T('Dilemma-Stapel', 'Dilemma stack')),
    el('p', null, T('Diese 46 Fälle stammen aus der psychologischen Forschung. Jedes Szenario kommt zweimal vor, in zwei Varianten, die sich in einem entscheidenden Detail unterscheiden.', 'These 46 cases come from psychological research. Each scenario appears twice, in two variants that differ in one decisive detail.')),
    el('p', null, T('Sie sind bewusst hart: Es geht immer um Leben und Tod, manchmal um Kinder. Du kannst jederzeit aufhören, dein Stand bleibt gespeichert.', 'They are deliberately tough: it is always about life and death, sometimes about children. You can stop at any time; your progress is saved.')));
  if (done === TROLLEY_STACK.length) b.append(el('p', 'gnote', T('Du hast alle 46 Fälle beantwortet. Wenn du neu startest, werden deine Antworten gelöscht.', 'You have answered all 46 cases. If you start again, your answers will be deleted.')));
  const go = el('button', 'btn gnext', done === TROLLEY_STACK.length ? T('Von vorn beginnen', 'Start over') : T('Starten →', 'Start →'));
  go.onclick = () => { if (done === TROLLEY_STACK.length) { tg.stack = {}; tg.order = null; saveTg(); } showStack(); };
  b.append(go, el('p', 'gsource', T('Quelle: Christensen, Flexas, Calabrese, Gut & Gomila (2014): „Moral judgment reloaded: a moral dilemma validation study“. Frontiers in Psychology 5:607. Lizenz CC BY. Deutsche Fassung der Autoren.', 'Source: Christensen, Flexas, Calabrese, Gut & Gomila (2014): “Moral judgment reloaded: a moral dilemma validation study”. Frontiers in Psychology 5:607. Licence CC BY. English version by the authors.')));
}
function showStack() {
  const order = stackOrder();
  const n = order.find(x => tg.stack[x] == null);
  if (n == null) return showStackEnd();
  const d = TROLLEY_STACK.find(x => x.n === n);
  const [icon, title] = TROLLEY_STACK_TITLES[d.s];
  const done = order.filter(x => tg.stack[x] != null).length;
  const b = gameScreen(T('Dilemma-Stapel', 'Dilemma stack'));
  b.append(el('p', 'gstep', T(`Fall ${done + 1} von ${order.length}`, `Case ${done + 1} of ${order.length}`)), el('div', 'ghero small', icon), el('h2', null, title), el('p', null, d.text), el('p', null, d.act), el('p', 'gq', d.q));
  b.append(choiceButtons(T('Ja', 'Yes'), T('Nein', 'No'), yes => {
    tg.stack[d.n] = yes ? 1 : 0;
    saveTg();
    const r = el('div', 'gresult');
    const chips = el('div', 'meta');
    chips.append(el('span', 'chip', d.p ? T('✋ Eigenhändig', '✋ With your own hands') : T('🎛️ Aus der Distanz', '🎛️ From a distance')), el('span', 'chip', d.i ? T('🎯 Tod als Mittel', '🎯 Death as a means') : T('↪️ Tod als Nebenfolge', '↪️ Death as a side effect')));
    r.append(chips, el('p', 'gnote', (d.p ? T('Hier müsstest du selbst Hand anlegen. ', 'Here you would have to do it with your own hands. ') : T('Hier löst du den Tod nur aus der Ferne aus. ', 'Here you only trigger the death from afar. ')) + (d.i ? T('Der Tod des Opfers ist das Mittel, das die anderen rettet.', 'The victim’s death is the means that saves the others.') : T('Der Tod des Opfers ist eine Nebenfolge der Rettung.', 'The victim’s death is a side effect of the rescue.'))));
    const next = el('button', 'btn gnext', T('Weiter →', 'Next →'));
    next.onclick = showStack;
    r.append(next);
    b.append(r);
    r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }));
}
function showStackEnd() {
  const b = gameScreen(T('Dilemma-Stapel', 'Dilemma stack'));
  b.append(el('div', 'ghero', '🏁'), el('h2', null, T('Alle 46 Fälle beantwortet', 'All 46 cases answered')));
  const pat = patternBlock();
  if (pat) b.append(pat);
  const menu = el('button', 'btn gnext', T('Zum Menü', 'Back to the menu'));
  menu.onclick = renderGameMenu;
  b.append(menu);
}
