// Task 29. Checks one annotator's label file for a batch of the inventory against the
// instructions in project/inventory/ANNOTATION.md, and compares two label files.
// It checks form only: entries, fields and listed values. It judges no label.
// Usage: node project/tools/supposing-labels.mjs <labels.json> <A|B>                 (check; exits 1 on a fault)
//        node project/tools/supposing-labels.mjs <labels.json> <A|B> <other.json>    (check both, then count agreement)
import fs from 'node:fs';
import path from 'node:path';
import * as lib from './lib.mjs';

const [file, half, other] = process.argv.slice(2);
if (!file || !['A', 'B'].includes(half)) throw new Error('usage: supposing-labels.mjs <labels.json> <A|B> [other.json]');
const inv = JSON.parse(fs.readFileSync(path.join(lib.PROJECT_DIR, 'inventory', 'supposing-build.json'), 'utf8'));
const wanted = [...inv.entries.filter((e) => e.half === half), ...inv.comparison.filter((e) => e.half === half)];
const grouped = new Set(wanted.filter((e) => e.groupedNouns.length).map((e) => e.id));

const VALUES = {
  reporter: ['text', 'instructed', 'quoted', 'open'],
  holder_kind: ['specific', 'generic', 'hypothetical', 'open'],
  attitude: ['held', 'not held', 'open'],
  truth: ['false', 'true', 'open', 'not applicable'],
  grounds: ['stated', 'expressly denied', 'not reported', 'not applicable'],
  grouping: ['one unit', 'not one unit', 'open', 'not applicable'],
};
const SCOPE = ['plain', 'verb negated', 'prohibited', 'questioned', 'conditional', 'inside quoted speech', 'inside instructed speech', 'generic or hypothetical'];
const TEXT = ['reporter_who', 'holder', 'proposition', 'scope_note', 'truth_evidence', 'grounds_evidence', 'context', 'alternative', 'note'];
const FIELDS = ['id', ...Object.keys(VALUES), 'scope', 'unsure', ...TEXT];

function load(f) {
  const rows = JSON.parse(fs.readFileSync(f, 'utf8'));
  const faults = [];
  if (!Array.isArray(rows)) return { rows: [], faults: ['the file is not an array'] };
  const ids = rows.map((r) => r.id);
  for (const e of wanted) if (ids.filter((x) => x === e.id).length !== 1) faults.push(`${e.id}: expected once, found ${ids.filter((x) => x === e.id).length}`);
  for (const id of ids) if (!wanted.some((e) => e.id === id)) faults.push(`${id}: not an entry of batch ${half}`);
  if (!faults.length && ids.join(' ') !== wanted.map((e) => e.id).join(' ')) faults.push('entries are not in the order of the batch file');
  for (const r of rows) {
    for (const k of FIELDS) if (!(k in r)) faults.push(`${r.id}: field ${k} is missing`);
    for (const k of Object.keys(r)) if (!FIELDS.includes(k)) faults.push(`${r.id}: unknown field ${k}`);
    for (const [k, list] of Object.entries(VALUES)) if (k in r && !list.includes(r[k])) faults.push(`${r.id}: ${k} is "${r[k]}", not one of the listed values`);
    if ('scope' in r && (!Array.isArray(r.scope) || !r.scope.length || r.scope.some((x) => !SCOPE.includes(x)))) faults.push(`${r.id}: scope must be a non-empty array of listed values`);
    if (Array.isArray(r.scope) && r.scope.includes('plain') && r.scope.length > 1) faults.push(`${r.id}: "plain" cannot stand with another scope layer`);
    if ('unsure' in r && (!Array.isArray(r.unsure) || r.unsure.some((x) => typeof x !== 'string' || !FIELDS.some((k) => x.startsWith(k))))) faults.push(`${r.id}: each item of unsure must be a string beginning with a field name`);
    for (const k of TEXT) if (k in r && typeof r[k] !== 'string') faults.push(`${r.id}: ${k} must be text`);
    if (grouped.has(r.id) && r.grouping === 'not applicable') faults.push(`${r.id}: the entry has two words, so grouping cannot be "not applicable"`);
    if (!grouped.has(r.id) && 'grouping' in r && r.grouping !== 'not applicable') faults.push(`${r.id}: the entry has one word, so grouping is "not applicable"`);
    for (const k of ['holder', 'proposition', 'context']) if (typeof r[k] === 'string' && !r[k].trim()) faults.push(`${r.id}: ${k} is empty`);
  }
  return { rows, faults };
}

let bad = false;
const sets = [file, other].filter(Boolean).map((f) => {
  const x = load(f);
  console.log(`${path.basename(f)}: ${x.rows.length} entries, ${x.faults.length} faults (batch ${half} has ${wanted.length} entries)`);
  for (const m of x.faults) console.log('  ' + m);
  if (x.faults.length) bad = true;
  return x.rows;
});
if (bad) process.exit(1);

if (other) {
  const [a, b] = sets;
  const byId = new Map(b.map((r) => [r.id, r]));
  const same = (x, y) => (Array.isArray(x) ? [...x].sort().join('|') === [...y].sort().join('|') : x === y);
  console.log('\nagreement on fields with listed values (exact match; scope compared as a set):');
  for (const k of [...Object.keys(VALUES), 'scope']) {
    const diff = a.filter((r) => !same(r[k], byId.get(r.id)[k]));
    console.log(`  ${k}: ${a.length - diff.length} of ${a.length}${diff.length ? '; differ at ' + diff.map((r) => r.id).join(', ') : ''}`);
  }
  console.log('free-text fields (holder, proposition, evidence) are compared by reading, not by this tool.');
}
