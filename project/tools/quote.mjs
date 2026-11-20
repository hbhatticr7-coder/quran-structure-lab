// Fills Arabic quotations into a text from the project's own copy of the text, so that no
// Arabic is typed by hand. In the source, {{49:6}} stands for the whole verse and
// {{49:6:5-8}} for words 5 to 8 of it ({{49:6:5}} for one word). Build suras only: a test or
// vault sura is refused by loadText.
// Usage: node project/tools/quote.mjs <source file> <output file>     (fill)
//        node project/tools/quote.mjs --words <sura:verse> ...        (print a verse's words with their numbers)
import fs from 'node:fs';
import * as lib from './lib.mjs';

const { corpus } = lib.loadText('build');
const verse = (s, v) => {
  const x = corpus.bySura.get(Number(s))?.find((y) => y.v === Number(v));
  if (!x) throw new Error(`no such verse in the build suras: ${s}:${v}`);
  return x;
};
const args = process.argv.slice(2);
if (args[0] === '--words') {
  for (const a of args.slice(1)) { const [s, v] = a.split(':'); console.log(`${a}  ` + verse(s, v).words.map((w) => `${w.w}.${w.form}`).join(' ')); }
} else {
  const [src, out] = args;
  if (!src || !out) throw new Error('usage: quote.mjs <source file> <output file> | --words <sura:verse> ...');
  let n = 0;
  const text = fs.readFileSync(src, 'utf8').replace(/\{\{(\d+):(\d+)(?::(\d+)(?:-(\d+))?)?\}\}/g, (m, s, v, a, b) => {
    const ws = verse(s, v).words;
    const from = a ? Number(a) : 1;
    const to = b ? Number(b) : a ? Number(a) : ws.length;
    if (from < 1 || to > ws.length || from > to) throw new Error(`bad word range in ${m}: the verse has ${ws.length} words`);
    n++;
    return ws.filter((w) => w.w >= from && w.w <= to).map((w) => w.form).join(' ');
  });
  if (/\{\{|\}\}/.test(text)) throw new Error('an unfilled or malformed {{ }} mark remains');
  fs.writeFileSync(out, text);
  console.log(`${n} quotations filled into ${out}`);
}
