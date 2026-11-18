// A fuller loader of the morphology file than corpus.mjs: every word keeps its
// written form, lemma, root, part of speech, stem features and attached prefixes.
// Used by the word-choice project (see PROJECT.md).
import fs from 'node:fs';
import { MORPH_PATH } from './corpus.mjs';

// -> { verses: [{ s, v, idx, words: [{ s, v, w, form, lemma, root, pos, feats, prefixes, token }] }], bySura: Map, at(s, v) }
// token = the lemma, or the written form when the word has no lemma. It is what
// two words are compared by.
//
// keepSura (optional): a function of the sura number. Lines of other suras are
// skipped before they are parsed: only the sura number at the start of the line
// is read. The word-choice project uses this so that suras a run may not see
// are never turned into words (see loadText in project/tools/lib.mjs).
export function loadWords(file = MORPH_PATH, keepSura = null) {
  const verses = [];
  let verse = null;
  let word = null;
  let key = '';
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue;
    if (keepSura && !keepSura(Number(line.slice(0, line.indexOf(':'))))) continue;
    const [loc, form, tag, featStr] = line.split('\t');
    const [s, v, w] = loc.split(':').map(Number);
    if (!verse || verse.s !== s || verse.v !== v) {
      verse = { s, v, idx: verses.length, words: [] };
      verses.push(verse);
      key = '';
    }
    const k = `${s}:${v}:${w}`;
    if (k !== key) {
      word = { s, v, w, form: '', lemma: null, root: null, pos: null, feats: [], prefixes: [] };
      verse.words.push(word);
      key = k;
    }
    word.form += form;
    const feats = (featStr || '').split('|');
    const lemma = (feats.find((f) => f.startsWith('LEM:')) || '').slice(4) || null;
    const root = (feats.find((f) => f.startsWith('ROOT:')) || '').slice(5) || null;
    if (feats.includes('PREF')) {
      word.prefixes.push(lemma || form);
      continue;
    }
    if (feats.includes('SUFF')) continue;
    // The stem: the first root-bearing segment, otherwise the first stem segment.
    if ((root && !word.root) || (!word.root && !word.lemma)) {
      word.lemma = lemma || word.lemma;
      word.root = root || word.root;
      word.pos = tag;
      word.feats = feats.filter((f) => !f.startsWith('LEM:') && !f.startsWith('ROOT:'));
    }
  }
  const bySura = new Map();
  const index = new Map();
  for (const vs of verses) {
    for (const x of vs.words) x.token = x.lemma || x.form;
    if (!bySura.has(vs.s)) bySura.set(vs.s, []);
    bySura.get(vs.s).push(vs);
    index.set(`${vs.s}:${vs.v}`, vs);
  }
  return { verses, bySura, at: (s, v) => index.get(`${s}:${v}`) };
}
