// Builds data/chronology.json from two downloaded reference files.
// Both are parsed as plain text; nothing in them is executed.
//   - Tanzil quran-data.xml: Meccan/Medinan type and the Egyptian standard order.
//   - Wikipedia "List of chapters in the Quran" (wikitext): Egyptian and Noldeke orders.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { ROOT_DIR } from '../src/corpus.mjs';

const xml = fs.readFileSync(path.join(ROOT_DIR, 'data', 'external', 'tanzil', 'quran-data.xml'), 'utf8');
const wiki = fs.readFileSync(path.join(ROOT_DIR, 'data', 'external', 'wikipedia', 'list_of_chapters.wikitext'), 'utf8');

const suras = {};
for (const m of xml.matchAll(/<sura index="(\d+)" ayas="(\d+)"[^>]*? type="(Meccan|Medinan)" order="(\d+)"/g)) {
  suras[+m[1]] = { sura: +m[1], ayas: +m[2], type: m[3], egyptian: +m[4] };
}
assert.equal(Object.keys(suras).length, 114, 'Tanzil: expected 114 suras');

// Wikipedia rows: "| N || [[Title]] ... | 7 (1) || [[Mecca|Makkah]] || 5 || 48 || ..."
const rows = wiki.split(/\n\|-[^\n]*/);
let parsed = 0;
const mismatches = [];
for (const row of rows) {
  // Cells are separated by "||" on one line or by a newline + "|"; normalise to "||".
  const norm = row.replace(/\n\|/g, '||');
  const head = norm.match(/^\s*\|\|\s*(\d+)\s*\|\|/);
  if (!head) continue;
  const n = +head[1];
  // verses (rukus) || place || Egyptian || Noldeke ||
  // rukus may be a fraction; the place cell may or may not be a wiki link.
  const m = norm.match(/(\d+)\s*\([^)|]*\)\s*\|\|(?:[^|]|\|(?!\|))*?\|\|\s*(\d+)\s*\|\|\s*(\d+)\s*\|\|/);
  if (!m || !suras[n]) continue;
  if (+m[1] !== suras[n].ayas || +m[2] !== suras[n].egyptian) mismatches.push({ sura: n, wikiAyas: +m[1], wikiEgyptian: +m[2] });
  suras[n].noldeke = +m[3];
  parsed++;
}
const list = Object.values(suras).sort((a, b) => a.sura - b.sura);
const isPermutation = (key) => {
  const vals = list.map((s) => s[key]).sort((a, b) => a - b);
  return vals.every((v, i) => v === i + 1);
};
const report = {
  wikipediaRowsParsed: parsed,
  egyptianIsPermutation: isPermutation('egyptian'),
  noldekeIsPermutation: parsed === 114 && isPermutation('noldeke'),
  tanzilVsWikipediaMismatches: mismatches,
};
console.log(JSON.stringify(report, null, 2));
fs.writeFileSync(
  path.join(ROOT_DIR, 'data', 'chronology.json'),
  JSON.stringify({ sources: ['tanzil.net quran-data.xml', 'en.wikipedia.org List_of_chapters_in_the_Quran (wikitext)'], report, suras: list }, null, 1)
);
