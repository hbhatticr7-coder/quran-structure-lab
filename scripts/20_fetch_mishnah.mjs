// Fetches the Mishnah (Hebrew, as served by Sefaria) into data/external/sefaria/.
// The order of tractates within each of the six orders is taken from Sefaria's
// table of contents. Responses are parsed as JSON data; nothing is executed.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from '../src/corpus.mjs';

const DIR = path.join(ROOT_DIR, 'data', 'external', 'sefaria');
fs.mkdirSync(DIR, { recursive: true });
const UA = { 'User-Agent': 'research-script/1.0' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const tocFile = path.join(DIR, 'index.json');
if (!fs.existsSync(tocFile)) fs.writeFileSync(tocFile, await (await fetch('https://www.sefaria.org/api/index', { headers: UA })).text());
const toc = JSON.parse(fs.readFileSync(tocFile, 'utf8'));
const orders = toc.find((c) => c.category === 'Mishnah').contents.filter((c) => /^Seder /.test(c.category || ''));
const list = orders.map((o) => ({ order: o.category.replace('Seder ', ''), tractates: o.contents.map((t) => t.title) }));

const out = [];
for (const { order, tractates } of list) {
  for (const title of tractates) {
    const file = path.join(DIR, `${title.replace(/[^A-Za-z]+/g, '_')}.json`);
    if (!fs.existsSync(file)) {
      const url = `https://www.sefaria.org/api/v3/texts/${encodeURIComponent(title.replace(/ /g, '_'))}?version=hebrew`;
      const res = await fetch(url, { headers: UA });
      if (!res.ok) throw new Error(`${title}: HTTP ${res.status}`);
      fs.writeFileSync(file, await res.text());
      await sleep(400);
    }
    const j = JSON.parse(fs.readFileSync(file, 'utf8'));
    const v = j.versions[0];
    out.push({ order, title, version: v.versionTitle, license: v.license, chapters: v.text.length, text: v.text });
  }
}
fs.writeFileSync(path.join(DIR, 'mishnah.json'), JSON.stringify(out));
const summary = list.map(({ order }) => `${order}: ${out.filter((t) => t.order === order).map((t) => `${t.title.replace('Mishnah ', '')} ${t.chapters}`).join(', ')}`);
console.log(summary.join('\n'));
console.log('tractates', out.length, '| versions', [...new Set(out.map((t) => t.version))].join('; '), '| licences', [...new Set(out.map((t) => t.license))].join('; '));
