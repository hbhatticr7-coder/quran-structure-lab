// Compares the tables of voices in two first readings of one build sura made under
// project/reading/PACKET_V2.md. It places each span on the words of its verse from the
// first and last Arabic words the reader gave, checks that each file covers the sura with
// no gap or overlap, and counts, on spans with the same word boundaries in both files, how
// often the leading values agree. It counts leading values only: two cells that both begin
// "open" or "other" may still name different alternatives, so those are counted apart.
// Usage: node project/tools/reading-table.mjs <sura> [file A] [file B]
//        (default files: project/reading/claude-<sura>.md and project/reading/codex-<sura>.md)
import fs from 'node:fs';
import path from 'node:path';
import * as lib from './lib.mjs';

const sura = Number(process.argv[2]);
const given = process.argv.slice(3).filter((x) => !x.startsWith('--'));
const files = given.length ? given : ['claude', 'codex'].map((w) => path.join(lib.PROJECT_DIR, 'reading', `${w}-${sura}.md`));
const { corpus } = lib.loadText('build');
const verses = corpus.bySura.get(sura);
if (!verses) throw new Error(`not a build sura: ${process.argv[2]}`);
const norm = (s) => s.normalize('NFD');
const ARABIC = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]+/g;
const COLS = ['speaker', 'god', 'addressee', 'level', 'setting', 'kind'];
const NEEDS_READING = new Set(['open', 'other', 'opponents', 'character']);

// The leading value of a cell: what stands before the first colon or bracket. The two
// columns that allow several values (how God is referred to, kind) give a sorted list of
// the listed values that begin a part between semicolons; a semicolon inside an
// explanation therefore adds nothing.
const SEVERAL = { god: ['i', 'we', 'he', 'you', 'none'], kind: ['statement', 'command', 'question', 'oath', 'prayer', 'other'] };
const first = (x) => x.split(/[:(]/)[0].trim().toLowerCase();
const lead = (cell, col) => (SEVERAL[col] ? [...new Set(cell.split(';').map(first).filter((v) => SEVERAL[col].includes(v)))].sort().join(' + ') : first(cell));

function table(file) {
  const rows = [];
  const faults = [];
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const cells = line.split('|').map((c) => c.trim());
    const m = cells[1]?.match(new RegExp(`^${sura}:(\\d+)([a-z])?`));
    if (!m || cells.length < 9 || rows.done) { if (rows.length && !line.startsWith('|')) rows.done = true; continue; }
    const words = (cells[1].match(ARABIC) || []).map(norm);
    rows.push({ v: Number(m[1]), letter: m[2] || '', first: words[0], last: words[words.length - 1], cells: Object.fromEntries(COLS.map((c, i) => [c, cells[i + 2]])), confidence: cells[8] });
  }
  for (const verse of verses) {
    const mine = rows.filter((r) => r.v === verse.v);
    const forms = verse.words.map((w) => norm(w.form));
    if (!mine.length) { faults.push(`${sura}:${verse.v} has no span`); continue; }
    if (mine.length === 1 && !mine[0].first) { mine[0].from = 1; mine[0].to = forms.length; continue; }
    let at = 0;
    for (const r of mine) {
      if (forms[at] !== r.first) faults.push(`${sura}:${r.v}${r.letter} does not start at word ${at + 1}`);
      const end = forms.indexOf(r.last, at);
      if (end < 0) { faults.push(`${sura}:${r.v}${r.letter}: last word not found from word ${at + 1}`); break; }
      r.from = at + 1; r.to = end + 1; at = end + 1;
    }
    if (at !== forms.length) {
      // the last word may occur more than once: let the final span run to the end of the verse if its last word matches there
      const r = mine[mine.length - 1];
      if (r.from && forms[forms.length - 1] === r.last) r.to = forms.length; else faults.push(`${sura}:${verse.v} is not covered to its last word`);
    }
  }
  return { name: path.basename(file), rows: rows.filter((r) => r.from), all: rows.length, faults };
}

const [a, b] = files.map(table);
for (const t of [a, b]) {
  console.log(`${t.name}: ${t.all} spans, ${t.faults.length} faults in placing them on the ${verses.length} verses`);
  for (const f of t.faults) console.log('  ' + f);
  const unsure = Object.fromEntries(COLS.map((c) => [c, 0]));
  const label = { speaker: 'speaker', god: 'how god', addressee: 'immediate addressee', level: 'level', setting: 'setting', kind: 'kind' };
  for (const r of t.rows) for (const c of COLS) if (new RegExp(`(^|;\\s*)${label[c]}[^:;]*:`, 'i').test(r.confidence)) unsure[c]++;
  console.log('  spans whose confidence cell names the column: ' + COLS.map((c) => `${c} ${unsure[c]}`).join(', '));
}
const key = (r) => `${r.v}:${r.from}-${r.to}`;
const inB = new Map(b.rows.map((r) => [key(r), r]));
const pairs = a.rows.filter((r) => inB.has(key(r))).map((r) => [r, inB.get(key(r))]);
console.log(`\nspans with the same word boundaries in both files: ${pairs.length}`);
const diffVerses = [...new Set([...a.rows.filter((r) => !inB.has(key(r))).map((r) => r.v), ...b.rows.filter((r) => !new Set(a.rows.map(key)).has(key(r))).map((r) => r.v)])].sort((x, y) => x - y);
console.log(`verses split differently: ${diffVerses.join(', ') || 'none'}`);
console.log('\nleading values on those spans (same / of which both begin open, other, opponents or character, so the detail must be read / different):');
for (const c of COLS) {
  const same = pairs.filter(([x, y]) => lead(x.cells[c], c) === lead(y.cells[c], c));
  const read = same.filter(([x]) => lead(x.cells[c], c).split(' + ').some((v) => NEEDS_READING.has(v)));
  const diff = pairs.filter(([x, y]) => lead(x.cells[c], c) !== lead(y.cells[c], c));
  console.log(`  ${c}: ${same.length} / ${read.length} / ${diff.length}`);
  if (process.argv.includes('--list')) for (const [x, y] of diff) console.log(`      ${sura}:${x.v}${x.letter}  ${lead(x.cells[c], c)}  |  ${lead(y.cells[c], c)}`);
}
