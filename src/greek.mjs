// Loads MorphGNT SBLGNT books as verses of content-word lemmas.
// Line format: bcv pos parsing text word normalized lemma  (space separated).
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from './corpus.mjs';

const FILES = { Mt: '61-Mt-morphgnt.txt', Mk: '62-Mk-morphgnt.txt', Lk: '63-Lk-morphgnt.txt' };

export function loadGospels(books = ['Mt', 'Mk', 'Lk']) {
  const verses = [];
  for (const book of books) {
    const lines = fs.readFileSync(path.join(ROOT_DIR, 'data', 'external', 'morphgnt', FILES[book]), 'utf8').split(/\r?\n/);
    let cur = null;
    for (const line of lines) {
      if (!line.trim()) continue;
      const parts = line.split(' ');
      const bcv = parts[0];
      const pos = parts[1];
      const lemma = parts[6];
      if (!cur || cur.bcv !== bcv) {
        cur = { book, bcv, ch: +bcv.slice(2, 4), v: +bcv.slice(4, 6), idx: verses.length, lemmas: [], words: 0 };
        verses.push(cur);
      }
      cur.words++;
      if (pos === 'N-' || pos === 'V-' || pos === 'A-') cur.lemmas.push(lemma);
    }
  }
  return { verses };
}
