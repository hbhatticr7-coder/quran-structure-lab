// Task 29. Build suras only. An inventory of one declared group of dictionary forms:
// zanna with its noun and participle, first-form hasiba, and za'ama.
// Retrieval and counting are mechanical. The English glosses are provisional labels,
// not findings: what a given use expresses is for the annotation. No rule is scored.
// Every word of the three roots is a core word, a comparison word, or set aside with a
// reason; a form the rules below do not name stops the run.
// Usage: node project/tools/supposing-inventory.mjs          (writes project/inventory/)
//        node project/tools/supposing-inventory.mjs --check  (writes nothing; fails if the files on disk differ)
import fs from 'node:fs';
import path from 'node:path';
import * as lib from './lib.mjs';

const { corpus, meta } = lib.loadText('build');
const split = lib.loadSplit();

// ---------- the rules ----------
// Keyed by root, then by dictionary form and part of speech. The key is the dictionary form
// without its vowel marks (typed marks do not always match the file's order of marks);
// the run stops if one key meets two different vowelled forms, so nothing is merged by this.
// in:      a core word of the named group
// compare: kept in a separate comparison group; not counted with the core (discussion 31)
// out:     set aside, with a provisional reason
const RULES = {
  ظنن: {
    'ظن V': { in: 'zanna', gloss: 'verb' },
    'ظن N': { in: 'zanna', gloss: 'noun' },
    'ظان N': { in: 'zanna', gloss: 'participle' },
  },
  حسب: {
    'حسب V': { in: 'hasiba', gloss: 'verb, first form' },
    'يحتسب V': { compare: 'eighth-form verb of the same root ("from where they had not expected"). Not the declared verb; kept beside the core for comparison.' },
    'حساب N': { out: 'reckoning, account' },
    'حسب N': { out: 'sufficiency expression ("enough for")' },
    'حسيب N': { out: 'one who reckons, who takes account' },
    'حاسب N': { out: 'one who reckons (participle)' },
    'حاسب V': { out: 'third form, "to call to account"' },
    'حسبان N': { out: 'in the one build-sura use, something sent from the sky upon a garden' },
  },
  زعم: {
    'زعم V': { in: "za'ama", gloss: 'verb' },
    'زعيم N': { out: 'guarantor, one who vouches' },
  },
};
const GROUPS = ['zanna', 'hasiba', "za'ama"];
const NAME = { zanna: 'ẓanna', hasiba: 'ḥasiba', "za'ama": 'zaʿama' };
const ARABIC = { zanna: 'ظَنَّ', hasiba: 'حَسِبَ', "za'ama": 'زَعَمَ' };
// A grouping rule, not a claim about meaning: a noun of the root ظنن and a verb or
// participle of the same root in the same verse, with at most this many words between
// them, are listed as one entry. Whether they are one unit of sense is asked of the annotator.
const MERGE_GAP = 3;
// How many verses of the same sura are shown before and after an entry in a batch file.
const CONTEXT = 2;
// Surface marks only. They say what stands next to the word, not what the clause means.
// bare(): the word without its vowel marks, hamza kept as written.
const bare = (s) => (s || '').replace(/[ً-ْٰـۖ-ۭ]/g, '');
const strip = (s) => bare(s).replace(/[أإآٱ]/g, 'ا');

// ---------- retrieval ----------
const included = [];
const compared = [];
const setAside = [];
const vowelled = new Map(); // root + key -> the file's own vowelled dictionary form
for (const v of corpus.verses) {
  if (!split.sets.build.has(v.s)) throw new Error(`not a build sura: ${v.s}`);
  for (const w of v.words) {
    const rules = RULES[w.root];
    if (!rules) continue;
    const key = `${strip(w.lemma)} ${w.pos}`;
    const rule = rules[key];
    if (!rule) throw new Error(`no rule for ${w.root} ${key} at ${v.s}:${v.v}:${w.w}`);
    const full = `${w.root} ${key}`;
    if (!vowelled.has(full)) vowelled.set(full, w.lemma);
    else if (vowelled.get(full) !== w.lemma) throw new Error(`two dictionary forms under one key: ${vowelled.get(full)} and ${w.lemma}`);
    const row = { s: v.s, v: v.v, w: w.w, form: w.form, lemma: w.lemma, pos: w.pos, feats: w.feats || [], prefixes: w.prefixes || [], root: w.root, key };
    if (rule.in) included.push({ ...row, group: rule.in });
    else if (rule.compare) compared.push({ ...row, group: 'comparison', reason: rule.compare });
    else setAside.push({ ...row, reason: rule.out, context: context(v, w) });
  }
}

function context(v, w) {
  return {
    before: v.words.filter((x) => x.w < w.w).slice(-3).map((x) => x.form).join(' '),
    after: v.words.filter((x) => x.w > w.w).slice(0, 5).map((x) => x.form).join(' '),
  };
}

// ---------- words to entries ----------
const isHead = (r) => r.pos === 'V' || r.feats.includes('ACT_PCPL');
const entries = [];
const byVerse = new Map();
for (const r of included) {
  const k = `${r.s}:${r.v}`;
  if (!byVerse.has(k)) byVerse.set(k, []);
  byVerse.get(k).push(r);
}
for (const rows of byVerse.values()) {
  const heads = rows.filter(isHead);
  const taken = new Map(); // head -> nouns grouped with it
  const alone = [];
  for (const n of rows.filter((r) => !isHead(r))) {
    const near = heads
      .filter((h) => h.root === n.root && Math.abs(h.w - n.w) - 1 <= MERGE_GAP)
      .sort((a, b) => Math.abs(a.w - n.w) - Math.abs(b.w - n.w))[0];
    if (near) taken.set(near, [...(taken.get(near) || []), n]);
    else alone.push(n);
  }
  for (const h of [...heads, ...alone].sort((a, b) => a.w - b.w)) entries.push(makeEntry(h, taken.get(h) || []));
}
const order = (a, b) => a.s - b.s || a.v - b.v || a.w - b.w;
entries.sort(order);
for (const p of entries) p.sameVerse = entries.filter((q) => q !== p && q.s === p.s && q.v === p.v).map((q) => q.id);
const comparison = compared.map((h) => makeEntry(h, [])).sort(order);

function makeEntry(h, nouns) {
  const v = corpus.at(h.s, h.v);
  const prev = v.words.filter((x) => x.w < h.w).slice(-1)[0];
  const next = v.words.filter((x) => x.w > h.w)[0];
  const person = h.feats.find((f) => /^[123][MF]?[SDP]$/.test(f)) || null;
  // The particle's kind is the morphology file's own tag (NEG, PRO, INTG, SUB ...), not a judgment made here.
  const marks = [];
  const lem = (x) => bare(x.lemma || x.form);
  const has = (x, tag) => (x.feats || []).includes(tag);
  if (h.prefixes.some((p) => bare(p) === 'أ')) marks.push('question particle on the word');
  if (prev && lem(prev) === 'أم') marks.push('after am');
  if (prev && lem(prev) === 'لا' && (has(prev, 'NEG') || has(prev, 'PRO'))) marks.push('after lā');
  if (prev && lem(prev) === 'ما' && has(prev, 'NEG')) marks.push('after negative mā');
  if (prev && lem(prev) === 'ما' && has(prev, 'INTG')) marks.push('after mā "what?"');
  if (next && lem(next) === 'أن') marks.push('next word is "that" (an, anna)');
  return {
    id: `${h.s}:${h.v}:${h.w}`,
    s: h.s, v: h.v, w: h.w,
    group: h.group,
    form: h.form, lemma: h.lemma, pos: h.pos,
    kind: h.pos === 'V' ? 'verb' : h.feats.includes('ACT_PCPL') ? 'participle' : 'noun',
    tense: h.feats.find((f) => ['PERF', 'IMPF', 'IMPV'].includes(f)) || null,
    person: person ? Number(person[0]) : null,
    subject: person,
    prefixes: h.prefixes,
    words: [h, ...nouns].sort((a, b) => a.w - b.w).map((x) => `${x.s}:${x.v}:${x.w}`),
    groupedNouns: nouns.map((n) => ({ id: `${n.s}:${n.v}:${n.w}`, w: n.w, form: n.form })),
    marks,
    ...context(v, h),
    verse: v.words.map((x) => x.form).join(' '),
    suraType: meta[h.s]?.type || null,
    half: split.sets.foldA.has(h.s) ? 'A' : 'B',
    sameVerse: [],
  };
}

// every candidate word is in exactly one list
const accounted = new Set([...entries.flatMap((e) => e.words), ...comparison.flatMap((e) => e.words), ...setAside.map((r) => `${r.s}:${r.v}:${r.w}`)]);
const candidates = included.length + compared.length + setAside.length;
if (accounted.size !== candidates) throw new Error(`candidate words ${candidates}, accounted for ${accounted.size}`);

// ---------- counts ----------
const count = (list, f) => { const m = {}; for (const x of list) { const k = f(x); m[k] = (m[k] || 0) + 1; } return m; };
const counts = {
  candidateWords: candidates,
  coreWords: included.length,
  comparisonWords: compared.length,
  setAsideWords: setAside.length,
  coreEntries: entries.length,
  comparisonEntries: comparison.length,
  verses: new Set(entries.map((p) => `${p.s}:${p.v}`)).size,
  suras: new Set(entries.map((p) => p.s)).size,
  half: { A: { core: entries.filter((e) => e.half === 'A').length, comparison: comparison.filter((e) => e.half === 'A').length }, B: { core: entries.filter((e) => e.half === 'B').length, comparison: comparison.filter((e) => e.half === 'B').length } },
  byGroup: Object.fromEntries(GROUPS.map((g) => {
    const ps = entries.filter((p) => p.group === g);
    const verbs = ps.filter((p) => p.kind === 'verb');
    return [g, {
      words: included.filter((r) => r.group === g).length,
      entries: ps.length,
      kind: count(ps, (p) => p.kind),
      verbPerson: count(verbs, (p) => `person ${p.person}`),
      verbTense: count(verbs, (p) => p.tense),
      suraType: count(ps, (p) => p.suraType),
      half: count(ps, (p) => p.half),
      questionMark: ps.filter((p) => p.marks.includes('question particle on the word') || p.marks.includes('after am')).length,
      afterLa: ps.filter((p) => p.marks.includes('after lā')).length,
      afterNegativeMa: ps.filter((p) => p.marks.includes('after negative mā')).length,
      noneOfThese: ps.filter((p) => !p.marks.some((m) => ['question particle on the word', 'after am', 'after lā', 'after negative mā'].includes(m))).length,
    }];
  })),
};

const out = {
  task: 29,
  note: 'Build suras only. Mechanical retrieval and counts from the morphology. Glosses are provisional. An entry is an annotation unit, not a claim that its words name one act of thought. See SUPPOSING.md for the rules and ANNOTATION.md for the labelling.',
  groupingGap: MERGE_GAP,
  counts,
  entries,
  comparison,
  setAside,
};

// ---------- the readable file ----------
const pc = (n, d) => `${n} of ${d}`;
const L = [];
L.push('# Inventory: ẓanna, ḥasiba and zaʿama in the build suras (task 29)');
L.push('');
L.push('Made by `node project/tools/supposing-inventory.mjs`. Do not edit by hand. Build suras only; no test or vault sura is read. Retrieval and counting are mechanical. The English glosses and reasons are provisional labels, not findings. No rule is tested.');
L.push('');
L.push('## What is covered and what is not');
L.push('');
L.push('The group was declared in discussion 25 before the occurrences were looked at, and its scope was set in discussions 26 and 31: all uses in the build suras of three selected dictionary forms. Whether a given use expresses uncertainty, knowledge, inference, a claim, an accusation or something else is **not** assumed here; that is for the annotation (`ANNOTATION.md`).');
L.push('');
L.push('It is not every way the text speaks of belief or its grounds. Other expressions (for example a verb of seeing used for an opinion, particles such as "perhaps", a phrase such as "guessing at the unseen") are not retrieved. The root خرص has no word in the build suras.');
L.push('');
L.push('## Rules');
L.push('');
L.push('Every word of the three roots in the build suras is a candidate. Each is a core word, a comparison word, or set aside, by its dictionary form and part of speech exactly as the morphology file gives them. A form the table does not name stops the tool.');
L.push('');
L.push('| Root | Dictionary form | Part of speech | Decision | Provisional gloss or reason | Words |');
L.push('|---|---|---|---|---|---|');
const all = [...included, ...compared, ...setAside];
for (const [root, rules] of Object.entries(RULES)) for (const [key, rule] of Object.entries(rules)) {
  const pos = key.split(' ')[1];
  const lemma = vowelled.get(`${root} ${key}`) || key.split(' ')[0];
  const n = all.filter((r) => r.root === root && `${strip(r.lemma)} ${r.pos}` === key).length;
  L.push(`| ${root} | ${lemma} | ${pos === 'V' ? 'verb' : 'noun'} | ${rule.in ? `core (${NAME[rule.in]})` : rule.compare ? 'comparison group' : 'set aside'} | ${rule.in ? rule.gloss : rule.compare || rule.out} | ${n} |`);
}
L.push('');
L.push(`Candidates: ${counts.candidateWords} words. Core: ${counts.coreWords}. Comparison: ${counts.comparisonWords}. Set aside: ${counts.setAsideWords}. Each candidate is in exactly one of the three.`);
L.push('');
L.push('## From words to entries');
L.push('');
L.push(`The unit is the annotation entry. A noun of the root ظنن that stands in the same verse as a verb or participle of that root, with at most ${MERGE_GAP} words between them, is listed with it as one entry. This is a grouping rule. It is not a claim that the two words name one act of thought, and the annotator is asked at each such entry whether they do. Nothing else is grouped. Two entries in one verse are both kept and each names the other. Entries are not independent passages, and no count below is a count of independent events.`);
L.push('');
L.push(`**${counts.coreWords} core words make ${counts.coreEntries} core entries, in ${counts.verses} verses of ${counts.suras} suras.** The comparison group has ${counts.comparisonEntries} entries and is never counted with the core.`);
L.push('');
L.push(`By half of the build suras: half A has ${counts.half.A.core} core entries and ${counts.half.A.comparison} comparison; half B has ${counts.half.B.core} and ${counts.half.B.comparison}. Half B has been displayed in this file since it was first published. It is a later batch of annotation, not unseen text.`);
L.push('');
L.push('## Counts');
L.push('');
L.push('Counts of grammatical form taken from the morphology, for the core entries. They are descriptions, not readings. "Question" means the question particle is on the word or the word follows *am*. "After lā" means the word before it is *lā*, tagged by the morphology file as negative or as prohibiting. "After negative mā" means the word before it is *mā* with the negative tag of the morphology file. A mark is set only by the word immediately before or after; a question or a denial that starts further back is not caught. The absence of a form (for example a first-person verb) is a count in these suras. It does not show that the form is impossible or that the distribution is unusual.');
L.push('');
L.push('| | ẓanna | ḥasiba | zaʿama |');
L.push('|---|---|---|---|');
const g = (name) => counts.byGroup[name];
const row = (label, f) => L.push(`| ${label} | ${GROUPS.map((n) => f(g(n))).join(' | ')} |`);
row('Core entries', (x) => x.entries);
row('Verb / noun / participle', (x) => `${x.kind.verb || 0} / ${x.kind.noun || 0} / ${x.kind.participle || 0}`);
row('Verbs in the first person (I, we)', (x) => pc(x.verbPerson['person 1'] || 0, x.kind.verb || 0));
row('Verbs in the second person (you)', (x) => pc(x.verbPerson['person 2'] || 0, x.kind.verb || 0));
row('Verbs in the third person', (x) => pc(x.verbPerson['person 3'] || 0, x.kind.verb || 0));
row('Verbs: past / present', (x) => `${x.verbTense.PERF || 0} / ${x.verbTense.IMPF || 0}`);
row('Question', (x) => pc(x.questionMark, x.entries));
row('After lā', (x) => pc(x.afterLa, x.entries));
row('After negative mā', (x) => pc(x.afterNegativeMa, x.entries));
row('None of these three marks', (x) => pc(x.noneOfThese, x.entries));
row('Meccan / Medinan suras', (x) => `${x.suraType.Meccan || 0} / ${x.suraType.Medinan || 0}`);
row('Half A / half B of the build suras', (x) => `${x.half.A || 0} / ${x.half.B || 0}`);
L.push('');
L.push('## The core entries');
L.push('');
L.push('The word is in square brackets. "Subject" is the person, gender and number as the morphology gives it (3MP: third person, masculine, plural). "Marks" are the surface marks described above. The whole verse and every word coordinate of each entry are in `supposing-build.json`.');
const table = (list) => {
  L.push('');
  L.push('| Entry | Half | Kind | Subject | In context | Marks | Also in this verse |');
  L.push('|---|---|---|---|---|---|---|');
  for (const p of list) {
    const grouped = p.groupedNouns.length ? ` (grouped with the noun ${p.groupedNouns.map((n) => `${n.form} at ${n.id}`).join(', ')})` : '';
    L.push(`| ${p.id} | ${p.half} | ${p.kind}${p.tense ? `, ${p.tense === 'PERF' ? 'past' : 'present'}` : ''} | ${p.subject || ''} | ${p.before} **[${p.form}]** ${p.after}${grouped} | ${p.marks.join('; ')} | ${p.sameVerse.join(', ')} |`);
  }
};
for (const name of GROUPS) {
  L.push('');
  L.push(`### ${NAME[name]} (${ARABIC[name]}): ${g(name).entries} entries`);
  table(entries.filter((q) => q.group === name));
}
L.push('');
L.push('## The comparison group');
L.push('');
L.push('Added at Codex\'s request (discussion 31) after the exclusions had been inspected, and disclosed as such. Annotated with the same columns, in a separate table, and never added to the core counts.');
table(comparison);
L.push('');
L.push('## Set aside');
L.push('');
L.push('Every other word of the three roots, with a provisional reason. Membership is decided by dictionary form and part of speech; the reason describes the form and is not a reading of each occurrence.');
L.push('');
L.push('| Word | Dictionary form | In context | Provisional reason |');
L.push('|---|---|---|---|');
for (const r of setAside) L.push(`| ${r.s}:${r.v}:${r.w} | ${r.lemma} | ${r.context.before} **[${r.form}]** ${r.context.after} | ${r.reason} |`);
L.push('');
L.push('## Annotation');
L.push('');
L.push('The columns, their values and the order of work are in `ANNOTATION.md`. The first batch is `batch-A.md`: the core entries of half A and its one comparison entry, each with its whole verse and the verses around it.');
L.push('');

// ---------- the batch file given to an annotator ----------
// Only what the annotator needs: the entry, its verse and the verses around it. No counts, no marks.
function batch(half) {
  const B = [];
  const show = (e) => {
    const v = corpus.at(e.s, e.v);
    const mark = new Set(e.words.map((x) => Number(x.split(':')[2])));
    B.push(`### ${e.id}`);
    B.push('');
    B.push(`Word: ${e.form}${e.groupedNouns.length ? `, listed together with ${e.groupedNouns.map((n) => `${n.form} (word ${n.w})`).join(', ')}` : ''}`);
    B.push('');
    const sura = corpus.bySura.get(e.s);
    const i = sura.indexOf(v);
    for (const u of sura.slice(Math.max(0, i - CONTEXT), i + CONTEXT + 1)) {
      const text = u.words.map((x) => (u === v && mark.has(x.w) ? `⟦${x.form}⟧` : x.form)).join(' ');
      B.push(`${u === v ? '**' : ''}${u.s}:${u.v}${u === v ? '**' : ''}  ${text}`);
      B.push('');
    }
  };
  B.push(`# Annotation batch ${half}`);
  B.push('');
  B.push(`Made by \`node project/tools/supposing-inventory.mjs\`. Read \`ANNOTATION.md\` first. Each entry shows its word in ⟦ ⟧ inside its verse (in bold reference), with up to ${CONTEXT} verses of the same sura before and after. Build suras only.`);
  B.push('');
  B.push('## Core entries');
  B.push('');
  for (const e of entries.filter((x) => x.half === half)) show(e);
  B.push('## Comparison entries (a separate group; label them the same way)');
  B.push('');
  for (const e of comparison.filter((x) => x.half === half)) show(e);
  return B.join('\n');
}

const dir = path.join(lib.PROJECT_DIR, 'inventory');
const files = { 'supposing-build.json': JSON.stringify(out, null, 1) + '\n', 'SUPPOSING.md': L.join('\n'), 'batch-A.md': batch('A') };
if (process.argv.includes('--check')) {
  for (const [f, text] of Object.entries(files)) if (fs.readFileSync(path.join(dir, f), 'utf8') !== text) throw new Error(`${f} on disk differs from what the tool makes`);
  console.log('inventory files match the tool');
} else {
  fs.mkdirSync(dir, { recursive: true });
  for (const [f, text] of Object.entries(files)) fs.writeFileSync(path.join(dir, f), text);
}
console.log(JSON.stringify(counts, null, 1));
