// Entry point: install the dependency recorder before loading project code.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startFreeze } from './freeze.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const mode = args[0];
if (args.length !== 1 || !['--build', '--test'].includes(mode)) throw new Error('usage: node project/tools/comparison-v2.mjs --build | --test');
const resultFile = path.join(root, 'project/comparison/v2', mode.slice(2) + '.json');
if (mode === '--test' && fs.existsSync(resultFile)) throw new Error('comparison v2 test already recorded; do not retest');
const freeze = startFreeze({ root, check: mode === '--test' });
try {
  freeze.add(['project/tools/comparison-v2.mjs', 'project/tools/freeze.mjs']);
  const { run } = await freeze.tools(path.join(root, 'project/tools/comparison-v2-run.mjs'));
  await run(freeze, { root, mode, resultFile });
} finally {
  freeze.stop();
}
