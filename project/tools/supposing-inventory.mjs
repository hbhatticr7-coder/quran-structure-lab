// Task 29. Build suras only. An inventory of one declared group of words: the three
// words for supposing (zanna with its noun and participle, hasiba, za'ama).
// It retrieves and counts. It interprets nothing and scores no rule.
// Every word of the three roots is either included or set aside with a reason;
// a word the rules below do not name stops the run.
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
const RULES = {
  ظنن: {
    'ظن V': { in: 'zanna', gloss: 'to suppose (verb)' },
    'ظن N': { in: 'zanna', gloss: 'supposition (noun)' },
    'ظان N': { in: 'zanna', gloss: 'one who supposes (participle)' },
  },
  حسب: {
    'حسب V': { in: 'hasiba', gloss: 'to suppose, to take something to be so (verb, first form)' },
    'يحتسب V': { out: 'nearest neighbour, kept apart: eighth form, "to reckon on, to expect" (from where they had not expected). An attitude toward what will happen, but not the declared verb.', near: true },
    'حساب N': { out: 'reckoning, account' },
    'حسب N': { out: '"enough for" (God is enough for us)' },
    'حسيب N': { out: 'one who reckons, who takes account' },
    'حاسب N': { out: 'one who reckons (participle)' },
    'حاسب V': { out: 'third form, "to call to account"' },
    'حسبان N': { out: 'here a calamity sent from the sky; elsewhere "calculation"' },
  },
  زعم: {
    'زعم V': { in: "za'ama", gloss: 'to claim, to assert (verb)' },
    'زعيم N': { out: 'guarantor, one who vouches' },
  },
};
const GROUPS = ['zanna', 'hasiba', "za'ama"];
const ARABIC = { zanna: 'ظَنَّ', hasiba: 'حَسِبَ', "za'ama": 'زَعَمَ' };
// A noun of supposing and a verb or participle of the same root in the same verse,
// with at most this many words between them, are one place (the noun names the same
// act: "they supposed ... the supposing of ...", "your supposition which you supposed").
const MERGE_GAP = 3;
// Surface marks only. They say what stands next to the word, not what the clause means.
// bare(): the word without its vowel marks, hamza kept as written.
const bare = (s) => (s || '').replace(/[ً-ْٰـۖ-ۭ]/g, '');
const strip = (s) => (s || '').replace(/[ً-ْٰـۖ-ۭ]/g, '').replace(/[أإآٱ]/g, 'ا');

// ---------- retrieval ----------
const included = [];
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
    const row = { s: v.s, v: v.v, w: w.w, form: w.form, lemma: w.lemma, pos: w.pos, feats: w.feats || [], prefixes: w.prefixes || [], root: w.root };
    if (rule.in) included.push({ ...row, group: rule.in });
    else setAside.push({ ...row, reason: rule.out, near: !!rule.near, context: context(v, w) });
  }
}

function context(v, w) {
  return {
    before: v.words.filter((x) => x.w < w.w).slice(-3).map((x) => x.form).join(' '),
    after: v.words.filter((x) => x.w > w.w).slice(0, 5).map((x) => x.form).join(' '),
  };
}

// ---------- words to places ----------
const isHead = (r) => r.pos === 'V' || r.feats.includes('ACT_PCPL');
const places = [];
const byVerse = new Map();
for (const r of included) {
  const k = `${r.s}:${r.v}`;
  if (!byVerse.has(k)) byVerse.set(k, []);
  byVerse.get(k).push(r);
}
for (const rows of byVerse.values()) {
  const heads = rows.filter(isHead);
  const taken = new Map(); // head -> nouns merged into it
  const alone = [];
  for (const n of rows.filter((r) => !isHead(r))) {
    const near = heads
      .filter((h) => h.root === n.root && Math.abs(h.w - n.w) - 1 <= MERGE_GAP)
      .sort((a, b) => Math.abs(a.w - n.w) - Math.abs(b.w - n.w))[0];
    if (near) taken.set(near, [...(taken.get(near) || []), n]);
    else alone.push(n);
  }
  for (const h of [...heads, ...alone].sort((a, b) => a.w - b.w)) places.push(makePlace(h, taken.get(h) || []));
}
places.sort((a, b) => a.s - b.s || a.v - b.v || a.w - b.w);
for (const p of places) p.sameVerse = places.filter((q) => q !== p && q.s === p.s && q.v === p.v).map((q) => q.id);

function makePlace(h, nouns) {
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
    mergedNouns: nouns.map((n) => ({ w: n.w, form: n.form })),
    marks,
    ...context(v, h),
    verse: v.words.map((x) => x.form).join(' '),
    suraType: meta[h.s]?.type || null,
    half: split.sets.foldA.has(h.s) ? 'A' : 'B',
    sameVerse: [],
  };
}

// ---------- counts ----------
const count = (list, f) => { const m = {}; for (const x of list) { const k = f(x); m[k] = (m[k] || 0) + 1; } return m; };
const counts = {
  candidateWords: included.length + setAside.length,
  includedWords: included.length,
  setAsideWords: setAside.length,
  places: places.length,
  verses: new Set(places.map((p) => `${p.s}:${p.v}`)).size,
  suras: new Set(places.map((p) => p.s)).size,
  byGroup: Object.fromEntries(GROUPS.map((g) => {
    const ps = places.filter((p) => p.group === g);
    const verbs = ps.filter((p) => p.kind === 'verb');
    return [g, {
      words: included.filter((r) => r.group === g).length,
      places: ps.length,
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
  note: 'Build suras only. Retrieval and counts from the morphology; nothing here is an interpretation. See SUPPOSING.md for the rules.',
  mergeGap: MERGE_GAP,
  counts,
  places,
  setAside,
};

// ---------- the readable file ----------
const pc = (n, d) => `${n} of ${d}`;
const L = [];
L.push('# Inventory: the words for supposing in the build suras (task 29)');
L.push('');
L.push('Made by `node project/tools/supposing-inventory.mjs`. Do not edit by hand. Build suras only; no test or vault sura is read. This file retrieves and counts. It interprets nothing and tests no rule.');
L.push('');
L.push('## What is covered and what is not');
L.push('');
L.push('The group was declared in discussion 25 before the places were looked at: three words for holding something to be so without knowing it. It is **not** every way the text speaks of supposing. Other expressions (for example a verb of seeing used for an opinion, particles such as "perhaps", a phrase such as "guessing at the unseen") are not retrieved. The root خرص ("to guess") has no word in the build suras.');
L.push('');
L.push('## Rules of inclusion');
L.push('');
L.push('Every word of the three roots in the build suras is a candidate. Each is included or set aside by its dictionary form and part of speech, exactly as the morphology file gives them. A form the table does not name stops the tool.');
L.push('');
L.push('| Root | Dictionary form | Part of speech | Decision | Sense, or reason for setting aside | Words |');
L.push('|---|---|---|---|---|---|');
for (const [root, rules] of Object.entries(RULES)) for (const [key, rule] of Object.entries(rules)) {
  const pos = key.split(' ')[1];
  const lemma = vowelled.get(`${root} ${key}`) || key.split(' ')[0];
  const n = [...included, ...setAside].filter((r) => r.root === root && `${strip(r.lemma)} ${r.pos}` === key).length;
  L.push(`| ${root} | ${lemma} | ${pos === 'V' ? 'verb' : 'noun'} | ${rule.in ? `included (${rule.in})` : rule.near ? 'set aside, nearest neighbour' : 'set aside'} | ${rule.in ? rule.gloss : rule.out} | ${n} |`);
}
L.push('');
L.push(`Candidates: ${counts.candidateWords} words. Included: ${counts.includedWords}. Set aside: ${counts.setAsideWords}.`);
L.push('');
L.push('## From words to places');
L.push('');
L.push(`The unit is the place: one act of supposing in its context. A noun of supposing that stands in the same verse as a verb or participle of the same root, with at most ${MERGE_GAP} words between them, is counted with that verb as one place ("they supposed about God ... the supposing of the age of ignorance"). Nothing else is merged. Two places in one verse are both kept and each names the other, because they are not independent passages.`);
L.push('');
L.push(`**${counts.includedWords} words make ${counts.places} places, in ${counts.verses} verses of ${counts.suras} suras.**`);
L.push('');
L.push('## Counts');
L.push('');
L.push('These are counts of grammatical form taken from the morphology. They are not readings. "Question" means the question particle is on the word or the word follows *am*. "After lā" means the word before it is *lā*, tagged by the morphology file as negative or as prohibiting. "After negative mā" means the word before it is *mā* with the negative tag of the morphology file. A mark is set only by the word immediately before or after; a question or a denial that starts further back is not caught. Whether a clause is in fact a question, a prohibition or a denial is for the reading step.');
L.push('');
L.push('| | ẓanna | ḥasiba | zaʿama |');
L.push('|---|---|---|---|');
const g = (name) => counts.byGroup[name];
const row = (label, f) => L.push(`| ${label} | ${GROUPS.map((n) => f(g(n))).join(' | ')} |`);
row('Places', (x) => x.places);
row('Verb / noun / participle', (x) => `${x.kind.verb || 0} / ${x.kind.noun || 0} / ${x.kind.participle || 0}`);
row('Verbs in the first person (I, we)', (x) => pc(x.verbPerson['person 1'] || 0, x.kind.verb || 0));
row('Verbs in the second person (you)', (x) => pc(x.verbPerson['person 2'] || 0, x.kind.verb || 0));
row('Verbs in the third person', (x) => pc(x.verbPerson['person 3'] || 0, x.kind.verb || 0));
row('Verbs: past / present', (x) => `${x.verbTense.PERF || 0} / ${x.verbTense.IMPF || 0}`);
row('Question', (x) => pc(x.questionMark, x.places));
row('After lā', (x) => pc(x.afterLa, x.places));
row('After negative mā', (x) => pc(x.afterNegativeMa, x.places));
row('None of these three marks', (x) => pc(x.noneOfThese, x.places));
row('Meccan / Medinan suras', (x) => `${x.suraType.Meccan || 0} / ${x.suraType.Medinan || 0}`);
row('Half A / half B of the build suras', (x) => `${x.half.A || 0} / ${x.half.B || 0}`);
L.push('');
L.push('## The places');
L.push('');
L.push('The word is in square brackets. "Subject" is the person, gender and number as the morphology gives it (3MP: third person, masculine, plural). "Marks" are the surface marks described above. The whole verse for each place is in `supposing-build.json`.');
for (const name of GROUPS) {
  L.push('');
  L.push(`### ${name === 'zanna' ? 'ẓanna' : name === 'hasiba' ? 'ḥasiba' : 'zaʿama'} (${ARABIC[name]}): ${g(name).places} places`);
  L.push('');
  L.push('| Place | Kind | Subject | In context | Marks | Also in this verse |');
  L.push('|---|---|---|---|---|---|');
  for (const p of places.filter((q) => q.group === name)) {
    const merged = p.mergedNouns.length ? ` (with the noun ${p.mergedNouns.map((n) => n.form).join(', ')})` : '';
    L.push(`| ${p.id} | ${p.kind}${p.tense ? `, ${p.tense === 'PERF' ? 'past' : 'present'}` : ''} | ${p.subject || ''} | ${p.before} **[${p.form}]** ${p.after}${merged} | ${p.marks.join('; ')} | ${p.sameVerse.join(', ')} |`);
  }
}
L.push('');
L.push('## Set aside');
L.push('');
L.push('Every word of the three roots that is not included, with the reason. The two marked "nearest neighbour" are the ones a reviewer is most likely to want back.');
L.push('');
L.push('| Word | Dictionary form | In context | Reason |');
L.push('|---|---|---|---|');
for (const r of setAside) L.push(`| ${r.s}:${r.v}:${r.w} | ${r.lemma} | ${r.context.before} **[${r.form}]** ${r.context.after} | ${r.reason} |`);
L.push('');
L.push('## What the reading step will record at each place (proposed; nothing below has been applied)');
L.push('');
L.push('From discussion 26. Each model fills these independently before seeing the other\'s. "Unclear" and "not applicable" are valid in every column.');
L.push('');
L.push('| Column | What it records |');
L.push('|---|---|');
L.push('| Who supposes | The person or group holding the attitude, as the text names them |');
L.push('| What is supposed | The proposition, in a few words, kept close to the Arabic |');
L.push('| Scope | How the supposing enters the text: stated as fact, denied, forbidden, asked about, conditional, or inside quoted speech (and whose) |');
L.push('| How the text presents its truth | The text treats what is supposed as false, as true, or leaves it open |');
L.push('| Grounds | What ground the text gives the holder for it: a ground is stated, none is stated, or a ground is expressly denied ("they have no knowledge of it") |');
L.push('| Note | Anything the columns do not hold, including a second defensible reading |');
L.push('');
L.push('A supposition can be true and still have no ground, and quoted speech is not the text\'s own view. The columns keep these apart.');
L.push('');

const dir = path.join(lib.PROJECT_DIR, 'inventory');
const files = { 'supposing-build.json': JSON.stringify(out, null, 1) + '\n', 'SUPPOSING.md': L.join('\n') };
if (process.argv.includes('--check')) {
  for (const [f, text] of Object.entries(files)) if (fs.readFileSync(path.join(dir, f), 'utf8') !== text) throw new Error(`${f} on disk differs from what the tool makes`);
  console.log('inventory files match the tool');
} else {
  fs.mkdirSync(dir, { recursive: true });
  for (const [f, text] of Object.entries(files)) fs.writeFileSync(path.join(dir, f), text);
}
console.log(JSON.stringify(counts, null, 1));
