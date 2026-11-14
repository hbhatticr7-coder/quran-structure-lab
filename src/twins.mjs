// Near-twin verses: pairs of verses whose content-root sequences are almost
// identical, and the single-word substitution sites between them.

// Longest common subsequence alignment. Returns matched index pairs [[i, j], ...].
export function lcsAlign(a, b) {
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  const matches = [];
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      matches.push([i - 1, j - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
    else j--;
  }
  return matches.reverse();
}

// Interior one-for-one substitutions: between two consecutive matches, each
// verse has exactly one unmatched root.
export function substitutionSites(a, b, matches) {
  const sites = [];
  for (let k = 0; k + 1 < matches.length; k++) {
    const [i0, j0] = matches[k];
    const [i1, j1] = matches[k + 1];
    if (i1 - i0 === 2 && j1 - j0 === 2) sites.push({ i: i0 + 1, j: j0 + 1, a: a[i0 + 1], b: b[j0 + 1] });
  }
  return sites;
}

// All near-twin pairs (any suras) at the loosest ratio we will use.
// Candidates are verse pairs sharing at least one bigram of consecutive roots.
export function findNearTwins(verses, { minLcs = 5, minRatio = 0.5 } = {}) {
  const byBigram = new Map();
  for (const v of verses) {
    if (v.roots.length < minLcs) continue;
    const seen = new Set();
    for (let i = 0; i + 1 < v.roots.length; i++) {
      const g = v.roots[i] + ' ' + v.roots[i + 1];
      if (seen.has(g)) continue;
      seen.add(g);
      if (!byBigram.has(g)) byBigram.set(g, []);
      byBigram.get(g).push(v.idx);
    }
  }
  const done = new Set();
  const out = [];
  for (const list of byBigram.values()) {
    for (let x = 0; x < list.length; x++)
      for (let y = x + 1; y < list.length; y++) {
        const key = list[x] * 10000 + list[y];
        if (done.has(key)) continue;
        done.add(key);
        const A = verses[list[x]];
        const B = verses[list[y]];
        const longer = Math.max(A.roots.length, B.roots.length);
        const shorter = Math.min(A.roots.length, B.roots.length);
        if (shorter < minLcs || shorter / longer < minRatio) continue;
        const matches = lcsAlign(A.roots, B.roots);
        const ratio = matches.length / longer;
        if (matches.length < minLcs || ratio < minRatio) continue;
        out.push({ a: A.idx, b: B.idx, lcs: matches.length, ratio, sameSura: A.s === B.s, sites: substitutionSites(A.roots, B.roots, matches) });
      }
  }
  return out;
}

// One pair per verse, most similar first. Different suras, at least one site.
export function selectPairs(twins, minRatio) {
  const eligible = twins
    .filter((t) => !t.sameSura && t.ratio >= minRatio && t.sites.length > 0)
    .sort((p, q) => q.ratio - p.ratio || q.lcs - p.lcs || p.a - q.a || p.b - q.b);
  const used = new Set();
  const picked = [];
  for (const t of eligible) {
    if (used.has(t.a) || used.has(t.b)) continue;
    used.add(t.a);
    used.add(t.b);
    picked.push(t);
  }
  return picked;
}
