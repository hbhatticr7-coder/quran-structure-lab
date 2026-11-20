// Build suras only. How much INFORMATION do the surrounding words give about which
// near-synonym is used, beyond how common each is in that grammatical form?
// Measured in bits per place (log loss), not in "right or wrong against the commonest".
// Train on one half of the build suras, score on the other, both ways.
// Exploration only: it reads the build suras and nothing else, and scores no rule.
// Usage: node project/tools/choice-information.mjs
import * as lib from './lib.mjs';
const { corpus } = lib.loadText('build');
const { sets } = lib.loadSplit();
const OTHER = lib.OTHER;
const wordAt = (o) => corpus.at(o.s, o.v).words.find((w) => w.w === o.slots[0]);
const feats = (o, win) => {
  const out = new Set();
  for (let dv = -win; dv <= win; dv++) {
    const v = corpus.at(o.s, o.v + dv);
    if (!v) continue;
    for (const w of v.words) { if (dv === 0 && o.slots.includes(w.w)) continue; out.add(w.root || w.token); }
  }
  return out;
};
const log2 = (x) => Math.log(x) / Math.LN2;

function run({ win = 0, alpha = 0.3, shuffle = null }) {
  const rows = []; // { set, s, prior, model, chosen }
  for (const [train, test] of [['foldA', 'foldB'], ['foldB', 'foldA']]) {
    for (const p of lib.problemsDefinedOn(train, 'build')) {
      if (p.type !== 'synonym') continue;
      let known = p.occurrences.filter((o) => sets[train].has(o.s) && o.chosen !== OTHER);
      let held = p.occurrences.filter((o) => sets[test].has(o.s) && o.chosen !== OTHER);
      if (shuffle) held = shuffle(held, p);
      const K = p.options.length;
      const count = (list) => { const c = Object.fromEntries(p.options.map((o) => [o, 0])); for (const o of list) c[o.chosen]++; return c; };
      const all = count(known);
      const byForm = new Map();
      for (const o of known) { const f = lib.formClass(wordAt(o)); if (!byForm.has(f)) byForm.set(f, []); byForm.get(f).push(o); }
      // prior: counts in the same form, shrunk toward the overall share
      const prior = (o) => {
        const f = count(byForm.get(lib.formClass(wordAt(o))) || []);
        const nf = Object.values(f).reduce((a, b) => a + b, 0);
        const out = {};
        for (const opt of p.options) { const overall = (all[opt] + 0.5) / (known.length + 0.5 * K); out[opt] = (f[opt] + 2 * overall) / (nf + 2); }
        return out;
      };
      // company: for each option, in how many of its places each feature is present
      const df = Object.fromEntries(p.options.map((o) => [o, new Map()]));
      for (const o of known) for (const f of feats(o, win)) df[o.chosen].set(f, (df[o.chosen].get(f) || 0) + 1);
      for (const o of held) {
        const pr = prior(o);
        const score = Object.fromEntries(p.options.map((opt) => [opt, Math.log(pr[opt])]));
        for (const f of feats(o, win)) {
          const tot = p.options.reduce((a, opt) => a + (df[opt].get(f) || 0), 0);
          if (tot < 2) continue;
          for (const opt of p.options) score[opt] += alpha * Math.log(((df[opt].get(f) || 0) + 0.5) / (all[opt] + 1));
        }
        const m = Math.max(...Object.values(score));
        const z = Object.values(score).reduce((a, x) => a + Math.exp(x - m), 0);
        const model = Object.fromEntries(p.options.map((opt) => [opt, Math.exp(score[opt] - m) / z]));
        rows.push({ set: p.id, s: o.s, prior: pr[o.truth || o.chosen], model: model[o.truth || o.chosen], pr, model_: model, chosen: o.truth || o.chosen });
      }
    }
  }
  return rows;
}
const bits = (rows) => ({ n: rows.length, prior: -rows.reduce((a, r) => a + log2(r.prior), 0) / rows.length, model: -rows.reduce((a, r) => a + log2(r.model), 0) / rows.length });
const acc = (rows, key) => rows.filter((r) => { const d = r[key]; const best = Object.keys(d).sort((a, b) => d[b] - d[a])[0]; return best === r.chosen; }).length;

console.log('tempering\twindow\tplaces\tbits before\tbits after\tgain (bits/place)\tshare of uncertainty removed\tright: prior / model');
for (const win of [0, 1]) for (const alpha of [0.1, 0.2, 0.3, 0.5, 1]) {
  const rows = run({ win, alpha }); const b = bits(rows);
  console.log(`${alpha}\t${win}\t${b.n}\t${b.prior.toFixed(3)}\t${b.model.toFixed(3)}\t${(b.prior - b.model).toFixed(3)}\t${(100 * (b.prior - b.model) / b.prior).toFixed(1)}%\t${acc(rows, 'pr')} / ${acc(rows, 'model_')}`);
}
// per set, and a sign count over suras, at one middling setting
const rows = run({ win: 0, alpha: 0.3 });
console.log('\nby set (window 0, tempering 0.3):');
for (const id of [...new Set(rows.map((r) => r.set))]) { const b = bits(rows.filter((r) => r.set === id)); console.log(`  ${id}\t${b.n} places\t${b.prior.toFixed(3)} -> ${b.model.toFixed(3)}\tgain ${(b.prior - b.model).toFixed(3)}`); }
const bySura = new Map();
for (const r of rows) bySura.set(r.s, (bySura.get(r.s) || 0) + log2(r.model) - log2(r.prior));
const gains = [...bySura.values()];
console.log(`suras where the surrounding words helped: ${gains.filter((g) => g > 0).length}; hurt: ${gains.filter((g) => g < 0).length}`);
// sign-flip test over suras
let seed = 99; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const obs = gains.reduce((a, b) => a + b, 0); let ge = 0; const N = 20000;
for (let i = 0; i < N; i++) { let t = 0; for (const g of gains) t += rnd() < 0.5 ? g : -g; if (t >= obs) ge++; }
console.log(`total gain ${obs.toFixed(1)} bits over ${rows.length} places; sign-flip over suras p = ${((ge + 1) / (N + 1)).toFixed(5)}`);
