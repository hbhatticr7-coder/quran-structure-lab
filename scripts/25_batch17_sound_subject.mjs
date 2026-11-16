// Batch 17: sound and subject, exactly as specified in PREREGISTRATION_batch17.md.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { ROOT_DIR, MORPH_PATH } from '../src/corpus.mjs';
import { loadRhymes } from '../src/rhyme.mjs';
import { rng, mean } from '../src/stats.mjs';

const r4 = (x) => +x.toFixed(4);
const preregHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT_DIR, 'PREREGISTRATION_batch17.md'))).digest('hex');
const bare = (s) => (s || '').replace(/[ً-ٰٕـ]/g, '');

// ---------- words with their written forms ----------
const verses = []; // { s, v, words: [{ form, root, lemma }] }
{
  let cur = null;
  let word = null;
  let key = '';
  for (const line of fs.readFileSync(MORPH_PATH, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue;
    const [loc, form, , f] = line.split('\t');
    const [s, v, w] = loc.split(':').map(Number);
    if (!cur || cur.s !== s || cur.v !== v) {
      cur = { s, v, words: [] };
      verses.push(cur);
      key = '';
    }
    const k = `${s}:${v}:${w}`;
    if (k !== key) {
      word = { form: '', root: null, lemma: null };
      cur.words.push(word);
      key = k;
    }
    word.form += form;
    const feats = (f || '').split('|');
    const root = (feats.find((x) => x.startsWith('ROOT:')) || '').slice(5) || null;
    const lemma = (feats.find((x) => x.startsWith('LEM:')) || '').slice(4) || null;
    if (root && !word.root) {
      word.root = root;
      word.lemma = lemma;
    } else if (!word.root && !word.lemma && lemma && !feats.includes('PREF') && !feats.includes('SUFF')) word.lemma = lemma;
  }
}
assert.equal(verses.length, 6236);

// ---------- markers ----------
function mostFrequentLemma(root, plain) {
  const t = new Map();
  for (const v of verses) for (const w of v.words) if (w.root === root && bare(w.lemma) === plain) t.set(w.lemma, (t.get(w.lemma) || 0) + 1);
  assert.ok(t.size > 0, `no lemma ${plain} under ${root}`);
  return [...t].sort((a, b) => b[1] - a[1])[0][0];
}
const JANNA = mostFrequentLemma('جنن', 'جنة');
const NAIM = mostFrequentLemma('نعم', 'نعيم');
const NAR = mostFrequentLemma('نور', 'نار');
const IQAB = mostFrequentLemma('عقب', 'عقاب');
const MERCY_ROOTS = new Set(['رحم', 'غفر', 'فوز', 'رضو', 'أجر']);
const WARN_ROOTS = new Set(['عذب', 'جحم', 'سعر', 'ويل', 'هلك', 'لعن']);
const isMercy = (w) => MERCY_ROOTS.has(w.root) || w.lemma === JANNA || w.lemma === NAIM;
const isWarn = (w) => WARN_ROOTS.has(w.root) || w.lemma === NAR || w.lemma === IQAB || bare(w.lemma) === 'جهنم';

// ---------- sound features ----------
const isMark = (c) => /[ً-ٰٕۖ-ۭـ]/.test(c);
const SKELETON = { 'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا', 'ؤ': 'و', 'ئ': 'ي', 'ى': 'ي' };
const VOWELISH = new Set(['ا', 'و', 'ي']);
const SKIP = new Set(['ء', 'ة']); // standalone hamza, ta marbuta
const HARD = new Set(['ص', 'ض', 'ط', 'ظ', 'ق', 'ب', 'ج', 'د']);
const SOFT = new Set(['ل', 'م', 'ن', 'ر']);
const SHORT = new Set(['َ', 'ُ', 'ِ', 'ً', 'ٌ', 'ٍ']);
const ALPHABET = [...'بتثجحخدذرزسشصضطظعغفقكلمنه'];
assert.equal(ALPHABET.length, 25);

function sound(words) {
  let cons = 0;
  let hard = 0;
  let soft = 0;
  let longs = 0;
  let shorts = 0;
  const letters = new Map();
  for (const w of words) {
    // split into base letters with their marks
    const units = [];
    for (const c of w.form) {
      if (isMark(c)) {
        if (units.length) units[units.length - 1].marks.push(c);
      } else units.push({ ch: c, marks: [] });
    }
    for (const u of units) {
      for (const m of u.marks) {
        if (SHORT.has(m)) shorts++;
        if (m === 'ٰ') longs++; // dagger alif
      }
      // an unmarked alif, waw or ya is a long vowel
      if ((u.ch === 'ا' || u.ch === 'و' || u.ch === 'ي' || u.ch === 'ى') && u.marks.length === 0) longs++;
      const n = SKELETON[u.ch] || u.ch;
      if (SKIP.has(n) || VOWELISH.has(n)) continue;
      if (!ALPHABET.includes(n)) continue;
      cons++;
      letters.set(n, (letters.get(n) || 0) + 1);
      if (HARD.has(n)) hard++;
      if (SOFT.has(n)) soft++;
    }
  }
  return { cons, hard, soft, longs, shorts, letters };
}

// ---------- classify and measure ----------
const rows = [];
for (const v of verses) {
  const m = v.words.some(isMercy);
  const w = v.words.some(isWarn);
  if (m === w) continue; // both or neither
  const rest = v.words.filter((x) => !isMercy(x) && !isWarn(x));
  const s = sound(rest);
  if (s.cons === 0 || s.shorts === 0) continue;
  rows.push({ s: v.s, v: v.v, cls: m ? 'mercy' : 'warning', F1: s.hard / s.cons, F2: s.soft / s.cons, F3: s.longs / s.shorts, F4: v.words.length, letters: s.letters, cons: s.cons });
}
const bySura = new Map();
for (const r of rows) {
  if (!bySura.has(r.s)) bySura.set(r.s, { mercy: [], warning: [] });
  bySura.get(r.s)[r.cls].push(r);
}
const used = [...bySura].filter(([, g]) => g.mercy.length >= 5 && g.warning.length >= 5);

function signFlip(diffs, seed, mode) {
  const obs = mean(diffs);
  const rand = rng(seed);
  const DRAWS = 100000;
  let ext = 0;
  for (let d = 0; d < DRAWS; d++) {
    let t = 0;
    for (const x of diffs) t += rand() < 0.5 ? x : -x;
    t /= diffs.length;
    if (mode === 'greater' ? t >= obs - 1e-15 : mode === 'less' ? t <= obs + 1e-15 : Math.abs(t) >= Math.abs(obs) - 1e-15) ext++;
  }
  return (ext + 1) / (DRAWS + 1);
}
function feature(name, f, mode, seed) {
  const diffs = used.map(([, g]) => mean(g.warning.map(f)) - mean(g.mercy.map(f)));
  return {
    feature: name,
    meanInWarningVerses: r4(mean(used.map(([, g]) => mean(g.warning.map(f))))),
    meanInMercyVerses: r4(mean(used.map(([, g]) => mean(g.mercy.map(f))))),
    meanDifference: r4(mean(diffs)),
    surasHigherInWarning: diffs.filter((x) => x > 0).length,
    surasHigherInMercy: diffs.filter((x) => x < 0).length,
    test: mode === 'two' ? 'two-sided' : mode === 'greater' ? 'one-sided, warning higher' : 'one-sided, mercy higher',
    p: +signFlip(diffs, seed, mode).toPrecision(3),
  };
}
const features = [
  feature('F1 hard consonants (share of consonants)', (r) => r.F1, 'greater', 20261220),
  feature('F2 soft consonants (share of consonants)', (r) => r.F2, 'less', 20261221),
  feature('F3 long vowels per short vowel', (r) => r.F3, 'less', 20261222),
  feature('F4 verse length in words', (r) => r.F4, 'two', 20261223),
];

// ---------- description: letter by letter ----------
const letterMap = ALPHABET.map((ch, k) => {
  const f = (r) => (r.letters.get(ch) || 0) / r.cons;
  const diffs = used.map(([, g]) => mean(g.warning.map(f)) - mean(g.mercy.map(f)));
  return { letter: ch, sharePer1000_warning: r4(1000 * mean(used.map(([, g]) => mean(g.warning.map(f))))), sharePer1000_mercy: r4(1000 * mean(used.map(([, g]) => mean(g.mercy.map(f))))), surasLeaningWarning: diffs.filter((x) => x > 0).length, surasLeaningMercy: diffs.filter((x) => x < 0).length, pTwoSided: +signFlip(diffs, 20261300 + k, 'two').toPrecision(3) };
}).sort((a, b) => b.sharePer1000_warning - b.sharePer1000_mercy - (a.sharePer1000_warning - a.sharePer1000_mercy));

// ---------- description: rhyme endings by class ----------
const rhymeOf = new Map(loadRhymes().map((x) => [`${x.s}:${x.v}`, x.family]));
const rhymeTable = {};
for (const r of rows) {
  const fam = rhymeOf.get(`${r.s}:${r.v}`);
  rhymeTable[fam] = rhymeTable[fam] || { mercy: 0, warning: 0 };
  rhymeTable[fam][r.cls]++;
}

const out = {
  preregistrationSha256: preregHash,
  verses: { mercy: rows.filter((r) => r.cls === 'mercy').length, warning: rows.filter((r) => r.cls === 'warning').length },
  surasUsed: used.map(([s]) => s),
  features,
  letterByLetter: letterMap,
  rhymeEndingsByClass: Object.fromEntries(Object.entries(rhymeTable).filter(([, c]) => c.mercy + c.warning >= 20).sort((a, b) => b[1].mercy + b[1].warning - (a[1].mercy + a[1].warning))),
};
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch17.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
