// Batch 16: the retold stories, exactly as specified in PREREGISTRATION_batch16.md.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { loadCorpus, ROOT_DIR } from '../src/corpus.mjs';
import { idfTable } from '../src/similarity.mjs';
import { rng, shuffle, mean } from '../src/stats.mjs';

const r4 = (x) => +x.toFixed(4);
const preregHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT_DIR, 'PREREGISTRATION_batch16.md'))).digest('hex');
const corpus = loadCorpus();
const { verses, suras } = corpus;
const meta = [];
for (const s of JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'chronology.json'), 'utf8')).suras) meta[s.sura] = s;
const bare = (s) => (s || '').replace(/[ً-ٰٕـ]/g, '');
const idf = idfTable(verses.map((v) => v.roots));

// The lemma under `root` with unvowelled form `plain` and total count `count`.
function lemmaFor(root, plain, count) {
  const tally = new Map();
  for (const v of verses) for (const w of v.words) if (w.root === root && bare(w.lemma) === plain) tally.set(w.lemma, (tally.get(w.lemma) || 0) + 1);
  const hits = [...tally].filter(([, n]) => n === count);
  assert.equal(hits.length, 1, `lemma lookup failed: ${root} ${plain} ${count} ${JSON.stringify([...tally])}`);
  return hits[0][0];
}
const AAD = (w) => w.lemma === 'عاد' && w.root === 'عود';
const named = (...names) => (w) => !w.root && names.includes(bare(w.lemma));
const prophets = {
  Moses: named('موسى', 'فرعون', 'هارون'),
  Noah: named('نوح'),
  Abraham: named('إبراهيم'),
  Lot: named('لوط'),
  Ad: AAD,
  Thamud: named('ثمود'),
  Shuayb: named('شعيب'),
  Adam: (w) => (w.root === 'أدم' && bare(w.lemma) === 'آدم') || (!w.root && bare(w.lemma) === 'إبليس'),
};

// ---------- tellings ----------
function tellingsOf(pred) {
  const out = [];
  for (const [s, vs] of suras) {
    const hits = vs.filter((v) => v.words.some(pred)).map((v) => v.v);
    if (hits.length === 0) continue;
    const groups = [];
    let start = hits[0];
    let last = hits[0];
    for (const h of hits.slice(1)) {
      if (h - last <= 10) last = h;
      else {
        groups.push([start, last]);
        start = last = h;
      }
    }
    groups.push([start, last]);
    const maxV = vs[vs.length - 1].v;
    const spans = groups.map(([a, b]) => [a, Math.min(b + 3, maxV)]);
    const inTelling = (v) => spans.some(([a, b]) => v.v >= a && v.v <= b);
    const tv = vs.filter(inTelling);
    const content = tv.reduce((t, v) => t + v.roots.length, 0);
    out.push({ s, spans, verses: tv, host: vs.filter((v) => !inTelling(v)), content, mentions: hits.length });
  }
  return out;
}

// ---------- Part 1: Moses episodes ----------
const CALF = lemmaFor('عجل', 'عجل', 10);
const rootIn = (...roots) => (w) => roots.includes(w.root);
const lemIn = (...plains) => (w) => plains.includes(bare(w.lemma));
const any = (...preds) => (w) => preds.some((p) => p(w));
const episodes = [
  ['Infancy', any(rootIn('رضع', 'لقط'), lemIn('تابوت'))],
  ['Killing, Madyan', any(rootIn('وكز'), (w) => w.root === 'مدن' && bare(w.lemma) === 'مدين')],
  ['Fire and call', any(rootIn('قبس', 'نعل', 'جذو'), (w) => w.root === 'طوي' && bare(w.lemma) === 'طوى')],
  ['Staff and hand', rootIn('بيض', 'ثعب', 'جيب')],
  ['Aaron as helper', any(rootIn('أزر', 'ردأ', 'فصح'), (w) => w.root === 'وزر' && bare(w.lemma) === 'وزير')],
  ['Magicians', rootIn('حبل', 'لقف', 'صلب')],
  ['Plagues', any(rootIn('جرد', 'قمل', 'ضفدع'), (w) => w.root === 'طوف' && bare(w.lemma) === 'طوفان')],
  ['Sea, drowning', rootIn('غرق', 'فلق', 'يبس')],
  ['Haman, tower', any(rootIn('صرح'), lemIn('هامان'))],
  ['Believer', rootIn('كتم')],
  ['Wilderness food', rootIn('سلو', 'غمم')],
  ['Sinai, tablets', any(rootIn('لوح', 'جلو'), (w) => w.root === 'وقت' && bare(w.lemma) === 'ميقات')],
  ['Golden calf', any((w) => w.lemma === CALF, rootIn('خور'), (w) => w.root === 'سمر' && bare(w.lemma) === 'سامري')],
  ['The cow', rootIn('بقر')],
  ['Wandering', rootIn('تيه')],
  ['Qarun', lemIn('قارون')],
  ['Journey (sura 18)', any(rootIn('حوت', 'جدر'), (w) => w.root === 'سفن' && bare(w.lemma) === 'سفينة')],
  ["Pharaoh's body", rootIn('بدن')],
];

// ---------- Part 2: echo test ----------
function echoTest(tellings, { dropFinal = false, byPeriod = false, seed }) {
  const rootsOf = (vs) => new Set(vs.flatMap((v) => (dropFinal ? v.roots.slice(0, -1) : v.roots)));
  const T = tellings.map((t) => ({ t, roots: rootsOf(t.verses), host: rootsOf(t.host) }));
  for (const x of T) {
    const others = new Set(T.filter((y) => y !== x).flatMap((y) => [...y.roots]));
    x.particular = [...x.roots].filter((r) => !others.has(r));
  }
  const used = T.filter((x) => x.particular.length > 0 && x.host.size > 0);
  const n = used.length;
  const E = used.map((x) => used.map((y) => x.particular.filter((r) => y.host.has(r)).length / x.particular.length));
  const obs = used.reduce((t, _, i) => t + E[i][i], 0);
  const rand = rng(seed);
  const DRAWS = 100000;
  let ge = 0;
  let sum = 0;
  const idx = used.map((_, i) => i);
  const groups = byPeriod ? ['Meccan', 'Medinan'].map((p) => idx.filter((i) => meta[used[i].t.s].type === p)) : [idx];
  const perm = idx.slice();
  for (let d = 0; d < DRAWS; d++) {
    for (const g of groups) {
      const sh = shuffle(g.slice(), rand);
      g.forEach((i, k) => (perm[i] = sh[k]));
    }
    let t = 0;
    for (let i = 0; i < n; i++) t += E[i][perm[i]];
    sum += t;
    if (t >= obs - 1e-12) ge++;
  }
  return {
    tellings: n,
    meanEchoInOwnHost: r4(obs / n),
    meanEchoUnderReassignment: r4(sum / DRAWS / n),
    ownHostBeatsAverageOtherHost: used.filter((_, i) => E[i][i] > (E[i].reduce((a, b) => a + b, 0) - E[i][i]) / (n - 1)).length,
    p: +((ge + 1) / (DRAWS + 1)).toPrecision(3),
    _used: used,
    _E: E,
  };
}
const strip = ({ _used, _E, ...rest }) => rest;

const all = {};
for (const [name, pred] of Object.entries(prophets)) {
  const ts = tellingsOf(pred);
  all[name] = { tellings: ts.filter((t) => t.content >= 30), passing: ts.filter((t) => t.content < 30).map((t) => t.s) };
}
const moses = all.Moses.tellings;
const R1 = echoTest(moses, { seed: 20261210 });
const secondary = {
  withoutVerseFinalWords: strip(echoTest(moses, { dropFinal: true, seed: 20261211 })),
  reassignedWithinPeriod: strip(echoTest(moses, { byPeriod: true, seed: 20261212 })),
  otherProphets: {},
};
let k = 0;
for (const name of ['Noah', 'Abraham', 'Lot', 'Ad', 'Thamud', 'Shuayb', 'Adam']) {
  const ts = all[name].tellings;
  secondary.otherProphets[name] = ts.length >= 4 ? strip(echoTest(ts, { seed: 20261220 + k++ })) : { tellings: ts.length, note: 'fewer than four tellings; not tested' };
}

// ---------- the map ----------
const span = (spans) => spans.map(([a, b]) => (a === b ? `${a}` : `${a}-${b}`)).join(', ');
const commonLemma = new Map();
{
  const t = new Map();
  for (const v of verses) for (const w of v.words) if (w.root) {
    if (!t.has(w.root)) t.set(w.root, new Map());
    t.get(w.root).set(w.lemma, (t.get(w.root).get(w.lemma) || 0) + 1);
  }
  for (const [root, m] of t) commonLemma.set(root, [...m].sort((a, b) => b[1] - a[1])[0][0]);
}
const mosesMap = moses.map((t) => {
  const i = R1._used.findIndex((x) => x.t === t);
  const x = R1._used[i];
  const present = episodes.filter(([, pred]) => t.verses.some((v) => v.words.some(pred))).map(([name]) => name);
  const echoed = x ? x.particular.filter((r) => x.host.has(r)).sort((a, b) => (idf.get(b) || 0) - (idf.get(a) || 0)) : [];
  return {
    sura: t.s,
    period: meta[t.s].type,
    verses: span(t.spans),
    contentWords: t.content,
    episodes: present,
    particularRoots: x ? x.particular.length : 0,
    echoInOwnHost: x ? r4(R1._E[i][i]) : null,
    meanEchoInOtherHosts: x ? r4((R1._E[i].reduce((a, b) => a + b, 0) - R1._E[i][i]) / (R1._used.length - 1)) : null,
    echoedParticularWords: echoed.slice(0, 8).map((r) => commonLemma.get(r)),
  };
});
const episodeCounts = episodes.map(([name]) => ({ episode: name, suras: mosesMap.filter((m) => m.episodes.includes(name)).map((m) => m.sura) }));

const out = {
  preregistrationSha256: preregHash,
  mosesTellings: moses.length,
  mosesPassingMentions: all.Moses.passing,
  R1_primary: strip(R1),
  secondary,
  episodeCounts,
};
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch16.json'), JSON.stringify(out, null, 2));
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'retellings.json'), JSON.stringify({ moses: mosesMap, others: Object.fromEntries(Object.entries(all).filter(([n]) => n !== 'Moses').map(([n, a]) => [n, a.tellings.map((t) => ({ sura: t.s, verses: span(t.spans), contentWords: t.content }))])) }, null, 1));

const md = [
  '# The Moses story across the suras',
  '',
  'Which parts of the story each sura tells, found automatically from marker words. Built by `scripts/24_batch16_retellings.mjs` under `PREREGISTRATION_batch16.md`; see `RESULTS.md`, batch 16.',
  '',
  'This is a first pass for a reader to correct. A marker can miss an episode told in other words, and can fire on an unrelated use of the word.',
  '',
  '## Episodes by sura',
  '',
  `| Sura | Verses | ${episodes.map(([n]) => n).join(' | ')} |`,
  `|---|---|${episodes.map(() => '---').join('|')}|`,
  ...mosesMap.map((m) => `| ${m.sura} | ${m.verses} | ${episodes.map(([n]) => (m.episodes.includes(n) ? 'x' : '')).join(' | ')} |`),
  '',
  '## How many suras tell each episode',
  '',
  '| Episode | Suras |',
  '|---|---|',
  ...episodeCounts.map((e) => `| ${e.episode} | ${e.suras.length ? e.suras.join(', ') : 'none found'} |`),
  '',
  '## What is particular to each telling',
  '',
  '"Particular words" occur in this telling and in no other Moses telling. "Echo" is the share of them that also occur elsewhere in the same sura, with the average share found in the other suras for comparison. The words listed are the rarest of those echoed.',
  '',
  '| Sura | Period | Particular words | Echo in own sura | In other suras | Echoed words (rarest first) |',
  '|---|---|---|---|---|---|',
  ...mosesMap.map((m) => `| ${m.sura} | ${m.period} | ${m.particularRoots} | ${m.echoInOwnHost === null ? '' : m.echoInOwnHost.toFixed(2)} | ${m.meanEchoInOtherHosts === null ? '' : m.meanEchoInOtherHosts.toFixed(2)} | ${m.echoedParticularWords.join('، ')} |`),
  '',
];
fs.writeFileSync(path.join(ROOT_DIR, 'RETELLINGS.md'), md.join('\n'));
console.log(JSON.stringify(out, null, 1));
console.log(mosesMap.map((m) => `${m.sura} [${m.verses}] ${m.contentWords}w: ${m.episodes.join('; ')}`).join('\n'));
