// Small least-squares helpers for sura-level regressions (n ~ 100, a handful of predictors).
import { rng, shuffle } from './stats.mjs';

function invert(A) {
  const n = A.length;
  const M = A.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    const d = M[c][c];
    for (let j = 0; j < 2 * n; j++) M[c][j] /= d;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c];
      if (f) for (let j = 0; j < 2 * n; j++) M[r][j] -= f * M[c][j];
    }
  }
  return M.map((row) => row.slice(n));
}

// X: n rows of p predictors (already weighted). Returns a function y -> { beta, t, fitted }
// where t is the t-statistic of the LAST predictor.
export function fitter(X) {
  const n = X.length;
  const p = X[0].length;
  const XtX = Array.from({ length: p }, (_, a) => Array.from({ length: p }, (_, b) => X.reduce((t, row) => t + row[a] * row[b], 0)));
  const inv = invert(XtX);
  // A = inv * X'  (p x n)
  const A = Array.from({ length: p }, (_, a) => Float64Array.from({ length: n }, (_, i) => inv[a].reduce((t, v, b) => t + v * X[i][b], 0)));
  const vLast = inv[p - 1][p - 1];
  return (y) => {
    const beta = A.map((row) => {
      let t = 0;
      for (let i = 0; i < n; i++) t += row[i] * y[i];
      return t;
    });
    let rss = 0;
    const fitted = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      let f = 0;
      for (let a = 0; a < p; a++) f += X[i][a] * beta[a];
      fitted[i] = f;
      rss += (y[i] - f) ** 2;
    }
    return { beta, fitted, t: beta[p - 1] / Math.sqrt((rss / (n - p)) * vLast) };
  };
}

// Freedman-Lane permutation test for the last predictor of X.
export function freedmanLane(X, y, { draws = 20000, seed = 1, twoSided = false } = {}) {
  const full = fitter(X);
  const red = fitter(X.map((row) => row.slice(0, -1)));
  const obs = full(y);
  // The reduced fitter's "t" is meaningless here; only its fitted values are used.
  const fr = red(y).fitted;
  const resid = Array.from(y, (v, i) => v - fr[i]);
  const rand = rng(seed);
  const e = resid.slice();
  const ystar = new Float64Array(y.length);
  let ge = 0;
  for (let d = 0; d < draws; d++) {
    shuffle(e, rand);
    for (let i = 0; i < y.length; i++) ystar[i] = fr[i] + e[i];
    const t = full(ystar).t;
    if (twoSided ? Math.abs(t) >= Math.abs(obs.t) - 1e-12 : t >= obs.t - 1e-12) ge++;
  }
  return { beta: obs.beta[obs.beta.length - 1], t: obs.t, p: (ge + 1) / (draws + 1) };
}
