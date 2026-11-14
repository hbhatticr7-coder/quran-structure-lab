// Exclusive shared formulas ("bridges"): an n-gram of consecutive content
// roots inside one verse that occurs in exactly two verses of the whole
// Quran, and those two verses are in different suras.

export function buildNgramIndex(verses, n) {
  const index = new Map(); // gram -> Set(verse idx)
  for (const vs of verses) {
    const r = vs.roots;
    for (let i = 0; i + n <= r.length; i++) {
      const g = r.slice(i, i + n).join(' ');
      let set = index.get(g);
      if (!set) index.set(g, (set = new Set()));
      set.add(vs.idx);
    }
  }
  return index;
}

// Returns [{gram, a, b}] with a, b verse objects in different suras.
export function findBridges(verses, n) {
  const index = buildNgramIndex(verses, n);
  const out = [];
  for (const [gram, set] of index) {
    if (set.size !== 2) continue;
    const [i, j] = [...set];
    const a = verses[i];
    const b = verses[j];
    if (a.s === b.s) continue;
    out.push({ gram, a, b });
  }
  return out;
}

const pairKey = (x, y) => (x < y ? `${x}-${y}` : `${y}-${x}`);

// Sura-pair weights. `grams` counts bridging n-grams (overlapping n-grams
// from one long shared passage each count); `versePairs` counts distinct
// bridged verse pairs, which does not inflate with passage length.
export function suraPairWeights(bridges) {
  const grams = new Map();
  const vpSets = new Map();
  for (const { a, b } of bridges) {
    const k = pairKey(a.s, b.s);
    grams.set(k, (grams.get(k) || 0) + 1);
    if (!vpSets.has(k)) vpSets.set(k, new Set());
    vpSets.get(k).add(a.idx < b.idx ? `${a.idx}|${b.idx}` : `${b.idx}|${a.idx}`);
  }
  const versePairs = new Map([...vpSets].map(([k, s]) => [k, s.size]));
  return { grams, versePairs };
}

export { pairKey };
