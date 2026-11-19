// Freezing the code of a run.
//
// A score is only worth something if the code that produced it was fixed and
// published first. So every file of code that a run loads has to be recorded,
// and for a test it has to be the file in the current commit.
//
// This module does not read source text to work out what a file imports.
// (Earlier versions did, with regular expressions, and Codex's reviews found
// valid import spellings they missed: project/METHOD_V4_REVIEW.md.) It asks
// Node itself: module.registerHooks puts a function in Node's own module
// loader, and the loader calls it for every file it is about to load,
// whatever the import was written like. Node loads a file and everything it
// imports before running any of it, so a refusal here stops the run before a
// line of the rule has run.
//
// What this is not: a sandbox. A rule file is ordinary JavaScript and could
// still reach the file system in ways no loader sees. The rules of AGENTS.md
// (a rule reaches the text only through ctx) are kept by the author and
// checked by the challenger. The word list below catches the obvious routes
// early and is a tripwire, not a proof.
//
// This file imports only Node's own modules.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import nodeModule from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const POLICY = 'A rule and its helpers may import only other .mjs files of this repository, by a written-out relative path.';
const TRIPWIRES = [
  [/\brequire\s*\(|\bcreateRequire\b/, 'require'],
  [/\bimport\s*\(/, 'a computed import'],
  [/\bimport\s*\.\s*meta\b/, 'import.meta'],
  [/\bprocess\s*[.[]|\bglobalThis\b|\bgetBuiltinModule\b/, 'the process or the global object'],
  [/\beval\s*\(|\bFunction\s*\(/, 'eval'],
];
const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

// root: the repository. check: true for a test or vault run, when every file
// must be the committed one. exec: how to run git (tests supply their own).
export function startFreeze({ root, check = false, exec = execFileSync } = {}) {
  if (typeof nodeModule.registerHooks !== 'function') throw new Error('This tool needs Node 22.15 or later (module.registerHooks).');
  const base = fs.realpathSync.native(root);
  const relOf = (abs) => {
    let real = abs;
    try {
      real = fs.realpathSync.native(abs);
    } catch {
      // a missing file: judged by its path as written
    }
    const r = path.relative(base, real);
    return r && !r.startsWith('..') && !path.isAbsolute(r) ? r.replace(/\\/g, '/') : null;
  };
  const git = (args) => String(exec('git', args, { cwd: base, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })).trim();
  let head = null;
  const headOf = () => (head ||= git(['rev-parse', 'HEAD']));
  const files = new Map(); // path within the repository -> sha256 of the file
  const ruleTree = new Set(); // URLs of the rule and of the helpers loaded for it
  let phase = 'tools'; // 'tools' -> 'rule' -> 'sealed'

  // Records one file. For a test, refuses it unless it is the committed file.
  // A clean "git status" would not be enough: a file that git ignores is not
  // listed there. So each file is compared with the commit directly.
  const admit = (abs) => {
    const rel = relOf(abs);
    if (!rel) throw new Error(`${abs}: outside the repository`);
    if (check) {
      let blob = null;
      try {
        blob = git(['rev-parse', '--verify', '--quiet', `${headOf()}:${rel}`]);
      } catch {
        blob = null;
      }
      if (!blob) throw new Error(`Commit and push before a test run. ${rel}: not in the current commit`);
      if (git(['hash-object', '--', rel]) !== blob) throw new Error(`Commit and push before a test run. ${rel}: differs from the committed file`);
    }
    const hash = sha256(fs.readFileSync(abs));
    if (files.has(rel) && files.get(rel) !== hash) throw new Error(`${rel}: changed during the run`);
    files.set(rel, hash);
    return rel;
  };

  const hooks = nodeModule.registerHooks({
    resolve(specifier, context, next) {
      if (phase === 'sealed') throw new Error(`No code may be loaded once the rule is loaded (asked for "${specifier}"). ${POLICY}`);
      const parent = context.parentURL;
      const strict = Boolean(parent) && ruleTree.has(parent);
      const from = strict ? relOf(fileURLToPath(parent)) : null;
      if (strict && !(/^\.\.?\//.test(specifier) && specifier.endsWith('.mjs'))) throw new Error(`${from}: imports "${specifier}". ${POLICY}`);
      const found = next(specifier, context);
      if (strict && !(found.url.startsWith('file:') && relOf(fileURLToPath(found.url)))) throw new Error(`${from}: imports "${specifier}". ${POLICY}`);
      return found;
    },
    load(url, context, next) {
      if (!url.startsWith('file:')) return next(url, context); // one of Node's own modules
      const u = new URL(url);
      if (u.search || u.hash) throw new Error(`"${url}": import a file by its plain path`);
      const abs = fileURLToPath(u);
      const rel = admit(abs);
      if (phase === 'rule') {
        if (!abs.endsWith('.mjs')) throw new Error(`${rel}: ${POLICY}`);
        const source = fs.readFileSync(abs, 'utf8');
        const hit = TRIPWIRES.find(([pattern]) => pattern.test(source));
        if (hit) throw new Error(`${rel}: uses ${hit[1]}. ${POLICY}`);
        ruleTree.add(url);
      }
      return next(url, context);
    },
  });

  const href = (file) => pathToFileURL(path.resolve(file)).href;
  return {
    // Loads a file of the tools, and whatever it imports.
    async tools(file) {
      if (phase !== 'tools') throw new Error('the tools are loaded before the rule');
      return import(href(file));
    },
    // Loads the rule, and whatever it imports, under the strict policy. After
    // this nothing more can be loaded.
    async rule(file) {
      if (phase !== 'tools') throw new Error('one rule per run');
      phase = 'rule';
      try {
        return await import(href(file));
      } finally {
        phase = 'sealed';
      }
    },
    // Records files that are read rather than imported (the text, the split,
    // the synonym list) and the two files loaded before this guard existed.
    add(list) {
      for (const f of list) admit(path.join(base, f));
    },
    // Checks every recorded file once more (it must not have changed meanwhile).
    verify() {
      for (const rel of [...files.keys()]) admit(path.join(base, rel));
    },
    // Refuses unless the current commit is on GitHub. Returns the commit.
    published() {
      try {
        git(['fetch', '--quiet', 'origin']);
      } catch {
        // offline: fall back on what is known of origin/main
      }
      try {
        git(['merge-base', '--is-ancestor', headOf(), 'origin/main']);
      } catch {
        throw new Error('The current commit is not on origin/main. Push before a test run, so the rule and the method are on record first.');
      }
      return headOf();
    },
    // Everything recorded so far: { path: sha256 }, sorted by path.
    inputs: () => Object.fromEntries([...files].sort((a, b) => (a[0] < b[0] ? -1 : 1))),
    stop: () => hooks.deregister(),
  };
}
