// Loads Genesis from the Open Scriptures Hebrew Bible (OSIS XML) as verses of
// content-word lemmas. The file is read as text; nothing in it is executed.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from './corpus.mjs';

export const GENESIS_PATH = path.join(ROOT_DIR, 'data', 'external', 'oshb', 'Gen.xml');

// Content words: verbs (V), nouns incl. proper (N), adjectives (A).
// A word's lemma attribute looks like "c/2492 b" (prefix letters, then a
// Strong's number with an optional homonym letter); its morph attribute looks
// like "HC/Vqw3ms" with one segment per lemma part (plus optional suffix segments).
export function loadGenesis(file = GENESIS_PATH) {
  const xml = fs.readFileSync(file, 'utf8');
  const verses = [];
  for (const m of xml.matchAll(/<verse osisID="Gen\.(\d+)\.(\d+)">([\s\S]*?)<\/verse>/g)) {
    const body = m[3].replace(/<note[\s\S]*?<\/note>/g, '');
    const lemmas = [];
    let words = 0;
    for (const w of body.matchAll(/<w\b([^>]*)>/g)) {
      words++;
      const lemmaAttr = (w[1].match(/lemma="([^"]*)"/) || [])[1];
      const morphAttr = (w[1].match(/morph="([^"]*)"/) || [])[1];
      if (!lemmaAttr || !morphAttr) continue;
      const lemParts = lemmaAttr.split('/');
      const morphParts = morphAttr.slice(1).split('/'); // drop language letter (H or A)
      for (let k = 0; k < lemParts.length; k++) {
        const id = lemParts[k].replace(/\+/g, '').trim();
        if (!/^\d/.test(id)) continue; // prefix letters
        const pos = (morphParts[k] || '')[0];
        if (pos === 'V' || pos === 'N' || pos === 'A') lemmas.push(id);
      }
    }
    verses.push({ ch: +m[1], v: +m[2], idx: verses.length, lemmas, words });
  }
  return { verses };
}

// Any OSHB books, e.g. ['1Sam', '2Sam']. Same word rules as loadGenesis.
export function loadOshbBooks(bookIds) {
  const verses = [];
  for (const book of bookIds) {
    const xml = fs.readFileSync(path.join(ROOT_DIR, 'data', 'external', 'oshb', `${book}.xml`), 'utf8');
    const re = new RegExp(`<verse osisID="${book}\\.(\\d+)\\.(\\d+)">([\\s\\S]*?)<\\/verse>`, 'g');
    for (const m of xml.matchAll(re)) {
      const body = m[3].replace(/<note[\s\S]*?<\/note>/g, '');
      const lemmas = [];
      for (const w of body.matchAll(/<w\b([^>]*)>/g)) {
        const lemmaAttr = (w[1].match(/lemma="([^"]*)"/) || [])[1];
        const morphAttr = (w[1].match(/morph="([^"]*)"/) || [])[1];
        if (!lemmaAttr || !morphAttr) continue;
        const lemParts = lemmaAttr.split('/');
        const morphParts = morphAttr.slice(1).split('/');
        for (let k = 0; k < lemParts.length; k++) {
          const id = lemParts[k].replace(/\+/g, '').trim();
          if (!/^\d/.test(id)) continue;
          const pos = (morphParts[k] || '')[0];
          if (pos === 'V' || pos === 'N' || pos === 'A') lemmas.push(id);
        }
      }
      verses.push({ book, ch: +m[1], v: +m[2], idx: verses.length, lemmas });
    }
  }
  return { verses };
}

// spec: "37:36-37:36,39:1-39:6" -> verses in those inclusive ranges, in order.
export function genesisRange(gen, spec) {
  const out = [];
  for (const part of spec.split(',')) {
    const [from, to] = part.split('-').map((x) => x.split(':').map(Number));
    const lo = from[0] * 1000 + from[1];
    const hi = to[0] * 1000 + to[1];
    const got = gen.verses.filter((x) => x.ch * 1000 + x.v >= lo && x.ch * 1000 + x.v <= hi);
    if (got.length === 0) throw new Error(`empty Genesis range: ${part}`);
    out.push(...got);
  }
  return out;
}
