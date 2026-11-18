// Builds the choice problems.
//
// Census version 2. Which problems exist, and which options each has, is
// decided from a *defining* set of suras only. Occurrences are then collected
// from the whole text. An occurrence whose word is not one of the options gets
// chosen = OTHER and is not scored.
//
// Version 1 defined problems from the whole text. That let the test suras
// shape the problems: a phrase frame counted only if its word varied somewhere,
// so a frame seen once in the build suras and once in the test suras was
// certain to differ there, and the baseline was certain to be wrong. Defining
// problems from the build suras alone removes this.
//
//   frame    a word slot with the same three words before it and after it
//            (a verse edge counts as a word; at least three of the six must be
//            real words), filled by two or more different words in the defining suras
//   synonym  an occurrence of a word from a listed set of near-synonyms
//   ending   a verse closed by two nouns/adjectives: given the first, which
//            word closes it. Options: closing words seen three times or more
//            after that first word in the defining suras (at least two of them)
//   order    two nouns joined by "and", seen three times or more and in both
//            orders in the defining suras
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from '../../src/corpus.mjs';

export const CENSUS_VERSION = 2;
export const OTHER = '(other)';
const PAD = 3;
const bare = (s) => (s || '').replace(/[ً-ٰٕـ]/g, '');
const nominal = (w) => w.pos === 'N' && w.root;
export const loadSynonymSets = () => JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'project', 'synonyms.json'), 'utf8')).sets;

// Things computed once per text, whatever the defining suras.
const prepared = new WeakMap();
function prepare(corpus) {
  if (prepared.has(corpus)) return prepared.get(corpus);
  const { verses } = corpus;
  const rootOf = new Map();
  for (const v of verses) for (const w of v.words) if (w.root && !rootOf.has(w.token)) rootOf.set(w.token, w.root);
  const frameMap = new Map();
  for (const v of verses) {
    const t = [...Array(PAD).fill('^'), ...v.words.map((w) => w.token), ...Array(PAD).fill('$')];
    for (let i = PAD; i < t.length - PAD; i++) {
      const ctx = [...t.slice(i - PAD, i), ...t.slice(i + 1, i + 1 + PAD)];
      if (ctx.filter((x) => x !== '^' && x !== '$').length < 3) continue;
      const key = `${ctx.slice(0, PAD).join(' ')} _ ${ctx.slice(PAD).join(' ')}`;
      if (!frameMap.has(key)) frameMap.set(key, []);
      frameMap.get(key).push({ s: v.s, v: v.v, slots: [i - PAD + 1], word: t[i] });
    }
  }
  const endings = []; // { s, v, slots, head, word }
  const pairs = new Map(); // "x\ty" (sorted) -> [{ s, v, slots, first, second }]
  for (const v of verses) {
    const n = v.words.length;
    if (n >= 2 && nominal(v.words[n - 2]) && nominal(v.words[n - 1])) endings.push({ s: v.s, v: v.v, slots: [n], head: v.words[n - 2].token, word: v.words[n - 1].token });
    for (let i = 0; i + 1 < n; i++) {
      const a = v.words[i];
      const b = v.words[i + 1];
      if (!nominal(a) || !nominal(b) || !b.prefixes.includes('و') || a.token === b.token) continue;
      const k = [a.token, b.token].sort().join('\t');
      if (!pairs.has(k)) pairs.set(k, []);
      pairs.get(k).push({ s: v.s, v: v.v, slots: [a.w, b.w], first: a.token, second: b.token });
    }
  }
  const out = { rootOf, frameMap, endings, pairs };
  prepared.set(corpus, out);
  return out;
}

// defining: a Set of sura numbers.
export function makeProblems(corpus, defining, sets = loadSynonymSets()) {
  const { rootOf, frameMap, endings, pairs } = prepare(corpus);
  const info = (tokens) => Object.fromEntries(tokens.map((t) => [t, { tokens: [t], roots: rootOf.get(t) ? [rootOf.get(t)] : [] }]));
  const problems = [];

  for (const [key, occ] of frameMap) {
    const options = [...new Set(occ.filter((o) => defining.has(o.s)).map((o) => o.word))];
    if (options.length < 2) continue;
    problems.push({ id: `frame:${key}`, type: 'frame', options, optionInfo: info(options), occurrences: occ.map((o) => ({ s: o.s, v: o.v, slots: o.slots, chosen: options.includes(o.word) ? o.word : OTHER })) });
  }

  for (const set of sets) {
    const optionInfo = {};
    const occurrences = [];
    for (const opt of set.options) {
      const tally = new Map();
      for (const v of corpus.verses) for (const w of v.words) if (w.root === opt.root && (!opt.plain || bare(w.lemma) === opt.plain)) tally.set(w.token, (tally.get(w.token) || 0) + 1);
      const tokens = [...tally].filter(([, n]) => opt.count === undefined || n === opt.count).map(([t]) => t);
      if (!tokens.length) throw new Error(`synonym option not found: ${set.id} / ${opt.label}`);
      optionInfo[opt.label] = { tokens, roots: [opt.root] };
      for (const v of corpus.verses) for (const w of v.words) if (tokens.includes(w.token)) occurrences.push({ s: v.s, v: v.v, slots: [w.w], chosen: opt.label });
    }
    occurrences.sort((a, b) => a.s - b.s || a.v - b.v || a.slots[0] - b.slots[0]);
    problems.push({ id: `synonym:${set.id}`, type: 'synonym', gloss: set.gloss, options: set.options.map((o) => o.label), optionInfo, occurrences });
  }

  const count = new Map();
  for (const e of endings) if (defining.has(e.s)) count.set(`${e.head}\t${e.word}`, (count.get(`${e.head}\t${e.word}`) || 0) + 1);
  const byHead = new Map();
  for (const [k, n] of count) {
    if (n < 3) continue;
    const [head, word] = k.split('\t');
    if (!byHead.has(head)) byHead.set(head, []);
    byHead.get(head).push(word);
  }
  for (const [head, options] of byHead) {
    if (options.length < 2) continue;
    problems.push({ id: `ending:${head}`, type: 'ending', options, optionInfo: info(options), occurrences: endings.filter((e) => e.head === head).map((e) => ({ s: e.s, v: e.v, slots: e.slots, chosen: options.includes(e.word) ? e.word : OTHER })) });
  }

  for (const [k, occ] of pairs) {
    const inDef = occ.filter((o) => defining.has(o.s));
    if (inDef.length < 3 || new Set(inDef.map((o) => o.first)).size < 2) continue;
    const [x, y] = k.split('\t');
    const options = [`${x} > ${y}`, `${y} > ${x}`];
    problems.push({ id: `order:${x} / ${y}`, type: 'order', options, optionInfo: { [options[0]]: { tokens: [x, y], roots: [] }, [options[1]]: { tokens: [y, x], roots: [] } }, occurrences: occ.map((o) => ({ s: o.s, v: o.v, slots: o.slots, chosen: `${o.first} > ${o.second}` })) });
  }
  return problems;
}
