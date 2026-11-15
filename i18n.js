'use strict';
// Sprache der App: die in den Einstellungen gewählte, sonst die Sprache des Geräts
// (Deutsch -> de, alles andere -> en). Umschalten lädt die App neu.
const LANG = (() => {
  try { const v = JSON.parse(localStorage.getItem('wf.lang')); if (v === 'de' || v === 'en') return v; } catch {}
  const dev = ((navigator.languages && navigator.languages[0]) || navigator.language || 'de').toLowerCase();
  return dev.startsWith('de') ? 'de' : 'en';
})();
// T('deutscher Text', 'English text') liefert den Text in der aktiven Sprache.
const T = (de, en) => LANG === 'en' ? en : de;

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
// Service Worker beide Sprachen bereit.
document.write(LANG === 'en'
  ? '<script src="thoughts.en.js"><\/script><script src="denken.en.js"><\/script><script src="trolley-data.en.js"><\/script><script src="fundstuecke.en.js"><\/script>'
  : '<script src="thoughts.js"><\/script><script src="denken.js"><\/script><script src="trolley-data.js"><\/script><script src="fundstuecke.de.js"><\/script>');
