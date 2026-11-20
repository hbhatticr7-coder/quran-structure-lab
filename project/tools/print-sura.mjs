// Prints the Arabic of one build sura, or a run of its verses, one verse to a line, and
// nothing else. This is the text given to a reader or an annotator. Build suras only:
// a test or vault sura is refused.
// Usage: node project/tools/print-sura.mjs <sura> [first verse] [last verse]
import * as lib from './lib.mjs';

const [s, from, to] = process.argv.slice(2).map(Number);
const { corpus } = lib.loadText('build');
const verses = corpus.bySura.get(s);
if (!verses) throw new Error(`not a build sura: ${process.argv[2]}`);
const first = from || 1;
const last = to || (from ? from : verses.length);
for (const v of verses) if (v.v >= first && v.v <= last) console.log(`${v.s}:${v.v}  ${v.words.map((w) => w.form).join(' ')}`);
