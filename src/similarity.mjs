// M2: distinctive shared vocabulary. tf-idf weighted cosine over lemmas.

// idfDocs: array of lemma arrays that define document frequency.
export function idfTable(idfDocs) {
  const df = new Map();
  for (const doc of idfDocs) for (const l of new Set(doc)) df.set(l, (df.get(l) || 0) + 1);
  const n = idfDocs.length;
  const idf = new Map();
  for (const [l, d] of df) idf.set(l, Math.log(n / d));
  return idf;
}

// unit: lemma array -> Map(lemma -> weight)
export function vector(unit, idf) {
  const tf = new Map();
  for (const l of unit) tf.set(l, (tf.get(l) || 0) + 1);
  const vec = new Map();
  for (const [l, c] of tf) {
    const w = Math.log(1 + c) * (idf.get(l) || 0);
    if (w > 0) vec.set(l, w);
  }
  return vec;
}

export function cosine(a, b) {
  let dot = 0;
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  for (const [l, w] of small) {
    const x = large.get(l);
    if (x) dot += w * x;
  }
  let na = 0;
  let nb = 0;
  for (const w of a.values()) na += w * w;
  for (const w of b.values()) nb += w * w;
  if (na === 0 || nb === 0) return 0;
  return dot / Math.sqrt(na * nb);
}

export const lemmasOf = (verses) => verses.flatMap((v) => v.lemmas);
