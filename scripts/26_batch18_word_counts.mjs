// Batch 18: an audit of popular word-count claims, exactly as specified in PREREGISTRATION_batch18.md.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { ROOT_DIR, MORPH_PATH } from '../src/corpus.mjs';

const preregHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT_DIR, 'PREREGISTRATION_batch18.md'))).digest('hex');
const bare = (s) => (s || '').replace(/[ً-ٰٕـ]/g, '');
const FATHA = 'َ', DAMMA = 'ُ', KASRA = 'ِ', SUKUN = 'ْ';

// ---------- words with stem features ----------
const words = []; // { s, v, w, root, lemma, pos, feats, pron, idh, det }
{
  let cur = null;
  let key = '';
  for (const line of fs.readFileSync(MORPH_PATH, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue;
    const [loc, , pos, f] = line.split('\t');
    const [s, v, w] = loc.split(':').map(Number);
    const k = `${s}:${v}:${w}`;
    if (k !== key) {
      cur = { s, v, w, root: null, lemma: null, pos: null, feats: [], pron: false, idh: false, det: false };
      words.push(cur);
      key = k;
    }
    const feats = (f || '').split('|');
    const root = (feats.find((x) => x.startsWith('ROOT:')) || '').slice(5) || null;
    const lemma = (feats.find((x) => x.startsWith('LEM:')) || '').slice(4) || null;
    if (feats.includes('PRON') && feats.includes('SUFF')) cur.pron = true;
    if (feats.includes('DET')) cur.det = true;
    if (bare(lemma) === 'إذ' && cur.lemma) cur.idh = true; // the "idh" of yawma'idhin, after the stem
    const affix = feats.includes('PREF') || feats.includes('SUFF');
    if (root && !cur.root) Object.assign(cur, { root, lemma, pos, feats });
    else if (!affix && !cur.root && !cur.lemma && lemma) Object.assign(cur, { lemma, pos, feats });
  }
}
const plural = (w) => w.feats.some((x) => x === 'MP' || x === 'FP' || x === 'P');
const dual = (w) => w.feats.some((x) => x === 'MD' || x === 'FD');
const singular = (w) => !plural(w) && !dual(w);
const count = (pred) => words.filter(pred).length;
const lem = (root, plain, ...mustInclude) => (w) => w.root === root && bare(w.lemma) === plain && mustInclude.every((m) => w.lemma.includes(m));
const rootOf = (root) => (w) => w.root === root;
const triple = (name, lemmaPred, root) => {
  const W = count(lemmaPred);
  assert.ok(W > 0, `nothing matched for ${name}`);
  return { word: name, word_count: W, singular: count((w) => lemmaPred(w) && singular(w)), root: count(rootOf(root)) };
};

// ---------- the words ----------
const P = {
  dunya: lem('دنو', 'دنيا'),
  akhira: (w) => w.root === 'أخر' && bare(w.lemma) === 'آخر' && w.lemma.includes(KASRA) && w.feats.includes('FS'),
  malak: lem('ملك', 'ملك', 'م' + FATHA, 'ل' + FATHA),
  shaytan: lem('شطن', 'شيطان'),
  hayat: lem('حيي', 'حياة'),
  mawt: lem('موت', 'موت'),
  rajul: lem('رجل', 'رجل', 'ج' + DAMMA),
  imraa: lem('مرأ', 'امرأت'),
  shahr: lem('شهر', 'شهر'),
  yawm: lem('يوم', 'يوم'),
  bahr: lem('بحر', 'بحر'),
  barr: lem('برر', 'بر', 'ب' + FATHA),
  zakat: lem('زكو', 'زكاة'),
  salat: lem('صلو', 'صلاة'),
  sab: lem('سبع', 'سبع', 'ب' + SUKUN),
  sama: lem('سمو', 'سماء'),
  naf: (w) => lem('نفع', 'نفع', 'ف' + SUKUN)(w) && w.pos === 'N',
  fasad: lem('فسد', 'فساد'),
  musiba: lem('صوب', 'مصيبة'),
  shukr: (w) => lem('شكر', 'شكر', 'ك' + SUKUN)(w) && w.pos === 'N',
  sabr: (w) => lem('صبر', 'صبر', 'ب' + SUKUN)(w) && w.pos === 'N',
  lisan: lem('لسن', 'لسان'),
  mawiza: lem('وعظ', 'موعظة'),
  nur: lem('نور', 'نور'),
  rahba: lem('رهب', 'رهبة'),
  qala: lem('قول', 'قال'),
};
const T = {
  dunya: triple('dunya (this world)', P.dunya, 'دنو'),
  akhira: triple('akhira (the hereafter)', P.akhira, 'أخر'),
  malak: triple('malak (angel)', P.malak, 'ملك'),
  shaytan: triple('shaytan (devil)', P.shaytan, 'شطن'),
  hayat: triple('hayat (life)', P.hayat, 'حيي'),
  mawt: triple('mawt (death)', P.mawt, 'موت'),
  rajul: triple('rajul (man)', P.rajul, 'رجل'),
  imraa: triple("imra'a (woman)", P.imraa, 'مرأ'),
  shahr: triple('shahr (month)', P.shahr, 'شهر'),
  zakat: triple('zakat (alms)', P.zakat, 'زكو'),
  naf: triple("naf' (benefit)", P.naf, 'نفع'),
  fasad: triple('fasad (corruption)', P.fasad, 'فسد'),
  musiba: triple('musiba (calamity)', P.musiba, 'صوب'),
  shukr: triple('shukr (thanks)', P.shukr, 'شكر'),
  sabr: triple('sabr (patience)', P.sabr, 'صبر'),
  lisan: triple('lisan (tongue)', P.lisan, 'لسن'),
  mawiza: triple("maw'iza (admonition)", P.mawiza, 'وعظ'),
  nur: triple('nur (light)', P.nur, 'نور'),
};
const rootOnly = (name, root) => ({ word: name, root: count(rootOf(root)) });

// ---------- verdicts ----------
function verdict(n, ws) {
  const all = (k) => ws.every((x) => x[k] === n);
  if (all('word_count')) return 'Holds';
  if (all('singular')) return 'Holds under another rule (singular only)';
  if (all('root')) return 'Holds under another rule (whole root)';
  if (ws.every((x) => [x.word_count, x.singular, x.root].includes(n))) return 'Only with mixed rules';
  if (ws.length > 1 && ws.every((x) => x.word_count === ws[0].word_count)) return `Does not hold (the two are equal, at ${ws[0].word_count})`;
  return 'Does not hold';
}
const claims = [];
const add = (id, claim, claimed, ws) => claims.push({ id, claim, claimed, counts: ws, verdict: verdict(claimed, ws) });
add(1, 'This world = the hereafter', 115, [T.dunya, T.akhira]);
add(2, 'Angels = devils', 88, [T.malak, T.shaytan]);
add(3, 'Life = death', 145, [T.hayat, T.mawt]);
add(4, 'Man = woman', 24, [T.rajul, T.imraa]);
add(5, 'Month', 12, [T.shahr]);

// 6, 7: day
const yawmSing = count((w) => P.yawm(w) && singular(w));
const yawmNarrow = count((w) => P.yawm(w) && singular(w) && !w.pron && !w.idh);
const yawmNoIdh = count((w) => P.yawm(w) && singular(w) && !w.idh);
const yawmPluralDual = count((w) => P.yawm(w) && (plural(w) || dual(w)));
claims.push({ id: 6, claim: 'Day', claimed: 365, counts: { asTheClaimDefinesIt_singularNoPronounNotYawmaidhin: yawmNarrow, singularWithoutYawmaidhin: yawmNoIdh, allSingular: yawmSing, allForms: count(P.yawm) }, verdict: yawmNarrow === 365 ? 'Holds (under the claim\'s own definition)' : yawmSing === 365 ? 'Holds under another rule (all singular forms)' : 'Does not hold' });
claims.push({ id: 7, claim: 'Days (plural and dual)', claimed: 30, counts: { plural: count((w) => P.yawm(w) && plural(w)), dual: count((w) => P.yawm(w) && dual(w)), together: yawmPluralDual }, verdict: yawmPluralDual === 30 ? 'Holds' : 'Does not hold' });

// 8: qul / qalu
const qul = count((w) => P.qala(w) && w.feats.includes('IMPV') && w.feats.includes('2MS'));
const qalu = count((w) => P.qala(w) && w.feats.includes('PERF') && w.feats.includes('3MP'));
claims.push({ id: 8, claim: '"Say" = "they said"', claimed: 332, counts: { qul, qalu }, verdict: qul === 332 && qalu === 332 ? 'Holds' : qul === qalu ? `Does not hold (the two are equal, at ${qul})` : 'Does not hold' });

// 9: sea and land
const sea = count((w) => P.bahr(w) && singular(w));
const verseHasSea = new Set(words.filter(P.bahr).map((w) => `${w.s}:${w.v}`));
const landDet = count((w) => P.barr(w) && singular(w) && w.det);
const landWithSea = count((w) => P.barr(w) && verseHasSea.has(`${w.s}:${w.v}`));
const yabas = count((w) => w.root === 'يبس' && bare(w.lemma) === 'يبس');
const pct = (a, b) => +((100 * a) / (a + b)).toFixed(2);
claims.push({
  id: 9,
  claim: 'Sea 32 and land 13 (71.11% sea)',
  claimed: '32 and 13',
  counts: { seaSingular: sea, seaAllForms: count(P.bahr), landSingularWithArticle: landDet, landInVerseWithSea: landWithSea, dryLand_yabas: yabas, percentSea_articleRulePlusYabas: pct(sea, landDet + yabas), percentSea_withSeaRulePlusYabas: pct(sea, landWithSea + yabas) },
  verdict: sea === 32 && (landDet + yabas === 13 || landWithSea + yabas === 13) ? 'Holds (with "dry land" added to land, as the claim does)' : 'Does not hold',
});

add(10, 'Alms (zakat) = blessing (baraka)', 32, [T.zakat, { word: 'baraka (blessing)', word_count: count(lem('برك', 'بركة')), singular: count((w) => lem('برك', 'بركة')(w) && singular(w)), root: count(rootOf('برك')) }]);
const salawat = count((w) => P.salat(w) && plural(w));
claims.push({ id: 11, claim: 'Prayers (plural)', claimed: 5, counts: { salawat, salatAllForms: count(P.salat) }, verdict: salawat === 5 ? 'Holds' : 'Does not hold' });
let sevenHeavens = 0;
for (let i = 0; i + 1 < words.length; i++) if (P.sab(words[i]) && P.sama(words[i + 1]) && plural(words[i + 1]) && words[i].s === words[i + 1].s && words[i].v === words[i + 1].v) sevenHeavens++;
claims.push({ id: 12, claim: '"Seven heavens"', claimed: 7, counts: { sevenFollowedByHeavens: sevenHeavens }, verdict: sevenHeavens === 7 ? 'Holds' : 'Does not hold' });
add(13, 'Benefit = corruption', 50, [T.naf, T.fasad]);
add(14, 'Calamity = thanks', 75, [T.musiba, T.shukr]);
{
  const hardship = rootOnly('hardship (root sh-d-d)', 'شدد');
  claims.push({ id: 15, claim: 'Patience = hardship', claimed: 114, counts: [T.sabr, hardship], verdict: T.sabr.root === 114 && hardship.root === 114 ? 'Holds under another rule (whole root)' : T.sabr.root === hardship.root ? `Does not hold (the two roots are equal, at ${hardship.root})` : 'Does not hold' });
}
add(16, 'Tongue = admonition', 25, [T.lisan, T.mawiza]);
{
  const reason = rootOnly("reason (root '-q-l)", 'عقل');
  claims.push({ id: 17, claim: 'Reason = light', claimed: 49, counts: [reason, T.nur], verdict: reason.root === 49 && [T.nur.word_count, T.nur.singular, T.nur.root].includes(49) ? (T.nur.root === 49 ? 'Holds under another rule (whole root)' : 'Only with mixed rules') : 'Does not hold' });
}
{
  const a = rootOnly('desire (root r-gh-b)', 'رغب');
  const b = rootOnly('dread (root r-h-b)', 'رهب');
  claims.push({ id: 18, claim: 'Desire = dread', claimed: 8, counts: [a, b, { word: 'rahba alone', word_count: count(P.rahba) }], verdict: a.root === 8 && b.root === 8 ? 'Holds' : a.root === b.root ? `Does not hold (the two are equal, at ${a.root})` : 'Does not hold' });
}
const iblis = count((w) => !w.root && bare(w.lemma) === 'إبليس');
claims.push({ id: 19, claim: 'Iblis', claimed: 11, counts: { iblis }, verdict: iblis === 11 ? 'Holds' : 'Does not hold' });
const muhammad = count((w) => w.root === 'حمد' && bare(w.lemma) === 'محمد');
claims.push({ id: 20, claim: 'Muhammad', claimed: 4, counts: { muhammad }, verdict: muhammad === 4 ? 'Holds' : 'Does not hold' });

const tally = {};
for (const c of claims) {
  const k = c.verdict.startsWith('Holds under') ? 'Holds under another rule' : c.verdict.startsWith('Holds') ? 'Holds' : c.verdict.startsWith('Only') ? 'Only with mixed rules' : 'Does not hold';
  tally[k] = (tally[k] || 0) + 1;
}
const out = { preregistrationSha256: preregHash, totalWords: words.length, tally, claims };
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch18.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(tally));
for (const c of claims) console.log(String(c.id).padStart(2), c.claim.padEnd(40), 'claimed', String(c.claimed).padEnd(9), '|', c.verdict, '|', JSON.stringify(c.counts));
