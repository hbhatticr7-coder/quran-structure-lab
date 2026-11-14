// Loads the Quranic Arabic Corpus morphology (mustafa0x fork of QAC v0.4)
// into verses of words. One word = one whitespace-delimited token of the
// Uthmani text; its root and lemma come from the stem segment.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(HERE, '..');
export const MORPH_PATH = path.join(ROOT_DIR, 'data', 'quran-morphology.txt');

export function loadCorpus(file = MORPH_PATH) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const verses = []; // {s, v, words:[{root, lemma, pos}]}
  let curVerse = null;
  let curWord = null;
  let curWordKey = '';
  for (const line of lines) {
    if (!line.trim()) continue;
    const [loc, , tag, featStr] = line.split('\t');
    const [s, v, w] = loc.split(':').map(Number);
    if (!curVerse || curVerse.s !== s || curVerse.v !== v) {
      curVerse = { s, v, words: [] };
      verses.push(curVerse);
      curWordKey = '';
    }
    const key = `${s}:${v}:${w}`;
    if (key !== curWordKey) {
      curWord = { root: null, lemma: null, pos: null };
      curVerse.words.push(curWord);
      curWordKey = key;
    }
    const feats = (featStr || '').split('|');
    const isAffix = feats.includes('PREF') || feats.includes('SUFF');
    let root = null;
    let lemma = null;
    for (const f of feats) {
      if (f.startsWith('ROOT:')) root = f.slice(5);
      else if (f.startsWith('LEM:')) lemma = f.slice(4);
    }
    // First root-bearing segment defines the word; otherwise first stem lemma.
    if (root && !curWord.root) {
      curWord.root = root;
      curWord.lemma = lemma || curWord.lemma;
      curWord.pos = tag;
    } else if (!isAffix && !curWord.root && !curWord.lemma && lemma) {
      curWord.lemma = lemma;
      curWord.pos = tag;
    }
  }
  // Derived per-verse sequences of content (root-bearing) words.
  verses.forEach((vs, i) => {
    vs.idx = i;
    vs.roots = vs.words.filter((x) => x.root).map((x) => x.root);
    vs.lemmas = vs.words.filter((x) => x.root).map((x) => x.lemma || x.root);
  });
  const suras = new Map(); // s -> [verses]
  for (const vs of verses) {
    if (!suras.has(vs.s)) suras.set(vs.s, []);
    suras.get(vs.s).push(vs);
  }
  return { verses, suras };
}

// Verses of sura s with verse number in [from, to] inclusive.
export function range(corpus, s, from, to) {
  return corpus.suras.get(s).filter((x) => x.v >= from && x.v <= to);
}
