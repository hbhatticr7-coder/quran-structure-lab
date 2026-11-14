// MRQAP with double semi-partialling (Dekker, Krackhardt & Snijders 2007)
// for undirected pair data on N nodes (nodes numbered 1..N).
import { rng, shuffle } from './stats.mjs';

export function makePairs(N) {
  const pairs = [];
  const id = Array.from({ length: N + 1 }, () => new Int32Array(N + 1).fill(-1));
  for (let i = 1; i <= N; i++)
    for (let j = i + 1; j <= N; j++) {
      id[i][j] = id[j][i] = pairs.length;
      pairs.push([i, j]);
    }
  return { pairs, id, n: pairs.length };
}

// One indicator column per node: 1 where the pair contains that node.
export function nodeFixedEffects(P, N) {
  const cols = [];
  for (let s = 1; s <= N; s++) {
    const c = new Float64Array(P.n);
    P.pairs.forEach(([i, j], k) => {
      if (i === s || j === s) c[k] = 1;
    });
    cols.push(c);
  }
  return cols;
}

const dot = (a, b) => {
  let t = 0;
  for (let k = 0; k < a.length; k++) t += a[k] * b[k];
  return t;
};

// Orthonormal basis of the column space (modified Gram-Schmidt, twice for stability).
export function basis(cols) {
  const Q = [];
  for (const c of cols) {
    const v = Float64Array.from(c);
    const norm0 = Math.sqrt(dot(v, v));
    for (let pass = 0; pass < 2; pass++)
      for (const q of Q) {
        const d = dot(q, v);
        for (let k = 0; k < v.length; k++) v[k] -= d * q[k];
      }
    const norm = Math.sqrt(dot(v, v));
    if (norm > 1e-9 * Math.max(1, norm0)) {
      for (let k = 0; k < v.length; k++) v[k] /= norm;
      Q.push(v);
    }
  }
  return Q;
}

export function residualize(x, Q) {
  const r = Float64Array.from(x);
  for (const q of Q) {
    const d = dot(q, r);
    for (let k = 0; k < r.length; k++) r[k] -= d * q[k];
  }
  return r;
}

// Tests the coefficient of x in  y ~ x + Z.  Returns beta, t and a one-sided
// (upper) permutation p-value.
export function dsp({ y, x, Z, P, N, perms, seed }) {
  const Q = basis(Z);
  const yr = residualize(y, Q);
  const xr = residualize(x, Q);
  const df = P.n - Q.length - 1;
  const tStat = (xv) => {
    const sxx = dot(xv, xv);
    const beta = dot(xv, yr) / sxx;
    const rss = dot(yr, yr) - beta * beta * sxx;
    return { beta, t: beta / Math.sqrt(rss / df / sxx) };
  };
  const obs = tStat(xr);
  const rand = rng(seed);
  const perm = Array.from({ length: N }, (_, k) => k + 1);
  const xp = new Float64Array(P.n);
  // The permuted residual xp must be residualised on Z again. Because yr is
  // orthogonal to Z, (xp - QQ'xp).yr = xp.yr, and |xp - QQ'xp|^2 = |xp|^2 - |Q'xp|^2,
  // where |xp|^2 = |xr|^2 for every relabelling. So only Q'xp is needed.
  const sxxAll = dot(xr, xr);
  const syy = dot(yr, yr);
  let ge = 0;
  for (let b = 0; b < perms; b++) {
    shuffle(perm, rand);
    for (let k = 0; k < P.n; k++) {
      const [i, j] = P.pairs[k];
      xp[k] = xr[P.id[perm[i - 1]][perm[j - 1]]];
    }
    let proj2 = 0;
    for (const q of Q) {
      const d = dot(q, xp);
      proj2 += d * d;
    }
    const sxx = sxxAll - proj2;
    const beta = dot(xp, yr) / sxx;
    const t = beta / Math.sqrt((syy - beta * beta * sxx) / df / sxx);
    if (t >= obs.t - 1e-12) ge++;
  }
  return { beta: obs.beta, t: obs.t, p: (ge + 1) / (perms + 1), rank: Q.length };
}
