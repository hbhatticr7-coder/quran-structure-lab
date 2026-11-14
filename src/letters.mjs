// The disconnected letters: which suras open with which letters, and letter
// counts per sura under two counting rules.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from './corpus.mjs';

const isMark = (c) => /[ً-ٰٕۖ-ۭـ]/.test(c);
const hasVowelMark = (w) => /[ً-ْٰ]/.test(w);
const strip = (w) => [...w].filter((c) => !isMark(c)).join('');

// 'skeleton': hamza-carrying forms count as their carrier, alif maqsura as ya,
// ta marbuta as ha, standalone hamza not counted.
// 'strict': only plain alif and alif wasla are alif; hamza carriers, alif
// maqsura and ta marbuta are kept as their own letters.
const SKELETON = { 'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا', 'ؤ': 'و', 'ئ': 'ي', 'ى': 'ي', 'ة': 'ه' };
const STRICT = { 'ٱ': 'ا' };
function normalise(ch, rule) {
  if (ch === 'ء') return null;
  const map = rule === 'strict' ? STRICT : SKELETON;
  return map[ch] || ch;
}

export function loadLetterData(file = path.join(ROOT_DIR, 'data', 'quran-uthmani.txt')) {
  const openers = new Map(); // sura -> { family, letters:[...] }
  const counts = { skeleton: [], strict: [] }; // [sura] -> Map(letter -> count)
  const totals = { skeleton: [], strict: [] };
  for (let s = 1; s <= 114; s++)
    for (const rule of ['skeleton', 'strict']) {
      counts[rule][s] = new Map();
      totals[rule][s] = 0;
    }
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^(\d+)\|(\d+)\|(.*)$/);
    if (!m) continue;
    const s = +m[1];
    const v = +m[2];
    let words = m[3].trim().split(/\s+/).filter((w) => strip(w).length > 0);
    // The file prefixes the basmala to verse 1 of every sura except 1 (where it is the verse) and 9.
    if (v === 1 && s !== 1 && s !== 9 && strip(words[0]) === 'بسم') words = words.slice(4);
    // Opening letters carry no vowel marks.
    if ((v === 1 || (s === 42 && v === 2)) && words.length && !hasVowelMark(words[0])) {
      const letters = [...strip(words[0])];
      if (!openers.has(s)) openers.set(s, { family: letters.join(''), letters: [], strings: [], letterOnlyVerses: [] });
      openers.get(s).letters.push(...letters);
      openers.get(s).strings.push(letters.join(''));
      words = words.slice(1);
      // True when the letters make up the whole verse.
      if (words.length === 0) openers.get(s).letterOnlyVerses.push(v);
    }
    for (const w of words)
      for (const ch of strip(w))
        for (const rule of ['skeleton', 'strict']) {
          const n = normalise(ch, rule);
          if (!n) continue;
          counts[rule][s].set(n, (counts[rule][s].get(n) || 0) + 1);
          totals[rule][s]++;
        }
  }
  for (const o of openers.values()) o.letters = [...new Set(o.letters.map((c) => normalise(c, 'skeleton')))];
  return { openers, counts, totals };
}
