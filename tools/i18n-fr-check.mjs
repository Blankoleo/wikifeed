// Prüft, ob jeder englische Oberflächentext eine französische Übersetzung in i18n.fr.js hat.
// Aufruf im Projektordner: node tools/i18n-fr-check.mjs
// Erfasst: alle T(de, en)-Aufrufe in app.js und trolley.js (auch Vorlagen mit ${…}) und data-en, data-en-ph,
// data-en-aria in index.html. Gibt fehlende Texte aus und endet dann mit Fehlercode 1.
import fs from 'fs';
import vm from 'vm';

const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('i18n.fr.js', 'utf8') + '\nthis.FR = FR; this.FR_TPL = FR_TPL; this.FR_DE = FR_DE;', ctx);
const tplKeys = new Set(ctx.FR_TPL.map(([k]) => k));

function readStr(s, i) {
  const q = s[i]; if (!`'"\``.includes(q)) return null;
  let j = i + 1, raw = '', n = 0;
  while (j < s.length && s[j] !== q) {
    if (s[j] === '\\') { raw += s[j] + s[j + 1]; j += 2; continue; }
    if (q === '`' && s[j] === '$' && s[j + 1] === '{') {
      let d = 1, k = j + 2;
      while (d) { if (s[k] === '{') d++; else if (s[k] === '}') d--; else if (s[k] === '`') k = readStr(s, k).end - 1; k++; }
      raw += '${' + n++ + '}'; j = k; continue;
    }
    raw += s[j]; j++;
  }
  return { raw, tpl: n > 0, end: j + 1 };
}
const unesc = r => r.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/\\n/g, '\n').replace(/\\(.)/g, '$1');
const missing = [];
let calls = 0;
for (const f of ['app.js', 'trolley.js']) {
  const s = fs.readFileSync(f, 'utf8');
  const re = /(?<![\w$.])T\(/g; let m;
  while ((m = re.exec(s))) {
    let i = m.index + 2; while (/\s/.test(s[i])) i++;
    const a = readStr(s, i); if (!a) continue;
    i = a.end; while (/[\s,]/.test(s[i])) i++;
    const b = readStr(s, i); if (!b) continue; // z. B. T('…', she ? '…' : '…'): beide Texte stehen einzeln im Wörterbuch
    calls++;
    const de = unesc(a.raw), en = unesc(b.raw), line = s.slice(0, m.index).split('\n').length;
    if (Object.hasOwn(ctx.FR_DE, de)) continue;
    if (b.tpl ? !tplKeys.has(en) : !Object.hasOwn(ctx.FR, en)) missing.push(`${f}:${line}  ${en}`);
  }
}
const html = fs.readFileSync('index.html', 'utf8');
const ent = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
for (const m of html.matchAll(/data-en(?:-ph|-aria)?="([^"]*)"/g)) {
  calls++;
  if (!Object.hasOwn(ctx.FR, ent(m[1]))) missing.push(`index.html  ${ent(m[1])}`);
}
console.log(`${calls} Texte geprüft, ${missing.length} ohne Übersetzung`);
for (const x of missing) console.log('  ' + x);
process.exit(missing.length ? 1 : 0);
