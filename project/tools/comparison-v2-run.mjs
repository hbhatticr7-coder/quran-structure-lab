import fs from 'node:fs';
import path from 'node:path';
import { loadComparisonPart } from './comparison-corpus.mjs';
import { makeProblems, CENSUS_VERSION } from './problems.mjs';
import { majority, scoreRows } from './lib.mjs';
import { comparisonContext, unitSignFlip } from './comparison.mjs';
import echo from '../rules/R001_echo.mjs';
import content from '../rules/R002_content.mjs';

export const COMPARISON_RULES = [
  { ...echo, id: 'C001_echo', appliesTo: ['frame'] },
  { ...content, id: 'C002_frame', appliesTo: ['frame'] },
  content,
];
const DATA = [
  'project/PHRASE_COMPARISON_V2_PROTOCOL.md', 'project/comparison/split.json',
  'project/comparison/synonyms-v2.json', 'project/comparison/synonym-candidates.json',
  'project/split.json', 'data/quran-morphology.txt', 'data/chronology.json',
];
export function summarizeV2(rows) {
  const known = rows.filter((r) => !r.unseen), covered = known.filter((r) => r.prediction !== null);
  return { ...scoreRows(rows), eligibleSites: rows.length, byUnit: unitSignFlip(covered) };
}
export function analyseV2(corpus, split, part, sets, rules = COMPARISON_RULES) {
  if (!['build', 'test'].includes(part)) throw new Error('invalid comparison part');
  const allowed = new Set(part === 'build' ? split.build : [...split.build, ...split.test]);
  if (corpus.verses.some((v) => !allowed.has(v.s))) throw new Error('excluded unit reached comparison analysis');
  const order = split.build.slice().sort((a, b) => corpus.bySura.get(b).reduce((n, v) => n + v.words.length, 0) - corpus.bySura.get(a).reduce((n, v) => n + v.words.length, 0) || a - b);
  const a = order.filter((_, i) => i % 2 === 0), b = order.filter((_, i) => i % 2 === 1);
  const runs = part === 'build' ? [[a, b], [b, a]] : [[split.build, split.test]];
  const output = Object.fromEntries(rules.map((rule) => [rule.id, []]));
  const definitions = { frame: 0, aligned: 0, synonym: 0 };
  for (const [defIds, scoredIds] of runs) {
    const defining = new Set(defIds), scoring = new Set(scoredIds);
    const problems = makeProblems(corpus, defining, sets).filter((p) => ['frame', 'synonym'].includes(p.type));
    for (const problem of problems) {
      definitions[problem.type]++;
      definitions.aligned += Number(problem.definition?.kind === 'aligned');
      const known = problem.occurrences.filter((o) => defining.has(o.s));
      const baseline = majority(known);
      const shown = { id: problem.id, type: problem.type, options: problem.options, optionInfo: problem.optionInfo };
      for (const occ of problem.occurrences.filter((o) => scoring.has(o.s))) {
        const unseen = occ.chosen === '(other)';
        for (const rule of rules.filter((r) => r.appliesTo.includes(problem.type))) {
          const ctx = comparisonContext(corpus, occ, known, defining);
          let prediction = unseen ? null : rule.predict({ s: occ.s, v: occ.v, slots: [...occ.slots] }, shown, ctx) ?? null;
          if (prediction !== null && !problem.options.includes(prediction)) throw new Error(`invalid comparison prediction from ${rule.id}`);
          output[rule.id].push({ problem, occ, baseline, plainBaseline: baseline, prediction, unseen });
        }
      }
    }
  }
  const perSet = {};
  for (const row of output.R002 || []) {
    if (!perSet[row.problem.id]) perSet[row.problem.id] = [];
    perSet[row.problem.id].push(row);
  }
  return { definitions, rules: Object.fromEntries(Object.entries(output).map(([id, rows]) => [id, summarizeV2(rows)])),
    synonymSets: Object.fromEntries(Object.entries(perSet).map(([id, rows]) => [id, summarizeV2(rows)])) };
}

export async function run(freeze, { root, mode, resultFile }) {
  freeze.add(DATA);
  const commit = mode === '--test' ? freeze.published() : null;
  const catalogue = JSON.parse(fs.readFileSync(path.join(root, 'project/comparison/synonyms-v2.json'), 'utf8'));
  const results = {};
  for (const id of ['quran', 'gospels', 'samuel_kings_chronicles', 'mishnah']) {
    results[id] = {};
    for (const representation of ['surface', 'lexical']) {
      const data = loadComparisonPart(id, mode === '--test' ? 'test' : 'build', representation);
      // A common surface phrase comparison; a separate lexical/synonym arm.
      // Mishnah has only surface forms in both arms, so its lexical arm is
      // only the declared dictionary contrast, without repeating frame scores.
      const sets = representation === 'lexical' ? catalogue.datasets[id].filter((s) => s.eligible) : [];
      const rules = representation === 'surface' ? COMPARISON_RULES.slice(0, 2)
        : id === 'mishnah' ? [content] : COMPARISON_RULES;
      results[id][representation] = {
        annotation: representation === 'surface' ? 'all unpointed written words; no roots or grammar' : data.annotation,
        buildUnits: data.split.build.length, scoredUnits: mode === '--test' ? data.split.test.length : data.split.build.length,
        sourceHashes: data.sourceHashes,
        ...analyseV2(data.corpus, data.split, mode === '--test' ? 'test' : 'build', sets, rules),
      };
      console.log(`${id}/${representation}: completed ${mode.slice(2)}`);
    }
  }
  freeze.verify();
  const out = { date: new Date().toISOString().slice(0, 10), experiment: 'comparison-v2', censusVersion: CENSUS_VERSION,
    node: process.version, commit, inputs: freeze.inputs(), datasets: results };
  fs.mkdirSync(path.dirname(resultFile), { recursive: true });
  fs.writeFileSync(resultFile, JSON.stringify(out, null, 2) + '\n', { flag: mode === '--test' ? 'wx' : 'w' });
}
