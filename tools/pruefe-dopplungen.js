'use strict';
// Dopplungsprüfung für neue Fragen im Bereich „Denken“ (Version 2.6).
// Vergleicht jede neue Frage (Titel + Lage + Frage) aus denken.js mit allen Gedankenspielen (thoughts.js),
// den Trolley-Klassikern (trolley.js), dem Forschungs-Stapel (trolley-data.js) und den neuen Fragen untereinander.
// Maß: Überlappung der Wortstämme (Anteil gemeinsamer Stämme am kleineren Text) plus Jaccard. Gibt auffällige Paare aus
// und markiert, welche schon als verwandt (`pair`) eingetragen sind.
// Kontrolle: Die fünf ersetzten Entwürfe aus ideen-2.5.md laufen mit, um zu zeigen, ob die Schwelle sie gefunden hätte.
// Aufruf: node tools/pruefe-dopplungen.js [Schwelle, Standard 0.18]

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const load = (file, names) => {
  const ctx = {};
  vm.runInNewContext(read(file) + `;this.__out = { ${names.join(', ')} };`, ctx);
  return ctx.__out;
};

const { THOUGHTS_DE } = load('thoughts.js', ['THOUGHTS_DE']);
const { TROLLEY_STACK, TROLLEY_STACK_TITLES } = load('trolley-data.js', ['TROLLEY_STACK', 'TROLLEY_STACK_TITLES']);
const { DENKEN_DE } = load('denken.js', ['DENKEN_DE']);
const tsrc = read('trolley.js');
const cStart = tsrc.indexOf('const TROLLEY_CLASSICS = [');
const cEnd = tsrc.indexOf('];', cStart) + 1;
const TROLLEY_CLASSICS = vm.runInNewContext(tsrc.slice(cStart, cEnd).replace('const TROLLEY_CLASSICS =', '(') + ')');

// Die ersetzten Entwürfe (Kontrollfälle), wörtlich aus ideen-2.5.md
const REPLACED = [
  { id: 'x-P1', title: 'Darf ich lügen, um einen Freund zu schützen?', text: 'Dein Freund hat bei der Arbeit einen teuren Fehler gemacht. Der Chef fragt dich direkt, ob er es war. Eine Lüge würde ihn schützen.', q: 'Darf ich lügen, um einen Freund zu schützen?' },
  { id: 'x-P4', title: 'Muss ich Fremden helfen, wenn es mich etwas kostet?', text: 'Am Monatsende bleiben dir regelmäßig 100 € übrig. Eine Hilfsorganisation könnte damit Menschen in großer Not helfen, die du nie treffen wirst.', q: 'Muss ich Fremden helfen, wenn es mich etwas kostet?' },
  { id: 'x-A4', title: 'Der Geldbeutel', text: 'Auf dem Gehweg liegt ein Geldbeutel mit 300 € und einem Ausweis. Weit und breit ist niemand zu sehen.', q: 'Was tust du?' },
  { id: 'x-A14', title: 'Urlaub oder Spende', text: 'Du hast 1 500 € für eine Reise gespart. Du liest, dass besonders gut geprüfte Hilfsorganisationen mit diesem Betrag zum Beispiel Hunderte Moskitonetze gegen Malaria verteilen können.', q: 'Wofür gibst du das Geld aus?' },
  { id: 'x-A15', title: 'Der Tipp', text: 'Du und dein bester Freund bewerbt euch auf dieselbe Stelle. Zufällig erfährst du, dass die Chefin großen Wert auf ein bestimmtes Computerprogramm legt. Er weiß es nicht.', q: 'Gibst du ihm den Tipp?' },
];

const STOP = new Set(('aber alle allein allem allen aller alles also auch auf aus bald beim beide beiden bei bin bis bist da dabei damit dann darf darfst das dass dein deine deinem deinen deiner dem den denn der des dich die dies diese diesem diesen dieser doch dort du durch ein eine einem einen einer eines einfach er es etwas euch euer für gar gibt hat hast hat hatte hier ich ihm ihn ihr ihre ihrem ihren ihrer im immer in ist ja je jede jedem jeden jeder jemand jetzt kann kannst kein keine man mehr mein meine mich mir mit muss musst nach nicht nichts noch nur ob oder ohne schon sehr sein seine seinem seinen seiner sich sie sind so soll sollst über um und uns unter vom von vor war was weil weiß wenn wer werden wie wieder wir wird wirst wo würde würdest zu zum zur zwei drei fünf sagt sagst tust tun dir dein ganz nie gerade viel viele vielen stehen steht wäre hätte'
  ).split(' '));
const stem = w => w.replace(/(innen|ungen|ung|en|er|es|em|e|n|s)$/, '');
const STOP_STEMS = new Set(['dein', 'mein', 'sein', 'ihr', 'ander', 'man', 'best', 'könnt', 'siehst', 'weißt', 'eur', 'liegt', 'weit', 'jahr', 'inzwisch', 'trotzd', 'angenomm', 'zwar', 'zeh', 'fragt', 'geb', 'klein', 'niemand']);
const textOf = t => (t.title + ' ' + (t.text || '') + ' ' + (t.q || '')).toLowerCase().normalize('NFC');
function words(t) {
  const set = new Set();
  for (const raw of textOf(t).match(/[a-zäöüß]+/g) || []) {
    if (raw.length < 4 || STOP.has(raw)) continue;
    const s = stem(raw);
    if (!STOP_STEMS.has(s)) set.add(s);
  }
  return set;
}
// Zweite Ebene: Themen. Reine Wortüberlappung findet Fälle mit anderen Worten, aber gleichem Kern nicht
// (z. B. Geldbeutel und Wechselgeld). Deshalb werden Wortanfänge zu Themen zusammengefasst.
const THEMES = {
  geld: ['geld', 'euro', '€', 'wechselgeld', 'geldbeutel', 'betrag', 'bezahl', 'zahl', 'teur', 'billig', 'gespart', 'spar'],
  spenden: ['spend', 'hilfsorganisation', 'moskitonetz', 'not ', 'fremd', 'organisation'],
  wahrheit: ['lüg', 'lüge', 'wahrheit', 'ehrlich', 'verrat', 'täusch', 'verschweig'],
  versprechen: ['versproch', 'versprech', 'wort '],
  eigentum: ['gehört', 'gefunden', 'fundbüro', 'gestohl', 'stiehlt', 'diebstahl', 'stehl', 'zurück'],
  helfen: ['rett', 'helf', 'hilf', 'hilft'],
  familie: ['famili', 'neffe', 'bruder', 'schwester', 'vater', 'mutter', 'tante', 'großmutter', 'eltern', 'kind'],
  freundschaft: ['freund'],
  schule: ['prüfung', 'schul', 'kurs', 'hausarbeit', 'abschluss', 'stipendium', 'klasse'],
  arbeit: ['arbeit', 'kolleg', 'chef', 'stelle', 'firma'],
  tod: ['tod', 'stirbt', 'sterb', 'töt', 'leben retten'],
  tier: ['tier', 'hähnchen', 'fleisch'],
  strafe: ['straf', 'schuld', 'verantwortlich'],
  unbeobachtet: ['niemand', 'gesehen', 'bemerkt', 'merkt', 'unsichtbar'],
  vorteil: ['vorteil', 'tipp', 'wissen', 'vorsprung'],
};
function themes(t) {
  const s = ' ' + textOf(t) + ' ';
  return new Set(Object.keys(THEMES).filter(k => THEMES[k].some(w => s.includes(w))));
}
function compare(a, b) {
  const A = words(a), B = words(b);
  const shared = [...A].filter(w => B.has(w));
  const overlap = shared.length / Math.max(1, Math.min(A.size, B.size));
  const jac = shared.length / Math.max(1, new Set([...A, ...B]).size);
  const TA = themes(a), TB = themes(b);
  const sharedThemes = [...TA].filter(x => TB.has(x));
  return { overlap, jac, shared, sharedThemes };
}
// auffällig: viele gleiche Wörter, oder mindestens drei gleiche Themen
const flagged = r => r.overlap >= LIMIT || r.shared.length >= 4 || r.sharedThemes.length >= 3;

const NEW = [...DENKEN_DE.alltag, ...DENKEN_DE.philo];
const OLD = [
  ...THOUGHTS_DE.map(t => ({ ...t, id: t.id, src: 'thoughts' })),
  ...TROLLEY_CLASSICS.map(c => ({ id: 'tg:' + c.id, title: c.title, text: c.text, q: c.q, src: 'trolley' })),
  ...TROLLEY_STACK.map(s => ({ id: 'ts:' + s.n, title: TROLLEY_STACK_TITLES[s.s] || ('Stapel ' + s.n), text: s.text + ' ' + s.act, q: s.q, src: 'stapel' })),
];
const LIMIT = Number(process.argv[2]) || 0.18;
const isPair = (a, b) => (a.pair || []).includes(b.id) || (b.pair || []).includes(a.id);

function report(title, list, against, self) {
  console.log('\n== ' + title + ' ==');
  const rows = [];
  list.forEach((a, i) => {
    const pool = self ? against.slice(i + 1) : against;
    for (const b of pool) {
      const r = compare(a, b);
      if (flagged(r)) rows.push({ a, b, ...r });
    }
  });
  rows.sort((x, y) => (y.overlap + y.sharedThemes.length / 10) - (x.overlap + x.sharedThemes.length / 10));
  if (!rows.length) console.log('  keine auffälligen Paare');
  for (const r of rows) {
    console.log(`  ${r.overlap.toFixed(2)} (J ${r.jac.toFixed(2)}, Themen ${r.sharedThemes.length})  ${r.a.id} „${r.a.title}“  <->  ${r.b.id} „${r.b.title}“${isPair(r.a, r.b) ? '  [als verwandt markiert]' : ''}`);
    console.log('        Wörter: ' + (r.shared.join(', ') || '–') + ' · Themen: ' + (r.sharedThemes.join(', ') || '–'));
  }
  return rows.length;
}

console.log(`Neue Fragen: ${NEW.length} · Vergleich mit ${THOUGHTS_DE.length} Gedankenspielen, ${TROLLEY_CLASSICS.length} Trolley-Klassikern, ${TROLLEY_STACK.length} Stapel-Fällen · Schwelle ${LIMIT}`);
const ids = new Set();
for (const t of [...THOUGHTS_DE, ...NEW]) { if (ids.has(t.id)) console.log('DOPPELTE ID: ' + t.id); ids.add(t.id); }
report('Neu gegen Bestand', NEW, OLD, false);
report('Neu untereinander', NEW, NEW, true);
report('Kontrolle: ersetzte Entwürfe gegen Bestand und Neu', REPLACED, [...OLD, ...NEW], false);
// Je neue Frage die drei ähnlichsten Fälle, damit auch knapp unter der Schwelle nichts übersehen wird
console.log('\n== Nächste Nachbarn je neuer Frage ==');
for (const a of NEW) {
  const top = [...OLD, ...NEW.filter(b => b !== a)].map(b => ({ b, ...compare(a, b) })).sort((x, y) => y.overlap - x.overlap).slice(0, 3);
  console.log(`  ${a.id.padEnd(16)} ` + top.map(t => `${t.b.id} ${t.overlap.toFixed(2)}`).join(' · '));
}
