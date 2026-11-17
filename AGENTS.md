# Working rules for AI agents

This repository is worked on by more than one AI model (Claude and Codex) across many sessions. Nothing carries over between sessions except what is in the repository. Read `PROJECT.md` first, then this file.

## Each session

1. `git pull`.
2. Read `project/QUEUE.md` and the top of `project/LOG.md`.
3. Take the first task that is open and not claimed by the other model. Mark it claimed with your name and the date, commit and push that one-line change before starting, so the other model does not take it too.
4. Do the task. Keep to one task per session unless it is small.
5. Add an entry at the top of `project/LOG.md`: date, who you are (`claude` or `codex`), what you did, what you found, what you would do next.
6. Update `project/QUEUE.md`: mark the task done, and add any tasks your work turned up.
7. Run `node project/tools/scoreboard.mjs` if any rule's status changed.
8. Commit and push. End the commit message with your own co-author line.

The owner does not want to be asked what to do next. Choose from the queue. Ask only before something outward-facing or hard to undo (see "Never" below).

## Setup

Node 20 or later. No dependencies, no install step. Python is not needed.

```bash
node project/tools/census.mjs
node project/tools/evaluate.mjs project/rules/R001_echo.mjs
node project/tools/scoreboard.mjs
```

The comparison texts are not in the repository. Fetch them with `bash scripts/00_fetch_external.sh` and `node scripts/20_fetch_mishnah.mjs` when a task needs them.

## Writing a rule

A rule is one file in `project/rules/`, named `R###_short-name.mjs`, with the next free number. Copy `R001_echo.mjs`.

```js
export default {
  id: 'R002',
  title: 'One sentence a non-specialist can read',
  author: 'claude',            // or 'codex'
  provenance: 'Where the idea came from, and what text you had looked at when you had it',
  appliesTo: ['synonym'],      // any of: frame, synonym, ending, order
  predict(occ, problem, ctx) { /* return one of problem.options, or null for "no answer" */ },
};
```

`predict` receives:

- `occ`: `{ s, v, slots }`, the sura, verse and word numbers of the choice. The choice itself is not included.
- `problem`: `{ id, type, options, optionInfo }`. `optionInfo[option]` gives that option's `tokens` (dictionary forms) and `roots`.
- `ctx`: the text, with the slot words hidden.
  - `ctx.verse()`: the words of this verse. `ctx.verse(s, v)`: any verse.
  - `ctx.window(k)`: the verses within `k` verses, same sura.
  - `ctx.sura()`: the whole sura.
  - `ctx.meta()`: `{ ayas, type (Meccan or Medinan), egyptian, noldeke }` (traditional order of revelation).
  - `ctx.rootOf(token)`.
  - `ctx.build`: this problem's occurrences in the build suras, with the choice made there. A rule may learn from these.
  - Each word is `{ s, v, w, form, lemma, root, pos, feats, prefixes, token }`, or `{ hidden: true }` for a slot.

A rule must reach the text only through `ctx`. It must not import the corpus, read the data files, or contain a table of answers keyed by sura and verse.

## Scoring a rule

1. **Build suras.** `node project/tools/evaluate.mjs project/rules/R###_name.mjs`. Run as often as you like. Tune here.
2. **Commit and push the rule file before testing it.** The commit is the proof that the rule was fixed first.
3. **Test suras.** Add `--test`. This runs **once** per rule. The tool refuses a second run and refuses a changed file. A changed rule is a new rule with a new number, and the old one stays in the ledger as it was.
4. The result goes to `project/ledger/R###.json`. Never edit the scores in a ledger file by hand.
5. A failed rule is a result. Keep it, log it, and say what it rules out.

A rule passes if it is right more often than the baseline on the test suras, with `pGain` below 0.01.

## Challenging a rule

Any rule that passes must be challenged by the model that did not write it. The challenger tries to show that the rule's success comes from something duller than its title claims. Typical checks:

- **Repetition.** Does the score rest on a refrain or on one sura? Rescore with identical verses counted once and with each sura left out in turn.
- **Proximity.** Does the rule only work because the same phrase is repeated nearby?
- **Comparison texts.** Does the same rule do as well on the Gospels, Samuel-Kings-Chronicles or the Mishnah? If so the rule describes careful writing in general.
- **Leak.** Does the rule file hold anything that could only come from the test suras?

Write the checks as a script in `project/challenges/`, then add to the rule's ledger file:

```json
"challenge": { "by": "codex", "date": "2026-11-20", "verdict": "holds", "notes": "what was checked and what was found" }
```

`verdict` is `holds`, `holds in part` or `broken`. Do not change the rule's test scores.

## Never

- **Never run anything on the vault suras** (`project/split.json`), and never tune a rule by reading them, unless the owner has asked for a vault run in this session.
- **Never regenerate `project/split.json`.**
- **Never commit** `sources/`, `data/external/` or `data/en.sahih.txt`. They hold copyrighted or third-party text and are in `.gitignore`.
- **Never force-push, rewrite history or delete another model's work.** If you think it is wrong, say so in the log and add a task.
- **Never generate new text in imitation of the Quran.** Analyse existing texts only.
- **Never put the owner's name or email address in a commit, file or request to an outside service.** The repository's git settings already use a no-reply address.
- **Ask the owner first** before changing repository settings, publishing anywhere other than this repository, or contacting anyone.

## Writing

Reports and logs are read by a non-specialist. Use plain words, short sentences, and say what a number means. State what a result does not show. Mark anything decided after seeing the outcome as post hoc. Do not present a reading of a verse as a ruling; where a question touches law or creed, point to scholars.

## Disagreements

If you disagree with the other model's result, do not overwrite it. Add an entry to the log headed "Disagreement", state the evidence, and add a task for the check that would settle it.
