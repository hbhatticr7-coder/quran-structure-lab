// Checks the Arabic quoted in the reading accounts of one build sura against the text.
// For every run of Arabic script in project/reading/<who>-<sura>.md it reports whether the
// run stands in the sura exactly as printed, or the same but for the order or encoding of
// its marks, or with the same letters and different marks, or not at all.
// For a table row whose first cell names verses, it also reports whether the quotation
// stands in one of those verses.
// Build suras only. It reads; it changes nothing and judges no interpretation.
// Usage: node project/tools/reading-check.mjs <sura number>
import fs from 'node:fs';
import path from 'node:path';
import * as lib from './lib.mjs';

const n = Number(process.argv[2]);
const { corpus } = lib.loadText('build');
const verses = corpus.verses.filter((v) => v.s === n);
if (!verses.length) throw new Error(`not a build sura: ${process.argv[2]}`);

const MARK = '\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u08D0-\\u08FF';
const sq = (s) => s.replace(/\s+/g, ' ').trim();
// alef with madda written as one character or as alef plus a mark: made the same
const sameAlef = (s) => s.replace(/آ/g, 'آ');
// the marks on each letter put in one fixed order, so that only their order is ignored
const ordered = (s) => sameAlef(s).replace(new RegExp(`([^${MARK}])([${MARK}]+)`, 'gu'), (m, b, marks) => b + [...marks].sort().join(''));
const letters = (s) => sameAlef(s).replace(new RegExp(`[${MARK}\\u0640]`, 'gu'), '');

const textOf = (v) => v.words.map((w) => w.form).join(' ');
const whole = verses.map(textOf).join(' ');
const where = (a, text) => (text.includes(a) ? 'exact' : ordered(text).includes(ordered(a)) ? 'marks reordered' : letters(text).includes(letters(a)) ? 'marks differ' : null);

const dir = path.join(lib.PROJECT_DIR, 'reading');
const files = fs.readdirSync(dir).filter((f) => new RegExp(`^[a-z]+-${n}\\.md$`).test(f)).sort();
if (!files.length) throw new Error(`no account of sura ${n} in project/reading`);
const RUN = /[؀-ۿ࣐-ࣿ][؀-ۿ࣐-ࣿ\s]*[؀-ۿ࣐-ࣿ]/g;

for (const f of files) {
  const lines = fs.readFileSync(path.join(dir, f), 'utf8').split('\n');
  const tally = { exact: 0, 'marks reordered': 0, 'marks differ': 0, absent: 0 };
  const cited = { rows: 0, inVerse: 0, elsewhere: [] };
  const notes = [];
  for (const line of lines) {
    const runs = (line.match(RUN) || []).map(sq).filter((a) => a.length > 1);
    if (!runs.length) continue;
    const cell = line.startsWith('|') ? line.split('|')[1] : '';
    let nums = [...cell.matchAll(/\d+/g)].map((m) => Number(m[0])).filter((x) => x >= 1 && x <= verses.length);
    const range = cell.match(/(\d+)\s*[–-]\s*(\d+)/);
    if (range) { nums = []; for (let i = Number(range[1]); i <= Number(range[2]); i++) nums.push(i); }
    for (const a of runs) {
      const w = where(a, whole);
      tally[w || 'absent']++;
      if (w === 'marks differ') notes.push(`marks differ from the text: ${a}`);
      if (!w) notes.push(`letters not found in the sura: ${a}`);
      if (w && nums.length) {
        cited.rows++;
        if (nums.some((k) => where(a, textOf(verses[k - 1])))) cited.inVerse++;
        else cited.elsewhere.push(`row "${cell.trim()}": ${a}`);
      }
    }
  }
  const total = Object.values(tally).reduce((p, q) => p + q, 0);
  console.log(`${f}: ${total} Arabic quotations. Exact: ${tally.exact}. Same but for the order or encoding of marks: ${tally['marks reordered']}. Same letters, different marks: ${tally['marks differ']}. Letters not in the sura: ${tally.absent}.`);
  console.log(`  on table rows that name verses: ${cited.rows} quotations, ${cited.inVerse} stand in a verse the row names`);
  for (const x of cited.elsewhere) console.log(`  not in the verses named: ${x}`);
  for (const x of notes) console.log(`  ${x}`);
}
