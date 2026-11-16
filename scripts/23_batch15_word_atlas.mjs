// Batch 15: the word-choice atlas, exactly as specified in PREREGISTRATION_batch15.md.
// Pass --list-w7 to print every occurrence of the two words for "year" (for the
// reading in claims/w7_reading.json) without running anything else.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { loadCorpus, ROOT_DIR, MORPH_PATH } from '../src/corpus.mjs';

const r4 = (x) => +x.toFixed(4);
const corpus = loadCorpus();
const { verses, suras } = corpus;
const meta = [];
for (const s of JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'chronology.json'), 'utf8')).suras) meta[s.sura] = s;

// Stem features (number, person) for each word, straight from the morphology file.
const featsAt = new Map();
for (const line of fs.readFileSync(MORPH_PATH, 'utf8').split(/\r?\n/)) {
  if (!line.trim()) continue;
  const [loc, , , f] = line.split('\t');
  const feats = (f || '').split('|');
  if (feats.includes('PREF') || feats.includes('SUFF')) continue;
  const key = loc.split(':').slice(0, 3).join(':');
  if (!featsAt.has(key) || feats.some((x) => x.startsWith('ROOT:'))) featsAt.set(key, feats);
}

// ---------- selecting words ----------
const bare = (s) => (s || '').replace(/[ً-ٰٕـ]/g, '');
// The exact lemma string under `root` whose unvowelled form is `plain` (and, if given, whose total count is `count`).
function lemmaFor(root, plain, count) {
  const tally = new Map();
  for (const v of verses) for (const w of v.words) if (w.root === root && bare(w.lemma) === plain) tally.set(w.lemma, (tally.get(w.lemma) || 0) + 1);
  const hits = [...tally].filter(([, n]) => count === undefined || n === count);
  assert.equal(hits.length, 1, `lemma lookup failed for ${root} / ${plain} / ${count}: ${JSON.stringify([...tally])}`);
  return hits[0][0];
}
function find(pred) {
  const out = [];
  for (const v of verses) v.words.forEach((w, wi) => {
    if (pred(w)) out.push({ s: v.s, v: v.v, wi, vIdx: v.idx, lemma: w.lemma, feats: featsAt.get(`${v.s}:${v.v}:${wi + 1}`) || [] });
  });
  return out;
}
const byRoot = (root) => find((w) => w.root === root);
const byLemmas = (...lems) => find((w) => lems.includes(w.lemma));
const R = (x) => x; // roots are written out below for readability

const SANA = [lemmaFor('سنو', 'سنة'), lemmaFor('سنو', 'سنين')];
const AM = lemmaFor('عوم', 'عام');
const words = {
  matar: byRoot('مطر'),
  ghayth: byLemmas(lemmaFor('غيث', 'غيث')),
  rih: byLemmas(lemmaFor('روح', 'ريح')),
  anzala: byLemmas(lemmaFor('نزل', 'أنزل')),
  nazzala: byLemmas(lemmaFor('نزل', 'نزل', 62)),
  khashya: byRoot('خشي'),
  khawf: byRoot('خوف'),
  fuad: byLemmas(lemmaFor('فأد', 'فؤاد')),
  qalb: byLemmas(lemmaFor('قلب', 'قلب', 132)),
  halafa: byRoot('حلف'),
  aqsama: byLemmas(lemmaFor('قسم', 'أقسم')),
  sana: byLemmas(...SANA),
  am: byLemmas(AM),
  jaa: byLemmas(lemmaFor('جيأ', 'جاء')),
  ata: byLemmas(lemmaFor('أتي', 'أتى')),
  bashar: byLemmas(lemmaFor('بشر', 'بشر', 37)),
  insan: byLemmas(lemmaFor('أنس', 'إنسان')),
  amila: byLemmas(lemmaFor('عمل', 'عمل', 276)),
  faala: byLemmas(lemmaFor('فعل', 'فعل', 88)),
};
const rihPlural = words.rih.filter((o) => o.feats.includes('FP') || o.feats.includes('MP'));
const rihSingular = words.rih.filter((o) => !(o.feats.includes('FP') || o.feats.includes('MP')));
const ref = (o) => `${o.s}:${o.v}`;

if (process.argv.includes('--list-w7')) {
  const en = new Map();
  const tr = path.join(ROOT_DIR, 'data', 'en.sahih.txt');
  if (fs.existsSync(tr)) for (const l of fs.readFileSync(tr, 'utf8').split(/\r?\n/)) {
    const m = l.match(/^(\d+)\|(\d+)\|(.*)$/);
    if (m) en.set(`${m[1]}:${m[2]}`, m[3]);
  }
  for (const [name, list] of [['sana', words.sana], ['am', words.am]]) for (const o of list) console.log(name, ref(o), '|', (en.get(ref(o)) || '').slice(0, 230));
  process.exit(0);
}

const preregHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT_DIR, 'PREREGISTRATION_batch15.md'))).digest('hex');

// ---------- helpers for the rules ----------
const verseRoots = (idx) => new Set(verses[idx].roots);
const sameVerseHas = (o, roots) => roots.some((r) => verseRoots(o.vIdx).has(r));
const nearbyHas = (o, roots) => [o.vIdx - 1, o.vIdx, o.vIdx + 1].some((i) => verses[i] && verses[i].s === o.s && roots.some((r) => verseRoots(i).has(r)));
const lnC = (n, k) => {
  let t = 0;
  for (let i = 1; i <= k; i++) t += Math.log(n - k + i) - Math.log(i);
  return t;
};
// One-sided Fisher exact: probability of a or more of the K "yes" cases falling in group 1 (size n1).
function fisher(a, n1, b, n2) {
  const K = a + b;
  let p = 0;
  for (let x = a; x <= Math.min(n1, K); x++) if (K - x <= n2) p += Math.exp(lnC(n1, x) + lnC(n2, K - x) - lnC(n1 + n2, K));
  return Math.min(1, p);
}
const share = (list, f) => {
  const yes = list.filter(f);
  return { of: list.length, yes: yes.length, share: r4(yes.length / list.length), list: yes.map(ref), others: list.filter((o) => !f(o)).map(ref) };
};

// ---------- W1 rain ----------
const PUNISH = ['عذب', 'حجر', 'سوأ', 'جرم', 'نذر', 'هلك', 'أذي'];
const w1a = share(words.matar, (o) => nearbyHas(o, PUNISH));
const w1b = share(words.ghayth, (o) => nearbyHas(o, PUNISH));
const W1 = { matar: w1a, ghayth: w1b, p: +fisher(w1a.yes, w1a.of, w1b.yes, w1b.of).toPrecision(3) };

// ---------- W2 wind ----------
const HARM = ['عذب', 'صرصر', 'عقم', 'عصف', 'هلك', 'دمر', 'قصف', 'عتو'];
const MERCY = ['بشر', 'رحم', 'لقح', 'سحب', 'نشر', 'طيب'];
const windClass = (o) => {
  const h = sameVerseHas(o, HARM);
  const m = sameVerseHas(o, MERCY);
  return h && m ? 'both' : h ? 'harm' : m ? 'mercy' : 'neither';
};
const tallyWind = (list) => {
  const t = { harm: [], mercy: [], both: [], neither: [] };
  for (const o of list) t[windClass(o)].push(ref(o));
  return t;
};
const ws = tallyWind(rihSingular);
const wp = tallyWind(rihPlural);
const W2 = {
  singular: { of: rihSingular.length, ...ws },
  plural: { of: rihPlural.length, ...wp },
  // harm: singular vs plural among occurrences classed harm or mercy
  p: +fisher(ws.harm.length, ws.harm.length + ws.mercy.length, wp.harm.length, wp.harm.length + wp.mercy.length).toPrecision(3),
};

// ---------- W3 sent down ----------
const scriptureVerse = (o) => verses[o.vIdx].words.some((w) => ['توراة', 'إنجيل'].includes(bare(w.lemma)));
const w3a = share(words.anzala, scriptureVerse);
const w3n = share(words.nazzala, scriptureVerse);
const W3 = { anzala: { of: w3a.of, withTorahOrGospel: w3a.yes, verses: w3a.list }, nazzala: { of: w3n.of, withTorahOrGospel: w3n.yes, verses: w3n.list }, p: +fisher(w3a.yes, w3a.of, w3n.yes, w3n.of).toPrecision(3) };

// ---------- W4 fear ----------
const DIVINE = new Set(['الله', 'ربّ', 'رحمن']);
const bareKeepShadda = (s) => (s || '').replace(/[ً-ِْ-ٰٕـ]/g, '');
const godFollows = (o) => verses[o.vIdx].words.slice(o.wi + 1, o.wi + 4).some((w) => DIVINE.has(bareKeepShadda(w.lemma)) || DIVINE.has(bare(w.lemma)));
const w4a = share(words.khashya, godFollows);
const w4b = share(words.khawf, godFollows);
const W4 = { khashya: { of: w4a.of, godWithinThreeWords: w4a.yes, share: w4a.share }, khawf: { of: w4b.of, godWithinThreeWords: w4b.yes, share: w4b.share }, p: +fisher(w4a.yes, w4a.of, w4b.yes, w4b.of).toPrecision(3) };

// ---------- W5 heart ----------
const faculties = (o) => verseRoots(o.vIdx).has('سمع') && verseRoots(o.vIdx).has('بصر');
const w5a = share(words.fuad, faculties);
const w5b = share(words.qalb, faculties);
const W5 = { fuad: { of: w5a.of, withHearingAndSight: w5a.yes, share: w5a.share, verses: w5a.list, others: w5a.others }, qalb: { of: w5b.of, withHearingAndSight: w5b.yes, share: w5b.share, verses: w5b.list }, p: +fisher(w5a.yes, w5a.of, w5b.yes, w5b.of).toPrecision(3) };

// ---------- W6 oaths ----------
const FALSE = ['كذب', 'نفق'];
const w6a = share(words.halafa, (o) => nearbyHas(o, FALSE));
const w6b = share(words.aqsama, (o) => nearbyHas(o, FALSE));
const firstSingular = (list) => list.filter((o) => o.feats.includes('1S')).map(ref);
const W6 = {
  halafa: { of: w6a.of, falsehoodNearby: w6a.yes, share: w6a.share, verses: w6a.list, others: w6a.others, firstPersonSingular: firstSingular(words.halafa) },
  aqsama: { of: w6b.of, falsehoodNearby: w6b.yes, share: w6b.share, verses: w6b.list, others: w6b.others, firstPersonSingular: firstSingular(words.aqsama) },
  p: +fisher(w6a.yes, w6a.of, w6b.yes, w6b.of).toPrecision(3),
};

// ---------- W7 year (a reading) ----------
const readingFile = path.join(ROOT_DIR, 'claims', 'w7_reading.json');
const reading = JSON.parse(fs.readFileSync(readingFile, 'utf8')).classes;
const w7 = (list, name) => {
  const t = { hardship: [], ease: [], count: [] };
  for (const o of list) {
    const c = reading[`${name} ${ref(o)}`];
    assert.ok(c && t[c], `no reading for ${name} ${ref(o)}`);
    t[c].push(ref(o));
  }
  return { of: list.length, hardship: t.hardship, ease: t.ease, plainCountOfTime: t.count };
};
const W7 = { note: 'Classified by reading each verse; see claims/w7_reading.json. No test.', sana: w7(words.sana, 'sana'), am: w7(words.am, 'am') };

// ---------- Part 2: the atlas ----------
const commonLemma = new Map();
{
  const t = new Map();
  for (const v of verses) for (const w of v.words) if (w.root) {
    if (!t.has(w.root)) t.set(w.root, new Map());
    t.get(w.root).set(w.lemma, (t.get(w.root).get(w.lemma) || 0) + 1);
  }
  for (const [root, m] of t) commonLemma.set(root, [...m].sort((a, b) => b[1] - a[1])[0][0]);
}
function company(A, B, ownRoots) {
  const vA = [...new Set(A.map((o) => o.vIdx))];
  const vB = [...new Set(B.map((o) => o.vIdx))];
  const count = (vs) => {
    const m = new Map();
    for (const i of vs) for (const r of verseRoots(i)) if (!ownRoots.includes(r)) m.set(r, (m.get(r) || 0) + 1);
    return m;
  };
  const cA = count(vA);
  const cB = count(vB);
  const rows = [];
  for (const r of new Set([...cA.keys(), ...cB.keys()])) {
    const a = cA.get(r) || 0;
    const b = cB.get(r) || 0;
    if (a + b < 5) continue;
    rows.push({ root: r, word: commonLemma.get(r), inA: a, inB: b, logOdds: Math.log((a + 0.5) / (vA.length - a + 0.5)) - Math.log((b + 0.5) / (vB.length - b + 0.5)) });
  }
  rows.sort((x, y) => y.logOdds - x.logOdds);
  const fmt = (x) => ({ word: x.word, withFirst: x.inA, withSecond: x.inB });
  return { versesFirst: vA.length, versesSecond: vB.length, distinctiveOfFirst: rows.slice(0, 8).map(fmt), distinctiveOfSecond: rows.slice(-8).reverse().map(fmt) };
}
const split = (list) => {
  const mec = list.filter((o) => meta[o.s].type === 'Meccan').length;
  return { occurrences: list.length, meccan: mec, medinan: list.length - mec };
};
const pairs = [
  ['rain', 'matar', 'ghayth', words.matar, words.ghayth, ['مطر', 'غيث']],
  ['wind', 'rih (singular)', 'riyah (plural)', rihSingular, rihPlural, ['روح']],
  ['sent down', 'anzala', 'nazzala', words.anzala, words.nazzala, ['نزل']],
  ['fear', 'khashya (kh-sh-y)', 'khawf (kh-w-f)', words.khashya, words.khawf, ['خشي', 'خوف']],
  ['heart', "fu'ad", 'qalb', words.fuad, words.qalb, ['فأد', 'قلب']],
  ['swear', 'halafa', 'aqsama', words.halafa, words.aqsama, ['حلف', 'قسم']],
  ['year', 'sana', "'am", words.sana, words.am, ['سنو', 'عوم']],
  ['came', "ja'a", 'ata', words.jaa, words.ata, ['جيأ', 'أتي']],
  ['human', 'bashar', 'insan', words.bashar, words.insan, ['بشر', 'أنس']],
  ['did', "'amila", "fa'ala", words.amila, words.faala, ['عمل', 'فعل']],
];
const atlas = pairs.map(([meaning, a, b, A, B, own]) => ({ meaning, first: { word: a, ...split(A), verses: A.length <= 30 ? A.map(ref) : undefined }, second: { word: b, ...split(B), verses: B.length <= 30 ? B.map(ref) : undefined }, company: company(A, B, own) }));

const out = { preregistrationSha256: preregHash, W1_rain: W1, W2_wind: W2, W3_sentDown: W3, W4_fear: W4, W5_heart: W5, W6_oaths: W6, W7_year: W7 };
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch15.json'), JSON.stringify(out, null, 2));
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'word_atlas.json'), JSON.stringify(atlas, null, 1));

const md = ['# Word-choice atlas', '', 'Pairs of near-synonyms in the Quran and the company each word keeps. Built by `scripts/23_batch15_word_atlas.mjs` under `PREREGISTRATION_batch15.md`. The checks of classical claims about these pairs are in `RESULTS.md`, batch 15.', '', '"Company" lists the words that appear in the same verse far more with one member of the pair than with the other (first number: verses with the first word; second: verses with the second). It is description, not a test.', ''];
for (const p of atlas) {
  md.push(`## ${p.meaning}: ${p.first.word} / ${p.second.word}`, '');
  md.push(`| | Occurrences | Meccan | Medinan |`, `|---|---|---|---|`, `| ${p.first.word} | ${p.first.occurrences} | ${p.first.meccan} | ${p.first.medinan} |`, `| ${p.second.word} | ${p.second.occurrences} | ${p.second.meccan} | ${p.second.medinan} |`, '');
  md.push(`Company of **${p.first.word}**: ${p.company.distinctiveOfFirst.map((x) => `${x.word} (${x.withFirst} / ${x.withSecond})`).join('، ')}`, '');
  md.push(`Company of **${p.second.word}**: ${p.company.distinctiveOfSecond.map((x) => `${x.word} (${x.withFirst} / ${x.withSecond})`).join('، ')}`, '');
  if (p.first.verses) md.push(`Every verse with ${p.first.word}: ${p.first.verses.join(', ')}`, '');
  if (p.second.verses) md.push(`Every verse with ${p.second.word}: ${p.second.verses.join(', ')}`, '');
}
fs.writeFileSync(path.join(ROOT_DIR, 'ATLAS.md'), md.join('\n'));
console.log(JSON.stringify(out, null, 1));
