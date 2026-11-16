// Batch 19, step 0: writes coded passages (closes and openings) for the readers.
// Usage: node scripts/27_batch19_prepare_passages.mjs <seed> <path-for-key.json>
// The seed and the key file are kept outside the repository until the batch is finished,
// so that nothing in the repository links a code to a sura while readers are working.
import fs from 'node:fs';
import path from 'node:path';
import { loadCorpus, ROOT_DIR } from '../src/corpus.mjs';
import { rng, shuffle } from '../src/stats.mjs';

const seed = Number(process.argv[2]);
const keyPath = process.argv[3];
if (!seed || !keyPath) throw new Error('usage: node scripts/27_batch19_prepare_passages.mjs <seed> <key.json>');

const corpus = loadCorpus();
const isMark = (c) => /[ً-ٰٕۖ-ۭـ]/.test(c);
const strip = (w) => [...w].filter((c) => !isMark(c)).join('');
const hasVowelMark = (w) => /[ً-ْٰ]/.test(w);

// Arabic text of every verse, without the basmala prefix or disconnected letters.
const text = new Map();
for (const line of fs.readFileSync(path.join(ROOT_DIR, 'data', 'quran-uthmani.txt'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^(\d+)\|(\d+)\|(.*)$/);
  if (!m) continue;
  const s = +m[1];
  const v = +m[2];
  let words = m[3].trim().split(/\s+/).filter((w) => strip(w).length > 0);
  if (v === 1 && s !== 1 && s !== 9 && strip(words[0]) === 'بسم') words = words.slice(4);
  if ((v === 1 || (s === 42 && v === 2)) && words.length && !hasVowelMark(words[0])) words = words.slice(1);
  text.set(`${s}:${v}`, words.join(' '));
}

function window(vs, fromEnd) {
  const seq = fromEnd ? vs.slice().reverse() : vs;
  const out = [];
  let n = 0;
  for (const v of seq) {
    out.push(v);
    n += v.roots.length;
    if (n >= 40) break;
  }
  return fromEnd ? out.reverse() : out;
}

const rand = rng(seed);
const used = new Set();
const code = (prefix) => {
  for (;;) {
    const c = `${prefix}${1000 + Math.floor(rand() * 9000)}`;
    if (!used.has(c)) {
      used.add(c);
      return c;
    }
  }
};
const key = {};
const closes = [];
const openings = [];
for (let s = 1; s <= 114; s++) {
  const vs = corpus.suras.get(s);
  for (const [kind, list, prefix] of [['close', closes, 'C'], ['opening', openings, 'P']]) {
    const w = window(vs, kind === 'close');
    const body = w.map((v) => text.get(`${v.s}:${v.v}`)).filter((t) => t && t.length).join(' ۝ ');
    const c = code(prefix);
    key[c] = { sura: s, kind, verses: `${w[0].v}-${w[w.length - 1].v}` };
    list.push({ code: c, body });
  }
}
shuffle(closes, rand);
shuffle(openings, rand);
const dir = path.join(ROOT_DIR, 'reading');
fs.mkdirSync(dir, { recursive: true });
const write = (name, items) => fs.writeFileSync(path.join(dir, name), items.map((x) => `[${x.code}]\n${x.body}\n`).join('\n'));
write('passages_closes_1.txt', closes.slice(0, 57));
write('passages_closes_2.txt', closes.slice(57));
write('passages_openings_1.txt', openings.slice(0, 57));
write('passages_openings_2.txt', openings.slice(57));
fs.writeFileSync(keyPath, JSON.stringify({ seed, key }, null, 1));
console.log('closes', closes.length, 'openings', openings.length, 'key written outside the repository');
