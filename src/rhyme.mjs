// Verse-ending rhyme from the Tanzil Uthmani text, as pronounced in pause.
// Each verse gets a key  <type>+<consonant>:
//   type L = long i or u before the final consonant   (-un, -in, -im, -ir ...)
//   type A = long a before the final consonant        (-ar, -ab, -an ...)
//   type s = short vowel before the final consonant   (-ad, -aq, -ar ...)
//   type C = consonant cluster before the final consonant (qadr, fajr)
//   consonant 0 = the verse ends in a long vowel      (A+0 = -a, L+0 = -i / -u)
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from './corpus.mjs';

const FATHA = 'َ';
const DAMMA = 'ُ';
const KASRA = 'ِ';
const SUKUN = 'ْ';
const SHADDA = 'ّ';
const TANWIN_FATH = 'ً';
const DAGGER = 'ٰ';
const HAMZA_ABOVE = 'ٔ';
const isMark = (c) => /[ً-ٰٕۖ-ۭ]/.test(c);
const VOWELISH = [FATHA, DAMMA, KASRA, SUKUN, 'ً', 'ٌ', 'ٍ'];
const HAMZAS = new Set(['ء', 'أ', 'ؤ', 'إ', 'ئ']);
const ALIF = 'ا';
const ALIF_WASLA = 'ٱ';
const MAQSURA = 'ى';
const YA = 'ي';
const WAW = 'و';
const TA_MARBUTA = 'ة';

// Names of the disconnected letters end like this in recitation.
export const LETTER_NAME = {
  'ا': 'L+م', // alif lam mim -> mim (only ever final as part of a group; unused)
  'م': 'L+م', // mim
  'ن': 'L+ن', // nun
  'س': 'L+ن', // sin
  'ص': 'A+د', // sad
  'ق': 'A+ف', // qaf
  'ه': 'A+0', // ha
  'ر': 'A+0', // ra
};

function units(word) {
  const out = [];
  for (const c of word) {
    if (c === 'ـ') continue; // tatweel only carries marks; attach them to the previous letter
    if (isMark(c)) {
      if (out.length) out[out.length - 1].marks.add(c);
    } else out.push({ ch: c, marks: new Set() });
  }
  return out;
}
const has = (u, m) => u && u.marks.has(m);
const hasVowelMark = (u) => VOWELISH.some((m) => u.marks.has(m));
const norm = (u) => (HAMZAS.has(u.ch) || u.marks.has(HAMZA_ABOVE) ? 'ء' : u.ch);

export function rhymeKey(word) {
  let u = units(word);
  if (u.length === 0) return '?';
  // Disconnected letters carry no vowel marks.
  if (!u.some((x) => hasVowelMark(x) || x.marks.has(DAGGER))) return LETTER_NAME[u[u.length - 1].ch] || '?';
  // Silent alif after plural waw.
  if (u.length >= 2 && u[u.length - 1].ch === ALIF && !hasVowelMark(u[u.length - 1])) {
    const p = u[u.length - 2];
    if (p.ch === WAW && !has(p, FATHA) && !has(p, KASRA) && !has(p, DAMMA) && !has(p, TANWIN_FATH)) u = u.slice(0, -1);
  }
  const last = u[u.length - 1];
  const prev = u[u.length - 2];
  // Vowel-final endings.
  if (last.ch === ALIF && !hasVowelMark(last)) return 'A+0';
  if (has(last, TANWIN_FATH) && last.ch !== TA_MARBUTA) return 'A+0';
  if (last.ch === MAQSURA && !hasVowelMark(last)) {
    if (has(last, DAGGER) || has(prev, FATHA) || has(prev, TANWIN_FATH) || has(prev, DAGGER)) return 'A+0';
    if (has(prev, KASRA)) return 'L+0';
    return 'A+0';
  }
  if (last.ch === YA && !hasVowelMark(last) && !has(last, SHADDA) && has(prev, KASRA)) return 'L+0';
  if (last.ch === WAW && !hasVowelMark(last) && !has(last, SHADDA) && has(prev, DAMMA)) return 'L+0';
  // Consonant-final endings (final short vowel or tanwin is dropped in pause).
  const cons = last.ch === TA_MARBUTA ? 'ه' : norm(last);
  if (!prev) return `s+${cons}`;
  const prev2 = u[u.length - 3];
  let type;
  if (has(prev, DAGGER)) type = 'A';
  else if ((prev.ch === ALIF || prev.ch === ALIF_WASLA) && !hasVowelMark(prev)) type = 'A';
  else if ((prev.ch === YA || prev.ch === MAQSURA) && !hasVowelMark(prev) && !has(prev, SHADDA) && has(prev2, KASRA)) type = 'L';
  else if (prev.ch === WAW && !hasVowelMark(prev) && !has(prev, SHADDA) && has(prev2, DAMMA)) type = 'L';
  else if (has(prev, SUKUN)) type = 'C';
  else type = 's';
  return `${type}+${cons}`;
}

// Broader family used to detect runs: any long i/u + consonant is one family,
// any long a + consonant is another; other endings keep their consonant.
export function rhymeFamily(key) {
  const [type, cons] = key.split('+');
  if (cons === '0') return key;
  if (type === 'L') return 'L+C';
  if (type === 'A') return 'A+C';
  return key;
}

// Returns [{ s, v, lastWord, key, family }] for all 6,236 verses.
export function loadRhymes(file = path.join(ROOT_DIR, 'data', 'quran-uthmani.txt')) {
  const out = [];
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^(\d+)\|(\d+)\|(.*)$/);
    if (!m) continue;
    const words = m[3].trim().split(/\s+/).filter((w) => [...w].some((c) => !isMark(c)));
    const lastWord = words[words.length - 1];
    const key = rhymeKey(lastWord);
    out.push({ s: +m[1], v: +m[2], lastWord, key, family: rhymeFamily(key) });
  }
  return out;
}
