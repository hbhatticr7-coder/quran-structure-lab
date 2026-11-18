# Independent review of method version 4

Codex, 2026-11-18. Task 20; answering discussion 11. Reviewed the repairs through `0225966` (production changes in `698f03c`). The claim was pushed in `d1d909c` before this work.

The original three defects are closed for the cases that exposed them. However, the new import scanner still accepts executable files that were never committed or included in the recorded hashes. The grammar baseline is a useful coarse control, but beating it does not establish an explanation beyond grammar. There is also a gap in carrying challenges between method versions.

## Repairs that hold

- Excluded morphology lines are skipped before their word fields are parsed. The file is read into memory and separated into lines; only an excluded line's sura number is used to decide to skip it. The artificial loader check confirms that the excluded payload is not split into fields. This is the boundary now documented by `loadText`.
- A normally written relative import of an ignored, uncommitted helper is refused. A published chain of ordinary `.mjs` imports passes; a changed file two imports away, or an unpushed commit, is refused.
- The old CommonJS, computed-import, Node-module and outside-repository examples are refused.
- Source review confirms that command and ledger checks precede execution of the rule, the census refuses a missing split, and site exports sort by build counts after removing non-build occurrences.
- The sura test is now described correctly as one sign for each sura's summed gain. It is not an equal-weight average of sura accuracies.

The three existing test files pass. These are useful regression checks, not proof that every JavaScript dependency is found.

## Remaining import gap: valid syntax evades the scanner

`inputsOf` removes comments and finds imports with regular expressions. It misses all three of these valid relative `.mjs` imports:

```js
import value // explanation
  from './private.mjs';
```

```js
import { 'value' as value } from './private.mjs';
```

```js
const opening = '/*';
import value from './private.mjs';
const closing = '*/';
```

The last case is ordinary string content mistaken for a block comment. None of these examples uses a package, a computed import or a non-MJS helper.

`project/challenges/method-v4-review.test.mjs` reproduces each case in a disposable Git repository with a local origin. The rule is committed and pushed; its helper is ignored and absent from the commit. The production guard functions, executed verbatim, accept the run. Editing the helper leaves every recorded input hash unchanged, and Node then executes the changed helper. A normally written import of the same helper is correctly refused as a positive control.

**Consequence:** the commitment guard cannot check a dependency the scanner omits. Its current promise that every executable input is frozen is too strong. R001–R005 have no imports; these fixtures do not show that their scores used an unfrozen helper or a forbidden sura.

**Repair:** enumerate dependencies using a JavaScript parser, with rejection of unsupported constructs and paths. Test ordinary imports, re-exports, quoted names, comments and strings, including nested helpers. Do not fix these three spellings with three more regular expressions. Dependency freezing is also not a sandbox for arbitrary JavaScript; the rule-author restrictions still matter.

## What the form baseline actually controls

The rule and baseline receive the same direct slot summary: part of speech plus the retained tense/definiteness tags. The baseline groups build examples by that summary and falls back to the plain majority when a group has fewer than three examples or ties. `DEF` specifically means the attached `ال` prefix; the unmarked class is distinct from `INDEF`.

Two limits matter:

1. **The fallback can be beaten with the slot summary alone.** The new artificial check gives a build sample four past-tense A choices and two imperative B choices. The baseline falls back to A for imperatives. A rule that learns B from the same two examples and reads only the imperative tag beats it on a separate invented sample, including the sura-block test. No surrounding word is needed. This is a counterexample to the unconditional claim that a gain must come from the rest of the text, not evidence about a Quran rule.
2. **Context can reveal omitted grammar.** Even with a well-supported class, surrounding words can carry grammatical information absent from the slot summary. A gain over this coarse control need not be semantic. A particular rule needs a matched grammar-only comparison or ablation before that stronger interpretation is warranted.

Thus “beats the build-trained baseline matched on part of speech, tense and definiteness” is justified wording. “Can only beat the baseline with something more than grammar,” currently in the scoreboard generator, is not.

## Build-only check of the grain

`project/challenges/method-v4-forms.mjs` loads only the build suras through `loadText('build')`. It checks all nine synonym sets and both existing build folds, using one fold to define each baseline and the other to score it. Its method-4 predictions are asserted equal to the production `formBaseline` at every known place. Output is saved in `project/challenges/method-v4-forms.json`.

The three-example minimum and tie fallback are the same for every form-based variant. The finer variants are diagnostic controls, not changes to `ctx.slot()` or a selected replacement policy.

| Baseline | Correct out of 795 build validation places | Accuracy | Places using the plain fallback |
|---|---:|---:|---:|
| Plain majority | 512 | 64.4% | — |
| Method 4: part of speech, tense, definiteness | 641 | 80.6% | 56 |
| Also mood and voice | 628 | 79.0% | 86 |
| Also person, number, gender and case | 593 | 74.6% | 250 |

No place in these build folds has an unseen option. Full definitions and per-set counts are in the saved output. The alternatives omit lemma, root and derived verb-form tags.

The finer partitions increase fallbacks and reduce accuracy on these folds. That supports keeping the current grain as a practical first control. It does not establish an optimal linguistic grain or show that the added features are irrelevant. A regularized model could use them differently; any such method needs a build-only design and a prospective freeze.

With all build suras defining, there are 31 form classes across the nine sets; seven still use the fallback. For “to come,” all three classes have enough examples: 119 past-tense places (101 jaa, 18 ata), 72 imperfect and 8 imperative places (all ata). This corrects the earlier count of 118 past-tense places in R003's prose; it does not change that file or its scores. The full-build majority therefore gives R003's predictions for each observed form. The two-fold baseline is right on 173/199 places, while the tense rule's stated mapping accounts for 181/199; the eight extra imperatives are exactly the sparse-class issue Claude identified.

These are exploratory build diagnostics made after earlier test results and the method-4 decision were known. They are not a fresh held-out confirmation. No test or vault suras were loaded for this review, and no rule was run or re-scored.

## Challenges must belong to a particular test

The evaluator retains `entry.challenge` when re-scoring an unchanged rule under a new method. The scoreboard requires a current-method test but accepts any retained challenge whose verdict is not `broken`. An invented ledger fixture demonstrates that a method-3 challenge therefore qualifies a method-4 pass without another challenge.

No current rule gains from this: there is no current-method pass in the reviewed ledger. Before one does, bind a challenge to the reviewed test's version and input identity, preserve an old challenge with its old result, and require the current test's challenge for headline eligibility. Check the challenger is the other model and the verdict is recognized. The present verdict schema does not enforce these conditions.

## Validation and hand-off

```bash
node --test project/challenges/census-v2-audit.test.mjs project/challenges/census-v3-review.test.mjs project/tools/comparison.test.mjs
node project/challenges/method-v4-review.test.mjs
node project/challenges/method-v4-forms.mjs
```

The existing suites and all six new diagnostic checks pass. Three new checks reproduce missed imports; one reproduces stale challenge acceptance. A passing diagnostic means the defect was demonstrated, not repaired. The remaining two check the ordinary-import guard and the grammar-only fallback counterexample.

Task 21 covers the import repair, challenge identity and narrower baseline wording. Task 17 remains the formal R003 verdict; the remaining helper gap does not prevent that particular challenge because R003 has no helpers. No production code, rule, ledger score, split or generated scoreboard was changed here.
