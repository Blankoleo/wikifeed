'use strict';
// Sprache der App: die in den Einstellungen gewählte, sonst die Sprache des Geräts
// (Deutsch -> de, Französisch -> fr, alles andere -> en). Umschalten lädt die App neu.
const LANG = (() => {
  try { const v = JSON.parse(localStorage.getItem('wf.lang')); if (v === 'de' || v === 'en' || v === 'fr') return v; } catch {}
  const dev = ((navigator.languages && navigator.languages[0]) || navigator.language || 'de').toLowerCase();
  return dev.startsWith('de') ? 'de' : dev.startsWith('fr') ? 'fr' : 'en';
})();
// T('deutscher Text', 'English text') liefert den Text in der aktiven Sprache.
// Französisch (seit 2.7): Wörterbuch FR in i18n.fr.js, Schlüssel ist der englische Text. FR_DE (Schlüssel: deutscher
// Text) klärt die wenigen Fälle, in denen ein englischer Text zwei Bedeutungen hat. Texte mit ${…} findet FR_TPL über
// Muster (${0}, ${1} … in der Reihenfolge des englischen Textes). Fehlt eine Übersetzung, bleibt es beim Englischen.
let frTpl = null;
const frHas = (o, k) => typeof o === 'object' && o !== null && Object.prototype.hasOwnProperty.call(o, k);
function frText(de, en) {
  if (typeof FR === 'undefined') return en;
  if (typeof FR_DE !== 'undefined' && frHas(FR_DE, de)) return FR_DE[de];
  if (frHas(FR, en)) return FR[en];
  if (!frTpl) {
    const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    frTpl = (typeof FR_TPL !== 'undefined' ? FR_TPL : []).map(([k, v]) =>
      [new RegExp('^' + k.split(/\$\{\d+\}/).map(esc).join('([\\s\\S]*?)') + '$'), (k.match(/\$\{\d+\}/g) || []).map(x => +x.slice(2, -1)), v]);
  }
  for (const [re, ids, v] of frTpl) {
    const m = re.exec(en);
    if (m) return v.replace(/\$\{(\d+)\}/g, (_, n) => m[ids.indexOf(+n) + 1]);
  }
  return en;
}
const T = (de, en) => LANG === 'de' ? de : LANG === 'fr' ? frText(de, en) : en;

// Alles, was an der jeweiligen Wikipedia hängt.
const WIKI = LANG === 'en' ? {
  host: 'en.wikipedia.org',
  top: 'incategory:"Featured articles|Good articles"',
  noList: '-intitle:"List of"',
  topCats: 'Category:Featured articles|Category:Good articles', // ausgezeichnete Artikel (für die Abzweigungen)
  thought: 'incategory:"Thought experiments|Thought experiments in ethics|Thought experiments in physics|Thought experiments in philosophy of mind|Paradoxes|Philosophical paradoxes|Physical paradoxes|Mathematical paradoxes|Probability theory paradoxes|Logical paradoxes|Decision-making paradoxes|Temporal paradoxes|Paradoxes of infinity"',
  ns: /^(File|Category|Help|Special|Wikipedia|Portal|Template|User|Talk|Draft|Module|MediaWiki):/,
  tts: 'en-US',
  voiceRe: /^en(-|_|$)/i,
  voiceBest: /en[-_](US|GB)/i,
  voiceNames: /^(Samantha|Ava|Allison|Susan|Tom|Evan|Nathan|Zoe|Daniel|Kate|Serena|Karen|Moira|Tessa|Alex)\b/i,
  voiceStrip: /\s*\(English[^)]*\)\)?/i,
} : LANG === 'fr' ? {
  // Kategorien per API geprüft (2026-11): „Article de qualité“ + „Bon article“ ≈ 6600 Artikel;
  // Gedankenexperimente/Paradoxa ≈ 190 Artikel. articletopic: funktioniert auch auf fr.wikipedia.org.
  host: 'fr.wikipedia.org',
  top: 'incategory:"Article de qualité|Bon article"',
  noList: '-intitle:"Liste de" -intitle:"Liste des"',
  topCats: 'Catégorie:Article de qualité|Catégorie:Bon article',
  thought: 'incategory:"Expérience de pensée|Expérience de pensée en physique|Expérience de pensée philosophique|Paradoxe|Paradoxe en mathématiques|Paradoxe logique|Paradoxe physique|Paradoxe probabiliste|Paradoxe temporel|Paradoxe philosophique|Paradoxe en économie|Paradoxe en biologie"',
  ns: /^(Fichier|Image|Catégorie|Aide|Spécial|Wikipédia|Wikipedia|Portail|Projet|Modèle|Utilisateur|Utilisatrice|Discussion|Module|MediaWiki|Référence|Sujet|Brouillon|File|Category):/,
  tts: 'fr-FR',
  voiceRe: /^fr(-|_|$)/i,
  voiceBest: /fr[-_]FR/i,
  voiceNames: /^(Thomas|Amélie|Audrey|Aurélie|Marie|Jacques|Virginie|Sébastien)\b/i,
  voiceStrip: /\s*\((Français|French|Französisch)[^)]*\)\)?/i,
} : {
  host: 'de.wikipedia.org',
  top: 'incategory:Wikipedia:Exzellent|Wikipedia:Lesenswert',
  noList: '-intitle:Liste',
  topCats: 'Kategorie:Wikipedia:Exzellent|Kategorie:Wikipedia:Lesenswert',
  thought: 'incategory:Gedankenexperiment|Paradoxon',
  ns: /^(Datei|Kategorie|Hilfe|Spezial|Wikipedia|Portal|Vorlage|File|Benutzer):/,
  tts: 'de-DE',
  voiceRe: /^de(-|_|$)/i,
  voiceBest: /de[-_]DE/i,
  voiceNames: /^(Anna|Petra|Markus|Viktor|Yannick|Helena|Martin)\b/i,
  voiceStrip: /\s*\(Deutsch[^)]*\)\)?/i,
};

// Inhalte nur in der gewählten Sprache laden (Gedankenspiele, Forschungs-Stapel, Fundstücke). Die Zeile steht im
// selben Skript, damit die Dateien wie gewohnt vor app.js der Reihe nach geladen werden. Offline hält der
// Service Worker alle Sprachen bereit. Fehlt eine französische Datei, steht hier vorübergehend die englische.
const LANG_FILES = {
  de: ['thoughts.js', 'denken.js', 'trolley-data.js', 'fundstuecke.de.js'],
  en: ['thoughts.en.js', 'denken.en.js', 'trolley-data.en.js', 'fundstuecke.en.js'],
  fr: ['i18n.fr.js', 'thoughts.fr.js', 'denken.fr.js', 'trolley-data.fr.js', 'fundstuecke.fr.js'],
};
document.write(LANG_FILES[LANG].map(f => '<script src="' + f + '"><\/script>').join(''));
