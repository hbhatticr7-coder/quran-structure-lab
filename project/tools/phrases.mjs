// Phrase choices defined exclusively on the defining units. The selected
// option never participates in matching its own occurrence to a problem.
import { lcsAlign } from '../../src/twins.mjs';

export const PHRASE_POLICY = Object.freeze({ radius: 2, context: 'form', aligned: true, minShared: 4, minRatio: 0.7, maxBigramUnits: 400 });
const edgeLeft = '^', edgeRight = '$';
const location = (o) => `${o.s}:${o.v}:${o.slots[0]}`;
const contextWord = (w, mode) => mode === 'lemma' ? w.token : (w.form ?? w.token).normalize('NFC');
const unique = (items) => [...new Set(items)];
const row = (v, i) => ({ s: v.s, v: v.v, slots: [v.words[i].w], word: v.words[i].token });
const anchorKey = (a, i) => i > 0 && i + 1 < a.length ? JSON.stringify([a[i - 1], a[i + 1]]) : null;
const without = (a, i) => [...a.slice(0, i), ...a.slice(i + 1)];

function lcsLength(a, b) {
  let previous = new Uint32Array(b.length + 1), next = new Uint32Array(b.length + 1);
  for (const token of a) {
    for (let j = 1; j <= b.length; j++) next[j] = token === b[j - 1] ? previous[j - 1] + 1 : Math.max(previous[j], next[j - 1]);
    [previous, next] = [next, previous]; next.fill(0);
  }
  return previous[b.length];
}

// Build pairs supply frozen masked prototypes. A one-for-one substitution
// between two LCS matches supplies the hole; other additions/deletions are
// allowed elsewhere in the verse. No held-out verse supplies a prototype.
function alignedDefinitions(verses, atoms, policy) {
  const byBigram = new Map();
  atoms.forEach((a, index) => {
    const keys = new Set(a.slice(1).map((token, i) => JSON.stringify([a[i], token])));
    for (const key of keys) {
      if (!byBigram.has(key)) byBigram.set(key, []);
      byBigram.get(key).push(index);
    }
  });
  const seen = new Set(), definitions = new Map();
  for (const indices of byBigram.values()) {
    if (indices.length > policy.maxBigramUnits) continue;
    for (let x = 0; x < indices.length; x++) for (let y = x + 1; y < indices.length; y++) {
      const ai = indices[x], bi = indices[y], pair = `${ai}:${bi}`;
      if (seen.has(pair)) continue;
      seen.add(pair);
      const a = atoms[ai], b = atoms[bi], longer = Math.max(a.length, b.length);
      if (Math.min(a.length, b.length) < policy.minShared || Math.min(a.length, b.length) / longer < policy.minRatio) continue;
      const matches = lcsAlign(a, b);
      if (matches.length < policy.minShared || matches.length / longer < policy.minRatio) continue;
      for (let k = 0; k + 1 < matches.length; k++) {
        const [al, bl] = matches[k], [ar, br] = matches[k + 1];
        if (ar - al !== 2 || br - bl !== 2) continue;
        const ap = al + 1, bp = bl + 1;
        if (verses[ai].words[ap].token === verses[bi].words[bp].token) continue;
        const key = anchorKey(a, ap);
        if (!definitions.has(key)) definitions.set(key, new Map());
        for (const masked of [without(a, ap), without(b, bp)]) definitions.get(key).set(JSON.stringify(masked), masked);
      }
    }
  }
  return definitions;
}

export function makePhraseProblems(corpus, defining, info, other, settings = {}) {
  const policy = { ...PHRASE_POLICY, ...settings };
  if (![2, 3].includes(policy.radius) || !['form', 'lemma'].includes(policy.context)) throw new Error('unsupported phrase policy');
  const verses = corpus.verses.slice().sort((a, b) => a.s - b.s || a.v - b.v);
  const atoms = verses.map((v) => v.words.map((w) => contextWord(w, policy.context)));
  const entries = [], localBuild = new Map();
  verses.forEach((v, vi) => {
    const a = atoms[vi], pad = policy.radius;
    for (let i = 0; i < a.length; i++) {
      const left = Array.from({ length: pad }, (_, j) => a[i - pad + j] ?? edgeLeft);
      const right = Array.from({ length: pad }, (_, j) => a[i + 1 + j] ?? edgeRight);
      if ([...left, ...right].filter((t) => t !== edgeLeft && t !== edgeRight).length < pad) continue;
      const key = JSON.stringify([left, right]);
      const entry = { ...row(v, i), key, vi, index: i };
      entries.push(entry);
      if (defining.has(v.s)) {
        if (!localBuild.has(key)) localBuild.set(key, []);
        localBuild.get(key).push(entry);
      }
    }
  });
  const make = (id, options, occurrences, definition) => ({
    id, type: 'frame', options, optionInfo: info(options), definition,
    occurrences: occurrences.map((o) => ({ s: o.s, v: o.v, slots: o.slots, chosen: options.includes(o.word) ? o.word : other })),
  });
  const localOptions = new Map([...localBuild].map(([key, occurrences]) => [key, unique(occurrences.map((o) => o.word))]).filter(([, opts]) => opts.length >= 2));
  const localOccurrences = new Map([...localOptions.keys()].map((key) => [key, []]));
  const used = new Set();
  for (const o of entries) if (localOptions.has(o.key)) {
    localOccurrences.get(o.key).push(o); used.add(location(o));
  }
  const problems = [...localOptions].map(([key, options]) => make(
    `frame:local${policy.radius}:${policy.context}:${key}`, options, localOccurrences.get(key),
    { kind: 'local', radius: policy.radius, context: policy.context },
  ));
  if (!policy.aligned) return problems;

  const buildIndices = verses.map((v, i) => defining.has(v.s) ? i : -1).filter((i) => i >= 0);
  const prototypes = alignedDefinitions(buildIndices.map((i) => verses[i]), buildIndices.map((i) => atoms[i]), policy);
  const matched = new Map([...prototypes.keys()].map((key) => [key, []]));
  for (const o of entries) {
    // Ownership is decided from the context, never from whether its answer
    // is known. In particular an unseen local choice cannot switch problems.
    if (used.has(location(o))) continue;
    const a = atoms[o.vi], key = anchorKey(a, o.index);
    const references = prototypes.get(key);
    if (!references) continue;
    const masked = without(a, o.index);
    const matches = [...references.values()].some((reference) => {
      const longer = Math.max(masked.length, reference.length);
      if (Math.min(masked.length, reference.length) / longer < policy.minRatio) return false;
      const common = lcsLength(masked, reference);
      return common >= policy.minShared && common / longer >= policy.minRatio;
    });
    if (matches) matched.get(key).push(o);
  }
  for (const [key, occurrences] of matched) {
    const options = unique(occurrences.filter((o) => defining.has(o.s)).map((o) => o.word));
    if (options.length < 2) continue;
    problems.push(make(`frame:aligned:${policy.context}:${key}`, options, occurrences, {
      kind: 'aligned', context: policy.context, minShared: policy.minShared, minRatio: policy.minRatio,
      prototypes: prototypes.get(key).size,
    }));
  }
  return problems;
}
