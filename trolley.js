'use strict';
// „Das Trolley-Spiel“ (Untertitel „Weichensteller“) im Tab „Denken“.
// Drei Teile: Klassiker (berühmte Fälle mit echten Umfragezahlen), Zufallsrunde (gewürfelte Fälle)
// und der Forschungs-Stapel (46 Fälle aus der Forschung, siehe trolley-data.js / trolley-data.en.js).
// Ebenen wie im Denken-Blatt: Menü → Modus. Pfeil und Zurück-Geste gehen eine Ebene zurück, Wegziehen schließt.
// Nutzt el(), $, store, levelSheet(), icBox() und symEl() aus app.js.

const tg = store.get('trolley', { classics: {}, stack: {}, order: null, endless: { n: 0, sw: 0, dims: {} } });
const saveTg = () => store.set('trolley', tg);
const gameEl = $('game');
const gameBody = $('game-body');
const gameScroll = $('game-scroll');

// Zahlen: Awad u. a. (2020), PNAS – 70 000 Menschen in 42 Ländern, Durchschnitt über die Länder.
const STAT_SOURCE = T('Studie mit 70\u00a0000 Menschen in 42 Ländern (Awad u. a., PNAS 2020)', 'Study with 70,000 people in 42 countries (Awad et al., PNAS 2020)');

const TROLLEY_CLASSICS = [
  { id: 'weiche', title: 'Die Weiche', scene: 'switch', main: ['worker', 5], side: ['worker', 1], stat: 81,
    text: 'Eine führerlose Straßenbahn rast auf fünf Gleisarbeiter zu. Du stehst an der Weiche. Legst du sie um, fährt die Bahn aufs Nebengleis und tötet dort einen einzelnen Arbeiter.',
    q: 'Legst du die Weiche um?', yes: 'Weiche umlegen', no: 'Nichts tun',
    note: 'Der Ausgangsfall, 1967 von Philippa Foot erdacht. Die meisten halten das Umlegen für erlaubt: Der Tod des einen ist eine vorhergesehene, aber nicht beabsichtigte Nebenfolge.' },
  { id: 'bruecke', title: 'Die Brücke', scene: 'bridge', main: ['worker', 5], side: ['man', 1], stat: 51,
    text: 'Diesmal gibt es keine Weiche. Du stehst auf einer Brücke über dem Gleis, neben dir ein sehr schwerer Mann. Stößt du ihn hinunter, stoppt sein Körper die Bahn. Er stirbt, die fünf überleben.',
    q: 'Stößt du den Mann hinunter?', yes: 'Hinunterstoßen', no: 'Nichts tun',
    note: 'Judith Jarvis Thomsons berühmte Variante. Die Rechnung ist dieselbe wie bei der Weiche. Aber hier benutzt du einen Menschen als Mittel und legst selbst Hand an – das macht für viele den Unterschied.' },
  { id: 'schleife', title: 'Die Schleife', scene: 'loop', main: ['worker', 5], side: ['man', 1], stat: 72,
    text: 'Wieder eine Weiche. Aber das Nebengleis führt in einer Schleife zurück aufs Hauptgleis. Auf der Schleife steht ein schwerer Mann. Nur weil sein Körper die Bahn aufhält, erreicht sie die fünf nicht mehr.',
    q: 'Legst du die Weiche um?', yes: 'Weiche umlegen', no: 'Nichts tun',
    note: 'Thomsons „Loop“ von 1985. Das Tückische: Wie auf der Brücke brauchst du den Körper des Mannes als Bremsklotz. Trotzdem stimmen viel mehr Menschen zu als beim Stoßen. Es geht also wohl weniger um „Mittel zum Zweck“ als darum, ob man selbst Hand anlegt.' },
  { id: 'falltuer', title: 'Die Falltür', scene: 'bridge', main: ['worker', 5], side: ['man', 1],
    text: 'Wieder steht ein schwerer Mann auf der Brücke. Diesmal musst du ihn nicht anfassen: Er steht auf einer Falltür, und du hast aus sicherer Entfernung einen Hebel dafür. Öffnest du sie, fällt er aufs Gleis und stoppt die Bahn.',
    q: 'Öffnest du die Falltür?', yes: 'Falltür öffnen', no: 'Nichts tun',
    note: 'In Experimenten des Psychologen Joshua Greene stimmen hier deutlich mehr Menschen zu als beim Stoßen mit den eigenen Händen. Körperliche Nähe und eigene Muskelkraft lassen eine Tat schlimmer wirken, obwohl das Ergebnis gleich ist.' },
  { id: 'saboteur', title: 'Der Saboteur', scene: 'bridge', main: ['worker', 5], side: ['robber', 1],
    text: 'Der Mann auf der Brücke ist kein Unbeteiligter: Er hat die Bremsen der Bahn absichtlich zerstört, um die fünf zu töten. Stößt du ihn hinunter, stoppt sein Körper die Bahn.',
    q: 'Stößt du den Saboteur hinunter?', yes: 'Hinunterstoßen', no: 'Nichts tun',
    note: 'In der Fachliteratur heißt der Fall „Fat Villain“. Viele, die beim Unschuldigen zögern, stoßen hier. Schuld verändert, was wir jemandem zumuten dürfen – ähnlich wie bei der Notwehr.' },
  { id: 'chirurg', title: 'Der Chirurg', scene: 'icon', main: ['patient', 5], side: ['man', 1],
    text: 'Du bist Chirurgin. Fünf deiner Patienten sterben heute, wenn sie kein Spenderorgan bekommen. Im Wartezimmer sitzt ein kerngesunder Besucher, dessen Organe zu allen fünf passen. Niemand würde je davon erfahren.',
    q: 'Opferst du den Besucher für die fünf?', yes: 'Ja, die fünf retten', no: 'Nein',
    note: 'Wieder fünf gegen einen, und doch sagen hier fast alle Nein. Philippa Foot und Judith Thomson zeigten damit: Es ist etwas anderes, eine vorhandene Gefahr umzulenken, als für einen Unbeteiligten eine neue zu schaffen.' },
  { id: 'garten', title: 'Der Mann im Garten', scene: 'switch', main: ['worker', 5], side: ['sleeper', 1],
    text: 'Du kannst die Bahn nur aufhalten, indem du sie mit der Weiche entgleisen lässt. Sie stürzt dann einen Hang hinunter in einen Garten, in dem ein Mann in seiner Hängematte schläft. Mit dem Gleis hat er nichts zu tun.',
    q: 'Lässt du die Bahn entgleisen?', yes: 'Entgleisen lassen', no: 'Nichts tun',
    note: 'Der Fall stammt vom Philosophen Peter Unger. Ein Gleisarbeiter kennt das Risiko seines Berufs, der Mann im Garten ist bei sich zu Hause. Manche finden: Wer sich nicht in Gefahr begeben hat, hat ein stärkeres Recht, verschont zu werden.' },
  { id: 'selbst', title: 'Du selbst', scene: 'switch', main: ['worker', 5], side: ['you', 1],
    text: 'Auf dem Nebengleis steht diesmal kein Fremder. Du selbst steckst dort mit dem Fuß fest, den Weichenhebel in Reichweite. Legst du um, trifft die Bahn dich statt der fünf.',
    q: 'Lenkst du die Bahn auf dich selbst?', yes: 'Auf mich lenken', no: 'Nichts tun',
    note: 'Judith Thomson stellte diese Frage 2008 und änderte damit ihre eigene Meinung: Wer nicht bereit wäre, sich selbst zu opfern, darf dieses Opfer auch keinem Fremden aufzwingen. Danach wäre sogar das Umlegen im Ausgangsfall nicht erlaubt.' },
  { id: 'liebe', title: 'Der geliebte Mensch', scene: 'switch', main: ['loved', 1], side: ['worker', 5],
    text: 'Auf dem Hauptgleis steht diesmal nur eine Person: der Mensch, der dir am nächsten steht. Auf dem Nebengleis arbeiten fünf Fremde. Tust du nichts, stirbt dein Mensch. Legst du um, sterben die fünf.',
    q: 'Legst du um, um deinen Menschen zu retten?', yes: 'Umlegen', no: 'Nichts tun',
    note: 'Strenge Utilitaristen sagen: Jedes Leben zählt gleich, also nein. Der Philosoph Bernard Williams hielt dagegen: Wer in so einem Moment erst nachrechnet, ob er den eigenen Partner retten darf, hat „einen Gedanken zu viel“.' },
  { id: 'auto', title: 'Das selbstfahrende Auto', scene: 'icon', main: ['walker', 5], side: ['car', 1],
    text: 'Du sitzt allein in einem selbstfahrenden Auto. Plötzlich laufen fünf Menschen auf die Straße, bremsen geht nicht mehr. Das Auto kann geradeaus fahren und die fünf töten oder gegen eine Betonwand ausweichen, was dich tötet. Du legst vorher fest, wie es programmiert wird.',
    q: 'Soll dein Auto ausweichen und dich opfern?', yes: 'Ja, ausweichen', no: 'Nein, mich schützen',
    note: 'Eine Studie in „Science“ (2016) fand genau hier ein Dilemma: Die meisten finden Autos richtig, die möglichst viele Leben retten – würden selbst aber lieber eines kaufen, das die Insassen schützt.' },
];

// English texts for the classics (same ids as above).
const TROLLEY_CLASSICS_EN = {
  weiche: { title: 'The switch', q: 'Do you pull the lever?', yes: 'Pull the lever', no: 'Do nothing',
    text: 'A runaway trolley is hurtling towards five track workers. You are standing at the switch. If you pull the lever, the trolley turns onto the side track and kills a single worker there.',
    note: 'The original case, devised by Philippa Foot in 1967. Most people consider pulling the lever permissible: the death of the one is a foreseen but unintended side effect.' },
  bruecke: { title: 'The footbridge', q: 'Do you push the man off?', yes: 'Push him', no: 'Do nothing',
    text: 'This time there is no switch. You are standing on a footbridge over the track, next to a very heavy man. If you push him off, his body stops the trolley. He dies, the five survive.',
    note: 'Judith Jarvis Thomson’s famous variant. The numbers are the same as with the switch. But here you use a person as a means and do it with your own hands – for many that makes the difference.' },
  schleife: { title: 'The loop', q: 'Do you pull the lever?', yes: 'Pull the lever', no: 'Do nothing',
    text: 'A switch again. But the side track loops back onto the main track. A heavy man is standing on the loop. Only because his body stops the trolley does it no longer reach the five.',
    note: 'Thomson’s “Loop” from 1985. The tricky part: as on the footbridge, you need the man’s body as a brake. Yet far more people agree to this than to pushing. So it seems to be less about “means to an end” than about whether you lay hands on someone yourself.' },
  falltuer: { title: 'The trapdoor', q: 'Do you open the trapdoor?', yes: 'Open the trapdoor', no: 'Do nothing',
    text: 'Again a heavy man is standing on the footbridge. This time you don’t have to touch him: he is standing on a trapdoor, and you have a lever for it at a safe distance. If you open it, he falls onto the track and stops the trolley.',
    note: 'In experiments by the psychologist Joshua Greene, clearly more people agree to this than to pushing by hand. Physical closeness and your own muscle power make an act seem worse, although the result is the same.' },
  saboteur: { title: 'The saboteur', q: 'Do you push the saboteur off?', yes: 'Push him', no: 'Do nothing',
    text: 'The man on the footbridge is no bystander: he deliberately destroyed the trolley’s brakes in order to kill the five. If you push him off, his body stops the trolley.',
    note: 'In the literature the case is called the “Fat Villain”. Many who would hesitate with an innocent man do push here. Guilt changes what we may impose on someone – much as in self-defence.' },
  chirurg: { title: 'The surgeon', q: 'Do you sacrifice the visitor for the five?', yes: 'Yes, save the five', no: 'No',
    text: 'You are a surgeon. Five of your patients will die today unless they receive a donor organ. In the waiting room sits a perfectly healthy visitor whose organs match all five. Nobody would ever find out.',
    note: 'Five against one again, and yet almost everyone says no here. Philippa Foot and Judith Thomson used this to show: redirecting an existing danger is different from creating a new one for a bystander.' },
  garten: { title: 'The man in the garden', q: 'Do you derail the trolley?', yes: 'Derail it', no: 'Do nothing',
    text: 'You can only stop the trolley by derailing it with the switch. It will then plunge down a slope into a garden where a man is asleep in his hammock. He has nothing to do with the track.',
    note: 'The case comes from the philosopher Peter Unger. A track worker knows the risks of his job; the man in the garden is at home. Some think: whoever has not put himself in danger has a stronger right to be spared.' },
  selbst: { title: 'Yourself', q: 'Do you turn the trolley onto yourself?', yes: 'Turn it onto me', no: 'Do nothing',
    text: 'This time no stranger is standing on the side track. You yourself are stuck there by the foot, with the lever within reach. If you pull it, the trolley hits you instead of the five.',
    note: 'Judith Thomson asked this question in 2008 and changed her own mind with it: whoever would not be willing to sacrifice himself may not force that sacrifice on a stranger either. On that view even pulling the lever in the original case would not be permitted.' },
  liebe: { title: 'The one you love', q: 'Do you pull the lever to save the one you love?', yes: 'Pull the lever', no: 'Do nothing',
    text: 'This time only one person is on the main track: the person closest to you. Five strangers are working on the side track. If you do nothing, the person you love dies. If you pull the lever, the five die.',
    note: 'Strict utilitarians say: every life counts the same, so no. The philosopher Bernard Williams objected: anyone who first calculates, in such a moment, whether he may save his own partner has “one thought too many”.' },
  auto: { title: 'The self-driving car', q: 'Should your car swerve and sacrifice you?', yes: 'Yes, swerve', no: 'No, protect me',
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
// Gezeichnete Figuren statt Emojis. Jede Figur steht mit den Füßen auf (0, 0) und ist rund 22 Einheiten hoch.
// Erwachsene, Kinder (kleiner), Ältere (mit Stock) und Tiere (auf vier Beinen) sind auf einen Blick zu unterscheiden.
const HEAD = (x = 0) => `<circle class="fh" cx="${x}" cy="-17.6" r="3.4"/>`;
const MAN = HEAD() + '<path class="fl" d="M0 -13.6V-5.6M-4.2 -6.8L0 -12 4.2 -6.8M0 -5.6L-3.1 0M0 -5.6L3.1 0"/>';
const WOMAN = HEAD() + '<path class="fh" d="M0 -13.4L-4.3 -4.2H4.3Z"/><path class="fl" d="M-4.2 -6.8L0 -12 4.2 -6.8M-1.6 -4.2V0M1.6 -4.2V0"/>';
const FIG = {
  man: MAN,
  woman: WOMAN,
  worker: MAN + '<path d="M-4 -18.4a4 4 0 0 1 8 0z" fill="#f5c96b"/><path d="M-5 -18.4h10" stroke="#f5c96b" stroke-width="1.6" stroke-linecap="round"/>',
  child: '<circle class="fh" cx="0" cy="-12.2" r="2.8"/><path class="fl" d="M0 -9.2V-4M-3 -4.8L0 -8.4 3 -4.8M0 -4L-2.2 0M0 -4L2.2 0"/>',
  oldman: HEAD(1.4) + '<path class="fl" d="M.8 -13.4Q0 -9.6 -.4 -5.6M-4 -7L.4 -11.8 4.6 -7.6M-.4 -5.6L-3.4 0M-.4 -5.6L2.6 0M4.6 -7.6L5.8 0M4.6 -7.6q.5 -1.6 2.1 -1"/>',
  oldwoman: HEAD(1.4) + '<path class="fh" d="M.8 -13.4L-3.6 -4.2H4.6Z"/><path class="fl" d="M-4 -7L.6 -11.8 4.6 -7.6M-1.2 -4.2V0M2 -4.2V0M4.6 -7.6L5.8 0M4.6 -7.6q.5 -1.6 2.1 -1"/>',
  doctor: WOMAN + '<path d="M-1.5 -7.4h3M0 -8.9v3" stroke="#e5484d" stroke-width="1.5" stroke-linecap="round"/>',
  robber: MAN + '<rect x="-3.9" y="-19" width="7.8" height="2.3" rx="1.1" fill="#151827"/><path class="fl" d="M4.2 -6.8l1 1.6"/><circle class="fl" cx="6" cy="-3" r="2.3"/>',
  dog: '<path class="fl" d="M-6.5 -6.5H3.8M-5.8 -6.5V0M-2.8 -6.5V0M.6 -6.5V0M3.2 -6.5V0M-6.5 -6.5l-2.2 -3.6M3.8 -6.5L5.2 -8.2M8.4 -8.8h1.4"/><circle class="fh" cx="6.2" cy="-9.2" r="2.6"/><path class="fh" d="M4.4 -11.4l-1.6 3.4 2.3-.5z"/>',
  cat: '<path class="fl" d="M-4.6 -5H2.4M-4 -5V0M-1.6 -5V0M.6 -5V0M2 -5V0M-4.6 -5c-2.6 -.6 -3 -3.6 -1.6 -6M2.4 -5l1 -1.2"/><circle class="fh" cx="4.4" cy="-7.4" r="2.2"/><path class="fh" d="M2.7 -8.4l.2 -2.8 1.8 1.4zM4.5 -9.4l1.6 -1.8.5 2.4z"/>',
  patient: '<path class="fl" d="M-10 0V-9M10 0V-5.5M-10 -4H10"/><circle class="fh" cx="-6.4" cy="-7" r="2.5"/><path class="fh" d="M-3.6 -4.6V-8.4h11.4a1.6 1.6 0 0 1 1.6 1.6v2.2z"/>',
  sleeper: '<path class="fl" d="M-11 0V-13M11 0V-13M-11 -11.5Q0 -2.5 11 -11.5"/><circle class="fh" cx="-5.6" cy="-9.8" r="2.4"/><path class="fh" d="M-3.4 -7.8Q1.5 -4.6 7 -8.6l.7 1.7Q1.5 -2.4 -3.2 -5.8z"/>',
  you: MAN + '<path class="fl" d="M-2.6 -27.4L0 -24.8 2.6 -27.4"/>',
  loved: MAN + '<path d="M0 -22.4s-3.8-2.3-3.8-4.8a2 2 0 0 1 3.8-.9 2 2 0 0 1 3.8.9c0 2.5-3.8 4.8-3.8 4.8z" fill="#ff6b8a"/>',
  walker: '<circle class="fh" cx=".8" cy="-17.6" r="3.4"/><path class="fl" d="M.4 -13.6L-.3 -5.6M-3.6 -8.4L.2 -11.8 3.4 -7.6M-.3 -5.6L-3.8 0M-.3 -5.6L3 -.4"/>',
  car: '<path class="fl" d="M-10.5 -3.6V-7.4l2.6-.8 3-4.2h9.4l3 4.2 2.6.8v3.8z"/><circle class="fh" cx="-6" cy="-3" r="2.3"/><circle class="fh" cx="6" cy="-3" r="2.3"/>',
};
const TRAM = '<path class="tr-pan" d="M-3.5 -24.5l3.5-4 3.5 4"/><rect class="tr-body" x="-15" y="-24.5" width="30" height="19" rx="4"/>'
  + '<rect class="tr-win" x="-11.5" y="-21" width="6.5" height="6" rx="1.2"/><rect class="tr-win" x="-3.2" y="-21" width="6.5" height="6" rx="1.2"/><rect class="tr-win" x="5" y="-21" width="6.5" height="6" rx="1.2"/>'
  + '<circle class="tr-lamp" cx="12.4" cy="-9" r="1.4"/><circle class="tr-wheel" cx="-8.5" cy="-3.6" r="2.6"/><circle class="tr-wheel" cx="8.5" cy="-3.6" r="2.6"/>';
const FIG_SCALE = 1.15; // etwas größer gezeichnet, damit die Figuren auf dem Handy gut zu erkennen sind
function figures(list, x0, x1, y) {
  const g = svg('g', { class: 'figs' });
  const n = list.length;
  const step = n > 1 ? Math.min(24, (x1 - x0) / (n - 1)) : 0;
  const start = (x0 + x1) / 2 - step * (n - 1) / 2;
  list.forEach((k, i) => {
    const pos = svg('g', { transform: `translate(${(start + i * step).toFixed(1)} ${y}) scale(${FIG_SCALE})` });
    const f = svg('g', { class: 'fig fig-' + k });
    f.innerHTML = FIG[k] || MAN;
    pos.append(f);
    g.append(pos);
  });
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
      node.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
      if (k < 1) requestAnimationFrame(tick); else { p.remove(); res(); }
    };
    requestAnimationFrame(tick);
  });
}
const wait = ms => new Promise(r => setTimeout(r, ms));
// gezeichneter Zusammenstoß (Zacken-Stern)
function boomAt(x, y) {
  const pts = [];
  for (let i = 0; i < 16; i++) { const r = i % 2 ? 5.5 : 12.5, a = Math.PI * i / 8 - Math.PI / 2; pts.push((x + Math.cos(a) * r).toFixed(1) + ',' + (y + Math.sin(a) * r).toFixed(1)); }
  return svg('polygon', { points: pts.join(' '), class: 'boom' });
}

// Baut die Szene. play(true) = eingreifen, play(false) = nichts tun.
function makeScene(cfg) {
  const kind = cfg.scene;
  const root = svg('svg', { viewBox: '0 0 360 190', class: 'scene', role: 'img', 'aria-label': T('Gleis-Ansicht', 'Track view') });
  const main = expand(cfg.main), side = expand(cfg.side);
  let gMain, gSide, tram;
  const hit = g => {
    g.classList.add('hit');
    root.append(boomAt(Number(g.dataset.cx), Number(g.dataset.cy) - 11));
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
  tram = svg('g', { class: 'tram', transform: 'translate(24 150)' });
  tram.innerHTML = TRAM;
  root.append(gMain, gSide, tram);

  const play = async yes => {
    if (kind === 'bridge') {
      if (yes) {
        const man = gSide.querySelector('.fig');
        man.style.transition = 'transform .35s ease-in';
        man.style.transform = `translateY(${(74 / FIG_SCALE).toFixed(1)}px)`; // innerhalb der vergrößerten Figur: 74 Einheiten bis aufs Gleis
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
const MODES = { classics: () => startClassics(), endless: () => startEndless(), stack: () => startStack() };
const gameL = levelSheet(gameEl, gameScroll, 'trolley', e => { if (e.t === 'menu') renderGameMenu(); else MODES[e.t](); });
function openTrolley() { gameL.open({ t: 'menu' }); }
function closeTrolley() { gameL.closeAll(); }
$('game-back').onclick = () => gameL.back();
const toMenu = () => gameL.back(); // aus einem Modus eine Ebene zurück ins Menü

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
  a.type = b.type = 'button';
  a.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-pressed', 'false');
  const choose = (btn, yes) => { a.disabled = b.disabled = true; btn.classList.add('picked'); btn.setAttribute('aria-pressed', 'true'); onPick(yes); };
  a.onclick = () => choose(a, true);
  b.onclick = () => choose(b, false);
  box.append(a, b);
  return box;
}

function renderGameMenu() {
  const b = gameScreen(T('Das Trolley-Spiel', 'The trolley game'));
  const kick = el('span', 'th-kind'); // nur ein Symbol pro Kopf: das große Tram-Symbol darüber
  kick.append(el('span', null, T('Weichensteller', 'Pull the lever')));
  $('game-back').setAttribute('aria-label', T('Spiel schließen', 'Close the game'));
  b.append(icBox('tram', 'big'), kick, el('h1', null, T('Das Trolley-Spiel', 'The trolley game')),
    el('p', 'gintro', T('Eine Bahn rast heran, und du stehst am Hebel. Jede Entscheidung kostet jemanden das Leben – auch die, nichts zu tun.', 'A trolley is hurtling closer, and you’re at the lever. Every decision costs someone their life, including the decision to do nothing.')));
  const cDone = TROLLEY_CLASSICS.filter(c => tg.classics[c.id] != null).length;
  const sDone = TROLLEY_STACK.filter(d => tg.stack[d.n] != null).length;
  const modes = [
    ['book', T('Klassiker', 'Classics'), T(`${TROLLEY_CLASSICS.length} berühmte Fälle der Philosophie, bei einigen mit Zahlen aus einer Studie mit 70\u00a0000 Menschen.`, `${TROLLEY_CLASSICS.length} famous cases from philosophy, some with figures from a study with 70,000 people.`), T(`${cDone} von ${TROLLEY_CLASSICS.length} beantwortet`, `${cDone} of ${TROLLEY_CLASSICS.length} answered`), 'classics'],
    ['dice', T('Zufallsrunde', 'Random round'), T('10 gewürfelte Fälle. Danach siehst du dein Muster.', '10 random cases. Then see your pattern.'), T(`${tg.endless.n} Fälle gespielt`, `${tg.endless.n} cases played`), 'endless'],
    ['stack', T('Fälle aus der Forschung', 'Research cases'), T(`${TROLLEY_STACK.length} harte Fälle aus der Psychologie, ganz ohne Gleise.`, `${TROLLEY_STACK.length} hard cases from psychology, no tracks at all.`), T(`${sDone} von ${TROLLEY_STACK.length} beantwortet`, `${sDone} of ${TROLLEY_STACK.length} answered`), 'stack'],
  ];
  for (const [sym, name, text, prog, mode] of modes) {
    const c = el('button', 'gmode');
    c.type = 'button';
    const t = el('div', 'gmode-t');
    t.append(el('b', null, name), el('small', null, text), el('span', 'gmode-p', prog));
    c.append(icBox(sym), t, chevEl());
    c.onclick = () => gameL.push({ t: mode });
    b.append(c);
  }
  const pat = patternBlock();
  if (pat) b.append(el('h3', null, T('Dein Muster', 'Your pattern')), pat);
  b.append(el('p', 'gsource', T('Zahlen der Klassiker: ', 'Figures for the classics: ') + STAT_SOURCE + T('. Fälle aus der Forschung: Christensen u. a. (2014), Frontiers in Psychology 5:607, CC BY.', '. Research cases: Christensen et al. (2014), Frontiers in Psychology 5:607, CC BY.')));
}

// ---------- Auswertung ----------
const DIM_LABEL = {
  anzahl: [T('Viele vor wenigen', 'Many over few'), T('So oft hast du die größere Gruppe gerettet.', 'How often you saved the larger group.')],
  alter: [T('Jung vor alt', 'Young over old'), T('So oft hast du die Jüngeren gerettet.', 'How often you saved the younger ones.')],
  art: [T('Mensch vor Tier', 'Humans over animals'), T('So oft hast du Menschen statt Tiere gerettet.', 'How often you saved humans rather than animals.')],
  status: [T('Ärztin vor Bankräuber', 'Doctor over bank robber'), T('So oft zählte für dich, wer jemand ist.', 'How often it mattered to you who someone is.')],
  regel: [T('Wer sich an Regeln hält', 'Those who follow the rules'), T('So oft hast du die verschont, die nichts falsch gemacht haben.', 'How often you spared those who had done nothing wrong.')],
};
function patternBlock() {
  const box = el('div', 'gpattern');
  const e = tg.endless;
  if (e.n >= 5) {
    box.append(bar(T('Du greifst ein', 'You intervene'), pct(e.sw, e.n), T(`In ${e.sw} von ${e.n} Fällen der Zufallsrunde hast du die Weiche umgelegt.`, `You pulled the lever in ${e.sw} of ${e.n} random-round cases.`)));
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
    box.append(el('h4', null, T('Fälle aus der Forschung: Wann sagst du Ja?', 'Research cases: when do you say yes?')),
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
  let i = TROLLEY_CLASSICS.findIndex(c => tg.classics[c.id] == null);
  if (i < 0) i = 0; // alles gespielt: von vorn
  showClassic(i);
}
function showClassic(i) {
  const c = TROLLEY_CLASSICS[i];
  const b = gameScreen(T('Klassiker', 'Classics'));
  $('game-back').setAttribute('aria-label', T('Zurück zum Menü', 'Back to the menu'));
  const sc = makeScene(c);
  b.append(el('p', 'gstep', T(`Fall ${i + 1} von ${TROLLEY_CLASSICS.length}`, `Case ${i + 1} of ${TROLLEY_CLASSICS.length}`)), el('h2', null, c.title), sc.el, el('p', null, c.text), el('p', 'gq', c.q));
  b.append(choiceButtons(c.yes, c.no, async yes => {
    tg.classics[c.id] = yes ? 1 : 0;
    saveTg();
    await sc.play(yes);
    const r = el('div', 'gresult');
    if (c.stat != null) r.append(bar(T('So viele würden hier eingreifen', 'People who would intervene'), c.stat, STAT_SOURCE));
    r.append(el('p', null, c.note));
    const last = i === TROLLEY_CLASSICS.length - 1;
    const next = el('button', 'btn gnext', last ? T('Zurück zum Menü', 'Back to the menu') : T('Nächster Fall ›', 'Next case ›'));
    next.onclick = () => last ? toMenu() : showClassic(i + 1);
    r.append(next);
    b.append(r);
    r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }));
}

// ---------- Zufallsrunde ----------
const WHO = LANG === 'en' ? {
  // singular, plural, drawn figure, article
  kind: ['child', 'children', 'child', 'a'], frau: ['woman', 'women', 'woman', 'a'], mann: ['man', 'men', 'man', 'a'],
  opa: ['elderly man', 'elderly men', 'oldman', 'an'], oma: ['elderly woman', 'elderly women', 'oldwoman', 'an'],
  arzt: ['doctor', 'doctors', 'doctor', 'a'], dieb: ['bank robber', 'bank robbers', 'robber', 'a'],
  hund: ['dog', 'dogs', 'dog', 'a'], katze: ['cat', 'cats', 'cat', 'a'],
} : {
  // Einzahl, Mehrzahl, gezeichnete Figur, Artikel
  kind: ['Kind', 'Kinder', 'child', 'ein'], frau: ['Frau', 'Frauen', 'woman', 'eine'], mann: ['Mann', 'Männer', 'man', 'ein'],
  opa: ['Rentner', 'Rentner', 'oldman', 'ein'], oma: ['Rentnerin', 'Rentnerinnen', 'oldwoman', 'eine'],
  arzt: ['Ärztin', 'Ärztinnen', 'doctor', 'eine'], dieb: ['Bankräuber', 'Bankräuber', 'robber', 'ein'],
  hund: ['Hund', 'Hunde', 'dog', 'ein'], katze: ['Katze', 'Katzen', 'cat', 'eine'],
};
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const grp = (type, n) => ({ type, n });
const grpText = g => `${g.n === 1 ? WHO[g.type][3] : g.n} ${WHO[g.type][g.n === 1 ? 0 : 1]}`;
const grpFigs = g => Array(g.n).fill(WHO[g.type][2]);

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
function startEndless() { endlessRun = 0; showEndless(); }
function showEndless() {
  const cs = rollCase();
  const b = gameScreen(T('Zufallsrunde', 'Random round'));
  $('game-back').setAttribute('aria-label', T('Zurück zum Menü', 'Back to the menu'));
  const sc = makeScene({ scene: 'switch', main: grpFigs(cs.main), side: grpFigs(cs.side) });
  const line = (label, g, note) => { const p = el('p', 'gline'); p.append(el('b', null, label + ': '), grpText(g) + (note ? ` (${note})` : '')); return p; };
  b.append(el('p', 'gstep', T(`Fall ${endlessRun + 1} von 10`, `Case ${endlessRun + 1} of 10`)), sc.el, line(T('Hauptgleis', 'Main track'), cs.main, cs.noteMain), line(T('Nebengleis', 'Side track'), cs.side, cs.noteSide), el('p', 'gq', T('Tust du nichts, trifft die Bahn das Hauptgleis.', 'If you do nothing, the trolley hits the main track.')));
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
    const next = el('button', 'btn gnext', endlessRun >= 10 ? T('Auswertung ansehen ›', 'See the results ›') : T('Nächster Fall ›', 'Next case ›'));
    next.onclick = () => endlessRun >= 10 ? showEndlessSummary() : showEndless();
    r.append(next);
    b.append(r);
    r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }));
}
function showEndlessSummary() {
  const b = gameScreen(T('Zufallsrunde', 'Random round'));
  b.append(icBox('chart', 'big'), el('h2', null, T('Dein Muster', 'Your pattern')), el('p', 'gintro', T(`Ausgewertet sind alle ${tg.endless.n} Fälle, die du bisher in Zufallsrunden gespielt hast.`, `This covers all ${tg.endless.n} cases you have played in random rounds so far.`)));
  const pat = patternBlock();
  if (pat) b.append(pat);
  const more = el('button', 'btn gnext', T('Noch eine Zufallsrunde ›', 'Another random round ›'));
  more.onclick = startEndless;
  const menu = el('button', 'btn ghost2 gnext', T('Zurück zum Menü', 'Back to the menu'));
  menu.onclick = toMenu;
  b.append(more, menu);
}

// ---------- Forschungs-Stapel ----------
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
  $('game-back').setAttribute('aria-label', T('Zurück zum Menü', 'Back to the menu'));
  const done = TROLLEY_STACK.filter(d => tg.stack[d.n] != null).length;
  if (done > 0 && done < TROLLEY_STACK.length) return showStack();
  const b = gameScreen(T('Fälle aus der Forschung', 'Research cases'));
  b.append(icBox('stack', 'big'), el('h2', null, T('Fälle aus der Forschung', 'Research cases')),
    el('p', null, T('Diese 46 Fälle stammen aus der psychologischen Forschung. Jedes Szenario kommt zweimal vor, in zwei Varianten, die sich in einem entscheidenden Detail unterscheiden.', 'These 46 cases come from psychological research. Each scenario appears twice, in two variants that differ in one decisive detail.')),
    el('p', null, T('Sie sind bewusst hart: Es geht immer um Leben und Tod, manchmal um Kinder. Du kannst jederzeit aufhören, dein Stand bleibt gespeichert.', 'They’re deliberately tough: it’s always about life and death, sometimes about children. You can stop at any time; your progress is saved.')));
  if (done === TROLLEY_STACK.length) b.append(el('p', 'gnote', T('Du hast alle 46 Fälle beantwortet. Wenn du neu startest, werden deine Antworten gelöscht.', 'You’ve answered all 46 cases. If you start over, your answers will be deleted.')));
  const go = el('button', 'btn gnext', done === TROLLEY_STACK.length ? T('Neu beginnen', 'Start over') : T('Starten ›', 'Start ›'));
  go.onclick = () => { if (done === TROLLEY_STACK.length) { tg.stack = {}; tg.order = null; saveTg(); } showStack(); };
  b.append(go, el('p', 'gsource', T('Quelle: Christensen, Flexas, Calabrese, Gut & Gomila (2014): „Moral judgment reloaded: a moral dilemma validation study“. Frontiers in Psychology 5:607. Lizenz CC BY. Deutsche Fassung der Autoren, leicht angepasst.', 'Source: Christensen, Flexas, Calabrese, Gut & Gomila (2014): “Moral judgment reloaded: a moral dilemma validation study”. Frontiers in Psychology 5:607. Licence CC BY. English version by the authors, lightly adapted.')));
}
function showStack() {
  const order = stackOrder();
  const n = order.find(x => tg.stack[x] == null);
  if (n == null) return showStackEnd();
  const d = TROLLEY_STACK.find(x => x.n === n);
  const tt = TROLLEY_STACK_TITLES[d.s];
  const title = Array.isArray(tt) ? tt[1] : tt;
  const done = order.filter(x => tg.stack[x] != null).length;
  const b = gameScreen(T('Fälle aus der Forschung', 'Research cases'));
  b.append(el('p', 'gstep', T(`Fall ${done + 1} von ${order.length}`, `Case ${done + 1} of ${order.length}`)), el('h2', null, title), el('p', null, d.text), el('p', null, d.act), el('p', 'gq', d.q));
  b.append(choiceButtons(T('Ja', 'Yes'), T('Nein', 'No'), yes => {
    tg.stack[d.n] = yes ? 1 : 0;
    saveTg();
    const r = el('div', 'gresult');
    const chips = el('div', 'meta');
    chips.append(el('span', 'chip', d.p ? T('Eigenhändig', 'With your own hands') : T('Aus der Distanz', 'From a distance')), el('span', 'chip', d.i ? T('Tod als Mittel', 'Death as a means') : T('Tod als Nebenfolge', 'Death as a side effect')));
    r.append(chips, el('p', 'gnote', (d.p ? T('Hier müsstest du selbst Hand anlegen. ', 'Here you would have to do it with your own hands. ') : T('Hier löst du den Tod nur aus der Ferne aus. ', 'Here you only trigger the death from afar. ')) + (d.i ? T('Der Tod des Opfers ist das Mittel, das die anderen rettet.', 'The victim’s death is the means that saves the others.') : T('Der Tod des Opfers ist eine Nebenfolge der Rettung.', 'The victim’s death is a side effect of the rescue.'))));
    const next = el('button', 'btn gnext', T('Weiter ›', 'Next ›'));
    next.onclick = showStack;
    r.append(next);
    b.append(r);
    r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }));
}
function showStackEnd() {
  const b = gameScreen(T('Fälle aus der Forschung', 'Research cases'));
  b.append(icBox('flag', 'big'), el('h2', null, T(`Alle ${TROLLEY_STACK.length} Fälle beantwortet`, `All ${TROLLEY_STACK.length} cases answered`)));
  const pat = patternBlock();
  if (pat) b.append(pat);
  const menu = el('button', 'btn gnext', T('Zurück zum Menü', 'Back to the menu'));
  menu.onclick = toMenu;
  b.append(menu);
}
