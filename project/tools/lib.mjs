// Shared code of the word-choice project: the split of the suras, the masked
// view of the text that a rule is given, and scoring.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from '../../src/corpus.mjs';
import { loadWords } from '../../src/words.mjs';
import { rng } from '../../src/stats.mjs';
import { makeProblems, rootsIn, OTHER, CENSUS_VERSION } from './problems.mjs';

export { OTHER, CENSUS_VERSION };
export const PROJECT_DIR = path.join(ROOT_DIR, 'project');
export const SITES_DIR = path.join(PROJECT_DIR, 'sites');
export const LEDGER_DIR = path.join(PROJECT_DIR, 'ledger');
export const TYPES = ['frame', 'synonym', 'ending', 'order'];
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

// ---------- the split ----------
// Each sura belongs to one part: build (rules are written and tuned here),
// test (each rule is scored here once), vault (opened only when the owner says so).
// For tuning, the build suras are further dealt into two halves, A and B
// (sorted by length, alternating): problems are defined on one half and
// scored on the other, then the reverse.
const PARTS = ['build', 'test', 'vault'];
let rawSplit = null;
const readSplit = () => (rawSplit ||= readJson(path.join(PROJECT_DIR, 'split.json')));

let splitCache = null;
export function loadSplit() {
  if (splitCache) return splitCache;
  const split = readSplit();
  const part = [];
  for (const name of PARTS) for (const s of split[name]) part[s] = name;
  const { words } = loadText('build');
  const byLength = split.build.slice().sort((a, b) => words[b] - words[a] || a - b);
  const sets = { build: new Set(split.build), test: new Set(split.test), vault: new Set(split.vault), foldA: new Set(byLength.filter((_, i) => i % 2 === 0)), foldB: new Set(byLength.filter((_, i) => i % 2 === 1)) };
  splitCache = { ...split, sets, partOf: (s) => part[s] };
  return splitCache;
}

// ---------- the text ----------
// A run is given only the suras it may see, and nothing else is kept in memory:
//   loadText('build')  the build suras
//   loadText('test')   the build and the test suras
//   loadText('vault')  the build and the vault suras; refused unless openVault() was called
// The morphology file holds the whole text, so it is read in full and the
// other suras are dropped at once, before anything is computed from them.
let vaultOpen = false;
export function openVault() {
  vaultOpen = true;
}
const textCache = new Map();
export function loadText(part = 'build') {
  if (!PARTS.includes(part)) throw new Error(`unknown part: ${part}`);
  if (part === 'vault' && !vaultOpen) throw new Error('The vault is opened only when the owner asks for it. See PROJECT.md.');
  if (textCache.has(part)) return textCache.get(part);
  const split = readSplit();
  const allowed = new Set([...split.build, ...(part === 'build' ? [] : split[part])]);
  const verses = loadWords()
    .verses.filter((v) => allowed.has(v.s))
    .map((v, idx) => ({ ...v, idx }));
  const bySura = new Map();
  const index = new Map();
  const words = [];
  for (const v of verses) {
    if (!bySura.has(v.s)) bySura.set(v.s, []);
    bySura.get(v.s).push(v);
    index.set(`${v.s}:${v.v}`, v);
    words[v.s] = (words[v.s] || 0) + v.words.length;
  }
  const meta = [];
  for (const s of readJson(path.join(ROOT_DIR, 'data', 'chronology.json')).suras) if (allowed.has(s.sura)) meta[s.sura] = s;
  const text = { part, allowed, corpus: { verses, bySura, at: (s, v) => index.get(`${s}:${v}`) }, meta, words };
  textCache.set(part, text);
  return text;
}

// ---------- the problems ----------
// A problem: { id, type, options: [label], optionInfo: { label: { tokens, roots } },
//              occurrences: [{ s, v, slots: [word numbers], chosen: label or OTHER }] }
const problemCache = new Map();
export function problemsDefinedOn(setName, part = 'build') {
  const key = `${part}|${setName}`;
  if (!problemCache.has(key)) problemCache.set(key, makeProblems(loadText(part).corpus, loadSplit().sets[setName]));
  return problemCache.get(key);
}

// What a rule may look at when predicting one occurrence: the sura the
// occurrence is in (with the slot words hidden) and the suras the rule learns
// from. Any other sura is refused, so one test sura cannot inform a prediction
// in another.
//   scope: { part, defining } - the part being scored and the name of the defining set of suras
const rootCache = new Map();
export function makeContext(occ, known, { part = 'build', defining = 'build' } = {}) {
  const { corpus, meta } = loadText(part);
  const learnFrom = loadSplit().sets[defining];
  const key = `${part}|${defining}`;
  if (!rootCache.has(key)) rootCache.set(key, rootsIn(corpus, learnFrom));
  const rootOfToken = rootCache.get(key);
  const allow = (s) => {
    if (s !== occ.s && !learnFrom.has(s)) throw new Error(`a rule may read its own sura and the suras it learns from; sura ${s} is neither`);
  };
  const hidden = new Set(occ.slots.map((w) => `${occ.s}:${occ.v}:${w}`));
  const view = (x) => (hidden.has(`${x.s}:${x.v}:${x.w}`) ? { s: x.s, v: x.v, w: x.w, hidden: true } : x);
  const here = corpus.at(occ.s, occ.v);
  const sura = corpus.bySura.get(occ.s);
  const pos = sura.indexOf(here);
  return {
    // Words of one verse (hidden slots marked { hidden: true }).
    verse: (s = occ.s, v = occ.v) => {
      allow(s);
      const vs = corpus.at(s, v);
      return vs ? vs.words.map(view) : null;
    },
    // Verses within k verses of this one, same sura, in order: [{ v, offset, words }].
    window: (k) => {
      const out = [];
      for (let d = -k; d <= k; d++) {
        const vs = sura[pos + d];
        if (vs) out.push({ v: vs.v, offset: d, words: vs.words.map(view) });
      }
      return out;
    },
    // The whole sura, as verses of words.
    sura: () => sura.map((vs, i) => ({ v: vs.v, offset: i - pos, words: vs.words.map(view) })),
    // Facts about a sura: { sura, ayas, type, egyptian, noldeke }.
    meta: (s = occ.s) => {
      allow(s);
      return meta[s];
    },
    // The root of a word, as annotated in the suras the rule learns from.
    rootOf: (token) => rootOfToken.get(token) || null,
    // This problem's occurrences in the suras the rule may learn from, with the
    // choice made there (OTHER where the word is not one of the options).
    build: known,
  };
}

// The simplest guess: the option used most in the suras the rule may learn from.
export function majority(known) {
  const tally = new Map();
  for (const o of known) if (o.chosen !== OTHER) tally.set(o.chosen, (tally.get(o.chosen) || 0) + 1);
  const ranked = [...tally].sort((a, b) => b[1] - a[1]);
  if (!ranked.length || (ranked[1] && ranked[1][1] === ranked[0][1])) return null;
  return ranked[0][0];
}

// The (defining suras, scored suras) pairs for a part.
export const runsFor = (part) => (part === 'build' ? [['foldA', 'foldB'], ['foldB', 'foldA']] : [['build', part]]);

// A rule's predictions on one part: [{ problem, occ, prediction, baseline, unseen }].
// unseen: the word used there is not among the options (seen in the defining
// suras), so the place cannot be answered; the rule is not asked.
// test and vault: problems are defined on the build suras, which are also what the rule may learn from.
// build: problems are defined on one half of the build suras and scored on the other half, both ways.
export function predictAll(rule, part) {
  const { sets } = loadSplit();
  const rows = [];
  for (const [defName, scoreName] of runsFor(part)) {
    for (const problem of problemsDefinedOn(defName, part)) {
      if (rule && rule.appliesTo && !rule.appliesTo.includes(problem.type)) continue;
      const known = problem.occurrences.filter((o) => sets[defName].has(o.s));
      const baseline = majority(known);
      const shown = { id: problem.id, type: problem.type, options: problem.options, optionInfo: problem.optionInfo };
      for (const occ of problem.occurrences) {
        if (!sets[scoreName].has(occ.s)) continue;
        if (occ.chosen === OTHER) {
          rows.push({ problem, occ, prediction: null, baseline, unseen: true });
          continue;
        }
        let prediction = null;
        if (rule) {
          prediction = rule.predict({ s: occ.s, v: occ.v, slots: occ.slots }, shown, makeContext(occ, known, { part, defining: defName })) ?? null;
          if (prediction !== null && !problem.options.includes(prediction)) throw new Error(`${rule.id} predicted "${prediction}", which is not an option of ${problem.id}`);
        }
        rows.push({ problem, occ, prediction, baseline, unseen: false });
      }
    }
  }
  return rows;
}

// Scores for a set of prediction rows, with three p-values.
// pGain: is the rule right more often than the baseline (sign-flip test, each
// answered place counted as independent)?
// pGainBySura: the same question with each sura counted once (its net gain over
// the baseline keeps or flips its sign as a whole), because places within one
// sura are not independent of each other.
// pAgainstShuffledChoices: within each problem, the choices actually made are
// shuffled among the occurrences the rule answered; do the rule's predictions
// match the real choices more often than the shuffled ones?
//
// Places where the word used is not among the options (rows marked unseen) are
// left out of accuracy and of every test. They are counted in `unseen`, and
// accuracyAllPlaces / baselineAllPlaces count them as misses, with the baseline
// standing in wherever the rule gives no answer.
export function scoreRows(allRows, { draws = 20000, seed = 7 } = {}) {
  const rows = allRows.filter((r) => !r.unseen);
  const unseen = allRows.length - rows.length;
  const covered = rows.filter((r) => r.prediction !== null);
  const baseScore = (r) => (r.baseline === null ? 1 / r.problem.options.length : r.baseline === r.occ.chosen ? 1 : 0);
  let correct = 0;
  let baseCorrect = 0;
  for (const r of covered) {
    if (r.prediction === r.occ.chosen) correct++;
    baseCorrect += baseScore(r);
  }
  const groups = new Map();
  for (const r of covered) {
    if (!groups.has(r.problem.id)) groups.set(r.problem.id, []);
    groups.get(r.problem.id).push(r);
  }
  const packs = [...groups.values()].filter((g) => g.length > 1).map((g) => ({ pred: g.map((r) => r.prediction), chosen: g.map((r) => r.occ.chosen) }));
  const fixed = [...groups.values()].filter((g) => g.length === 1).reduce((t, g) => t + (g[0].prediction === g[0].occ.chosen ? 1 : 0), 0);
  const rand = rng(seed);
  let ge = 0;
  for (let d = 0; d < draws; d++) {
    let c = fixed;
    for (const p of packs) {
      const ch = p.chosen;
      for (let i = ch.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        const t = ch[i];
        ch[i] = ch[j];
        ch[j] = t;
      }
      for (let i = 0; i < ch.length; i++) if (p.pred[i] === ch[i]) c++;
    }
    if (c >= correct) ge++;
  }
  // Is the rule better than the baseline? Each answered occurrence gives a
  // difference (rule right or wrong, minus the baseline's score); under "no
  // better", the signs of the differences are arbitrary.
  const diffs = covered.map((r) => (r.prediction === r.occ.chosen ? 1 : 0) - baseScore(r)).filter((d) => d !== 0);
  const total = diffs.reduce((t, d) => t + d, 0);
  let geGain = 0;
  for (let d = 0; d < draws; d++) {
    let t = 0;
    for (let i = 0; i < diffs.length; i++) t += rand() < 0.5 ? diffs[i] : -diffs[i];
    if (t >= total - 1e-9) geGain++;
  }
  // The same, one sign per sura.
  const perSura = new Map();
  for (const r of covered) perSura.set(r.occ.s, (perSura.get(r.occ.s) || 0) + (r.prediction === r.occ.chosen ? 1 : 0) - baseScore(r));
  const suraDiffs = [...perSura.values()].filter((d) => Math.abs(d) > 1e-9);
  const suraTotal = suraDiffs.reduce((t, d) => t + d, 0);
  const rand2 = rng(seed + 1);
  let geSura = 0;
  for (let d = 0; d < draws; d++) {
    let t = 0;
    for (let i = 0; i < suraDiffs.length; i++) t += rand2() < 0.5 ? suraDiffs[i] : -suraDiffs[i];
    if (t >= suraTotal - 1e-9) geSura++;
  }
  // Every place, answered or not, unseen words included.
  let allRule = 0;
  let allBase = 0;
  for (const r of rows) {
    allBase += baseScore(r);
    allRule += r.prediction === null ? baseScore(r) : r.prediction === r.occ.chosen ? 1 : 0;
  }
  const r4 = (x) => +x.toFixed(4);
  return {
    occurrences: rows.length,
    answered: covered.length,
    correct,
    accuracy: covered.length ? r4(correct / covered.length) : null,
    baselineAccuracy: covered.length ? r4(baseCorrect / covered.length) : null,
    gainOverBaseline: covered.length ? r4((correct - baseCorrect) / covered.length) : null,
    pGain: covered.length ? +((geGain + 1) / (draws + 1)).toPrecision(3) : null,
    pAgainstShuffledChoices: covered.length ? +((ge + 1) / (draws + 1)).toPrecision(3) : null,
    surasAnswered: perSura.size,
    pGainBySura: covered.length ? +((geSura + 1) / (draws + 1)).toPrecision(3) : null,
    unseen,
    accuracyAllPlaces: allRows.length ? r4(allRule / allRows.length) : null,
    baselineAllPlaces: allRows.length ? r4(allBase / allRows.length) : null,
  };
}

export function scoreByType(rows) {
  const out = { all: scoreRows(rows) };
  for (const t of TYPES) {
    const sub = rows.filter((r) => r.problem.type === t);
    if (sub.length) out[t] = scoreRows(sub);
  }
  return out;
}

export const readLedger = () =>
  fs.existsSync(LEDGER_DIR)
    ? fs
        .readdirSync(LEDGER_DIR)
        .filter((f) => f.endsWith('.json'))
        .sort()
        .map((f) => readJson(path.join(LEDGER_DIR, f)))
    : [];
