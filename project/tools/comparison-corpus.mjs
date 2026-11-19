// Version-2 comparison adapters. Existing unit IDs and partitions are reused.
// Excluded chapters/tractates are skipped before words are tokenized. All
// orthographic words are retained, including function and one-letter words.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ROOT_DIR } from '../../src/corpus.mjs';
import { loadText, loadSplit } from './lib.mjs';
import { indexCorpus } from './comparison.mjs';

const manifest = () => JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'project/comparison/split.json'), 'utf8'));
const word = (s, v, w, form, token) => ({ s, v, w, form: form.normalize('NFC'), token: token.normalize('NFC'), lemma: token.normalize('NFC'), root: null, pos: null, feats: [], prefixes: [] });
export function normalizedSurface(text) {
  // Greek accents use both precomposed and combining letters. Arabic letter
  // hamzas are retained by using NFC there; vowel/recitation marks are removed.
  const greek = /\p{Script=Greek}/u.test(text);
  return text.normalize(greek ? 'NFD' : 'NFC').replace(/\p{M}/gu, '').replace(/\u0640/g, '').toLowerCase().normalize('NFC');
}
const decode = (text) => text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n));

export function parseGreek(text, book, units, allowed) {
  const verses = [], byVerse = new Map();
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const bcv = line.slice(0, 6), ch = +bcv.slice(2, 4), v = +bcv.slice(4, 6);
    const s = units.get(`${book}:${ch}`);
    if (!allowed.has(s)) continue;
    const fields = line.trim().split(/\s+/);
    if (fields.length !== 7) throw new Error(`bad MorphGNT row in allowed chapter ${book}:${ch}`);
    const key = `${s}:${v}`;
    if (!byVerse.has(key)) { const row = { s, v, words: [] }; byVerse.set(key, row); verses.push(row); }
    const vs = byVerse.get(key);
    vs.words.push(word(s, v, vs.words.length + 1, fields[4], fields[6]));
  }
  return verses;
}

export function parseHebrew(text, book, units, allowed) {
  const verses = [];
  for (const match of text.matchAll(/<verse\b[^>]*osisID="([^"]+)"[^>]*>([\s\S]*?)<\/verse>/g)) {
    const [, chapter, number] = match[1].split('.');
    const s = units.get(`${book}:${+chapter}`), v = +number;
    if (!allowed.has(s)) continue;
    const words = [];
    const body = match[2].replace(/<note\b[\s\S]*?<\/note>/g, '');
    for (const w of body.matchAll(/<w\b([^>]*)>([\s\S]*?)<\/w>/g)) {
      const form = decode(w[2].replace(/<[^>]*>/g, '')).replace(/\//g, '');
      const lemma = decode((w[1].match(/\blemma="([^"]*)"/) || [])[1] || '');
      const pieces = lemma.replace(/\+/g, '').split('/').map((p) => p.trim()).filter(Boolean);
      const stems = pieces.filter((p) => /^\d/.test(p));
      const token = stems.length ? stems.join('/') : pieces.join('/') || normalizedSurface(form);
      words.push(word(s, v, words.length + 1, form, token));
    }
    verses.push({ s, v, words });
  }
  return verses;
}

export function mishnahWords(text) {
  const flat = Array.isArray(text) ? text.flat(Infinity).join(' ') : String(text);
  return (decode(flat.replace(/<[^>]*>/g, ' ').replace(/־/g, ' ')).match(/[א-ת][א-ת\u0591-\u05bd\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05c7]*/g) || []).map(normalizedSurface);
}

const cache = new Map();
export function loadComparisonPart(id, part, representation = 'surface') {
  if (!['build', 'test'].includes(part) || !['surface', 'lexical'].includes(representation)) throw new Error('comparison part/representation is not allowed');
  const key = `${id}:${part}`;
  if (!cache.has(key)) {
    if (id === 'quran') {
      const split = loadSplit();
      const corpus = loadText(part).corpus;
      cache.set(key, { corpus, split: { build: split.build, test: split.test, reserve: split.vault }, sourceHashes: {}, annotation: 'QAC lemmas, all words' });
    } else {
      const data = manifest().datasets[id];
      if (!data) throw new Error(`unknown comparison collection ${id}`);
      const allowed = new Set(part === 'build' ? data.build : [...data.build, ...data.test]);
      const units = new Map(data.units.map((u) => [u.name, u.s]));
      const verses = [];
      for (const [name, expected] of Object.entries(data.sourceHashes)) {
        const bytes = fs.readFileSync(path.join(ROOT_DIR, name));
        if (crypto.createHash('sha256').update(bytes).digest('hex') !== expected) throw new Error(`comparison source changed: ${name}`);
        if (id === 'gospels') {
          const book = path.basename(name).split('-')[1];
          verses.push(...parseGreek(bytes.toString('utf8'), book, units, allowed));
        } else if (id === 'samuel_kings_chronicles') {
          verses.push(...parseHebrew(bytes.toString('utf8'), path.basename(name, '.xml'), units, allowed));
        } else {
          const tractates = JSON.parse(bytes);
          if (tractates.length !== 63) throw new Error('expected all 63 Mishnah tractates');
          for (const tractate of tractates) {
            const s = units.get(tractate.title);
            if (!allowed.has(s)) continue;
            if (!Array.isArray(tractate.text) || tractate.text.length !== tractate.chapters || !tractate.text.every(Array.isArray)) throw new Error(`incomplete tractate: ${tractate.title}`);
            let v = 0;
            for (const chapter of tractate.text) for (const item of chapter) {
              v++;
              verses.push({ s, v, words: mishnahWords(item).map((token, i) => word(s, v, i + 1, token, token)) });
            }
          }
        }
      }
      if (!verses.length || verses.some((v) => !allowed.has(v.s))) throw new Error('empty or unfiltered comparison input');
      cache.set(key, { corpus: indexCorpus(verses), split: { build: data.build, test: data.test, reserve: data.reserve }, sourceHashes: data.sourceHashes,
        annotation: id === 'mishnah' ? 'unpointed written forms; no lemma annotation' : 'source lemmas, all orthographic words' });
    }
  }
  const data = cache.get(key);
  const verses = data.corpus.verses.map((vs) => ({ s: vs.s, v: vs.v, words: vs.words.map((w) => {
    const surface = normalizedSurface(w.form ?? w.token);
    // All arms have the same fields; no roots or hidden grammatical features.
    // Surface arms also normalize their context forms, not just their targets.
    return word(vs.s, vs.v, w.w, representation === 'surface' ? surface : w.form ?? w.token, representation === 'surface' ? surface : w.token);
  }) }));
  return { ...data, corpus: indexCorpus(verses), representation };
}
