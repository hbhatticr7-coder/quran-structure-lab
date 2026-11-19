// Compile explicit option tokens using BUILD units only. Output is frozen
// with the version-2 protocol before any test run.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT_DIR } from '../../src/corpus.mjs';
import { loadComparisonPart } from './comparison-corpus.mjs';

export function compileCandidates(corpus, candidates) {
  const count = new Map();
  for (const verse of corpus.verses) for (const word of verse.words) count.set(word.token, (count.get(word.token) || 0) + 1);
  return candidates.map((candidate) => {
    const options = candidate.options.map((option) => {
      const matches = (token) => option.lemmas?.some((lemma) => lemma.normalize('NFC') === token)
        || option.lemmaIds?.includes(token.split(' ')[0])
        || option.surfaceStems?.some((stem) => token.endsWith(stem) && /^[ובכלמשה]{0,2}$/.test(token.slice(0, token.length - stem.length)));
      const lemmas = [...count.keys()].filter(matches).sort();
      return { label: option.label, lemmas, buildCount: lemmas.reduce((n, token) => n + count.get(token), 0) };
    });
    const tokens = options.flatMap((o) => o.lemmas);
    if (new Set(tokens).size !== tokens.length) throw new Error(`overlapping options in ${candidate.id}`);
    return { id: candidate.id, gloss: candidate.gloss, sources: candidate.sources, entries: candidate.entries,
      minBuild: 5, eligible: options.every((o) => o.buildCount >= 5), options };
  });
}

export function compileComparisonSets() {
  const candidates = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'project/comparison/synonym-candidates.json'), 'utf8'));
  const quran = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'project/synonyms.json'), 'utf8')).sets;
  const datasets = {};
  for (const id of ['quran', 'gospels', 'samuel_kings_chronicles', 'mishnah']) {
    const { corpus, split } = loadComparisonPart(id, 'build', 'lexical');
    if (corpus.verses.some((v) => !split.build.includes(v.s))) throw new Error('compile only from build units');
    datasets[id] = compileCandidates(corpus, id === 'quran' ? quran.map((s) => ({ ...s, sources: ['project/synonyms.json'], entries: [s.id] })) : candidates[id]);
  }
  return { version: 2, scope: 'Explicit tokens compiled from build units only. No sense disambiguation. Five examples per option in the defining units.', datasets };
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) console.log(JSON.stringify(compileComparisonSets(), null, 2));
