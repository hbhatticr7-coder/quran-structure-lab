// The census: finds every place where the text makes a choice of the kinds
// defined below, and writes them as problems to project/sites/. Also makes the
// split of the suras (once) and writes project/CENSUS.md.
//
//   frame    a word slot with the same three words before it and after it
//            (a verse edge counts as a word; at least three of the six must be
//            real words), filled by different words in different places
//   synonym  an occurrence of a word from a listed set of near-synonyms
//   ending   a verse-final pair of nouns/adjectives that recurs: given the
//            first word, which word closes the verse
//   order    two nouns joined by "and" that occur in both orders
//
// Usage: node project/tools/census.mjs
import fs from 'node:fs';
import path from 'node:path';
import { loadWords } from '../../src/words.mjs';
import { rng } from '../../src/stats.mjs';
import { lcsAlign } from '../../src/twins.mjs';
import { PROJECT_DIR, SITES_DIR } from './lib.mjs';

const corpus = loadWords();
const { verses } = corpus;
const bare = (s) => (s || '').replace(/[ً-ٰٕـ]/g, '');
const rootOf = new Map();
for (const v of verses) for (const w of v.words) if (w.root && !rootOf.has(w.token)) rootOf.set(w.token, w.root);
const info = (tokens) => Object.fromEntries(tokens.map((t) => [t, { tokens: [t], roots: rootOf.get(t) ? [rootOf.get(t)] : [] }]));
fs.mkdirSync(SITES_DIR, { recursive: true });

// ---------- the split (made once, then never changed) ----------
const splitFile = path.join(PROJECT_DIR, 'split.json');
if (!fs.existsSync(splitFile)) {
  const words = [];
  for (const [s, vs] of corpus.bySura) words[s] = vs.reduce((t, v) => t + v.words.length, 0);
  const order = [...corpus.bySura.keys()].sort((a, b) => words[b] - words[a]);
  const rand = rng(20261117);
  const split = { note: 'Suras sorted by length and dealt out in fours: two to build, one to test, one to vault, at random (seed 20261117). The last two go to build. Never regenerate.', build: [], test: [], vault: [] };
  for (let i = 0; i < order.length; i += 4) {
    const group = order.slice(i, i + 4);
    if (group.length < 4) {
      split.build.push(...group);
      continue;
    }
    for (let k = 3; k > 0; k--) {
      const j = Math.floor(rand() * (k + 1));
      [group[k], group[j]] = [group[j], group[k]];
    }
    split.build.push(group[0], group[1]);
    split.test.push(group[2]);
    split.vault.push(group[3]);
  }
  for (const k of ['build', 'test', 'vault']) split[k].sort((a, b) => a - b);
  split.words = Object.fromEntries(['build', 'test', 'vault'].map((k) => [k, split[k].reduce((t, s) => t + words[s], 0)]));
  fs.writeFileSync(splitFile, JSON.stringify(split, null, 1));
}
const split = JSON.parse(fs.readFileSync(splitFile, 'utf8'));
const partOf = [];
for (const k of ['build', 'test', 'vault']) for (const s of split[k]) partOf[s] = k;

// ---------- frames ----------
const PAD = 3;
const frameMap = new Map();
for (const v of verses) {
  const t = [...Array(PAD).fill('^'), ...v.words.map((w) => w.token), ...Array(PAD).fill('$')];
  for (let i = PAD; i < t.length - PAD; i++) {
    const key = `${t.slice(i - PAD, i).join(' ')} _ ${t.slice(i + 1, i + 1 + PAD).join(' ')}`;
    if (!frameMap.has(key)) frameMap.set(key, []);
    frameMap.get(key).push({ s: v.s, v: v.v, slots: [i - PAD + 1], chosen: t[i] });
  }
}
const frames = [];
for (const [key, occ] of frameMap) {
  const options = [...new Set(occ.map((o) => o.chosen))];
  if (options.length < 2) continue;
  // At least three of the six context positions must be real words, not verse edges.
  if (key.split(' ').filter((t) => t !== '^' && t !== '$' && t !== '_').length < 3) continue;
  frames.push({ id: `frame:${key}`, type: 'frame', options, optionInfo: info(options), occurrences: occ });
}

// ---------- synonyms ----------
const sets = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'synonyms.json'), 'utf8')).sets;
const synonyms = [];
for (const set of sets) {
  const optionInfo = {};
  const occurrences = [];
  for (const opt of set.options) {
    const tally = new Map();
    for (const v of verses) for (const w of v.words) if (w.root === opt.root && (!opt.plain || bare(w.lemma) === opt.plain)) tally.set(w.token, (tally.get(w.token) || 0) + 1);
    const tokens = [...tally].filter(([, n]) => opt.count === undefined || n === opt.count).map(([t]) => t);
    if (!tokens.length) throw new Error(`synonym option not found: ${set.id} / ${opt.label}`);
    optionInfo[opt.label] = { tokens, roots: [opt.root] };
    for (const v of verses) for (const w of v.words) if (tokens.includes(w.token)) occurrences.push({ s: v.s, v: v.v, slots: [w.w], chosen: opt.label });
  }
  occurrences.sort((a, b) => a.s - b.s || a.v - b.v || a.slots[0] - b.slots[0]);
  synonyms.push({ id: `synonym:${set.id}`, type: 'synonym', gloss: set.gloss, options: set.options.map((o) => o.label), optionInfo, occurrences });
}

// ---------- verse endings ----------
const nominal = (w) => w.pos === 'N' && w.root;
const pairCount = new Map();
for (const v of verses) {
  const n = v.words.length;
  if (n < 2 || !nominal(v.words[n - 2]) || !nominal(v.words[n - 1])) continue;
  const k = `${v.words[n - 2].token}\t${v.words[n - 1].token}`;
  pairCount.set(k, (pairCount.get(k) || 0) + 1);
}
const byHead = new Map();
for (const [k, n] of pairCount) {
  if (n < 3) continue;
  const [head, last] = k.split('\t');
  if (!byHead.has(head)) byHead.set(head, []);
  byHead.get(head).push(last);
}
const endings = [];
for (const [head, lasts] of byHead) {
  if (lasts.length < 2) continue;
  const occurrences = [];
  for (const v of verses) {
    const n = v.words.length;
    if (n < 2 || !nominal(v.words[n - 2]) || v.words[n - 2].token !== head || !lasts.includes(v.words[n - 1].token)) continue;
    occurrences.push({ s: v.s, v: v.v, slots: [n], chosen: v.words[n - 1].token });
  }
  endings.push({ id: `ending:${head}`, type: 'ending', options: lasts, optionInfo: info(lasts), occurrences });
}

// ---------- order of paired words ----------
const pairs = new Map();
for (const v of verses)
  for (let i = 0; i + 1 < v.words.length; i++) {
    const a = v.words[i];
    const b = v.words[i + 1];
    if (!nominal(a) || !nominal(b) || !b.prefixes.includes('و') || a.token === b.token) continue;
    const k = [a.token, b.token].sort().join('\t');
    if (!pairs.has(k)) pairs.set(k, []);
    pairs.get(k).push({ s: v.s, v: v.v, slots: [a.w, b.w], chosen: `${a.token} > ${b.token}` });
  }
const order = [];
let fixedOrderPairs = 0;
for (const [k, occ] of pairs) {
  if (occ.length < 3) continue;
  const [x, y] = k.split('\t');
  const options = [`${x} > ${y}`, `${y} > ${x}`];
  if (new Set(occ.map((o) => o.chosen)).size < 2) {
    fixedOrderPairs++;
    continue;
  }
  order.push({ id: `order:${x} / ${y}`, type: 'order', options, optionInfo: { [options[0]]: { tokens: [x, y], roots: [] }, [options[1]]: { tokens: [y, x], roots: [] } }, occurrences: occ });
}

// ---------- near-identical verses (counted, not yet turned into problems) ----------
const byBigram = new Map();
verses.forEach((v) => {
  const t = v.words.map((w) => w.token);
  const seen = new Set();
  for (let i = 0; i + 1 < t.length; i++) {
    const g = `${t[i]} ${t[i + 1]}`;
    if (seen.has(g)) continue;
    seen.add(g);
    if (!byBigram.has(g)) byBigram.set(g, []);
    byBigram.get(g).push(v.idx);
  }
});
const done = new Set();
const twins = { pairs: 0, identical: 0, oneWordSwapped: 0, wordsAddedOrLeftOut: 0, other: 0 };
for (const list of byBigram.values()) {
  if (list.length > 400) continue; // a pair of very common words; such verses meet through rarer pairs
  for (let x = 0; x < list.length; x++)
    for (let y = x + 1; y < list.length; y++) {
      const key = list[x] * 10000 + list[y];
      if (done.has(key)) continue;
      done.add(key);
      const A = verses[list[x]].words.map((w) => w.token);
      const B = verses[list[y]].words.map((w) => w.token);
      const longer = Math.max(A.length, B.length);
      if (Math.min(A.length, B.length) < 4 || Math.min(A.length, B.length) / longer < 0.7) continue;
      const m = lcsAlign(A, B);
      if (m.length < 4 || m.length / longer < 0.7) continue;
      twins.pairs++;
      if (m.length === A.length && m.length === B.length) {
        twins.identical++;
        continue;
      }
      // classify the gaps between matches
      let swaps = 0;
      let adds = 0;
      let other = 0;
      const pts = [[-1, -1], ...m, [A.length, B.length]];
      for (let k = 0; k + 1 < pts.length; k++) {
        const da = pts[k + 1][0] - pts[k][0] - 1;
        const db = pts[k + 1][1] - pts[k][1] - 1;
        if (da === 0 && db === 0) continue;
        if (da === 1 && db === 1) swaps++;
        else if (da === 0 || db === 0) adds++;
        else other++;
      }
      if (swaps) twins.oneWordSwapped++;
      if (adds) twins.wordsAddedOrLeftOut++;
      if (other) twins.other++;
    }
}

// ---------- write ----------
const groups = { frame: frames, synonym: synonyms, ending: endings, order };
const rows = [];
for (const [type, problems] of Object.entries(groups)) {
  problems.sort((a, b) => b.occurrences.length - a.occurrences.length || (a.id < b.id ? -1 : 1));
  fs.writeFileSync(path.join(SITES_DIR, `${type}.json`), JSON.stringify({ type, problems }));
  const occ = problems.flatMap((p) => p.occurrences);
  const n = (part) => occ.filter((o) => partOf[o.s] === part).length;
  rows.push({ type, problems: problems.length, occurrences: occ.length, build: n('build'), test: n('test'), vault: n('vault') });
}
const tot = rows.reduce((t, r) => ({ problems: t.problems + r.problems, occurrences: t.occurrences + r.occurrences, build: t.build + r.build, test: t.test + r.test, vault: t.vault + r.vault }), { problems: 0, occurrences: 0, build: 0, test: 0, vault: 0 });
const WHAT = {
  frame: 'A word slot with the same three words before and after it, filled differently in different places',
  synonym: `An occurrence of a word from ${sets.length} listed sets of near-synonyms`,
  ending: 'A recurring pair of words closing a verse: given the first, which word closes it',
  order: 'Two nouns joined by "and" that occur in both orders',
};
const md = [
  '# Census of choice sites',
  '',
  'Written by `project/tools/census.mjs`. Do not edit by hand.',
  '',
  'A *problem* is one kind of choice (one phrase frame, one set of synonyms). An *occurrence* is one place in the text where that choice is made.',
  '',
  '| Type | What it is | Problems | Occurrences | In build suras | In test suras | In vault suras |',
  '|---|---|---|---|---|---|---|',
  ...rows.map((r) => `| ${r.type} | ${WHAT[r.type]} | ${r.problems.toLocaleString('en')} | ${r.occurrences.toLocaleString('en')} | ${r.build.toLocaleString('en')} | ${r.test.toLocaleString('en')} | ${r.vault.toLocaleString('en')} |`),
  `| **all** | | ${tot.problems.toLocaleString('en')} | ${tot.occurrences.toLocaleString('en')} | ${tot.build.toLocaleString('en')} | ${tot.test.toLocaleString('en')} | ${tot.vault.toLocaleString('en')} |`,
  '',
  `The split: ${split.build.length} build suras (${split.words.build.toLocaleString('en')} words), ${split.test.length} test suras (${split.words.test.toLocaleString('en')}), ${split.vault.length} vault suras (${split.words.vault.toLocaleString('en')}).`,
  '',
  '## Not yet turned into problems',
  '',
  `- **Near-identical verses.** ${twins.pairs.toLocaleString('en')} pairs of verses share at least 70% of their words in order. ${twins.identical.toLocaleString('en')} are word-for-word identical; ${twins.oneWordSwapped.toLocaleString('en')} differ by a swapped word; ${twins.wordsAddedOrLeftOut.toLocaleString('en')} by words added or left out; ${twins.other.toLocaleString('en')} in a longer stretch. (A pair can fall in more than one group.) Swapped words are mostly covered by the frames above. Added and omitted words are not yet covered.`,
  `- **Pairs always in one order.** ${fixedOrderPairs} pairs of nouns joined by "and" occur three times or more and always in the same order.`,
  '- **Choices of form.** Singular or plural, verb form, definite or indefinite, which particle is attached. Words are compared by dictionary form here, so these are not counted.',
  '- **What each telling of a story includes.** See batch 16.',
  '',
];
fs.writeFileSync(path.join(PROJECT_DIR, 'CENSUS.md'), md.join('\n'));
console.log(JSON.stringify({ rows, total: tot, twins, fixedOrderPairs, split: split.words }, null, 1));
console.log('largest frames:', frames.slice(0, 8).map((f) => `${f.id} [${f.options.length} options, ${f.occurrences.length} places]`).join('\n  '));
