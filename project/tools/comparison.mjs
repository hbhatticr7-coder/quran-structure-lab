// Comparison texts only. Never calls loadText/loadSplit or opens Quran data.
// Prepare once, optionally score build folds, commit/push, then test once.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { ROOT_DIR } from '../../src/corpus.mjs';
import { loadGospels } from '../../src/greek.mjs';
import { loadOshbBooks } from '../../src/hebrew.mjs';
import { rng } from '../../src/stats.mjs';
import { makeProblems, OTHER, CENSUS_VERSION } from './problems.mjs';
import { majority, scoreRows } from './lib.mjs';
import echo from '../rules/R001_echo.mjs';
import content from '../rules/R002_content.mjs';

const DIR = path.join(ROOT_DIR, 'project/comparison');
const SPLIT = 'project/comparison/split.json';
const HEBREW_BOOKS = ['1Sam', '2Sam', '1Kgs', '2Kgs', '1Chr', '2Chr'];
const SOURCES = {
  gospels: ['61-Mt', '62-Mk', '63-Lk'].map((f) => `data/external/morphgnt/${f}-morphgnt.txt`),
  samuel_kings_chronicles: HEBREW_BOOKS.map((b) => `data/external/oshb/${b}.xml`),
  mishnah: ['data/external/sefaria/mishnah.json'],
};
const DEPENDENCIES = [
  'project/COMPARISON_PROTOCOL.md', SPLIT, 'project/tools/comparison.mjs',
  'project/tools/problems.mjs', 'project/tools/lib.mjs',
  'project/rules/R001_echo.mjs', 'project/rules/R002_content.mjs',
  'src/corpus.mjs', 'src/words.mjs', 'src/stats.mjs', 'src/greek.mjs', 'src/hebrew.mjs',
];
const contentOnFrames = { ...content, id: 'C002_frame', appliesTo: ['frame'] };
const sha = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const read = (file) => fs.readFileSync(path.join(ROOT_DIR, file));
const hashes = (files) => Object.fromEntries(files.map((f) => [f, sha(read(f))]));
const r4 = (x) => +x.toFixed(4);
const ratio = (n, d) => d ? r4(n / d) : null;

export function indexCorpus(verses) {
  const bySura = new Map();
  const index = new Map();
  for (const verse of verses) {
    if (!bySura.has(verse.s)) bySura.set(verse.s, []);
    bySura.get(verse.s).push(verse);
    const key = `${verse.s}:${verse.v}`;
    if (index.has(key)) throw new Error(`duplicate comparison verse: ${key}`);
    index.set(key, verse);
  }
  return { verses, bySura, at: (s, v) => index.get(`${s}:${v}`) };
}

// The batch-13 tokenizer, retaining its removal of one-letter forms.
export function mishnahTokens(text) {
  const flatten = (x) => Array.isArray(x) ? x.flatMap(flatten) : [String(x)];
  return flatten(text).join(' ').replace(/<[^>]*>/g, ' ').replace(/־/g, ' ')
    .replace(/[֑-ׇ]/g, '').split(/[^א-ת]+/).filter((w) => w.length >= 2);
}

function loadComparison(id) {
  let rows;
  if (id === 'gospels') rows = loadGospels().verses.map((v) => ({ unit: `${v.book}:${v.ch}`, v: v.v, tokens: v.lemmas }));
  else if (id === 'samuel_kings_chronicles') rows = loadOshbBooks(HEBREW_BOOKS).verses.map((v) => ({ unit: `${v.book}:${v.ch}`, v: v.v, tokens: v.lemmas }));
  else if (id === 'mishnah') {
    const raw = JSON.parse(read(SOURCES.mishnah[0]));
    if (raw.length !== 63) throw new Error('expected 63 Mishnah tractates');
    rows = raw.flatMap((t) => {
      if (!Array.isArray(t.text) || !t.text.every(Array.isArray) || t.text.length !== t.chapters) throw new Error(`incomplete Mishnah tractate: ${t.title}`);
      let v = 0;
      return t.text.flatMap((chapter) => chapter.map((text) => ({ unit: t.title, v: ++v, tokens: mishnahTokens(text) })));
    });
  } else throw new Error(`unknown comparison text: ${id}`);
  const units = new Map();
  const verses = rows.map((row) => {
    if (!units.has(row.unit)) units.set(row.unit, { s: units.size + 1, name: row.unit, words: 0, verses: 0 });
    const unit = units.get(row.unit);
    unit.words += row.tokens.length;
    unit.verses++;
    return { s: unit.s, v: row.v, words: row.tokens.map((token, i) => ({ s: unit.s, v: row.v, w: i + 1, token, root: null, pos: null, prefixes: [] })) };
  });
  if (!verses.length || ![...units.values()].every((u) => u.words > 0)) throw new Error(`empty comparison input: ${id}`);
  return { corpus: indexCorpus(verses), units: [...units.values()] };
}

// Same length-ranked quartets and seed as the Quran split; independent units.
export function splitUnits(units) {
  const sorted = units.slice().sort((a, b) => b.words - a.words || a.s - b.s);
  const rand = rng(20261117);
  const split = { build: [], test: [], reserve: [] };
  for (let i = 0; i < sorted.length; i += 4) {
    const group = sorted.slice(i, i + 4).map((u) => u.s);
    if (group.length < 4) { split.build.push(...group); continue; }
    for (let k = 3; k > 0; k--) {
      const j = Math.floor(rand() * (k + 1));
      [group[k], group[j]] = [group[j], group[k]];
    }
    split.build.push(group[0], group[1]);
    split.test.push(group[2]);
    split.reserve.push(group[3]);
  }
  for (const part of Object.values(split)) part.sort((a, b) => a - b);
  return split;
}

export function comparisonContext(corpus, occ, known, defining) {
  const allowed = new Set([...defining, occ.s]);
  const hidden = new Set(occ.slots);
  const view = (w) => w.s === occ.s && w.v === occ.v && hidden.has(w.w)
    ? { s: w.s, v: w.v, w: w.w, hidden: true } : { ...w, prefixes: [...w.prefixes] };
  const unit = corpus.bySura.get(occ.s);
  const position = unit.indexOf(corpus.at(occ.s, occ.v));
  const check = (s) => { if (!allowed.has(s)) throw new Error(`context access outside build/current unit: ${s}`); };
  return {
    verse(s = occ.s, v = occ.v) { check(s); return corpus.at(s, v)?.words.map(view) ?? null; },
    window(k) { return unit.slice(Math.max(0, position - k), position + k + 1).map((v) => ({ v: v.v, offset: unit.indexOf(v) - position, words: v.words.map(view) })); },
    sura: () => unit.map((v, i) => ({ v: v.v, offset: i - position, words: v.words.map(view) })),
    meta(s = occ.s) { check(s); return { ayas: corpus.bySura.get(s)?.length }; },
    rootOf: () => null,
    build: known,
  };
}

export const baselinePoint = (row) => row.occ.chosen === OTHER ? 0
  : row.baseline === null ? 1 / row.problem.options.length : Number(row.baseline === row.occ.chosen);

// Sensitivity check: one sign per chapter/tractate, not one per occurrence.
export function unitSignFlip(rows) {
  const groups = new Map();
  for (const r of rows) {
    const gain = Number(r.prediction === r.occ.chosen) - baselinePoint(r);
    groups.set(r.occ.s, (groups.get(r.occ.s) || 0) + gain);
  }
  const diffs = [...groups.values()].filter((d) => Math.abs(d) > 1e-9);
  const total = diffs.reduce((a, b) => a + b, 0);
  const exact = diffs.length <= 16;
  const draws = exact ? 2 ** diffs.length : 20000;
  const rand = rng(17);
  let ge = 0;
  for (let d = 0; d < draws; d++) {
    let value = 0;
    for (let i = 0; i < diffs.length; i++) value += (exact ? (d >> i) & 1 : rand() < 0.5) ? diffs[i] : -diffs[i];
    if (value >= total - 1e-9) ge++;
  }
  return { units: groups.size, nonzeroUnits: diffs.length, pGain: rows.length ? +(exact ? ge / draws : (ge + 1) / (draws + 1)).toPrecision(3) : null, exact };
}

export function summarize(rows) {
  const closed = rows.filter((r) => r.occ.chosen !== OTHER);
  const answered = rows.filter((r) => r.prediction !== null);
  const covered = closed.filter((r) => r.prediction !== null);
  return {
    ...scoreRows(closed),
    eligibleSites: rows.length,
    unseenOptions: rows.length - closed.length,
    baselineAllScored: ratio(closed.reduce((n, r) => n + baselinePoint(r), 0), closed.length),
    baselineAllEligible: ratio(rows.reduce((n, r) => n + baselinePoint(r), 0), rows.length),
    answeredIncludingUnseen: answered.length,
    accuracyIncludingUnseen: ratio(answered.filter((r) => r.prediction === r.occ.chosen).length, answered.length),
    withBaselineFallbackAllEligible: ratio(rows.reduce((n, r) => n + (r.prediction === null ? baselinePoint(r) : Number(r.prediction === r.occ.chosen)), 0), rows.length),
    byUnit: unitSignFlip(covered),
  };
}

export function analyse(corpus, split, part, rules = [echo, contentOnFrames, content]) {
  const active = new Set(part === 'build' ? split.build : [...split.build, ...split.test]);
  const usable = indexCorpus(corpus.verses.filter((v) => active.has(v.s)));
  const lengths = (s) => usable.bySura.get(s).reduce((n, v) => n + v.words.length, 0);
  const order = split.build.slice().sort((a, b) => lengths(b) - lengths(a) || a - b);
  const a = order.filter((_, i) => i % 2 === 0), b = order.filter((_, i) => i % 2 === 1);
  const runs = part === 'build' ? [[a, b], [b, a]] : [[split.build, split.test]];
  const output = Object.fromEntries(rules.map((rule) => [rule.id, []]));
  let problems = 0;
  for (const [defIds, scoreIds] of runs) {
    const defining = new Set(defIds), scoring = new Set(scoreIds);
    const list = makeProblems(usable, defining, []).filter((p) => p.type === 'frame');
    problems += list.length;
    for (const problem of list) {
      const known = problem.occurrences.filter((o) => defining.has(o.s));
      const baseline = majority(known);
      const shown = { id: problem.id, type: problem.type, options: problem.options, optionInfo: problem.optionInfo };
      for (const rule of rules) {
        if (!rule.appliesTo.includes(problem.type)) continue;
        for (const occ of problem.occurrences) {
          if (!scoring.has(occ.s)) continue;
          const input = { s: occ.s, v: occ.v, slots: [...occ.slots] };
          const prediction = rule.predict(input, shown, comparisonContext(usable, occ, known, defining)) ?? null;
          if (prediction !== null && !problem.options.includes(prediction)) throw new Error(`invalid answer from ${rule.id}`);
          output[rule.id].push({ problem, occ, prediction, baseline });
        }
      }
    }
  }
  return { problems, rules: Object.fromEntries(Object.entries(output).map(([id, rows]) => [id, summarize(rows)])) };
}

function requirePublished() {
  const git = (args) => execFileSync('git', args, { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
  const commit = git(['rev-parse', 'HEAD']);
  git(['merge-base', '--is-ancestor', commit, 'origin/main']);
  for (const file of DEPENDENCIES) {
    const committed = execFileSync('git', ['show', `${commit}:${file}`], { cwd: ROOT_DIR });
    if (sha(committed) !== sha(read(file))) throw new Error(`commit and push before testing: ${file}`);
  }
  return commit;
}

function main(mode) {
  if (!['--prepare', '--build', '--test'].includes(mode)) throw new Error('usage: node project/tools/comparison.mjs --prepare | --build | --test');
  if (CENSUS_VERSION !== 2) throw new Error('The first comparison belongs to census 2. Reproduce it from its recorded commit, or use comparison-v2.mjs. Its saved files must not be overwritten.');
  fs.mkdirSync(DIR, { recursive: true });
  const resultFile = path.join(DIR, 'test.json');
  if (mode === '--test' && fs.existsSync(resultFile)) throw new Error('comparison test already recorded; do not retest');
  if (mode === '--prepare' && fs.existsSync(path.join(ROOT_DIR, SPLIT))) throw new Error('comparison split already exists; do not regenerate');
  const commit = mode === '--test' ? requirePublished() : null;
  const manifest = mode === '--prepare' ? { seed: 20261117, datasets: {} } : JSON.parse(read(SPLIT));
  const results = {};
  for (const id of Object.keys(SOURCES)) {
    const sourceHashes = hashes(SOURCES[id]);
    if (mode !== '--prepare' && JSON.stringify(sourceHashes) !== JSON.stringify(manifest.datasets[id].sourceHashes)) throw new Error(`comparison source changed: ${id}`);
    const { corpus, units } = loadComparison(id);
    if (mode === '--prepare') manifest.datasets[id] = { sourceHashes, units, ...splitUnits(units) };
    else results[id] = analyse(corpus, manifest.datasets[id], mode === '--test' ? 'test' : 'build');
  }
  if (mode === '--prepare') {
    fs.writeFileSync(path.join(ROOT_DIR, SPLIT), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
    console.log('Comparison split and source hashes saved; no problems built or scores examined.');
  } else {
    const out = { date: new Date().toISOString().slice(0, 10), censusVersion: CENSUS_VERSION, commit, dependencyHashes: hashes(DEPENDENCIES), datasets: results };
    fs.writeFileSync(mode === '--test' ? resultFile : path.join(DIR, 'build.json'), JSON.stringify(out, null, 2) + '\n', { flag: mode === '--test' ? 'wx' : 'w' });
    for (const [id, result] of Object.entries(results)) {
      console.log(id, 'frame problems:', result.problems);
      console.table(Object.entries(result.rules).map(([rule, s]) => ({ rule, scored: s.occurrences, unseen: s.unseenOptions, answered: s.answered, accuracy: s.accuracy, baselineSameSites: s.baselineAccuracy, pGain: s.pGain, pGainByUnit: s.byUnit.pGain })));
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main(process.argv[2]);
