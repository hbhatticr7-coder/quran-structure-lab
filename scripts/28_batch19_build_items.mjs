// Batch 19, step 2 preparation: builds the judges' items from the gists.
// Usage: node scripts/28_batch19_build_items.mjs <path-to-key.json>
// Reads the passage key (kept outside the repository), writes item files for the judges
// into reading/, and adds the item key to the same outside file.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { ROOT_DIR } from '../src/corpus.mjs';
import { rng, shuffle } from '../src/stats.mjs';

const keyPath = process.argv[2];
const store = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
const dir = path.join(ROOT_DIR, 'reading');
const gists = {};
for (const f of ['gists_closes_1.json', 'gists_closes_2.json', 'gists_openings_1.json', 'gists_openings_2.json']) Object.assign(gists, JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));

const closeOf = [];
const openOf = [];
for (const [code, k] of Object.entries(store.key)) {
  assert.ok(typeof gists[code] === 'string' && gists[code].trim().length > 0, `missing gist for ${code}`);
  (k.kind === 'close' ? closeOf : openOf)[k.sura] = gists[code].trim();
}
for (let s = 1; s <= 114; s++) assert.ok(closeOf[s] && openOf[s], `sura ${s} incomplete`);

const rand = rng(store.seed + 1);
// The four nearest suras other than N and N+1, preferring two after and two before.
function decoys(n) {
  const out = [];
  for (const c of [n + 2, n - 1, n + 3, n - 2, n + 4, n - 3, n + 5, n - 4, n + 6, n - 5]) {
    if (out.length === 4) break;
    if (c >= 1 && c <= 114 && c !== n && c !== n + 1) out.push(c);
  }
  return out;
}
const LABELS = ['A', 'B', 'C', 'D', 'E'];
const used = new Set();
const newId = (prefix) => {
  for (;;) {
    const id = `${prefix}${100 + Math.floor(rand() * 900)}`;
    if (!used.has(id)) {
      used.add(id);
      return id;
    }
  }
};
function makeItem(n, prefix) {
  const options = shuffle([n + 1, ...decoys(n)], rand);
  return { id: newId(prefix), sura: n, options, trueLabel: LABELS[options.indexOf(n + 1)] };
}
const render = (items) =>
  items
    .map((it) => [`=== ITEM ${it.id} ===`, `CLOSE: ${closeOf[it.sura]}`, ...it.options.map((s, i) => `${LABELS[i]}: ${openOf[s]}`), ''].join('\n'))
    .join('\n');

const seams = shuffle(Array.from({ length: 113 }, (_, k) => k + 1), rand);
const items = seams.map((n) => makeItem(n, 'S'));
const files = [items.slice(0, 38), items.slice(38, 76), items.slice(76)];
files.forEach((part, i) => fs.writeFileSync(path.join(dir, `judge_items_${i + 1}.txt`), render(part)));
// Second judge on the first 38 seams, with a fresh order of options.
const repeat = files[0].map((it) => makeItem(it.sura, 'R'));
fs.writeFileSync(path.join(dir, 'judge_items_4.txt'), render(shuffle(repeat.slice(), rand)));
// Blindness check: 40 closes.
const blind = shuffle(Array.from({ length: 114 }, (_, k) => k + 1), rand).slice(0, 40).map((s) => ({ id: newId('B'), sura: s }));
fs.writeFileSync(path.join(dir, 'blindness_items.txt'), blind.map((b) => `[${b.id}] ${closeOf[b.sura]}`).join('\n\n') + '\n');

store.items = Object.fromEntries([...items, ...repeat].map((it) => [it.id, { sura: it.sura, options: it.options, trueLabel: it.trueLabel }]));
store.blind = Object.fromEntries(blind.map((b) => [b.id, b.sura]));
fs.writeFileSync(keyPath, JSON.stringify(store, null, 1));
console.log('items', items.length, 'repeat', repeat.length, 'blindness', blind.length);
console.log('true label spread:', LABELS.map((l) => `${l}:${items.filter((it) => it.trueLabel === l).length}`).join(' '));
